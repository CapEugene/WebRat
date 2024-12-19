const express = require('express');
const bodyParser = require('body-parser');
const amqp = require('amqplib');
const authRoutes = require('./routes/authRoutes');
const { handleAuthQueue } = require('./authQueueHandler')

const app = express();
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
//console.log("OK");

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
     handleAuthQueue(channel);
 })
 .catch(console.error);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));
