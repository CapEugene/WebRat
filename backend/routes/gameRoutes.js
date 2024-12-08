const express = require('express');
const { getAllGames, getGameById } = require('../controllers/gameController');
const router = express.Router();

router.get('/', getAllGames); // Получить все игры
router.get('/:id', getGameById); // Получить игру по ID

module.exports = router;
