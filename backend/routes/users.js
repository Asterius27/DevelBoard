const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');
const broker = require('../utils/broker');

router.use(auth.authenticateToken);

router.get('/:email', async (req, res, next) => {
    let topic = req.user.email.split('@').join('') + 'getuser'
    let msg = JSON.stringify({email: req.params.email, response: topic})
    await broker.createTopics(topic, 1);
    broker.sendMessage('loginUser', [{value: msg}])
    let promise = broker.receiveMessage(topic, topic)
    promise.then(async (data) => {
        await data.consumer.disconnect()
        broker.deleteTopics([topic])
        if (data.msg === "" || data.msg === "Invalid User") {
            console.log("DB Error")
            return res.sendStatus(500)
        }
        else {
            let user = JSON.parse(data.msg)
            let filteredUser = {
                username: user.username,
                name: user.name,
                surname: user.surname,
                email: user.email,
                role: user.role
            };
            return res.status(200).json(filteredUser);
        }
    })
})

module.exports = router
