const express = require('express');
const bodyParser = require('body-parser');
const favoriteRoutes = require('./routes/favoriteRoutes');
const amqp = require('amqplib');

const app = express();
app.use(bodyParser.json());

// Подключение маршрутов
app.use('/api/favorites', favoriteRoutes);

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
  
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`Favorite Service running on port ${PORT}`));
