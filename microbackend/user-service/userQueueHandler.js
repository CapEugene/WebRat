const UserModel = require('./models/UserModel');

const handleUserQueues = async (channel) => {
  // Обработчик для user.create
  await channel.assertQueue('user.create', { durable: true });
  channel.consume('user.create', async (msg) => {
    if (msg !== null) {
      const { userId, username } = JSON.parse(msg.content.toString());

      try {
        // Создаем информацию в UsersInfo
        await UserModel.createUserInfo(userId, username);
      } catch (error) {
        console.error('Error processing user.create:', error.message);
      }

      channel.ack(msg);
    }
  });

  // Другие обработчики (например, user.getById)
  await channel.assertQueue('user.getById', { durable: true });
  channel.consume('user.getById', async (msg) => {
    if (msg !== null) {
      const { userId } = JSON.parse(msg.content.toString());
      //console.log(userId);
      const { replyTo, correlationId } = msg.properties;

      try {
        const userInfo = await UserModel.getUserInfoById(userId);
        //console.log(userInfo);

        const response = userInfo
          ? { username: userInfo.username, role: userInfo.role, correlationId: correlationId }
          : { error: 'User info not found' };

        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
      } catch (error) {
        console.error('Error processing user.getById:', error.message);
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify({ error: 'Internal server error' })), { correlationId });
      }

      channel.ack(msg);
    }
  });

  await channel.assertQueue('user.get', { durable: true });
  channel.consume('user.get', async (msg) => {
    if (msg !== null) {
      const { email } = JSON.parse(msg.content.toString());
      const { replyTo, correlationId } = msg.properties;

      try {
        // Извлечение информации о пользователе из базы данных
        const user = await UserModel.getUserByEmail(email);

        const response = user
          ? { user }
          : { error: 'User not found' };

        // Отправка ответа в очередь replyTo
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), {
          correlationId,
        });
      } catch (error) {
        console.error('Error processing user.get:', error.message);
        channel.sendToQueue(
          replyTo,
          Buffer.from(JSON.stringify({ error: 'Internal server error' })),
          { correlationId }
        );
      }

      // Подтверждение обработки сообщения
      channel.ack(msg);
    }
  });

  await channel.assertQueue('user.getByIds', { durable: true });
  channel.consume('user.getByIds', async (msg) => {
    //console.log('Received message in user.getByIds:', msg.content.toString()); // Логирование

    if (msg !== null) {
      const { userIds } = JSON.parse(msg.content.toString());
      const { replyTo, correlationId } = msg.properties;

      try {
        // Проверка массива userIds
        if (!Array.isArray(userIds) || userIds.length === 0) {
          throw new Error('Invalid or empty userIds array');
        }

        // Проверка формата userIds (должны быть числами)
        if (!userIds.every((id) => Number.isInteger(id))) {
          throw new Error('Invalid userIds format: all IDs must be integers');
        }

        // Запрос к базе данных
        const users = await UserModel.getUsersByIds(userIds);

        //console.log('Sending response:', users); // Логирование ответа
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify({ users })), {
          correlationId,
        });
      } catch (error) {
        console.error('Error processing user.getByIds:', error.message);
        channel.sendToQueue(
          replyTo,
          Buffer.from(JSON.stringify({ error: error.message })),
          { correlationId }
        );
      }

      channel.ack(msg);
    }
  });

};

module.exports = { handleUserQueues };
