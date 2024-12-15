import React, { useState, useEffect } from 'react';
import '../styles/CommentSection.css';

const CommentSection = ({ comments, onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim() === '') return;

    try {
      await onAddComment(newComment);
      setNewComment(''); // Очищаем поле после добавления
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  return (
    <div className="comment-section">
      <h4 className="comment-section-title">Comments</h4>
      <ul className="comment-list">
        {comments.map((comment) => (
          <li key={comment.commentid} className="comment-item">
            <strong className="comment-author">{comment.username}:</strong>
            <p className="comment-text">{comment.commenttext}</p>
          </li>
        ))}
      </ul>

      {isLoggedIn ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="comment-textarea"
          />
          <button type="submit" className="comment-submit-button">
            Post
          </button>
        </form>
      ) : (
        <p className="comment-login-notice">Please log in to add a comment.</p>
      )}
    </div>
  );
};

export default CommentSection;
