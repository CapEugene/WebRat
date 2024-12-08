const express = require('express');
const { getUserProfile, getTokenData } = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/profile', authenticate, getUserProfile);
router.get('/tokeninfo', authenticate, getTokenData); // Получить профиль текущего пользователя

module.exports = router;
