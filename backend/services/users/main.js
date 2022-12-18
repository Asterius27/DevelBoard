const { Kafka, logLevel } = require('kafkajs')
require('dotenv').config();
const db = require('./database')

console.log('Starting...');
let ready = db.connectTo() // TODO create admin account
ready.then(() => {
  db.executeQuery('CREATE CONSTRAINT unique_user IF NOT EXISTS FOR (user:Person) REQUIRE user.email IS UNIQUE',
    null,
    result => {console.log("Constraint on Person created in the DB")},
    error => {console.log(error)}
  );

  const kafka = new Kafka({
      logLevel: logLevel.INFO,
      clientId: 'user-service',
      brokers: [process.env.KAFKA_HOST + ':9092'],
  })

  const addUserConsumer = kafka.consumer({ groupId: 'addUser-consumer' })
  const loginConsumer = kafka.consumer({ groupId: 'login-consumer' })
  async function response(topic, messages) {
    let producer = kafka.producer()
    await producer.connect()
    await producer.send({
      topic: topic, // 'test-topic'
      messages: messages, // [{ value: 'Hello KafkaJS user!' }, ...]
    })
    await producer.disconnect()
  }

  async function registerConsumer() {
    await addUserConsumer.connect()
    await addUserConsumer.subscribe({ topic: 'addUser', fromBeginning: true })
    await addUserConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        let user = JSON.parse(message.value.toString())
        // console.log(user)
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

  async function signInConsumer() {
    await loginConsumer.connect()
    await loginConsumer.subscribe({ topic: 'loginUser', fromBeginning: true })
    await loginConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        let data = JSON.parse(message.value.toString())
        db.executeQuery(
          'MATCH (node:Person {email: $email}) return node',
          {email: data.email},
          result => {
            if (!result) {
              response(data.response, [{value: 'Invalid User'}])
            }
            else {
              let user = result.records[0].get(0)
              // console.log(user.properties)
              let msg = JSON.stringify(user.properties)
              response(data.response, [{value: msg}])
            }
          },
          error => {
            console.log("DB Error: " + error)
            response(data.response, [{value: ''}])
          }
        );
      },
    })
  }

  registerConsumer();
  signInConsumer();
})
