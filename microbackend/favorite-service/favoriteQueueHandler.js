const FavoriteModel = require('./models/FavoriteModel');

const handleFavoriteQueues = async (channel) => {
    const { queue } = await channel.assertQueue('delete_favorites', { durable: true });

  channel.bindQueue(queue, 'events', 'game.deleted');

  //console.log('Favorite-service waiting for game.deleted messages...');

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const { gameId } = JSON.parse(msg.content.toString());
      //console.log(`Received game.deleted for GameID ${gameId}`);

      try {
        await FavoriteModel.deleteFavoritesByGameId(gameId);
        //console.log(`Deleted favorites for GameID ${gameId}`);
      } catch (err) {
        console.error(`Failed to delete favorites for GameID ${gameId}:`, err.message);
      }

      channel.ack(msg);
    }
  });
}

module.exports = { handleFavoriteQueues }