const db = require('../config/db');

const getCommentsByReviewId = async (reviewId) => {
  const result = await db.query(
    `SELECT CommentID, ReviewID, UserID, CommentText, CommentDate
     FROM Comments
     WHERE ReviewID = $1
     ORDER BY CommentDate ASC`,
    [reviewId]
  );
  return result.rows;
};


const addComment = async (reviewId, userId, commentText) => {
  const result = await db.query(
    'INSERT INTO Comments (ReviewID, UserID, CommentText) VALUES ($1, $2, $3) RETURNING *',
    [reviewId, userId, commentText]
  );
  return result.rows[0];
};

const deleteCommentsByReviewId = async (gameId) => {
  const result = await db.query(
    'DELETE FROM Comments WHERE ReviewID = $1',
    [gameId]
  );
};

module.exports = { getCommentsByReviewId, addComment, deleteCommentsByReviewId};
