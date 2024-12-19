import React, { useState, useEffect } from 'react';
import '../styles/CommentSection.css';
import { format } from 'date-fns';

const CommentSection = ({ comments, onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const [commentList, setCommentList] = useState(comments || []); // Локальное состояние комментариев
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState(null); // Состояние для ошибок

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim() === '') return; // Прекращаем выполнение, если комментарий пустой

    try {
      const addedComment = await onAddComment(newComment);
      setCommentList((prev) => [...prev, addedComment]);
      setNewComment(''); // Очищаем поле ввода
      setError(null); // Сбрасываем ошибку после успешного добавления
    } catch (error) {
      setError('Failed to post comment. Please try again later.'); // Устанавливаем сообщение об ошибке
      console.error('Error posting comment:', error);
    }
  };

  const formatSafeDate = (dataString) => {
    const date = new Date(dataString);
    if (isNaN(date)) {
      return 'Invalid Date';
    }
    return format(date, 'dd.MM.yyyy');
  };

  return (
    <div className="comment-section">
      <h4 className="comment-section-title">Comments</h4>

      {/* Отображаем ошибку, если она есть */}
      {error && <p className="error-message">{error}</p>}

      <ul className="comment-list">
        {commentList.length > 0 ? (
          commentList.map((comment) => (
            <li key={comment?.commentid || Math.random()} className="comment-item">
              <strong className="comment-author">
                {comment?.username || 'Unknown User'}:
              </strong>
              <p className="time">{formatSafeDate(comment.commentdate)}</p>
              <p className="comment-text">{comment?.commenttext || 'No text available'}</p>
            </li>
          ))
        ) : (
          <p>No comments available.</p> // Сообщение, если нет комментариев
        )}
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
