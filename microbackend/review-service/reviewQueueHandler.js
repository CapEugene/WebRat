const ReviewModel = require('./models/ReviewModel');

const handleReviewQueues = async (channel) => {
  const { queue } = await channel.assertQueue('delete_reviews', { durable: true });

  channel.bindQueue(queue, 'events', 'game.deleted');

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const { gameId } = JSON.parse(msg.content.toString());
      //console.log(`Received game.deleted for GameID ${gameId}`);

      try {
        const reviews = await ReviewModel.getReviewsByGameId(gameId);
        await ReviewModel.deleteReviewsByGameId(gameId);

        // Отправляем событие об удалении отзыва
        //console.log(reviews);
        for (const review of reviews) {
          const payload = { reviewId: review.reviewid };
          // В block с отправкой события об удалении отзыва
          channel.publish('events', 'review.deleted', Buffer.from(JSON.stringify(payload)), (err, ok) => {
            if (err) {
              console.error('Failed to send review.deleted event:', err);
            } else {
              //console.log(`Sent review.deleted event for ReviewID ${payload.reviewId}`);
            }
          });
        };

        //console.log(`Deleted reviews for GameID ${gameId}`);
      } catch (err) {
        console.error(`Failed to delete reviews for GameID ${gameId}:`, err.message);
      }

      channel.ack(msg);
    }
  });
};

module.exports = { handleReviewQueues };
