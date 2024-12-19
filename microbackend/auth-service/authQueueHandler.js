const jwt = require('jsonwebtoken');
const { jwtSecret } = require('./config/config');
const AuthModel = require('./models/AuthModel');

const handleAuthQueue = async (channel) => {
    await channel.assertQueue('auth.validate', { durable: false });
    await channel.assertQueue('auth.createUser', { durable: true });

    //console.log('Auth Service: Listening on queue "auth.validate"...');

    channel.consume(
        'auth.validate',
        async (msg) => {
            if (msg !== null) {
                const { token } = JSON.parse(msg.content.toString());
                const correlationId = msg.properties.correlationId;
                const replyTo = msg.properties.replyTo;

                let response = {};

                try {
                    // Проверяем токен
                    const decoded = jwt.verify(token, jwtSecret);

                    response = {
                        valid: true,
                        user: {
                            userid: decoded.userid,
                            username: decoded.username,
                            userrole: decoded.userrole,
                        },
                    };
                } catch (error) {
                    console.error('Token validation error:', error.message);

                    response = {
                        valid: false,
                        user: null,
                    };
                }

                // Отправляем ответ
                channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), {
                    correlationId,
                });

                // Подтверждаем обработку сообщения
                channel.ack(msg);
            }
        },
        { noAck: false }
    );

    channel.consume(
        'auth.createUser',
        async (msg) => {
          if (msg !== null) {
            const { email, passwordHash, username } = JSON.parse(msg.content.toString());
            const correlationId = msg.properties.correlationId;
            const replyTo = msg.properties.replyTo;
    
            let response;
    
            try {
              // Проверяем, существует ли пользователь с таким email
              const existingUser = await AuthModel.getUserByEmail(email);
              if (existingUser) {
                throw new Error('User with this email already exists');
              }
    
              // Создаем пользователя в таблице Users
              const newUser = await AuthModel.createUser(email, passwordHash);
    
              // Отправляем запрос на user-service для создания записи в UsersInfo
              const corrId = correlationId || `corr_${Date.now()}`;
              channel.sendToQueue(
                'user.create',
                Buffer.from(JSON.stringify({ userId: newUser.userid, username })),
                { correlationId: corrId }
              );
    
              // Формируем успешный ответ
              response = { userId: newUser.userid };
            } catch (error) {
              console.error('Error processing auth.createUser:', error.message);
    
              // Формируем ответ с ошибкой
              response = { error: error.message };
            }
    
            // Отправляем ответ
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
    
            // Подтверждаем обработку сообщения
            channel.ack(msg);
          }
        },
        { noAck: false }
      );
};

module.exports = { handleAuthQueue };
