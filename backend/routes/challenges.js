const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');
const broker = require('../utils/broker');

router.use(auth.authenticateToken);

router.post('/', (req, res) => {
    let date=''+req.body.expireDate.year+'-'+req.body.expireDate.month+'-'+req.body.expireDate.day+'T'+req.body.expireDate.hour+':'+req.body.expireDate.minute+':00';
    let title=req.body.title;
    let challenge={
        title: title,
        description: req.body.description,
        language: req.body.language,
        testCases: req.body.testCases,
        resultCases: req.body.resultCases,
        expireDate: date
    };
    let msg = JSON.stringify(challenge)
    broker.sendMessage('createChallenge', [{value: msg}])
    return res.sendStatus(200);
});

router.get('/:title', async (req, res) => {
    let topic = req.user.email.split('@').join('') + 'challengetitle'
    let msg = JSON.stringify({title: req.params.title, response: topic})
    await broker.createTopics(topic, 1);
    broker.sendMessage('getTitleChallenge', [{value: msg}])
    let promise = broker.receiveMessage(topic, topic)
    promise.then(async (data) => {
        await data.consumer.disconnect()
        broker.deleteTopics([topic])
        if (data.msg === "") {
            console.log("DB Error")
            return res.sendStatus(500)
        }
        else {
            let challenge = JSON.parse(data.msg)
            return res.status(200).json(challenge);
        }
    })
});

router.get('/', async (req, res) => {
    let topic = req.user.email.split('@').join('') + 'challenge'
    let msg = JSON.stringify({email: req.user.email, response: topic})
    await broker.createTopics(topic, 1);
    broker.sendMessage('getChallenge', [{value: msg}])
    let promise = broker.receiveMessage(topic, topic)
    promise.then(async (data) => {
        await data.consumer.disconnect()
        broker.deleteTopics([topic])
        if (data.msg === "") {
            console.log("DB Error")
            return res.sendStatus(500)
        }
        else {
            let challenges = JSON.parse(data.msg)
            return res.status(200).json(challenges);
        }
    })
});

module.exports = router
