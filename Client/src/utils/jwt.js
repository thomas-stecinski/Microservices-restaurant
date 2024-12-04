const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key'; 

exports.generateToken = (payload) => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
};

exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    throw new Error('Token invalide ou expiré');
  }
};
