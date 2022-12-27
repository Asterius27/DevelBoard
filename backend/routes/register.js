const express = require('express');
const router = express.Router()
const broker = require('../utils/broker');
const auth = require('../utils/auth');
const crypto = require('crypto');
const timeout = require('timers/promises')

function createPassword(pwd){
	let salt = crypto.randomBytes(16).toString('hex');
    let hmac = crypto.createHmac('sha512', salt);
    hmac.update(pwd);
	let digest = hmac.digest('hex');
	return {salt,digest}
}

router.post('/', async function (req, res, next) {
	let topic = req.body.email.split('@').join('') + 'register'
	let user = {
		email: req.body.email,
		password: req.body.password, 
		name: req.body.name,
		role: req.body.role,
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
		let succ = await broker.createTopics(topic, 1);
		while (!succ) {
			await timeout.setTimeout(process.env.KAFKA_RETRY_TIMEOUT);
			succ = await broker.createTopics(topic, 1);
		}
		broker.sendMessage('addUser', [{value: message}]);
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
				let token = auth.generateAccessToken(JSON.parse(data.msg))
				return res.json({token: token})
			}
		})
	}
	else {
		console.log("Request Error")
		return res.sendStatus(404)
	}
});

module.exports = router
