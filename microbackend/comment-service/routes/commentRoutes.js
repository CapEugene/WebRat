const express = require('express');
const { getCommentsByReview, addComment } = require('../controllers/commentController');
const { authenticate } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authenticate, addComment);
router.get('/:reviewId', getCommentsByReview);

module.exports = router;
