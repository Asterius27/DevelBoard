//https://neo4j.com/developer/js-movie-app/
const express = require('express');
import Neode from 'neode';

//const instance = new Neode('bolt://localhost:7687', 'username', 'password');

const app = express();

const port = 3000;

app.listen(port, () => {
    console.log('app listening on port '+port)
})