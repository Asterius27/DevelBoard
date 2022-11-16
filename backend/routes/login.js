const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const passport = require('passport');
const passportHTTP = require('passport-http');
const db = require('../utils/database');
const auth = require('../utils/auth');
dotenv.config();

function validatePassword(user, pwd){
	let hmac = crypto.createHmac('sha512', user.salt);
	hmac.update(pwd);
	let digest = hmac.digest('hex');
	return (user.digest === digest);
}

passport.use(new passportHTTP.BasicStrategy(
	function(email, password, done) {
		db.executeQuery(`MATCH (node:Person {email: $email}) RETURN node`, {email: email}), 
		result => {
			if (!result) { 
				return done(null, false, {statusCode: 500, error: true, errormessage: "Invalid user"})}
			else {
				let user = result.records[0]
				if (validatePassword(user, password)) { 
					return done(null, user);
				}
				else{
					return done(null, false, {statusCode: 500, error: true, errormessage: "Invalid password"})
				}
			}
		},
		error => {return done({statusCode: 500, error: true, errormessage: error})}
	}
));

router.get('/', passport.authenticate('basic', {session: false}), function (req, res) {
	let tokendata = {
    username: req.user.username,
    name: req.user.name,
    surname: req.user.surname,
    mail: req.user.mail,
    role: req.user.role,
    id: req.user.id,
    temporary: req.user.temporary
  };
  let token_signed = auth.generateAccessToken(tokendata)
  return res.status(200).json({error: false, errormessage: "", token: token_signed});
});

module.exports = router
