const CommentModel = require('../models/CommentModel');

const getCommentsByReview = async (req, res) => {
    const { reviewId } = req.params;
    try {
      const comments = await CommentModel.getCommentsByReviewId(reviewId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

  const addComment = async (req, res) => {
    const { reviewId, commentText } = req.body;
    const userId = req.user.userid; // предполагаем, что пользователь аутентифицирован
  
    try {
      const newComment = await CommentModel.addComment(reviewId, userId, commentText);
      const user = await CommentModel.getUserById(userId); // тут возникает ошибка
  
      const commentWithUser = {
        ...newComment,
        username: user.username, // добавляем имя пользователя
      };
  
      res.status(201).json(commentWithUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  };

  module.exports = { getCommentsByReview, addComment };