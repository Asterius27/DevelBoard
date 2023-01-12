const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
    let decoded = {}
    try {
        decoded = jwt.verify(token, process.env.TOKEN);
    } catch(err) {
        console.log(err)
        return res.sendStatus(403)
    }
    req.user = decoded;
    next()
}

function generateAccessToken(user) {
	return jwt.sign(user, process.env.TOKEN, {});
}

module.exports = { authenticateToken, generateAccessToken }
