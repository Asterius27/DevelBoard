//https://neo4j.com/developer/js-movie-app/
const express = require('express');
import Neode from 'neode';
const jwt = require('jsonwebtoken');

//const instance = new Neode('bolt://localhost:7687', 'username', 'password');

const login = require('./routes/login') 
const register = require('./routes/register')
const app = express();

const port = 3000; //to change with env variable

app.use('/login', login)
app.use('/register', register)

app.listen(port, () => {
    console.log('app listening on port '+port);
});