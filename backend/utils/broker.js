const { Kafka, logLevel } = require('kafkajs')

let kafka = {}
let producer = {}
let admin = {}

function create() {
    kafka = new Kafka({
        logLevel: logLevel.INFO,
        clientId: 'express',
        brokers: [process.env.KAFKA_HOST + ':9092'],
    })
    admin = kafka.admin()
    producer = kafka.producer()
}

async function sendMessage(topic, messages) {
    await producer.connect()
    await producer.send({
        topic: topic, // 'test-topic'
        messages: messages, // [{ value: 'Hello KafkaJS user!' }, ...]
    })
    await producer.disconnect()
}

async function receiveMessage(groupId, topic) { // TODO probably doesn't wait for res
    let res = ""
    const consumer = kafka.consumer({ groupId: groupId })
    await consumer.connect()
    await consumer.subscribe({ topic: topic, fromBeginning: true })
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            res = message.value.toString()
            // await consumer.stop() probably doesn't exist
            await consumer.disconnect()
        },
    })
    return res
}

async function createTopics(topic, numPartitions) {
    await admin.connect()
    let temp = await admin.createTopics({
        topics: [
            {
                topic: topic, // String
                numPartitions: numPartitions, // Number
            },
        ],
    })
    console.log(temp)
    await admin.disconnect()
}

async function deleteTopics(topics) {
    await admin.connect()
    await admin.deleteTopics({
        topics: topics, // String[]
    })
    await admin.disconnect()
}

module.exports = { create, sendMessage, createTopics, deleteTopics, receiveMessage }
