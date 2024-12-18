const jwt = require('jsonwebtoken');
const { jwtSecret } = require('./config/config');

const handleAuthQueue = async (channel) => {
    await channel.assertQueue('auth.validate', { durable: false });

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
};

module.exports = { handleAuthQueue };
