//https://neo4j.com/developer/js-movie-app/
const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('./utils/database');

const port = process.env.PORT;

const login = require('./routes/login') 
const register = require('./routes/register')
const evaluateCode = require('./routes/evaluateCode')
const challenges = require('./routes/challenges')
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use('/login', login)
app.use('/register', register)
app.use('/evaluate', evaluateCode)
app.use('/challenges', challenges)

app.listen(port, () => {
    console.log('app listening on port '+port);
    db.connectTo();

    db.executeQuery('CREATE CONSTRAINT unique_user IF NOT EXISTS FOR (user:Person) REQUIRE user.email IS UNIQUE',
        null,
        result => {console.log("Constraint on Person created in the DB")},
        error => {console.log(error)}
    );

    db.executeQuery('CREATE CONSTRAINT unique_challenge IF NOT EXISTS FOR (chall:Challenge) REQUIRE chall.title IS UNIQUE',
        null,
        result => {console.log("Constraint on Challenge created in the DB")},
        error => {console.log(error)}
    )
});