const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');
const db = require('../utils/database');

router.use(auth.authenticateToken);

router.get('/', (req, res, next) => {
    res.status(200).json(req.user);
});

router.get('/stats', (req, res, next) => { // TODO query the database and calculate totscore / totmax_score * 100
    res.status(200).json({percentage: 78});
})

module.exports = router
