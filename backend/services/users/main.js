const { Kafka, logLevel } = require('kafkajs')
require('dotenv').config();
const db = require('./database')

db.connectTo()

const kafka = new Kafka({
    logLevel: logLevel.DEBUG,
    clientId: 'express',
    brokers: [process.env.KAFKA_HOST + ':9092'],
})
const consumer = kafka.consumer({ groupId: 'user-service' })

await consumer.connect()
await consumer.subscribe({ topic: 'test-topic', fromBeginning: true })

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    // TODO db query
    console.log({
      value: message.value.toString(),
    })
  },
})
