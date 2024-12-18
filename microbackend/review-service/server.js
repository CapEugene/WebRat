const express = require('express');
const bodyParser = require('body-parser');
const reviewRoutes = require('./routes/reviewRoutes');
const amqp = require('amqplib');

const app = express();
app.use(bodyParser.json());

// Подключение маршрутов
app.use('/api/reviews', reviewRoutes);

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
  })
  .catch(console.error);
  
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`Review Service running on port ${PORT}`));
