import React, { useState, useEffect } from 'react';
import CommentSection from './CommentSection';
import { likeReview } from '../services/api';
import { format } from 'date-fns';

const ReviewCard = ({ review, onAddComment }) => {
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [likes, setLikes] = useState(review.likes);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [isLoggedIn]);

  const toggleComments = () => {
    setCommentsVisible(!commentsVisible);
  };

  const handleLike = async () => {
    try {
      setLikes((prevlikes) => prevlikes + 1);
      const response = await likeReview(review.reviewid);
      const updatedLikes = response.likes;
      setLikes(updatedLikes);
    } catch (error) {
      setLikes((prevlikes) => prevlikes - 1);
      console.error('Error liking review:', error);
    }
  };

  const formatSafeDate = (dataString) => {
    const date = new Date(dataString);
    if (isNaN(date)) {
      return 'Invalid Date';
    }
    return format(date, 'dd.MM.yyyy HH:mm:ss');
  }

  return (
    <div style={styles.card}>
      <h4>User: {review.username}</h4>
      <p>Rating: {review.rating}</p>
      <p>{review.reviewtext}</p>
      <p>Review Date: {formatSafeDate(review.reviewdate)}</p>
      {isLoggedIn && <button style={styles.button} onClick={handleLike}>Like ({likes})</button>}
      <button style={styles.toggleButton} onClick={toggleComments}>
        {commentsVisible ? 'Hide Comments' : 'Show Comments'}
      </button>

      {commentsVisible && (
        <CommentSection
      comments={review.comments} // Передаем массив комментариев
      onAddComment={(commentText) => onAddComment(review.reviewid, commentText)} // Передаем функцию добавления комментария
/>

      )}
    </div>
  );
};

const styles = {
  card: { border: '1px solid #ddd', padding: '10px', borderRadius: '8px', margin: '10px 0' },
  button: { marginTop: '10px', padding: '5px 10px', border: 'none', backgroundColor: '#007BFF', color: '#fff' },
  toggleButton: { marginLeft: '10px', padding: '5px 10px', border: 'none', backgroundColor: '#6c757d', color: '#fff' },
};

export default ReviewCard;
