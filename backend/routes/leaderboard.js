const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');
const broker = require('../utils/broker');
const timeout = require('timers/promises')

router.use(auth.authenticateToken);

router.get('/', async (req, res, next) => {
    let topic = req.user.email.split('@').join('') + 'leaderboard'
    let msg = JSON.stringify({response: topic})
    let succ = await broker.createTopics(topic, 1);
    while (!succ) {
        await timeout.setTimeout(process.env.KAFKA_RETRY_TIMEOUT);
        succ = await broker.createTopics(topic, 1);
    }
    broker.sendMessage('getGeneralLeaderboard', [{value: msg}])
    let promise = broker.receiveMessage(topic, topic)
    promise.then(async (data) => {
        await data.consumer.disconnect()
        broker.deleteTopics([topic])
        if (data.msg === "") {
            console.log("DB Error")
            return res.sendStatus(500)
        }
        else {
            let leaderboard = JSON.parse(data.msg)
            return res.status(200).json(leaderboard);
        }
    })
});

router.get('/user/:email', async (req, res, next) => {
    let topic = req.user.email.split('@').join('') + 'leaderboarduser'
    let msg = JSON.stringify({email: req.params.email, response: topic})
    let succ = await broker.createTopics(topic, 1);
    while (!succ) {
        await timeout.setTimeout(process.env.KAFKA_RETRY_TIMEOUT);
        succ = await broker.createTopics(topic, 1);
    }
    broker.sendMessage('getGeneralUserLeaderboard', [{value: msg}])
    let promise = broker.receiveMessage(topic, topic)
    promise.then(async (data) => {
        await data.consumer.disconnect()
        broker.deleteTopics([topic])
        if (data.msg === "") {
            console.log("DB Error")
            return res.sendStatus(500)
        }
        else {
            let leaderboard = JSON.parse(data.msg)
            return res.status(200).json(leaderboard);
        }
    })
});

router.get('/completed', async (req, res, next) => {
    let topic = req.user.email.split('@').join('') + 'leaderboardcompleted'
    let msg = JSON.stringify({response: topic})
    let succ = await broker.createTopics(topic, 1);
    while (!succ) {
        await timeout.setTimeout(process.env.KAFKA_RETRY_TIMEOUT);
        succ = await broker.createTopics(topic, 1);
    }
    broker.sendMessage('getLeaderboard', [{value: msg}])
    let promise = broker.receiveMessage(topic, topic)
    promise.then(async (data) => {
        await data.consumer.disconnect()
        broker.deleteTopics([topic])
        if (data.msg === "") {
            console.log("DB Error")
            return res.sendStatus(500)
        }
        else {
            let leaderboard = JSON.parse(data.msg)
            return res.status(200).json(leaderboard);
        }
    })
});

router.get('/usercompleted/:email', async (req, res, next) => {
    let topic = req.user.email.split('@').join('') + 'leaderboardcompleteduser'
    let msg = JSON.stringify({email: req.params.email, response: topic})
    let succ = await broker.createTopics(topic, 1);
    while (!succ) {
        await timeout.setTimeout(process.env.KAFKA_RETRY_TIMEOUT);
        succ = await broker.createTopics(topic, 1);
    }
    broker.sendMessage('getUserLeaderboard', [{value: msg}])
    let promise = broker.receiveMessage(topic, topic)
    promise.then(async (data) => {
        await data.consumer.disconnect()
        broker.deleteTopics([topic])
        if (data.msg === "") {
            console.log("DB Error")
            return res.sendStatus(500)
        }
        else {
            let leaderboard = JSON.parse(data.msg)
            return res.status(200).json(leaderboard);
        }
    })
});

router.get('/challenge/:title', async (req, res, next) => {
    let topic = req.user.email.split('@').join('') + 'leaderboardchallenge'
    let msg = JSON.stringify({title: req.params.title, response: topic})
    let succ = await broker.createTopics(topic, 1);
    while (!succ) {
        await timeout.setTimeout(process.env.KAFKA_RETRY_TIMEOUT);
        succ = await broker.createTopics(topic, 1);
    }
    broker.sendMessage('getChallengeLeaderboard', [{value: msg}])
    let promise = broker.receiveMessage(topic, topic)
    promise.then(async (data) => {
        await data.consumer.disconnect()
        broker.deleteTopics([topic])
        if (data.msg === "") {
            console.log("DB Error")
            return res.sendStatus(500)
        }
        else {
            let leaderboard = JSON.parse(data.msg)
            return res.status(200).json(leaderboard);
        }
    })
});

router.get('/mychallenge/:title', async (req, res, next) => {
    let topic = req.user.email.split('@').join('') + 'leaderboardchallengeuser'
    let msg = JSON.stringify({title: req.params.title, email: req.user.email, response: topic})
    let succ = await broker.createTopics(topic, 1);
    while (!succ) {
        await timeout.setTimeout(process.env.KAFKA_RETRY_TIMEOUT);
        succ = await broker.createTopics(topic, 1);
    }
    broker.sendMessage('getUserChallengeScore', [{value: msg}])
    let promise = broker.receiveMessage(topic, topic)
    promise.then(async (data) => {
        await data.consumer.disconnect()
        broker.deleteTopics([topic])
        if (data.msg === "") {
            console.log("DB Error")
            return res.sendStatus(500)
        }
        else {
            let leaderboard = JSON.parse(data.msg)
            return res.status(200).json(leaderboard);
        }
    })
});

module.exports = router
