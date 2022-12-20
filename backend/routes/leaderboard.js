const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');
const broker = require('../utils/broker');

router.use(auth.authenticateToken);

//this gives for each user the percentage of point in all the challenges, even the ones he didn't undertake
router.get('/', async (req, res, next) => {
    let topic = req.user.email.split('@').join('') + 'leaderboard'
    let msg = JSON.stringify({response: topic})
    await broker.createTopics(topic, 1);
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

//like the one above but for only 1 user
router.get('/user', async (req, res, next) => {
    let topic = req.user.email.split('@').join('') + 'leaderboarduser'
    let msg = JSON.stringify({email: req.user.email, response: topic})
    await broker.createTopics(topic, 1);
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

//percentage score for all users on the challenge they took, not the ones they didn't
router.get('/completed', async (req, res, next) => { // TODO not tested
    let topic = req.user.email.split('@').join('') + 'leaderboardcompleted'
    let msg = JSON.stringify({response: topic})
    await broker.createTopics(topic, 1);
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

//percentage for a single user of the challenges he took
router.get('/mycompleted', async (req, res, next) => {
    let topic = req.user.email.split('@').join('') + 'leaderboardcompleteduser'
    let msg = JSON.stringify({email: req.user.email, response: topic})
    await broker.createTopics(topic, 1);
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

//score of all users in a single challenge
router.get('/challenge/:title', async (req, res, next) => { // TODO not tested
    let topic = req.user.email.split('@').join('') + 'leaderboardchallenge'
    let msg = JSON.stringify({title: req.params.title, response: topic})
    await broker.createTopics(topic, 1);
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

//score of a single user on a single challenge
router.get('/mychallenge/:title', async (req, res, next) => { // TODO not tested
    let topic = req.user.email.split('@').join('') + 'leaderboardchallengeuser'
    let msg = JSON.stringify({title: req.params.title, email: req.user.email, response: topic})
    await broker.createTopics(topic, 1);
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
