const pool = require('../config/db');

const UserModel = {
  async createUserInfo(userId, username, role = 'user') {
    const query = `
      INSERT INTO UsersInfo (UserID, Username, Role) 
      VALUES ($1, $2, $3) RETURNING *
    `;
    const values = [userId, username, role];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async getUserInfoById(userId) {
    try {
      const query = 'SELECT * FROM usersinfo WHERE userid = $1'; // SQL-запрос для получения username и role
      const result = await pool.query(query, [userId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in getUserInfoById:', error.message);
      throw new Error('Database query error');
    }
  },

  async getUserInfoByUsername(username) {
    const query = `SELECT * FROM UsersInfo WHERE Username = $1`;
    const result = await pool.query(query, [username]);
    return result.rows[0];
  },

  async getUsersByIds(userIds) {
    const query = `
      SELECT UserID as userid, Username as username 
      FROM UsersInfo 
      WHERE UserID = ANY($1::int[])
    `;
    const result = await pool.query(query, [userIds]);
    return result.rows;
  },
};

module.exports = UserModel;
