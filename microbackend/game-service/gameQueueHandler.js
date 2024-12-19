const GameModel = require('./models/GameModel');

const handleGameUpdateStatistics = async (channel) => {
    await channel.assertQueue('game.updateStatistics', { durable: true });

    channel.consume('game.updateStatistics', async (msg) => {
    if (msg !== null) {
        const { gameId, rating } = JSON.parse(msg.content.toString());
        const correlationId = msg.properties.correlationId;
        const replyTo = msg.properties.replyTo;

        try {
        // Проверяем существование игры
        const game = GameModel.getGameById(gameId);
        if (!game) {
            const errorResponse = {
            success: false,
            error: 'Game not found',
            };

            channel.sendToQueue(
            replyTo,
            Buffer.from(JSON.stringify(errorResponse)),
            { correlationId }
            );

            channel.ack(msg);
            return;
        }

        // Обновляем статистику игры
        const updatedGame = await GameModel.updateGameStatistics(gameId, rating);

        const successResponse = {
            success: true,
            game: updatedGame,
        };

        // Отправляем результат в очередь ответа
        channel.sendToQueue(
            replyTo,
            Buffer.from(JSON.stringify(successResponse)),
            { correlationId }
        );
        } catch (error) {
        console.error('Error updating game statistics:', error.message);

        const errorResponse = {
            success: false,
            error: 'Internal server error',
        };

        channel.sendToQueue(
            replyTo,
            Buffer.from(JSON.stringify(errorResponse)),
            { correlationId }
        );
        }

        // Подтверждаем обработку сообщения
        channel.ack(msg);
    }
    });

    await channel.assertQueue('game.getByIds', { durable: true });
    channel.consume('game.getByIds', async (msg) => {
        if (msg !== null) {
            const { gameIds } = JSON.parse(msg.content.toString());
            const { replyTo, correlationId } = msg.properties;

            try {
                // Получаем данные об играх из базы данных
                const games = await GameModel.getGamesByIds(gameIds);

                channel.sendToQueue(replyTo, Buffer.from(JSON.stringify({ games })), { correlationId });
            } catch (error) {
                console.error('Error processing game.getByIds:', error.message);
                channel.sendToQueue(replyTo, Buffer.from(JSON.stringify({ error: 'Internal server error' })), { correlationId });
            }

            channel.ack(msg);
        }
    });
};

module.exports = { handleGameUpdateStatistics };
