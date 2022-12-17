const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');

router.use(auth.authenticateToken);

router.get('/', (req, res, next) => {
    res.status(200).json(req.user);
});

module.exports = router
