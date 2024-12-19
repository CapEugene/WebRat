const CommentModel = require('../models/CommentModel');

const getCommentsByReview = async (req, res) => {
  const { reviewId } = req.params;
  const channel = req.app.locals.rabbitChannel; // Канал для RabbitMQ

  if (!channel) {
    return res.status(500).json({ error: 'RabbitMQ channel not found' });
  }

  try {
    // Шаг 1: Получаем комментарии из базы данных (без Username)
    const comments = await CommentModel.getCommentsByReviewId(reviewId);

    if (!comments.length) {
      return res.json([]); // Если комментариев нет, возвращаем пустой массив
    }

    // Шаг 2: Получаем уникальные UserID из комментариев
    const userIds = [...new Set(comments.map((comment) => comment.userid))]; // Уникальные UserID

    // Шаг 3: Отправляем запрос в user-service через RabbitMQ
    const correlationId = Math.random().toString(36).substring(7);
    const responseQueue = await channel.assertQueue('', { exclusive: true });

    channel.sendToQueue('user.getByIds', Buffer.from(JSON.stringify({ userIds })), {
      correlationId,
      replyTo: responseQueue.queue,
    });

    // Ожидаем ответ от user-service
    const userData = await new Promise((resolve, reject) => {
      channel.consume(
        responseQueue.queue,
        (msg) => {
          if (msg.properties.correlationId === correlationId) {
            const data = JSON.parse(msg.content.toString());
            if (data.error) {
              reject(new Error(data.error));
            } else {
              resolve(data.users); // Список пользователей
            }
          }
        },
        { noAck: true }
      );
    });

    // Шаг 4: Объединяем данные комментариев с данными пользователей
    const commentsWithUsernames = comments.map((comment) => {
      const user = userData.find((u) => u.userid === comment.userid); // Ищем пользователя по UserID
      return {
        ...comment,
        username: user ? user.username : null, // Добавляем Username, если пользователь найден
      };
    });
    
    //console.log(commentsWithUsernames);
    res.json(commentsWithUsernames);
  } catch (error) {
    console.error('Error fetching comments:', error.message);
    res.status(500).json({ error: error.message });
  }
};

  

const addComment = async (req, res) => {
  const { reviewId, commentText } = req.body;
  const userId = req.user.userid; // Предполагаем, что пользователь аутентифицирован

  try {
    const channel = req.app.locals.rabbitChannel;
    const responseQueue = await channel.assertQueue('', { exclusive: true });

    const correlationId = Math.random().toString(36).substring(7);

    channel.sendToQueue(
      'user.getById',
      Buffer.from(JSON.stringify({ userId })),
      {
        correlationId,
        replyTo: responseQueue.queue,
      }
    );

    const userResponse = await new Promise((resolve, reject) => {
      channel.consume(
        responseQueue.queue,
        (msg) => {
          if (msg.properties.correlationId === correlationId) {
            const response = JSON.parse(msg.content.toString());
            if (response.error) {
              reject(new Error('Failed to fetch user data'));
            } else {
              resolve(response);
            }
          }
        },
        { noAck: true }
      );
    });

    const { username } = userResponse;

    // Добавляем комментарий в базу
    const newComment = await CommentModel.addComment(reviewId, userId, commentText);

    // Формируем объект ответа сразу с `username`
    const commentWithUser = {
      ...newComment,
      username,
    };
    // Отправляем ответ с добавленным комментарием
    res.status(201).json(commentWithUser);
  } catch (error) {
    console.error('Error adding comment: ', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


  module.exports = { getCommentsByReview, addComment };