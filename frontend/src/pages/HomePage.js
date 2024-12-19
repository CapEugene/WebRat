import React, { useEffect, useState } from 'react';
import GameCard from '../components/GameCard';
import { fetchGames } from '../services/api';
import '../styles/HomePage.css';

const HomePage = () => {
  const [games, setGames] = useState([]);
  const [sortedGames, setSortedGames] = useState([]);
  const [sortCriteria, setSortCriteria] = useState('');
  const [error, setError] = useState(null); // Состояние для ошибки
  const [loading, setLoading] = useState(true); // Состояние для загрузки

  useEffect(() => {
    fetchGames()
      .then((response) => {
        setGames(response.data);
        setSortedGames(response.data);
        setError(null); // Если запрос успешен, сбрасываем ошибку
      })
      .catch((err) => {
        if (err.response && err.response.status === 504) {
          setError('Game service is currently unavailable. Please try again later.'); // Устанавливаем сообщение об ошибке
        } else {
          setError('An unexpected error occurred.');
        }
      })
      .finally(() => {
        setLoading(false); // Завершаем загрузку
      });
  }, []);

  const handleSortChange = (criteria) => {
    setSortCriteria(criteria);

    const sorted = [...games];
    if (criteria === 'reviews') {
      sorted.sort((a, b) => (b.reviewcount || 0) - (a.reviewcount || 0));
    } else if (criteria === 'rating') {
      sorted.sort((a, b) => (b.averagerating || 0) - (a.averagerating || 0));
    }

    setSortedGames(sorted);
  };

  if (loading) {
    return <div>Loading...</div>; // Можете заменить на ваш индикатор загрузки
  }

  return (
    <div className="home-page">
      <h1 className="home-title">Games</h1>
      <div className="sort-container">
        <label htmlFor="sort" className="sort-label">Sort by: </label>
        <select
          id="sort"
          value={sortCriteria}
          onChange={(e) => handleSortChange(e.target.value)}
          className="sort-select"
        >
          <option value="">Default</option>
          <option value="reviews">Number of Reviews</option>
          <option value="rating">Average Rating</option>
        </select>
      </div>

      {/* Показываем сообщение об ошибке, если оно есть */}
      {error && <div className="error-message">{error}</div>}

      <div className="game-grid">
        {sortedGames.map((game) => (
          <GameCard key={game.gameid} game={game} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
