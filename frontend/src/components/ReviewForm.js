// components/ReviewForm.js
import React, { useState, useEffect } from 'react';

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
    <div>
      {isLoggedIn ? (
        <form onSubmit={handleSubmit}>
        <div>
          <label>Rating:</label>
          <input
            type="number"
            value={rating}
            min="1"
            max="10"
            onChange={(e) => setRating(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label>Review:</label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            required
            style={styles.textarea}
          />
        </div>
        <button type="submit" style={styles.button}>Submit Review</button>
      </form>
      ) : (
        <p style={styles.notice}>Please log in to add a review.</p>
      )}
    </div>
  );
};

const styles = {
  textarea: { width: '100%', height: '50px', marginBottom: '10px', resize: 'none' },
  button: { padding: '5px 10px', border: 'none', backgroundColor: '#007BFF', color: '#fff' },
  notice: { color: '#FF0000', fontStyle: 'italic' },
};

export default ReviewForm;
