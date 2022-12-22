const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');
const broker = require('../utils/broker');
const crypto = require('crypto');

router.use(auth.authenticateToken);

function createPassword(pwd){
	let salt = crypto.randomBytes(16).toString('hex');
    let hmac = crypto.createHmac('sha512', salt);
    hmac.update(pwd);
	let digest = hmac.digest('hex');
	return {salt,digest}
}

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

router.post('/', async function (req, res, next) {
	let topic = req.user.email.split('@').join('') + 'editprofile'
	let user = {
        oldemail: req.user.email,
		email: req.body.email,
		password: req.body.password, 
		name: req.body.name,
		username: req.body.username,
		surname: req.body.surname,
		response: topic
	}
	// console.log(user);
	if (user.email && user.password && user.name && user.username && user.surname) {
		let {salt, digest} = createPassword(user.password)
		user['salt'] = salt
		user['digest'] = digest
		let message = JSON.stringify(user)
		await broker.createTopics(topic, 1);
		broker.sendMessage('editUser', [{value: message}]);
		let promise = broker.receiveMessage(topic, topic)
		promise.then(async (data) => {
			// console.log("PROMISE RESOLVED: " + data.msg)
			await data.consumer.disconnect()
			broker.deleteTopics([topic])
			if (data.msg === "") {
				console.log("DB Error")
				return res.sendStatus(500)
			}
			else {
				return res.sendStatus(200)
			}
		})
	}
	else {
		console.log("Request Error")
		return res.sendStatus(404)
	}
});

module.exports = router
