const ReviewModel = require('../models/ReviewModel');
const UserModel = require('../models/UserModel');
const GameModel = require('../models/GameModel')

const getReviewsByGameId = async (req, res) => {
  const { gameId } = req.params;
  try {
    const reviews = await ReviewModel.getReviewsByGameId(gameId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addReview = async (req, res) => {
  const { gameId, rating, reviewText } = req.body;
  // console.log(req.body);
  const userId = req.user.userid; // Получаем ID пользователя из токена

  if (!userId) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    // Предполагаем, что есть функция для создания отзыва
    const review = await ReviewModel.createReview({ gameId, userId, rating, reviewText });
    await GameModel.updateGameStatistics(gameId, rating);

    // Получаем имя пользователя из базы
    const user = await UserModel.getUserById(userId);

    res.status(201).json({ ...review, username: user.username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding review' });
  }
};

const addLikeOnReview = async (req, res) => {
  const userId = req.user.userid;

  if(!userId){
    return res.status(403).json({ message: 'Unauthorized' });
  }
  
  const { reviewId } = req.params;
  try {
    const review = await ReviewModel.getReviewById(reviewId);
    if (!review){
      return res.status(404).json({ message: 'Review not found' });
    }

    review.likes += 1;
    await ReviewModel.updateReviewStatistics(review);

    res.json({ likes: review.likes });
  } catch (error) {
    res.status(500).json({ message: 'Error liking review', error });
  }
};


module.exports = { getReviewsByGameId, addReview, addLikeOnReview };
