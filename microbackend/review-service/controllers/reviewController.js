const ReviewModel = require('../models/ReviewModel');

const getReviewsByGameId = async (req, res) => {
  const { gameId } = req.params;
  try {
    const reviews = await ReviewModel.getReviewsByGameId(gameId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addReview = async (req, res) => {
  const { gameId, rating, reviewText } = req.body;
  const userId = req.user.userid; // ID пользователя из токена

  if (!userId) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const channel = req.app.locals.rabbitChannel;

  if (!channel) {
    return res.status(500).json({ message: 'RabbitMQ channel not found' });
  }

  try {
    // 1. Создание отзыва в локальной базе данных
    const review = await ReviewModel.createReview({ gameId, userId, rating, reviewText });

    // 2. Обновление статистики игры (взаимодействие с game-service)
    const updateGameCorrelationId = Math.random().toString(36).substring(7);

    const gameUpdateResponseQueue = await channel.assertQueue('', { exclusive: true });

    channel.sendToQueue(
      'game.updateStatistics',
      Buffer.from(JSON.stringify({ gameId, rating })),
      {
        correlationId: updateGameCorrelationId,
        replyTo: gameUpdateResponseQueue.queue,
      }
    );

    const gameUpdateResult = await new Promise((resolve) => {
      channel.consume(
        gameUpdateResponseQueue.queue,
        (msg) => {
          if (msg.properties.correlationId === updateGameCorrelationId) {
            const data = JSON.parse(msg.content.toString());
            resolve(data);
          }
        },
        { noAck: true }
      );
    });

    if (!gameUpdateResult.success) {
      console.error('Error updating game statistics:', gameUpdateResult.error);
    }

    // 3. Получение информации о пользователе (взаимодействие с user-service)
    const userCorrelationId = Math.random().toString(36).substring(7);

    const userResponseQueue = await channel.assertQueue('', { exclusive: true });

    channel.sendToQueue(
      'user.getById',
      Buffer.from(JSON.stringify({ userId })),
      {
        correlationId: userCorrelationId,
        replyTo: userResponseQueue.queue,
      }
    );

    const userResult = await new Promise((resolve) => {
      channel.consume(
        userResponseQueue.queue,
        (msg) => {
          if (msg.properties.correlationId === userCorrelationId) {
            const data = JSON.parse(msg.content.toString());
            resolve(data);
          }
        },
        { noAck: true }
      );
    });

    if (!userResult.user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 4. Формирование ответа
    res.status(201).json({ ...review, username: userResult.user.username });
  } catch (error) {
    console.error('Error adding review:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


const addLikeOnReview = async (req, res) => {
  const userId = req.user.userid;

  if(!userId){
    return res.status(403).json({ message: 'Unauthorized' });
  }
  
  const { reviewId } = req.params;
  try {
    const review = await ReviewModel.getReviewById(reviewId);
    if (!review){
      return res.status(404).json({ message: 'Review not found' });
    }

    review.likes += 1;
    await ReviewModel.updateReviewStatistics(review);

    res.json({ likes: review.likes });
  } catch (error) {
    res.status(500).json({ message: 'Error liking review', error });
  }
};


module.exports = { getReviewsByGameId, addReview, addLikeOnReview };
