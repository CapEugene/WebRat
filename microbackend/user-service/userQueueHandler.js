const UserModel = require('./models/UserModel');

const handleUserQueues = async (channel) => {
  // Обработчик для очереди user.getById
  await channel.assertQueue('user.getById', { durable: true });
  channel.consume('user.getById', async (msg) => {
    if (msg !== null) {
      const { userId } = JSON.parse(msg.content.toString());
      const { replyTo, correlationId } = msg.properties;

      try {
        const user = await UserModel.getUserById(userId);

        const response = user
          ? { userId: user.id, username: user.username, role: user.role }
          : { error: 'User not found' };

        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
      } catch (error) {
        console.error('Error processing user.getById:', error.message);

        const response = { error: 'Internal server error' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
      }

      channel.ack(msg);
    }
  });

  // Обработчик для очереди user.create
  await channel.assertQueue('user.create', { durable: true });
  channel.consume('user.create', async (msg) => {
    if (msg !== null) {
      const { username, email, passwordHash } = JSON.parse(msg.content.toString());
      const { replyTo, correlationId } = msg.properties;

      try {
        const newUser = await UserModel.createUser(username, email, passwordHash);

        const response = { user: newUser };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
      } catch (error) {
        console.error('Error processing user.create:', error.message);

        const response = { error: error.message };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
      }

      channel.ack(msg);
    }
  });

  // Обработчик для очереди user.get
  await channel.assertQueue('user.get', { durable: true });
  channel.consume('user.get', async (msg) => {
    if (msg !== null) {
      const { email } = JSON.parse(msg.content.toString());
      const { replyTo, correlationId } = msg.properties;

      try {
        const user = await UserModel.getUserByEmail(email);

        const response = user
          ? { user }
          : { error: 'User not found' };

        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
      } catch (error) {
        console.error('Error processing user.get:', error.message);

        const response = { error: 'Internal server error' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
      }

      channel.ack(msg);
    }
  });
};

module.exports = { handleUserQueues };
