const { Kafka, logLevel } = require('kafkajs')
require('dotenv').config();
const db = require('./database')

console.log('Starting...');
let ready = db.connectTo()
ready.then(() => {
  db.executeQuery('CREATE CONSTRAINT unique_challenge IF NOT EXISTS FOR (chall:Challenge) REQUIRE chall.title IS UNIQUE',
    null,
    result => {console.log("Constraint on Challenge created in the DB")},
    error => {console.log(error)}
  );

  const kafka = new Kafka({
      logLevel: logLevel.INFO,
      clientId: 'challenges-service',
      brokers: [process.env.KAFKA_HOST + ':' + process.env.KAFKA_PORT],
  })

  const createChallengeConsumer = kafka.consumer({ groupId: 'createChallenge-consumer' })
  const getTitleChallengeConsumer = kafka.consumer({ groupId: 'getTitleChallenge-consumer' })
  const getChallengeConsumer = kafka.consumer({ groupId: 'getChallenge-consumer' })
  const getLastChallengeConsumer = kafka.consumer({ groupId: 'getLastChallenge-consumer' })
  async function response(topic, messages) {
    let producer = kafka.producer()
    await producer.connect()
    await producer.send({
      topic: topic,
      messages: messages,
    })
    await producer.disconnect()
  }

  async function createConsumer() {
    await createChallengeConsumer.connect()
    await createChallengeConsumer.subscribe({ topic: 'createChallenge', fromBeginning: true })
    await createChallengeConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        let challenge = JSON.parse(message.value.toString())
        db.executeQuery(
          'CREATE (node:Challenge {title: $title, expireDate: localdatetime($date), description: $description, language: $language, testCases: $testCases, resultCases: $resultCases}) RETURN node',
          {title: challenge.title, date: challenge.expireDate, description: challenge.description, language: challenge.language, testCases: challenge.testCases,resultCases: challenge.resultCases},
          result => {},
          error => {
            console.log(error);
          }
        );
      },
    })
  }

  async function getTitleConsumer() {
    await getTitleChallengeConsumer.connect()
    await getTitleChallengeConsumer.subscribe({ topic: 'getTitleChallenge', fromBeginning: true })
    await getTitleChallengeConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        let msg = JSON.parse(message.value.toString())
        db.executeQuery('MATCH (node:Challenge {title: $title}) RETURN node.title as title , node.expireDate as expireDate, node.language as language, node.description as description',
          {title: msg.title},
          result => {
            let challenge;
            result.records.forEach(chall => challenge={"title": chall.get("title"), "expireDate": db.dateParse(chall.get("expireDate")), language: chall.get('language'), description: chall.get('description')});
            let message = JSON.stringify(challenge)
            if (message) {
              response(msg.response, [{value: message}])
            } else {
              response(msg.response, [{value: JSON.stringify({'title': 'no challenge found'})}])
            }
          },
          error => {
            console.log("DB Error: " + error)
            response(msg.response, [{value: ''}])
          }
        );
      },
    })
  }

  async function getConsumer() {
    await getChallengeConsumer.connect()
    await getChallengeConsumer.subscribe({ topic: 'getChallenge', fromBeginning: true })
    await getChallengeConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        let msg = JSON.parse(message.value.toString())
        const now = new Date();
        db.executeQuery('MATCH (node:Challenge) WHERE node.expireDate > localdatetime($date) AND NOT exists((:Person {email: $email})-[:RELTYPE]->(node)) RETURN node.title as title, node.expireDate as expireDate, node.language as language',
          {date: now.toISOString().slice(0,-1), email: msg.email}, 
          result => {
            let challenges=new Array;
            result.records.forEach(chall =>challenges.push({title: chall.get('title'), expireDate: db.dateParse(chall.get('expireDate')), language: chall.get('language')}));
            let message = JSON.stringify(challenges)
            response(msg.response, [{value: message}])
          },
          error => {
            console.log("DB Error: " + error)
            response(msg.response, [{value: ''}])
          }
        );
      },
    })
  }

  async function getLastConsumer() {
    await getLastChallengeConsumer.connect()
    await getLastChallengeConsumer.subscribe({ topic: 'getLastChallenge', fromBeginning: true })
    await getLastChallengeConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        let msg = JSON.parse(message.value.toString())
        const now = new Date();
        db.executeQuery('MATCH (node:Challenge) RETURN node.title as title, node.expireDate as expireDate, node.language as language ORDER BY node.expireDate LIMIT 15',
          {date: now.toISOString().slice(0,-1)}, 
          result => {
            let challenges=new Array;
            result.records.forEach(chall =>challenges.push({title: chall.get('title'), expireDate: db.dateParse(chall.get('expireDate')), language: chall.get('language')}));
            let message = JSON.stringify(challenges)
            response(msg.response, [{value: message}])
          },
          error => {
            console.log("DB Error: " + error)
            response(msg.response, [{value: ''}])
          }
        );
      },
    })
  }

  createConsumer();
  getTitleConsumer();
  getConsumer();
  getLastConsumer();
})
