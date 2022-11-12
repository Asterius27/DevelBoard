const express = require('express')
const neo4j = require('neo4j-driver')
const path = require('path')
const router = express.Router()

const driver = neo4j.driver('bolt://localhost:7474/', neo4j.auth.basic('neo4j', 's3cr3t'))
const session = driver.session()
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

// GET REGISTER PAGE
router.get('/', function (req,res){
	return res.status(200)
});


// POST REGISTER PAGE
router.post('/', function (req, res) {
	let user = {
		email: req.body.email,
		password: req.body.password, 
		name: req.body.name,
		username: req.body.username,
		surname: req.body.surname
	} 
	if (user.email && user.password && user.name && user.username && user.surname) {
		session
		.run(
			  'CREATE (n:Person {nome:{nameParam}, email:{emailParam}, password:{passwordParam}, username:{usernameParam}, surname:{surnameParam}} return n', {nameParam:user.name, emailParam:user.email, passwordParam:user.password, usernameParam:user.username, surnameParam:user.surname}
			)
		.then(res.sendStatus(200).json({error: false, errormessage: ""})
		)
		.catch(
			(err) => {return next({statusCode: 404, error: true, errormessage: "DB Error: " + err})}
		)
	}
	else{return next({statusCode: 404, error: true, errormessage: "Missing information!"})}
});

module.exports = router