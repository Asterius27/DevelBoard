const express = require('express')
const router = express.Router()
const db = require('../utils/database');

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json())

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
		db.executeQuery('CREATE (n:Person {nome:$name, email:$email, password:$password, username:$username, surname:$surname} return n', 
		{email: user.email, password: user.password, name:user.name, username:user.username, surname:user.surname},
		result => {
			res.sendStatus(200).json(result)
		},
		error => {return next({statusCode: 404, error: true, errormessage: "DB Error: " + error})}
		)
	}
	else{return next({statusCode: 404, error: true, errormessage: "Missing or Wrong information!"})}
});

module.exports = router