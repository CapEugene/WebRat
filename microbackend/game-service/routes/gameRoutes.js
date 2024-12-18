const express = require('express');
const { getAllGames, getGameById, addGame, removeGame, getGenres, updateGame } = require('../controllers/gameController');
const { authenticate } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', getAllGames); // Получить все игры
router.get('/:id', getGameById); // Получить игру по ID
router.get('/genres/getgenres', getGenres);
router.post('/add', authenticate, addGame);
router.delete('/:id/remove', authenticate, removeGame);
router.post('/:id/update', updateGame);

module.exports = router;
