require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
};

const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret';

module.exports = { dbConfig, jwtSecret };
