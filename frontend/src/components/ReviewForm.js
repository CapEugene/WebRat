import React, { useState, useEffect } from 'react';
import '../styles/ReviewForm.css';

const ReviewForm = ({ onAddReview }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false); // Состояние для загрузки
  const [error, setError] = useState(null); // Состояние для ошибки

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Начинаем загрузку
    setError(null); // Сбрасываем ошибки

    try {
      await onAddReview(rating, reviewText); // Ожидаем добавление отзыва
      setRating(0);
      setReviewText('');
    } catch (err) {
      setError('Error submitting the review. Please try again later.'); // Обработка ошибки
    } finally {
      setLoading(false); // Завершаем загрузку
    }
  };

  return (
    <div className="review-form-container">
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="review-form">
          <div className="form-group">
            <label htmlFor="rating">Rating:</label>
            <input
              type="number"
              id="rating"
              value={rating}
              min="1"
              max="10"
              onChange={(e) => setRating(Number(e.target.value))}
              required
              className="rating-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="review">Review:</label>
            <textarea
              id="review"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              required
              className="review-textarea"
            />
          </div>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      ) : (
        <p className="login-notice">Please log in to add a review.</p>
      )}

      {/* Сообщение об ошибке */}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default ReviewForm;
