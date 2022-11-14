//https://neo4j.com/developer/js-movie-app/
const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('./utils/database');

const port = process.env.PORT;

const login = require('./routes/login') 
const register = require('./routes/register')
const evaluateCode = require('./routes/evaluateCode')
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use('/login', login)
app.use('/register', register)
app.use('/evaluate', evaluateCode)

app.listen(port, () => {
    console.log('app listening on port '+port);
    db.connectTo();
});