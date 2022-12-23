const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');
const broker = require('../utils/broker');
const timeout = require('timers/promises')

router.use(auth.authenticateToken);

router.post('/', async (req, res, next) => {
    let topic = req.user.email.split('@').join('') + 'evaluatecode'
    let msg = JSON.stringify({
        title: req.body.title, 
        language: req.body.language, 
        code: req.body.code, 
        email: req.user.email,
        response: topic
    })
    let succ = false;
    while (!succ) {
        succ = await broker.createTopics(topic, 1);
        await timeout.setTimeout(process.env.KAFKA_RETRY_TIMEOUT);
    }
    broker.sendMessage('evaluateCode', [{value: msg}])
    let promise = broker.receiveMessage(topic, topic)
    promise.then(async (data) => {
        await data.consumer.disconnect()
        broker.deleteTopics([topic])
        if (data.msg === "") {
            console.log("DB Error")
            return res.sendStatus(500)
        }
        else {
            let evaluation = JSON.parse(data.msg)
            return res.status(200).json(evaluation);
        }
    })
});

module.exports = router
