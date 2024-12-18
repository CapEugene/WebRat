const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');

const register = async (req, res) => {
  const { username, email, password } = req.body;

  const channel = req.app.locals.rabbitChannel; // Используем RabbitMQ канал из app.locals
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

    // Отправляем запрос на создание пользователя в user-service
    channel.sendToQueue(
      'user.create',
      Buffer.from(JSON.stringify({ username, email, passwordHash })),
      {
        correlationId,
        replyTo: responseQueue.queue,
      }
    );

    // Ждём ответа от user-service
    const createdUser = await new Promise((resolve, reject) => {
      channel.consume(
        responseQueue.queue,
        (msg) => {
          if (msg.properties.correlationId === correlationId) {
            const data = JSON.parse(msg.content.toString());
            if (data.error) reject(new Error(data.error));
            else resolve(data.user);
          }
        },
        { noAck: true }
      );
    });

    // Возвращаем созданного пользователя
    res.status(201).json(createdUser);
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const login = async (req, res) => {
  const {email, password} = req.body;

  const channel = req.app.locals.rabbitChannel;
  if (!channel) {
    return res.status(500).json({ message: 'RabbitMQ channel not found' });
  }

  try {
    const correlationId = Math.random().toString(36).substring(7);

    const responseQueue = await channel.assertQueue('', { exclusive: true });

    channel.sendToQueue('user.get', Buffer.from(JSON.stringify({ email })), {
      correlationId,
    replyTo: responseQueue.queue,
  });

    const user = await new Promise((resolve, reject) => {
      channel.consume(
        responseQueue.queue,
        (msg) => {
          if (msg.properties.correlationId === correlationId) {
            const data = JSON.parse(msg.content.toString());
            if (data.error) reject(new Error(data.error));
            else resolve(data.user);
          }
        },
        { noAck: true}
      );
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentails' });
    }

    const token = jwt.sign(
      {userid: user.userid, username: user.username, userrole: user.role},
      jwtSecret,
      { expiresIn: '300d' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Login error: ', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login };
