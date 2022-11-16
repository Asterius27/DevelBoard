const express = require('express');
const { authenticate } = require('passport');
const router = express.Router()
const db = require('../utils/database');
const auth = require('../utils/auth');

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json())

function createPassword(pwd){
	let salt = crypto.randomBytes(16).toString('hex');
    let hmac = crypto.createHmac('sha512', salt);
    hmac.update(pwd);
	let digest = hmac.digest('hex');
	return (salt,digest)
}

// GET REGISTER PAGE
router.post('/', function (req,res){
	let user = {
		email: req.body.email,
		password: req.body.password, 
		name: req.body.name,
		username: req.body.username,
		surname: req.body.surname
	} 
	if (user.email && user.password && user.name && user.username && user.surname) {

		let (salt, digest) = createPassword(user.password)

		db.executeQuery('CREATE (n:Person {nome:$name, email:$email, salt:$salt, digest:$digest, username:$username, surname:$surname}) return n', 
		{email: user.email, salt:salt, digest:digest, name:user.name, username:user.username, surname:user.surname},
		result => {
			res.sendStatus(200).json(result.records.forEach(user => { auth.generateAccessToken(user) }))
			},
		error => {return next({statusCode: 404, error: true, errormessage: "DB Error: " + error})}
		)
	}
	else{return next({statusCode: 404, error: true, errormessage: "Missing or wrong information!"})}
});




module.exports = router