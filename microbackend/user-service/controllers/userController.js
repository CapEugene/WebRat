const UserModel = require('../models/UserModel');
const { jwtSecret } = require('../config/config');
const jwt = require('jsonwebtoken');

const getUserProfile = async (req, res) => {
  const userId = req.user.userid;
  //console.log(userId);
  try {
    const user = await UserModel.getUserInfoById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTokenData = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Предполагается, что токен передаётся в формате "Bearer TOKEN"
  // console.log(token);
  if (token == null) {
    // console.log('OK');
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    // console.log(decoded); // Проверяем и декодируем токен
    const { userid, username } = decoded; // Извлекаем данные из токена
    res.json({ userid, username });
  } catch (error) {
    //console.log('OK');
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { getUserProfile, getTokenData };