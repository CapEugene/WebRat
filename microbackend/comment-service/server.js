const express = require('express');
const bodyParser = require('body-parser');
const commentRoutes = require('./routes/commentRoutes');
const amqp = require('amqplib');
const { handleCommentQueues } = require('./commentQueueHandler');

const app = express();
app.use(bodyParser.json());

// Подключение маршрутов
app.use('/api/comments', commentRoutes);

// RabbitMQ подключение
let channel;

async function connectRabbitMQ() {
  const connection = await amqp.connect('amqp://localhost');
  channel = await connection.createChannel();
  await channel.assertExchange('events', 'topic', { durable: true });

  return channel;
}

connectRabbitMQ()
  .then(() => {
    app.locals.rabbitChannel = channel;
    handleCommentQueues(channel);
  })
  .catch(console.error);
  
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Comment Service running on port ${PORT}`));
