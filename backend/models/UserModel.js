const pool = require('../config/db');

const UserModel = {
  async createUser(username, email, passwordHash) {
    const query = `INSERT INTO Users (Username, Email, PasswordHash) 
                   VALUES ($1, $2, $3) RETURNING *`;
    const values = [username, email, passwordHash];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async getUserByEmail(email) {
    const query = `SELECT * FROM Users WHERE Email = $1`;
    const result = await pool.query(query, [email]);
    return result.rows[0];
  },

  async getUserById(userId) {
    const query = 'SELECT * FROM Users WHERE UserID = $1';
    const result = await pool.query(query, [userId]);
    // console.log(userId);
    return result.rows[0];
  },
};

module.exports = UserModel;
