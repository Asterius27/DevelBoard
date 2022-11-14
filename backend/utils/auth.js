const jwt = require('jsonwebtoken');


export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
  
    if (token == null) return res.sendStatus(401).json({error: "Authentication failed"})
  
    jwt.verify(token, process.env.TOKEN, (err, data) => {
        console.log(err)
        if (err) return res.sendStatus(403)
        req.user = data.user
        next()
    })
}