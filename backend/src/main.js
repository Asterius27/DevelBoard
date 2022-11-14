//https://neo4j.com/developer/js-movie-app/
const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config()
import { connectTo } from '../utils/database';

const port = process.env.PORT;
export var drivers;
//const instance = new Neode('bolt://localhost:7687', 'username', 'password');

const login = require('./routes/login') 
const register = require('./routes/register')
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json())


app.use('/login', login)
app.use('/register', register)

app.listen(port, () => {
    console.log('app listening on port '+port);
    drivers=connectTo()
});