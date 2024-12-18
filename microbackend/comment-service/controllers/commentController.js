const CommentModel = require('../models/CommentModel');

const getCommentsByReview = async (req, res) => {
    const { reviewId } = req.params;
    try {
      const comments = await CommentModel.getCommentsByReviewId(reviewId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

  const addComment = async (req, res) => {
    const { reviewId, commentText } = req.body;
    const userId = req.user.userid; // предполагаем, что пользователь аутентифицирован
  
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

      channel.consume(
        responseQueue.queue,
        (msg) => {
          if (msg !== null) {
            const response = JSON.parse(msg.content.toString());

            if (response.correlationId === correlationId) {
              const {user, error} = response;

              if (error) {
                console.error('Error from Users Service: ', error);
                res.status(500).json({ error: 'Failed to fetch user data'});
              } else {
                CommentModel.addComment(reviewId, userId, commentText).then((newComment) => {
                  const commentWithUser = {
                    ...newComment,
                    username: user.username,
                  };
                  res.status(201).json(commentWithUser);
                });
              }

              channel.ack(msg);
              }
          }
        },
        { noAck: false }
      );
    } catch (error) {
      console.error('Error adding comment: ', error.message);
      res.status(500).json({ error: 'Internal server error'});
    }
  };

  module.exports = { getCommentsByReview, addComment };