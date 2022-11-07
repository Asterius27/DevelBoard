//https://neo4j.com/developer/js-movie-app/
const express = require('express');
import Neode from 'neode';
const jwt = require('jsonwebtoken');

//const instance = new Neode('bolt://localhost:7687', 'username', 'password');

const app = express();

const port = 3000; //to change with env variable

app.listen(port, () => {
    console.log('app listening on port '+port);
});