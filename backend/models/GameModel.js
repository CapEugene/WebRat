const pool = require('../config/db');

const GameModel = {
  async getAllGames() {
    const query = `
      SELECT g.*, gs.AverageRating, gs.ReviewCount, array_agg(gn.GenreName) AS genres
      FROM Games g
      LEFT JOIN GameStatistics gs ON g.GameID = gs.GameID
      LEFT JOIN GameGenres gg ON g.GameID = gg.GameID
      LEFT JOIN Genres gn ON gg.GenreID = gn.GenreID
      GROUP BY g.GameID, gs.AverageRating, gs.ReviewCount;
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  async getGameById(gameId) {
    const query = `
      SELECT g.*, gs.AverageRating, array_agg(gn.GenreName) AS genres
      FROM Games g
      LEFT JOIN GameStatistics gs ON g.GameID = gs.GameID
      LEFT JOIN GameGenres gg ON g.GameID = gg.GameID
      LEFT JOIN Genres gn ON gg.GenreID = gn.GenreID
      WHERE g.GameID = $1
      GROUP BY g.GameID, gs.AverageRating;
    `;
    const result = await pool.query(query, [gameId]);
    return result.rows[0];
  },

  async updateGameStatistics(gameId, newRating) {
    const checkQuery = `SELECT COUNT(*) FROM GameStatistics WHERE GameStatId = $1`;
    const { rows } = await pool.query(checkQuery, [gameId]);
  
    if (rows[0].count === "0") {
      // Если записи нет, создаем её
      const insertQuery = `
        INSERT INTO GameStatistics (GameStatId, AverageRating, ReviewCount)
        VALUES ($1, $2, 1);
      `;
      await pool.query(insertQuery, [gameId, newRating]);
    } else {
      const updateQuery = `
        UPDATE GameStatistics
        SET 
          AverageRating = ((GameStatistics.AverageRating * GameStatistics.ReviewCount) + $2) / (GameStatistics.ReviewCount + 1),
          ReviewCount = GameStatistics.ReviewCount + 1
        WHERE GameStatId = $1;
      `;
      await pool.query(updateQuery, [gameId, newRating]);
    }
  }
  
};

module.exports = GameModel;

