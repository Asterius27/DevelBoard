const { Kafka, logLevel } = require('kafkajs')
require('dotenv').config();
const db = require('./database')

db.connectTo()

const kafka = new Kafka({
    logLevel: logLevel.INFO,
    clientId: 'challenges-service',
    brokers: [process.env.KAFKA_HOST + ':9092'],
})

const createChallengeConsumer = kafka.consumer({ groupId: 'createChallenge-consumer' })
const getTitleChallenge = kafka.consumer({ groupId: 'getTitleChallenge-consumer' })
const getChallenge = kafka.consumer({ groupId: 'getChallenge-consumer' })
async function response(topic, messages) {
  let producer = kafka.producer()
  await producer.connect()
  await producer.send({
    topic: topic, // 'test-topic'
    messages: messages, // [{ value: 'Hello KafkaJS user!' }, ...]
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
        result => {
          // console.log("Challenge created");
        },
        error => {
          console.log(error);
        }
      );
    },
  })
}

async function getTitleConsumer() {
  await getTitleChallenge.connect()
  await getTitleChallenge.subscribe({ topic: 'getTitleChallenge', fromBeginning: true })
  await getTitleChallenge.run({
    eachMessage: async ({ topic, partition, message }) => {
      let msg = JSON.parse(message.value.toString())
      db.executeQuery('MATCH (node:Challenge {title: $title}) RETURN node.title as title , node.expireDate as expireDate, node.language as language, node.description as description',
        {title: msg.title},
        result => {
          let challenge;
          result.records.forEach(chall => challenge={"title": chall.get("title"), "expireDate": db.dateParse(chall.get("expireDate")), language: chall.get('language'), description: chall.get('description')}); //rivedi la data così non va
          let message = JSON.stringify(challenge)
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

async function getConsumer() {
  await getChallenge.connect()
  await getChallenge.subscribe({ topic: 'getChallenge', fromBeginning: true })
  await getChallenge.run({
    eachMessage: async ({ topic, partition, message }) => {
      let msg = JSON.parse(message.value.toString())
      const now = new Date();
      db.executeQuery('MATCH (node:Challenge) WHERE node.expireDate > localdatetime($date) AND NOT exists((:Person {email: $email})-[:RELTYPE]->(node)) RETURN node.title as title, node.expireDate as expireDate, node.language as language',
        {date: now.toISOString().slice(0,-1), email: msg.email}, 
        result => {
          let challenges=new Array;
          result.records.forEach(chall =>challenges.push({title: chall.get('title'), expireDate: db.dateParse(chall.get('expireDate')), language: chall.get('language')})); //rivedi la data così non va
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
