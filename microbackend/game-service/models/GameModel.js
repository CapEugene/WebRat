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

  async getGenres() {
    //console.log("OK");
    const query = `SELECT * FROM Genres`;
    const result = await pool.query(query);
    // console.log(result.rows);
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

  async addGame(title, releaseDate, developer, publisher, platform, description, coverImage) {
    const query = `
    INSERT INTO Games (Title, ReleaseDate, Developer, Publisher, Platform, Description, CoverImage) 
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `;
    const result = await pool.query(query, [title, releaseDate, developer, publisher, platform, description, coverImage]);
    return result.rows[0];
  },

  async addGameGenres(gameId, genreId) {
    const existsQuery = `
      SELECT 1 FROM GameGenres WHERE GameID = $1
    `;
    const existsResult = await pool.query(existsQuery, [gameId]);
  
    if (existsResult.rowCount > 0) {
      // Если запись существует, обновляем
      const updateQuery = `
        UPDATE GameGenres
        SET GenreID = $2
        WHERE GameID = $1
      `;
      await pool.query(updateQuery, [gameId, genreId]);
    } else {
      // Если записи нет, добавляем
      const insertQuery = `
        INSERT INTO GameGenres (GameID, GenreID)
        VALUES ($1, $2)
      `;
      await pool.query(insertQuery, [gameId, genreId]);
    }
  },

  async removeGame(gameId) {
    const query = `DELETE FROM Games WHERE GameID = $1 RETURNING *`;
    await pool.query(query, [gameId]);
  },

  async updateGame(game) {
    const query = `
    UPDATE Games
    SET
      Title = $2,
      ReleaseDate = $3,
      Developer = $4,
      Publisher = $5,
      Platform = $6,
      Description = $7,
      CoverImage = $8
    WHERE GameID = $1
    `;
    await pool.query(query, [
      game.gameid,
      game.title,
      game.releasedate,
      game.developer,
      game.publisher,
      game.platform,
      game.description,
      game.coverimage
    ]);
  },
  
};

module.exports = GameModel;

