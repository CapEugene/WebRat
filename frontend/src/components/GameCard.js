import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/GameCard.css';

const GameCard = ({ game }) => {
  const [error, setError] = useState(null);  // Состояние для ошибки
  const navigate = useNavigate();

  const handleCardClick = () => {
    try {
      // Переход по ID игры
      if (game && game.gameid) {
        navigate(`/games/${game.gameid}`);
      } else {
        throw new Error('Game ID is missing.');
      }
    } catch (error) {
      setError('Failed to navigate to game details.'); // Устанавливаем ошибку
      console.error(error);
    }
  };

  useEffect(() => {
    // Дополнительная проверка на пустые или некорректные данные
    if (!game || !game.gameid) {
      setError('Game data is not available.');
    }
  }, [game]);

  if (error) {
    return (
      <div className="game-card-error">
        <p>{error}</p> {/* Отображаем ошибку */}
      </div>
    );
  }

  return (
    <div className="game-card" onClick={handleCardClick}>
      <img 
        src={game.coverimage || '../styles/placeholder.jpg'} 
        alt={game.title || 'No title available'}  // Подсказка на случай отсутствия title
        className="game-card-image" 
      />
      <h3 className="game-card-title">{game.title || 'No title available'}</h3>
      <p className="game-card-description">{game.description || 'No description available.'}</p>
      <div className="game-card-footer">
        <span>{game.averagerating ? `⭐ ${game.averagerating}` : 'No rating'}</span>
        <span>{game.reviewcount || 0} reviews</span>
      </div>
    </div>
  );
};

export default GameCard;
