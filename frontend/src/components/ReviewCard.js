import React, { useState, useEffect } from 'react';
import CommentSection from './CommentSection';
import { likeReview } from '../services/api';
import { format } from 'date-fns';
import '../styles/ReviewCard.css';

const ReviewCard = ({ review, onAddComment }) => {
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [likes, setLikes] = useState(review.likes);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState(null); // Состояние для ошибки

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const toggleComments = () => {
    setCommentsVisible(!commentsVisible);
  };

  const handleLike = async () => {
    try {
      setLikes((prevLikes) => prevLikes + 1); // Временно увеличиваем лайк
      const response = await likeReview(review.reviewid);
      const updatedLikes = response.likes;
      setLikes(updatedLikes); // Обновляем количество лайков после успешной операции
    } catch (error) {
      setLikes((prevLikes) => prevLikes - 1); // Возвращаем количество лайков, если ошибка
      setError('Error liking the review. Please try again later.'); // Отображаем ошибку
      console.error('Error liking review:', error);
    }
  };

  const formatSafeDate = (dataString) => {
    const date = new Date(dataString);
    if (isNaN(date)) {
      return 'Invalid Date';
    }
    return format(date, 'dd.MM.yyyy HH:mm:ss');
  };

  return (
    <div className="review-card">
      <div className="review-header">
        <h4>{review.username}</h4>
        <p className="review-date">{formatSafeDate(review.reviewdate)}</p>
      </div>
      <div className="review-body">
        <p className="review-rating">Rating: {review.rating}/10</p>
        <p className="review-text">{review.reviewtext}</p>
      </div>
      <div className="review-footer">
        {isLoggedIn && (
          <button className="like-button" onClick={handleLike}>
            👍 Like ({likes})
          </button>
        )}
        <button className="toggle-comments-button" onClick={toggleComments}>
          {commentsVisible ? 'Hide Comments' : 'Show Comments'}
        </button>
      </div>
      {/* Отображение ошибки, если она есть */}
      {error && <div className="error-message">{error}</div>}
      {commentsVisible && (
        <CommentSection
          comments={review.comments}
          onAddComment={(commentText) => onAddComment(review.reviewid, commentText)}
        />
      )}
    </div>
  );
};

export default ReviewCard;
