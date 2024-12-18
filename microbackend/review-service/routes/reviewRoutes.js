const express = require('express');
const { getReviewsByGameId, addReview, addLikeOnReview } = require('../controllers/reviewController');
const { authenticate } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authenticate, addReview);
router.get('/:gameId/', getReviewsByGameId);
router.post('/:reviewId/like/', authenticate, addLikeOnReview);

module.exports = router;
