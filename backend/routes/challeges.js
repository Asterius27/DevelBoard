const express = require('express');
const router = express.Router();
import Neode from 'neode';
import authenticateToken from '../utils/auth';

const instance = Neode.fromEnv().with({Quiz: require('../models/Quiz')});

router.use(express.json());

router.use(authenticateToken)

router.post('/' ,(req, resp) => {
    req.body
})

module.exports = router