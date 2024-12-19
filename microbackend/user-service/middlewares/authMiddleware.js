const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const channel = req.app.locals.rabbitChannel;

  if (!channel) {
    return res.status(500).json( {message: 'RabbitMQ channel not found'} );
  }

  try {
    const correlationId = Math.random().toString(36).substring(7);

    const responseQueue = await channel.assertQueue('', { exclusive: true });

    channel.sendToQueue('auth.validate', Buffer.from(JSON.stringify({ token })), {
      correlationId,
      replyTo: responseQueue.queue,
  });

  const result = await new Promise((resolve) => {
    channel.consume(
      responseQueue.queue,
      (msg) => {
        if (msg.properties.correlationId === correlationId) {
          const data = JSON.parse(msg.content.toString());
          resolve(data);
      }
      },
      { noAck: true }
    );
  });

  if (!result.valid) {
    return res.status(403).json({ message: 'Invalid token '});
  }

  //console.log(result);
  req.user = result.user;
  next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { authenticate };
