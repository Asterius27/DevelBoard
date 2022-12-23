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
        topic: topic, // 'test-topic'
        messages: messages, // [{ value: 'Hello KafkaJS user!' }, ...]
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
                // console.log("TOKEN: " + message.value.toString())
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
                    topic: topic, // String
                    numPartitions: numPartitions, // Number
                },
            ],
        })
        // console.log(topic + ": " + succ)
        await admin.disconnect()
        resolve(succ)
    })
}

async function deleteTopics(topics) {
    const admin = kafka.admin()
    await admin.connect()
    await admin.deleteTopics({
        topics: topics, // String[]
    })
    // console.log(topics[0] + ": Topic Deleted!");
    await admin.disconnect()
}

async function cleanUp() {
    const admin = kafka.admin()
    await admin.connect()
    let topics = await admin.listTopics()
    // let metadata = await admin.fetchTopicMetadata({ topics: topics })
    console.log(topics);
    /*
    metadata.topics.forEach(element => {
        console.log(element.partitions)
    });
    */
    await admin.deleteTopics({
        topics: topics,
    })
    topics = await admin.listTopics()
    console.log(topics);
    await admin.disconnect()
}

module.exports = { create, sendMessage, createTopics, deleteTopics, receiveMessage, cleanUp }
