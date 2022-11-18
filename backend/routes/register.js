const express = require('express');
const router = express.Router()
const db = require('../utils/database');
const auth = require('../utils/auth');
const crypto = require('crypto');

function createPassword(pwd){
	let salt = crypto.randomBytes(16).toString('hex');
    let hmac = crypto.createHmac('sha512', salt);
    hmac.update(pwd);
	let digest = hmac.digest('hex');
	return {salt,digest}
}

router.post('/', function (req, res, next) {
	let user = {
		email: req.body.email,
		password: req.body.password, 
		name: req.body.name,
		role: req.body.role,
		username: req.body.username,
		surname: req.body.surname
	}
	// console.log(user);
	if (user.email && user.password && user.name && user.username && user.surname) {
		let {salt, digest} = createPassword(user.password)
		db.executeQuery(
			'CREATE (n:Person {name:$name, email:$email, salt:$salt, digest:$digest, role:$role, username:$username, surname:$surname}) return n', 
			{email: user.email, salt:salt, digest:digest, name:user.name, role:user.role, username:user.username, surname:user.surname},
			result => {
				let user = result.records[0].get(0)
				// console.log(user.properties)
				let token_data = {
					username: user.properties.username,
					name: user.properties.name,
					surname: user.properties.surname,
					email: user.properties.email,
					role: user.properties.role
				}
				let token = auth.generateAccessToken(token_data)
				return res.json({token: token})
			},
			error => {
				console.log("DB Error: " + error)
				return res.sendStatus(500)
			}
		);
	}
	else{
		console.log("Request Error: " + error)
		return res.sendStatus(404)
	}
});

module.exports = router
