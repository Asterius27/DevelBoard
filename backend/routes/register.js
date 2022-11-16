const express = require('express');
const router = express.Router()
const db = require('../utils/database');
const auth = require('../utils/auth');

function createPassword(pwd){
	let salt = crypto.randomBytes(16).toString('hex');
    let hmac = crypto.createHmac('sha512', salt);
    hmac.update(pwd);
	let digest = hmac.digest('hex');
	return (salt,digest)
}

router.post('/', function (req,res){
	let user = {
		email: req.body.email,
		password: req.body.password, 
		name: req.body.name,
		role: req.body.role,
		username: req.body.username,
		surname: req.body.surname
	} 
	if (user.email && user.password && user.name && user.username && user.surname) {
		let (salt, digest) = createPassword(user.password)
		db.executeQuery(
			'CREATE (n:Person {name:$name, email:$email, salt:$salt, digest:$digest, role:$role, username:$username, surname:$surname}) return n', 
			{email: user.email, salt:salt, digest:digest, name:user.name, role:role, username:user.username, surname:user.surname},
			result => {
				let token = "";
				result.records.forEach(user => { token = auth.generateAccessToken(user) })
				res.sendStatus(200).json({token: token})
			},
			error => {
				console.log("DB Error: " + error)
				res.sendStatus(500)
			}
		)
	}
	else{
		console.log("Request Error: " + error)
		res.sendStatus(404)
	}
});

module.exports = router
