const express = require('express')
const neo4j = require('neo4j-driver')
const path = require('path')
const jwt = require('jsonwebtoken');

const driver = neo4j.driver('bolt://localhost:7474/', neo4j.auth.basic('neo4j', 's3cr3t'))
const session = driver.session()
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json())


// http://localhost:3000/ 
// TO LOGIN
app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + '/login.html'));
});

// http://localhost:3000/auth
// POST OF LOGIN
app.post('/auth', function (req, res) {
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
			//req.session.loggedin = true // TO DO: fix loggedin
		)
		.catch(
			function(){ res.send('Error') }
		)
	}
	else{es.send('Incorrect Username and/or Password!')}
});

app.get('/home', function(req,res){
	if(true)//(req.session.loggedin) // TO DO: fix loggedin
		res.send('<h1>Beautiful Home!</h1>')
	else
		res.redirect('/')
});

app.get('/register', function (req,res){
	res.sendFile(path.join(__dirname + '/login.html'));
});

// http://localhost:3000/register
// POST OF REGISTER
app.post('/register', function (req, res) {
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

app.listen(3000);