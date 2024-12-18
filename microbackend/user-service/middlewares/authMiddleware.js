const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    if (!decoded.userid) {
      return res.status(403).json({ message: 'Invalid token payload: userid missing' });
    }
    
    req.user = decoded;
    next();
  });
};

module.exports = { authenticate };
