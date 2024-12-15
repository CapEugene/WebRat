import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/GameCard.css';

const GameCard = ({ game }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/games/${game.gameid}`)
  };
  
  return (
    <div className="game-card" onClick={handleCardClick}>
      <img 
        src={game.coverimage || '../styles/placeholder.jpg'} 
        alt={game.title} 
        className="game-card-image" 
      />
      <h3 className="game-card-title">{game.title}</h3>
      <p className="game-card-description">{game.description || 'No description available.'}</p>
      <div className="game-card-footer">
        <span>{game.averagerating ? `⭐ ${game.averagerating}` : 'No rating'}</span>
        <span>{game.reviewcount || 0} reviews</span>
      </div>
    </div>
  );
};

export default GameCard;
