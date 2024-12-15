const express = require('express');
const { addFavorite, removeFavorite, getFavorites } = require('../controllers/favoriteController');
const { authenticate } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', authenticate, getFavorites);
router.post('/add', authenticate, addFavorite);
router.delete('/:gameId', authenticate, removeFavorite);

module.exports = router;
