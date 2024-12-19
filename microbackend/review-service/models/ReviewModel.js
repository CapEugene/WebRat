const pool = require('../config/db');

const ReviewModel = {
  async getReviewsByGameId(gameId) {
    const query = `
      SELECT * 
      FROM Reviews 
      WHERE GameID = $1
    `;
    const result = await pool.query(query, [gameId]);
    return result.rows;
  },

  async getReviewById(reviewId) {
    const query = `
      SELECT r.*
      FROM Reviews r
      WHERE r.ReviewID = $1
    `;
    const result = await pool.query(query, [reviewId]);
    return result.rows[0];
  },

  async createReview({ gameId, userId, rating, reviewText }) {
    const query = `
      INSERT INTO Reviews (GameID, UserID, Rating, ReviewText) 
      VALUES ($1, $2, $3, $4) RETURNING *
    `;
    const values = [gameId, userId, rating, reviewText];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async updateReviewStatistics(review) {
    const checkQuery = `SELECT COUNT(*) FROM Reviews WHERE ReviewID = $1`;
    const { rows } = await pool.query(checkQuery, [review.reviewid]);
    if (rows[0].count === "0") {
      // Если записи нет, создаем её
      const insertQuery = `
        INSERT INTO Reviews (ReviewID, GameID, UserID, Rating, ReviewText, ReviewData, likes) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
      `;
      const insertValues = [review.reviewid, review.gameid, review.userid, review.rating, review.reviewtext, review.reviewdata, review.likes];
      await pool.query(insertQuery, insertValues);
    } else {
      const updateQuery = `
        UPDATE Reviews
        SET 
          likes = $2
        WHERE ReviewID = $1;
      `;
      await pool.query(updateQuery, [review.reviewid, review.likes]);
    }
  },

  async getUserById(userId) {
    const query = 'SELECT * FROM Users WHERE UserID = $1';
    const result = await pool.query(query, [userId]);
    // console.log(userId);
    return result.rows[0];
  },

  async deleteReviewsByGameId(gameId) {
    const query = 'DELETE FROM Reviews WHERE GameID = $1';
    await pool.query(query, [gameId]);
  }
  
};

module.exports = ReviewModel;
