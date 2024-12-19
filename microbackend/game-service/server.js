const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const gameRoutes = require('./routes/gameRoutes');
const amqp = require('amqplib');
const { handleGameUpdateStatistics } = require('./gameQueueHandler')

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Подключение маршрутов
app.use('/api/games', gameRoutes);

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
    handleGameUpdateStatistics(channel);
  })
  .catch(console.error);
  
const PORT = process.env.PORT || 5004;
app.listen(PORT, () => console.log(`Game Service running on port ${PORT}`));
