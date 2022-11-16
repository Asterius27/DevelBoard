const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
  
    if (token == null) return res.sendStatus(401)
  
    jwt.verify(token, process.env.TOKEN, (err, data) => {
        console.log(err)
        if (err) return res.sendStatus(403)
        req.user = data.user
        next()
    })
}

function generateAccessToken(username) {
	return jwt.sign(username, process.env.TOKEN, { expiresIn: '1800s' });
}

module.exports = { authenticateToken, generateAccessToken }
