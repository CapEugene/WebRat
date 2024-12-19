const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');
const AuthModel = require('../models/AuthModel');

const register = async (req, res) => {
  //console.log(req.body);
  const { email, password, username } = req.body;

  const channel = req.app.locals.rabbitChannel;
  if (!channel) {
    return res.status(500).json({ message: 'RabbitMQ channel not available' });
  }

  try {
    // Хэшируем пароль
    const passwordHash = await bcrypt.hash(password, 10);

    // Создаём уникальный идентификатор для корреляции ответа
    const correlationId = Math.random().toString(36).substring(7);

    // Создаём временную очередь для ответа
    const responseQueue = await channel.assertQueue('', { exclusive: true });

    // Отправляем запрос на auth.createUser
    channel.sendToQueue(
      'auth.createUser',
      Buffer.from(JSON.stringify({ email, passwordHash, username })),
      { correlationId, replyTo: responseQueue.queue }
    );

    // Ждём ответа от auth-service
    const createdUser = await new Promise((resolve, reject) => {
      channel.consume(
        responseQueue.queue,
        (msg) => {
          if (msg.properties.correlationId === correlationId) {
            const data = JSON.parse(msg.content.toString());
            if (data.error) reject(new Error(data.error));
            else resolve(data);
          }
        },
        { noAck: true }
      );
    });

    res.status(201).json(createdUser);
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const channel = req.app.locals.rabbitChannel; // Канал для RabbitMQ
  if (!channel) {
    return res.status(500).json({ message: 'RabbitMQ channel not found' });
  }

  try {
    // Шаг 1: Проверяем данные в auth-service
    const user = await AuthModel.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordhash);
    //console.log(isMatch);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Шаг 2: Запрашиваем данные о пользователе из user-service
    const correlationId = Math.random().toString(36).substring(7);
    const responseQueue = await channel.assertQueue('', { exclusive: true });

    channel.sendToQueue('user.getById', Buffer.from(JSON.stringify({ userId: user.userid })), {
      correlationId,
      replyTo: responseQueue.queue,
    });

    const userData = await new Promise((resolve, reject) => {
      channel.consume(
        responseQueue.queue,
        (msg) => {
          if (msg.properties.correlationId === correlationId) {
            const data = JSON.parse(msg.content.toString());
            if (data.error) reject(new Error(data.error));
            else resolve(data);
          }
        },
        { noAck: true }
      );
    });

    //console.log(userData);

    // Шаг 3: Генерируем JWT с username и role из user-service
    const token = jwt.sign(
      { userid: user.userid, username: userData.username, userrole: userData.role },
      jwtSecret,
      { expiresIn: '300d' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Login error: ', error.message);
    res.status(500).json({ error: error.message });
  }
};

const getUserInfoFromToken = async (token, channel) => {
  const userId = getUserIdFromToken(token); // Извлекаем userId из токена

  const correlationId = Math.random().toString(36).substring(7);
  const responseQueue = await channel.assertQueue('', { exclusive: true });

  // Отправляем запрос в user-service для получения данных о пользователе
  channel.sendToQueue('user.getById', Buffer.from(JSON.stringify({ userId })), {
    correlationId,
    replyTo: responseQueue.queue,
  });

  // Ожидаем ответ от user-service
  return new Promise((resolve, reject) => {
    channel.consume(
      responseQueue.queue,
      (msg) => {
        if (msg.properties.correlationId === correlationId) {
          const data = JSON.parse(msg.content.toString());
          if (data.error) {
            reject(new Error(data.error));
          } else {
            resolve(data);
          }
        }
      },
      { noAck: true }
    );
  });
};



module.exports = { register, login, getUserInfoFromToken };
