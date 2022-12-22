//https://neo4j.com/developer/js-movie-app/
//https://getpino.io/#/docs/web?id=express
const express = require('express');
require('dotenv').config();
const broker = require('./utils/broker');
const login = require('./routes/login') 
const register = require('./routes/register')
const evaluateCode = require('./routes/evaluateCode')
const challenges = require('./routes/challenges')
const leaderboard = require('./routes/leaderboard')
const users = require('./routes/users')
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
app.use('/leaderboards', leaderboard)
app.use('/users', users)

// TODO "this server does not host this topic-partition" in express, "The coordinator is not aware of this member", "the group coordinator is not available", 
// "there is no leader for this topic-partition as we are in the middle of a leadership election" in user consumer (getuser) ERROR, probably solved by cleaning kafka instance (?)
app.listen(port, async () => {
    console.log('Starting...');
    await timeout.setTimeout(1000); // TODO not the best solution (25000), have to wait for kafka to startup
    console.log('app listening on port '+port);
    broker.create();
    // await broker.cleanUp();

    await broker.createTopics('addUser', process.env.KAFKA_USER_CONSUMER); // TODO try to increase the partitions and the consumers
    await broker.createTopics('loginUser', process.env.KAFKA_USER_CONSUMER);

    await broker.createTopics('createChallenge', process.env.KAFKA_CHALLENGE_CONSUMER);
    await broker.createTopics('getTitleChallenge', process.env.KAFKA_CHALLENGE_CONSUMER);
    await broker.createTopics('getChallenge', process.env.KAFKA_CHALLENGE_CONSUMER);
    await broker.createTopics('getLastChallenge', process.env.KAFKA_CHALLENGE_CONSUMER);

    await broker.createTopics('evaluateCode', process.env.KAFKA_CODE_EVALUATION_CONSUMER);
    
    await broker.createTopics('getGeneralLeaderboard', process.env.KAFKA_LEADERBOARD_CONSUMER);
    await broker.createTopics('getGeneralUserLeaderboard', process.env.KAFKA_LEADERBOARD_CONSUMER);
    await broker.createTopics('getLeaderboard', process.env.KAFKA_LEADERBOARD_CONSUMER);
    await broker.createTopics('getUserLeaderboard', process.env.KAFKA_LEADERBOARD_CONSUMER);
    await broker.createTopics('getChallengeLeaderboard', process.env.KAFKA_LEADERBOARD_CONSUMER);
    await broker.createTopics('getUserChallengeScore', process.env.KAFKA_LEADERBOARD_CONSUMER);
});
