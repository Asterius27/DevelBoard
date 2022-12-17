const { Kafka, logLevel } = require('kafkajs')
require('dotenv').config();
const db = require('./database')

db.connectTo()

const kafka = new Kafka({
    logLevel: logLevel.INFO,
    clientId: 'user-service',
    brokers: [process.env.KAFKA_HOST + ':9092'],
})

const consumer = kafka.consumer({ groupId: 'addUser-consumer' })
async function response(topic, messages) {
  let producer = kafka.producer()
  await producer.connect()
  await producer.send({
    topic: topic, // 'test-topic'
    messages: messages, // [{ value: 'Hello KafkaJS user!' }, ...]
  })
  await producer.disconnect()
}

async function service() {
  await consumer.connect()
  await consumer.subscribe({ topic: 'addUser', fromBeginning: true })
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      let user = JSON.parse(message.value.toString())
      console.log(user)
      db.executeQuery(
        'CREATE (n:Person {name:$name, email:$email, salt:$salt, digest:$digest, role:$role, username:$username, surname:$surname}) return n', 
        {email: user.email, salt:user.salt, digest:user.digest, name:user.name, role:user.role, username:user.username, surname:user.surname},
        result => {
          let dbuser = result.records[0].get(0)
          // console.log(user.properties)
          let token_data = {
            username: dbuser.properties.username,
            name: dbuser.properties.name,
            surname: dbuser.properties.surname,
            email: dbuser.properties.email,
            role: dbuser.properties.role
          }
          let message = JSON.stringify(token_data);
          response(user.response, [{value: message}])
        },
        error => {
          console.log("DB Error: " + error)
          response(user.response, [{value: ''}])
        }
      );
    },
  })
}

service();
