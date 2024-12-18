const express = require('express');
const bodyParser = require('body-parser');
const amqp = require('amqplib');
const userRoutes = require('./routes/userRoutes');
const { handleUserQueues } = require('./userQueueHandler');

const app = express();
app.use(bodyParser.json());

app.use('/api/users', userRoutes);

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
     handleUserQueues(channel);
 })
 .catch(console.error);

const PORT = process.env.PORT || 5006;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
