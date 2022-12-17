//https://neo4j.com/developer/js-movie-app/
//https://getpino.io/#/docs/web?id=express
const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('./utils/database');
const broker = require('./utils/broker');
const login = require('./routes/login') 
const register = require('./routes/register')
const evaluateCode = require('./routes/evaluateCode')
const challenges = require('./routes/challenges')
const users = require('./routes/users')
const leaderboard = require('./routes/leaderboard')
const cors = require('cors')
const pino = require('pino-http')
const timeout = require('timers/promises')

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(pino());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/login', login)
app.use('/register', register)
app.use('/evaluate', evaluateCode)
app.use('/challenges', challenges)
app.use('/users', users)
app.use('/leaderboards', leaderboard)

app.listen(port, async () => {
    console.log('Starting...');
    await timeout.setTimeout(1000); // TODO not the best solution (40000), have to wait for db to startup
    console.log('app listening on port '+port);
    broker.create();

    await broker.createTopics('addUser', 1); // TODO try to increase the partitions and the consumers
    await broker.createTopics('loginUser', 1);
    await broker.createTopics('createChallenge', 1);
    await broker.createTopics('getTitleChallenge', 1);
    await broker.createTopics('getChallenge', 1);
    await broker.createTopics('evaluateCode', 1);

    db.connectTo(); // TODO create admin account

    db.executeQuery('CREATE CONSTRAINT unique_user IF NOT EXISTS FOR (user:Person) REQUIRE user.email IS UNIQUE',
        null,
        result => {console.log("Constraint on Person created in the DB")},
        error => {console.log(error)}
    );

    db.executeQuery('CREATE CONSTRAINT unique_challenge IF NOT EXISTS FOR (chall:Challenge) REQUIRE chall.title IS UNIQUE',
        null,
        result => {console.log("Constraint on Challenge created in the DB")},
        error => {console.log(error)}
    );
});
