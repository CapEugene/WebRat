import React, { useState, useEffect } from 'react';

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
    <div>
      <h4>Comments</h4>
      <ul>
        {comments.map((comment) => (
          <li key={comment.commentid}>
            <strong>{comment.username}:</strong> {comment.commenttext}
          </li>
        ))}
      </ul>

      {isLoggedIn ? (
        <form onSubmit={handleSubmit}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            style={styles.textarea}
          />
          <button type="submit" style={styles.button}>
            Post
          </button>
        </form>
      ) : (
        <p style={styles.notice}>Please log in to add a comment.</p>
      )}
    </div>
  );
};


const styles = {
  textarea: { width: '100%', height: '50px', marginBottom: '10px', resize: 'none' },
  button: { padding: '5px 10px', border: 'none', backgroundColor: '#007BFF', color: '#fff' },
  notice: { color: '#FF0000', fontStyle: 'italic' },
};

export default CommentSection;
