const express = require('express');
const router = express.Router()
const db = require('../utils/database');
const broker = require('../utils/broker');
const auth = require('../utils/auth');
const crypto = require('crypto');

function createPassword(pwd){
	let salt = crypto.randomBytes(16).toString('hex');
    let hmac = crypto.createHmac('sha512', salt);
    hmac.update(pwd);
	let digest = hmac.digest('hex');
	return {salt,digest}
}

router.post('/', async function (req, res, next) {
	let user = {
		email: req.body.email,
		password: req.body.password, 
		name: req.body.name,
		role: req.body.role,
		username: req.body.username,
		surname: req.body.surname,
		response: req.body.email
	}
	// console.log(user);
	if (user.email && user.password && user.name && user.username && user.surname) {
		let {salt, digest} = createPassword(user.password)
		user['salt'] = salt
		user['digest'] = digest
		let message = JSON.stringify(user)
		await broker.createTopics(user.email, 1); // TODO invalid user exception with mario.rossi@gmail.com, probably @ is the problem
		broker.sendMessage('addUser', [{value: message}]);
		let promise = broker.receiveMessage(user.email, user.email)
		promise.then((token_data) => {
			broker.deleteTopics([user.email])
			if (token_data === "") {
				console.log("DB Error: " + error)
				return res.sendStatus(500)
			}
			else {
				let token = auth.generateAccessToken(JSON.parse(token_data))
				return res.json({token: token})
			}
		})
	}
	else{
		console.log("Request Error: " + error)
		return res.sendStatus(404)
	}
});

module.exports = router
