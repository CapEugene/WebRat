const pool = require('../config/db');

const FavoriteModel = {
  async getFavorites(userId) {
    const query = `
        SELECT GameID 
        FROM Favorites 
        WHERE UserID = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
},


  async addFavorite(userId, gameId) {
    const existQuery = `SELECT * FROM Favorites WHERE UserID = $1 AND GameID = $2`;
    const exists = await pool.query(existQuery, [userId, gameId]);
      if (exists.rowCount > 0) {
        return res.status(400).json({ error: 'Game already in favorites.' });
      }
    
    const query = `
    INSERT INTO Favorites (UserID, GameID) VALUES ($1, $2)
    `;
    const result = await pool.query(query, [userId, gameId]);
    return result.rows[0];
  },

  async removeFavorite(userId, gameId) {
      const query = `
      DELETE FROM Favorites WHERE UserID = $1 AND GameID = $2
      `;
      await pool.query(query, [userId, gameId]);
  },

  async deleteFavoritesByGameId(gameId) {
    const query = 'DELETE FROM Favorites WHERE GameID = $1';
    await pool.query(query, [gameId]);
  }
};

module.exports = FavoriteModel;

