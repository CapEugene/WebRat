import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReviewCard from '../components/ReviewCard';
import { 
  fetchGameDetails, 
  fetchGameReviews, 
  fetchReviewComments, 
  addComment, 
  addReview, 
  addFavorite, 
  removeFavorite, 
  fetchFavorites 
} from '../services/api';
import ReviewForm from '../components/ReviewForm';
import { format } from 'date-fns';
import '../styles/GameDetailsPage.css';

const GameDetailsPage = () => {
  let { id } = useParams();
  id = parseInt(id, 10);
  const [game, setGame] = useState({});
  const [reviews, setReviews] = useState([]);
  const [sortedReviews, setSortedReviews] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sortCriteria, setSortCriteria] = useState('');
  const [loading, setLoading] = useState(true); // Состояние загрузки
  const [error, setError] = useState(null); // Состояние ошибки

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const gameResponse = await fetchGameDetails(id);
        setGame(gameResponse.data);
        const reviewsResponse = await fetchGameReviews(id);
        const reviewsWithComments = await Promise.all(
          reviewsResponse.data.map(async (review) => {
            const comments = await fetchReviewComments(review.reviewid);
            return { ...review, comments: comments.data };
          })
        );
        setReviews(reviewsWithComments);
        setSortedReviews(reviewsWithComments);
      } catch (error) {
        setError('Error loading game details or reviews. Please try again later.');
      } finally {
        setLoading(false); // Завершаем загрузку
      }
    };

    fetchGameData();
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    const checkFavorites = async () => {
      try {
        const favorites = await fetchFavorites();
        setIsFavorite(favorites.some((favorite) => favorite.gameid === id));
      } catch (error) {
        setError('Error loading favorite status. Please try again later.');
      }
    };

    if (isLoggedIn) checkFavorites();
  }, [id, isLoggedIn]);

  const handleAddComment = async (reviewId, commentText) => {
    try {
      const newComment = await addComment(reviewId, commentText);
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.reviewid === reviewId
            ? { ...review, comments: [...review.comments, newComment] }
            : review
        )
      );
      return newComment;
    } catch (error) {
      setError('Error adding comment. Please try again later.');
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await removeFavorite(game.gameid);
        setIsFavorite(false);
      } else {
        await addFavorite(game.gameid);
        setIsFavorite(true);
      }
    } catch (error) {
      setError('Failed to toggle favorite. Please try again later.');
    }
  };

  const handleAddReview = async (rating, reviewText) => {
    try {
      const review = await addReview(id, rating, reviewText);
      setReviews((prevReviews) => [...prevReviews, { ...review, comments: [], username: review.username || 'Current User' }]);
      setSortedReviews((prevReviews) => [...prevReviews, { ...review, comments: [], username: review.username || 'Current User' }]);
      const updatedGame = await fetchGameDetails(id);
      setGame(updatedGame.data);
    } catch (error) {
      setError('Error adding review. Please try again later.');
    }
  };

  const handleSortChange = (criteria) => {
    setSortCriteria(criteria);
    const sortedReviews = [...reviews];
    if (criteria === 'rating') {
      sortedReviews.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (criteria === 'date') {
      sortedReviews.sort((a, b) => new Date(b.reviewdate) - new Date(a.reviewdate));
    }
    setSortedReviews(sortedReviews);
  };

  const formatSafeDate = (dataString) => {
    const date = new Date(dataString);
    if (isNaN(date)) {
      return 'Invalid Date';
    }
    return format(date, 'dd.MM.yyyy');
  };

  if (loading) {
    return <div>Loading...</div>; // Показываем индикатор загрузки
  }

  return (
    <div className="game-details-container">
      <div className="game-details-header">
        <img src={game.coverimage} alt={game.title} className="game-cover-image" />
        <h1 className="game-title">{game.title}</h1>
        <p className="game-description">{game.description}</p>
        <ul className="game-info">
          <li>Publisher: {game.publisher}</li>
          <li>Developer: {game.developer}</li>
          <li>Release Date: {formatSafeDate(game.releasedate)}</li>
          <li>Genre: {game.genres ? game.genres.join(', ') : 'No genres available'}</li>
          <li>Platform: {game.platform}</li>
        </ul>
        {isLoggedIn && (
          <button
            className={`favorite-button ${isFavorite ? 'remove' : 'add'}`}
            onClick={toggleFavorite}
          >
            {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          </button>
        )}
      </div>

      {/* Сообщение об ошибке */}
      {error && <div className="error-message">{error}</div>}

      <div className="review-section">
        <h2>Write a Review</h2>
        <ReviewForm onAddReview={handleAddReview} />
        <h2>Sort Reviews</h2>
        <div className="sort-controls">
          <label htmlFor="sort">Sort by:</label>
          <select
            id="sort"
            value={sortCriteria}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="">Default</option>
            <option value="rating">Rating</option>
            <option value="date">Date</option>
          </select>
        </div>
        <h2>Reviews</h2>
        <div className="review-list">
          {sortedReviews.map((review) => (
            <ReviewCard
              key={review.reviewid}
              review={review}
              onAddComment={handleAddComment}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameDetailsPage;
