const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');

const AuthModel = {
    async createUser(email, passwordHash) {
        const query = `INSERT INTO Users (Email, PasswordHash) 
                        VALUES ($1, $2) RETURNING *`;
        const values = [email, passwordHash];
        const result = await pool.query(query, values);
        return result.rows[0];
        },

    async getUserByEmail(email) {
        const query = `SELECT * FROM Users WHERE Email = $1`;
        const result = await pool.query(query, [email]);
        return result.rows[0];
        },
    async getUserIdFromToken(token) {
        try {
            const decodedToken = jwtSecret.verify(token, jwtSecret);
            return decodedToken.userid;
        } catch (error) {
            console.error('Error decoding token:', error);
            throw new Error('Invalid token');
        }
    },
};

module.exports = AuthModel;