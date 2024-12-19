const CommentModel = require('./models/CommentModel');

const handleCommentQueues = async (channel) => {
  const { queue } = await channel.assertQueue('delete_comments', { durable: true });

  channel.bindQueue(queue, 'events', 'game.deleted');
  channel.bindQueue(queue, 'events', 'review.deleted'); // Слушаем события об удалении отзывов

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const message = JSON.parse(msg.content.toString());
      //console.log(message);

      if (message.reviewId) {
        //console.log(`Received review.deleted for ReviewID ${message.reviewId}`);

        try {
          await CommentModel.deleteCommentsByReviewId(message.reviewId);
          //console.log(`Deleted comments for ReviewID ${message.reviewId}`);
        } catch (err) {
          console.error(`Failed to delete comments for ReviewID ${message.reviewId}:`, err.message);
        }
      }

      if (message.gameId) {
        //console.log(`Received game.deleted for GameID ${message.gameId}`);

        try {
          await CommentModel.deleteCommentsByReviewId(message.gameId);
          //console.log(`Deleted comments for GameID ${message.gameId}`);
        } catch (err) {
          console.error(`Failed to delete comments for GameID ${message.gameId}:`, err.message);
        }
      }

      channel.ack(msg);
    }
  });
};

module.exports = { handleCommentQueues };
