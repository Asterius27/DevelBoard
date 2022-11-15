const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const dotenv = require('dotenv');
const passport = require('passport');
const passportHTTP = require('passport-http');
const db = require('../utils/database');

dotenv.config();

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json())


function generateAccessToken(username) {
	return jwt.sign(username, process.env.TOKEN, { expiresIn: '1800s' });
}

passport.use(new passportHTTP.BasicStrategy(
	function(email, password, done) {
		db.executeQuery(`MATCH (node:Person) {email = $email AND password = $password} RETURN node.email`,{email: email, password: password}, 
		result => {
			res.sendStatus(200).json({error: false, errormessage: "", token: generateAccessToken(result), temporary: req.user.temporary})
		},
		error => {res.sendStatus(404).json({error: true, errormessage: "DB Error: " + error})} 
		), (err, user) => { 
		if (err) { return done({statusCode: 500, error: true, errormessage:err});}
		if (!user) { return done(null, false, {statusCode: 500, error: true, errormessage: "Invalid user"});}
		if (user.validatePassword(password)) { return done(null, user);}
		return done(null, false, {statusCode: 500, error: true, errormessage: "Invalid password"});
	  }
}));


// GET LOGIN PAGE
router.get('/', function (req, res) {
	return res.status(200)
});

// POST LOGIN PAGE
router.post('/',  passport.authenticate('basic', {session: false}), function (req, res) {
	let user = {
		email: req.body.email, 
		password: req.body.password
	}
	if (user.email && user.password) {
		db.executeQuery(`MATCH (node:Person) {email = $email AND password = $password} RETURN node.email`,{email: user.email, password: user.password}, 
		result => {
			res.sendStatus(200).json({error: false, errormessage: "", token: generateAccessToken(result), temporary: req.user.temporary})
		},
		error => {res.sendStatus(404).json({error: true, errormessage: "DB Error: " + error})} 
		)
	}
	else{return next({statusCode: 404, error: true, errormessage: "Incorrect username and/or password"})}
});

module.exports = router