const { Kafka, logLevel } = require('kafkajs')
require('dotenv').config();
const db = require('./database');
const crypto = require('crypto');

console.log('Starting...');
let ready = db.connectTo()
ready.then(async () => {
  await db.executeQuery('CREATE CONSTRAINT unique_user IF NOT EXISTS FOR (user:Person) REQUIRE user.email IS UNIQUE',
    null,
    result => {
      console.log("Constraint on Person created in the DB")
    },
    error => {console.log(error)}
  );

  let salt = crypto.randomBytes(16).toString('hex');
  let hmac = crypto.createHmac('sha512', salt);
  hmac.update(process.env.ADMIN_PASSWORD);
	let digest = hmac.digest('hex');
  await db.executeQuery(
    'MERGE (n:Person {name:$name, email:$email, salt:$salt, digest:$digest, role:$role, username:$username, surname:$surname})', 
    {email: process.env.ADMIN_EMAIL, salt:salt, digest:digest, name:process.env.ADMIN_NAME, role:"ADMIN", username:process.env.ADMIN_USERNAME, surname:process.env.ADMIN_SURNAME},
    result => {
      console.log("Admin account created");
    },
    error => {
      console.log(error)
    }
  );

  const kafka = new Kafka({
      logLevel: logLevel.INFO,
      clientId: 'user-service',
      brokers: [process.env.KAFKA_HOST + ':' + process.env.KAFKA_PORT],
  })

  const addUserConsumer = kafka.consumer({ groupId: 'addUser-consumer' })
  const loginConsumer = kafka.consumer({ groupId: 'login-consumer' })
  const addFollowConsumer = kafka.consumer({groupId: 'addFollow-consumer'})
  const editUserConsumer = kafka.consumer({ groupId: 'editUser-consumer' })
  async function response(topic, messages) {
    let producer = kafka.producer()
    await producer.connect()
    await producer.send({
      topic: topic,
      messages: messages,
    })
    await producer.disconnect()
  }

  async function registerConsumer() {
    await addUserConsumer.connect()
    await addUserConsumer.subscribe({ topic: 'addUser', fromBeginning: true })
    await addUserConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        let user = JSON.parse(message.value.toString())
        db.executeQuery(
          'CREATE (n:Person {name:$name, email:$email, salt:$salt, digest:$digest, role:$role, username:$username, surname:$surname}) return n', 
          {email: user.email, salt:user.salt, digest:user.digest, name:user.name, role:user.role, username:user.username, surname:user.surname},
          result => {
            let dbuser = result.records[0].get(0)
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

  async function editConsumer() {
    await editUserConsumer.connect()
    await editUserConsumer.subscribe({ topic: 'editUser', fromBeginning: true })
    await editUserConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        let user = JSON.parse(message.value.toString())
        db.executeQuery(
          'MATCH (p:Person {email:$oldemail})'+
          'SET p += {name:$name, email:$email, salt:$salt, digest:$digest, username:$username, surname:$surname}', 
          {oldemail: user.oldemail, email: user.email, salt:user.salt, digest:user.digest, name:user.name, username:user.username, surname:user.surname},
          result => {
            response(user.response, [{value: 'OK'}])
          },
          error => {
            console.log("DB Error: " + error)
            response(user.response, [{value: ''}])
          }
        );
      },
    })
  }
  
  registerConsumer();
  signInConsumer();
  editConsumer();
})
