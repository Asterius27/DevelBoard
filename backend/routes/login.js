const express = require('express');
const router = express.Router();
const passport = require('passport');
const passportHTTP = require('passport-http');
const broker = require('../utils/broker');
const auth = require('../utils/auth');
const crypto = require('crypto');
const timeout = require('timers/promises')

function validatePassword(user, pwd){
	let hmac = crypto.createHmac('sha512', user.salt);
	hmac.update(pwd);
	let digest = hmac.digest('hex');
	return (user.digest === digest);
}

passport.use(new passportHTTP.BasicStrategy(
	async function(email, password, done) {
		// console.log(email, password)
		let topic = email.split('@').join('') + 'login'
		let msg = JSON.stringify({email: email, response: topic})
		let succ = await broker.createTopics(topic, 1);
		while (!succ) {
			await timeout.setTimeout(process.env.KAFKA_RETRY_TIMEOUT);
			succ = await broker.createTopics(topic, 1);
		}
		broker.sendMessage('loginUser', [{value: msg}])
		let promise = broker.receiveMessage(topic, topic)
		promise.then(async (data) => {
			await data.consumer.disconnect()
			broker.deleteTopics([topic])
			if (data.msg === "") {
				return done({statusCode: 500, error: true, errormessage: "DB error"})
			}
			if (data.msg === "Invalid User") {
				return done(null, false, {statusCode: 500, error: true, errormessage: "Invalid user"})
			}
			if (data.msg !== "" && data.msg !== "Invalid User") {
				let user = JSON.parse(data.msg)
				if (validatePassword(user, password)) { 
					return done(null, user);
				}
				else{
					return done(null, false, {statusCode: 500, error: true, errormessage: "Invalid password"})
				}
			}
		})
	}
));

router.get('/', passport.authenticate('basic', {session: false}), function (req, res, next) {
	let tokendata = {
		username: req.user.username,
		name: req.user.name,
		surname: req.user.surname,
		email: req.user.email,
		role: req.user.role
	};
	// console.log(tokendata)
	let token_signed = auth.generateAccessToken(tokendata)
	return res.status(200).json({error: false, errormessage: "", token: token_signed});
});

module.exports = router
