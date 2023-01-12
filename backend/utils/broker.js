const { Kafka, logLevel } = require('kafkajs')

let kafka = {}

function create() {
    kafka = new Kafka({
        logLevel: logLevel.INFO,
        clientId: 'express',
        brokers: [process.env.KAFKA_HOST + ':9092'],
    })
}

async function sendMessage(topic, messages) {
    const producer = kafka.producer()
    await producer.connect()
    await producer.send({
        topic: topic,
        messages: messages,
    })
    await producer.disconnect()
}

async function receiveMessage(groupId, topic) {
    const consumer = kafka.consumer({ groupId: groupId })
    await consumer.connect()
    await consumer.subscribe({ topic: topic, fromBeginning: true })
    const res = new Promise(async (resolve, reject) => {
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                resolve({msg: message.value.toString(), consumer: consumer})
            },
        })
    })
    return res;
}

async function createTopics(topic, numPartitions) {
    return new Promise(async (resolve) => {
        const admin = kafka.admin()
        await admin.connect()
        let succ = await admin.createTopics({
            topics: [
                {
                    topic: topic,
                    numPartitions: numPartitions,
                },
            ],
        })
        await admin.disconnect()
        resolve(succ)
    })
}

async function deleteTopics(topics) {
    const admin = kafka.admin()
    await admin.connect()
    await admin.deleteTopics({
        topics: topics,
    })
    await admin.disconnect()
}

async function cleanUp() {
    const admin = kafka.admin()
    await admin.connect()
    let topics = await admin.listTopics()
    await admin.deleteTopics({
        topics: topics,
    })
    topics = await admin.listTopics()
    await admin.disconnect()
}

module.exports = { create, sendMessage, createTopics, deleteTopics, receiveMessage, cleanUp }
