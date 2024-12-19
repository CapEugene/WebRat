const FavoriteModel = require('../models/FavoriteModel');

const addFavorite = async (req, res) => {
    const userId = req.user.userid;

    if(!userId){
        return res.status(403).json({ message: 'Unauthorized' });
      }

    const { gameId } = req.body;
    try {
        const favorite = await FavoriteModel.addFavorite(userId, gameId);
        res.json(favorite);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getFavorites = async (req, res) => {
    const userId = req.user.userid;
    if (!userId) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    const channel = req.app.locals.rabbitChannel; // Канал RabbitMQ
    if (!channel) {
        return res.status(500).json({ message: 'RabbitMQ channel not found' });
    }

    try {
        // Шаг 1: Получаем список GameID из базы данных
        const favorites = await FavoriteModel.getFavorites(userId);
        const gameIds = favorites.map(fav => fav.gameid);

        if (!gameIds.length) {
            return res.json([]); // Если у пользователя нет избранных игр
        }

        // Шаг 2: Отправляем запрос в game-service для получения информации об играх
        const correlationId = Math.random().toString(36).substring(7);
        const responseQueue = await channel.assertQueue('', { exclusive: true });

        channel.sendToQueue('game.getByIds', Buffer.from(JSON.stringify({ gameIds })), {
            correlationId,
            replyTo: responseQueue.queue,
        });

        // Шаг 3: Ожидаем ответа от game-service
        const gameData = await new Promise((resolve, reject) => {
            channel.consume(
                responseQueue.queue,
                (msg) => {
                    if (msg.properties.correlationId === correlationId) {
                        const data = JSON.parse(msg.content.toString());
                        if (data.error) {
                            reject(new Error(data.error));
                        } else {
                            resolve(data.games); // Список игр
                        }
                    }
                },
                { noAck: true }
            );
        });

        // Шаг 4: Объединяем данные игр с избранными
        const favoritesWithGameData = favorites.map(fav => {
            const game = gameData.find(g => g.gameid === fav.gameid);
            return {
                ...fav,
                title: game ? game.title : null,
                coverimage: game ? game.coverimage : null,
                releasedate: game ? game.releasedate : null,
            };
        });

        res.json(favoritesWithGameData);
    } catch (error) {
        console.error('Error in getFavorites:', error.message);
        res.status(500).json({ error: error.message });
    }
};


const removeFavorite = async (req, res) => {
    const userId = req.user.userid;

    if(!userId){
        return res.status(403).json({ message: 'Unauthorized' });
      }

    const { gameId } = req.params;
    try {
        const favorite = await FavoriteModel.removeFavorite(userId, gameId);
        res.json(favorite);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { addFavorite, getFavorites, removeFavorite };
