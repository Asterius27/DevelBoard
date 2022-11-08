const express = require('express')
const neo4j = require('neo4j-driver')
const path = require('path')
const jwt = require('jsonwebtoken');
const router = express.Router()

const driver = neo4j.driver('bolt://localhost:7474/', neo4j.auth.basic('neo4j', 's3cr3t'))
const session = driver.session()
app.use(express.urlencoded({ extended: true }));
app.use(express.json())


// GET LOGIN PAGE
router.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + '/login.html')); // TO DO: get actual login page
});

// POST LOGIN PAGE
router.post('/', function (req, res) {
	let email = req.body.email 
	let password = req.body.password
	if (email && password) {
		session
		.run(
			  `MATCH (p:Person)
			  WHERE p.name = email AND p.password = password
			  RETURN p.name AS name
			  LIMIT 1`
		)
		.then(res.redirect('/home')
			//req.session.loggedin = true // TO DO: fix loggedin and redirect to the correct page
		)
		.catch(
			function(){ res.send('Error') }
		)
	}
	else{es.send('Incorrect Username and/or Password!')}
});

/*
router.get('/home', function(req,res){
	if(true)//(req.session.loggedin) // TO DO: fix loggedin
		res.send('<h1>Beautiful Home!</h1>')
	else
		res.redirect('/')
});
*/

module.exports = router