import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReviewCard from '../components/ReviewCard';
import { fetchGameDetails, fetchGameReviews, fetchReviewComments, addComment, addReview } from '../services/api';
import ReviewForm from '../components/ReviewForm';
import { format } from 'date-fns';

const GameDetailsPage = () => {
  let { id } = useParams();
  id = parseInt(id, 10);
  const [game, setGame] = useState({});
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchGameDetails(id).then((response) => setGame(response.data));
    fetchGameReviews(id).then(async (response) => {
      const reviewsWithComments = await Promise.all(
        response.data.map(async (review) => {
          const comments = await fetchReviewComments(review.reviewid);
          return { ...review, comments: comments.data };
        })
      );
      setReviews(reviewsWithComments);
    });
  }, [id]);

  const handleAddComment = async (reviewId, commentText) => {
    try {
      const newComment = await addComment(reviewId, commentText);
  
      // console.log('New comment:', newComment);
  
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.reviewid === reviewId
            ? { ...review, comments: [...review.comments, newComment] }
            : review
        )
      );
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleAddReview = async (rating, reviewText) => {
    try {
      //console.log('Sending review:', { gameId: id, rating, reviewText });
      const review = await addReview(id, rating, reviewText);
      setReviews((prevReviews) => [...prevReviews, { ...review, comments: [], username: review.username || 'Current User' }]);
      const updatedGame = await fetchGameDetails(id);
      setGame(updatedGame.data);
    } catch (error) {
      console.error('Error adding review:', error);
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
    <div>
      <h1>{game.title}</h1>
      <h2>{game.description}</h2>
      <h3>Main Information:</h3>
      <li>Publisher: {game.publisher}</li>
      <li>Developer: {game.developer}</li>
      <li>Release Data: {formatSafeDate(game.releasedate)}</li>
      <li>Genre: {game.genres ? game.genres.join(', ') : 'No genres available'}</li>
      <li>Platform: {game.platform}</li>
      <h3>Write a Review</h3>
      <ReviewForm onAddReview={handleAddReview} />
      <h3>Reviews</h3>
      {reviews.map((review) => (
        <ReviewCard key={review.reviewid} review={review} onAddComment={handleAddComment} />
      ))}
    </div>
  );
};

export default GameDetailsPage;
