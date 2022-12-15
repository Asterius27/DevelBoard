const { Kafka, logLevel } = require('kafkajs')

let kafka = {}

function create() {
    kafka = new Kafka({
        logLevel: logLevel.DEBUG,
        clientId: 'express',
        brokers: [process.env.KAFKA_HOST + ':9092'],
    })
}

async function sendMessage(topic, messages) {
    let producer = kafka.producer()
    await producer.connect()
    await producer.send({
        topic: topic, // 'test-topic'
        messages: messages, // [{ value: 'Hello KafkaJS user!' }, ...]
    })
    await producer.disconnect()
}

async function createTopics(topic, numPartitions) {
    let admin = kafka.admin()
    await admin.connect()
    await admin.createTopics({
        topics: [
            {
                topic: topic, // String
                numPartitions: numPartitions, // Number
            },
        ],
    })
    await admin.disconnect()
}

async function deleteTopics(topics) {
    let admin = kafka.admin()
    await admin.connect()
    await admin.deleteTopics({
        topics: topics, // String[]
    })
    await admin.disconnect()
}

module.exports = { create, sendMessage, createTopics, deleteTopics }
