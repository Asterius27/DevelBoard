const { Kafka, logLevel } = require('kafkajs')
require('dotenv').config();
const db = require('./database')

console.log('Starting...');
let ready = db.connectTo()
ready.then(() => {
  const kafka = new Kafka({
      logLevel: logLevel.INFO,
      clientId: 'leaderboards-service',
      brokers: [process.env.KAFKA_HOST + ':9092'],
  })

  const getGeneralLeaderboardConsumer = kafka.consumer({ groupId: 'getGeneralLeaderboard-consumer' })
  const getGeneralUserLeaderboardConsumer = kafka.consumer({ groupId: 'getGeneralUserLeaderboard-consumer' })
  const getLeaderboardConsumer = kafka.consumer({ groupId: 'getLeaderboard-consumer' })
  const getUserLeaderboardConsumer = kafka.consumer({ groupId: 'getUserLeaderboard-consumer' })
  const getChallengeLeaderboardConsumer = kafka.consumer({ groupId: 'getChallengeLeaderboard-consumer' })
  const getUserChallengeScoreConsumer = kafka.consumer({ groupId: 'getUserChallengeScore-consumer' })
  async function response(topic, messages) {
    let producer = kafka.producer()
    await producer.connect()
    await producer.send({
      topic: topic, // 'test-topic'
      messages: messages, // [{ value: 'Hello KafkaJS user!' }, ...]
    })
    await producer.disconnect()
  }

  async function getGeneralConsumer() {
    await getGeneralLeaderboardConsumer.connect()
    await getGeneralLeaderboardConsumer.subscribe({ topic: 'getGeneralLeaderboard', fromBeginning: true })
    await getGeneralLeaderboardConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        let msg = JSON.parse(message.value.toString())
        db.executeQuery("Match (p:Person)-[r:RELTYPE]->(:Challenge) "+
          "Call{ "+
            "Match (c:Challenge) "+
            "Return count(DISTINCT c.title) as number "+
          "} "+
          "With p.username as username, (sum(toFloat(r.score)/toFloat(r.max_score)*100)) as percentage, number "+
          "Return username, percentage/number as percent_score "+
          "ORDER BY percent_score DESC",
          null,
          result =>{
            let rs=new Array;
            result.records.forEach(row => rs.push({username: row.get('username'), percentage: row.get('percent_score')}));
            let message = JSON.stringify(rs)
            response(msg.response, [{value: message}])
          },
          error =>{
            console.log("DB Error: " + error)
            response(msg.response, [{value: ''}])
          }
        );
      },
    })
  }

  async function getGeneralUserConsumer() {
    await getGeneralUserLeaderboardConsumer.connect()
    await getGeneralUserLeaderboardConsumer.subscribe({ topic: 'getGeneralUserLeaderboard', fromBeginning: true })
    await getGeneralUserLeaderboardConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        let msg = JSON.parse(message.value.toString())
        db.executeQuery("Match (p:Person{email: $email})-[r:RELTYPE]->(:Challenge) "+
          "Call{ "+
            "Match (c:Challenge) "+
            "Return count(DISTINCT c.title) as number "+
          "} "+
          "With (sum(toFloat(r.score)/toFloat(r.max_score)*100)) as percentage, number "+
          "RETURN percentage/number as percent_score",
          {email: msg.email},
          result =>{
            let rs;
            result.records.forEach(row => rs=row.get('percent_score'));
            let message = JSON.stringify(rs)
            response(msg.response, [{value: message}])
          },
          error =>{
            console.log("DB Error: " + error)
            response(msg.response, [{value: ''}])
          }
        );
      },
    })
  }

  async function getConsumer() {
    await getLeaderboardConsumer.connect()
    await getLeaderboardConsumer.subscribe({ topic: 'getLeaderboard', fromBeginning: true })
    await getLeaderboardConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        let msg = JSON.parse(message.value.toString())
        db.executeQuery("Match (p:Person)-[r:RELTYPE]->(c:Challenge) "+
          "RETURN p.username as username, (toFloat(sum(r.score))/toFloat(sum(r.max_score)))*100 as percent_score "+
          "ORDER BY percent_score DESC",
          null,
          result =>{
            let rs=new Array;
            result.records.forEach(row => rs.push({username: row.get('username'), percentage: row.get('percent_score')}));
            let message = JSON.stringify(rs)
            response(msg.response, [{value: message}])
          },
          error =>{
            console.log("DB Error: " + error)
            response(msg.response, [{value: ''}])
          }
        );
      },
    })
  }

  async function getUserConsumer() {
    await getUserLeaderboardConsumer.connect()
    await getUserLeaderboardConsumer.subscribe({ topic: 'getUserLeaderboard', fromBeginning: true })
    await getUserLeaderboardConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        let msg = JSON.parse(message.value.toString())
        db.executeQuery("Match (p:Person{email: $email})-[r:RELTYPE]->(c:Challenge) "+
          "RETURN (toFloat(sum(r.score))/toFloat(sum(r.max_score)))*100 as percent_score",
          {email: msg.email},
          result =>{
              let rs;
              result.records.forEach(row => rs=row.get('percent_score'));
              let message = JSON.stringify({percentage: rs})
              response(msg.response, [{value: message}])
          },
          error =>{
            console.log("DB Error: " + error)
            response(msg.response, [{value: ''}])
          }
        );
      },
    })
  }

  async function getChallengeConsumer() {
    await getChallengeLeaderboardConsumer.connect()
    await getChallengeLeaderboardConsumer.subscribe({ topic: 'getChallengeLeaderboard', fromBeginning: true })
    await getChallengeLeaderboardConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        let msg = JSON.parse(message.value.toString())
        db.executeQuery("Match (p:Person)-[r:RELTYPE]->(c:Challenge {title: $title}) "+
          "RETURN p.username as username, (toFloat(r.score)/toFloat(r.max_score))*100 as percent_score "+
          "ORDER BY percent_score DESC",
          {title: msg.title},
          result =>{
            let rs=new Array;
            result.records.forEach(row => rs.push({username: row.get('username'), percentage: row.get('percent_score')}));
            let message = JSON.stringify(rs)
            response(msg.response, [{value: message}])
          },
          error =>{
            console.log("DB Error: " + error)
            response(msg.response, [{value: ''}])
          }
        );
      },
    })
  }

  async function getUserChallengeConsumer() {
    await getUserChallengeScoreConsumer.connect()
    await getUserChallengeScoreConsumer.subscribe({ topic: 'getUserChallengeScore', fromBeginning: true })
    await getUserChallengeScoreConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        let msg = JSON.parse(message.value.toString())
        db.executeQuery("Match (p:Person {email: $email})-[r:RELTYPE]->(c:Challenge {title: $title}) "+
          "RETURN (toFloat(r.score)/toFloat(r.max_score))*100 as percent_score",
          {title: msg.title, email: msg.email},
          result =>{
            let rs;
            result.records.forEach(row => rs=row.get('percent_score'));
            let message = JSON.stringify(rs)
            response(msg.response, [{value: message}])
          },
          error =>{
            console.log("DB Error: " + error)
            response(msg.response, [{value: ''}])
          }
        );
      },
    })
  }

  getGeneralConsumer();
  getGeneralUserConsumer();
  getConsumer();
  getUserConsumer();
  getChallengeConsumer();
  getUserChallengeConsumer();
})
