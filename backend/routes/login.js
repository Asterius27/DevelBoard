const express = require('express');
const neo4j = require('neo4j-driver')
const path = require('path');
const jwt = require('jsonwebtoken');
const router = express.Router();
const dotenv = require('dotenv');

dotenv.config();

const driver = neo4j.driver('bolt://localhost:7474/', neo4j.auth.basic('neo4j', 's3cr3t'))
const session = driver.session()
app.use(express.urlencoded({ extended: true }));
app.use(express.json())


function generateAccessToken(username) {
	return jwt.sign(username, process.env.TOKEN, { expiresIn: '1800s' });
}

passport.use(new passportHTTP.BasicStrategy(
	function(email, password, done) {
	  user.getModel().findOne({email: email}, (err, user) => { // TO DO: change user.getModel() in the OGM way
		if (err) {
		  return done({statusCode: 500, error: true, errormessage:err});
		}
		if (!user) {
		  return done(null, false, {statusCode: 500, error: true, errormessage: "Invalid user"});
		}
		if (user.validatePassword(password)) {
		  return done(null, user);
		}
		return done(null, false, {statusCode: 500, error: true, errormessage: "Invalid password"});
	  })
	}
));

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
		session
		.run(
			  `MATCH (p:Person)
			  WHERE p.name = email AND p.password = password
			  RETURN p.name AS name
			  LIMIT 1`
		)
		let token_signed = generateAccessToken(user.email)
		.then(res.sendStatus(200).json({error: false, errormessage: "", token: token_signed, temporary: req.user.temporary})
		)
		.catch(
			(err) => {return next({statusCode: 404, error: true, errormessage: "DB Error: " + err})}
		)
	}
	else{return next({statusCode: 404, error: true, errormessage: "Incorrect username and/or password"})}
});

module.exports = router