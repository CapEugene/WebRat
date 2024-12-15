// components/ReviewForm.js
import React, { useState, useEffect } from 'react';
import '../styles/ReviewForm.css';

const ReviewForm = ({ onAddReview }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddReview(rating, reviewText);
    setRating(0);
    setReviewText('');
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
          <button type="submit" className="submit-button">Submit Review</button>
        </form>
      ) : (
        <p className="login-notice">Please log in to add a review.</p>
      )}
    </div>
  )
};

export default ReviewForm;
