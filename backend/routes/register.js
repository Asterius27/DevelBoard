const express = require('express')
const neo4j = require('neo4j-driver')
const path = require('path')
const jwt = require('jsonwebtoken');
const router = express.Router()

const driver = neo4j.driver('bolt://localhost:7474/', neo4j.auth.basic('neo4j', 's3cr3t'))
const session = driver.session()
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

// GET REGISTER PAGE
router.get('/', function (req,res){
	res.sendFile(path.join(__dirname + '/login.html')); // TO DO: get actual register page
});


// POST REGISTER PAGE
router.post('/', function (req, res) {
	let email = req.body.email 
	let password =  req.body.password 
	let name = req.body.name 
	if (email && password) {
		session
		.run(
			  'CREATE (n:Person {nome:{nameParam}, email:{emailParam}, password:{passwordParam}} return n', {nameParam:name, emailParam:email, passwordParam:password}
			)
		.then(
			res.redirect('/home')	
		)
		.catch(
			function(){ res.send('Error') }
		)
	}
	else{
			res.send('An error occurred')
		}
		res.end()
	
});

module.exports = router