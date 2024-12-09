import React from 'react';
import { useNavigate } from 'react-router-dom';

const GameCard = ({ game }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/games/${game.gameid}`)
  };
  
  return (
    <div style={styles.card} onClick={handleCardClick}>
      <img src={game.coverimage} alt={game.title} style={styles.image} />
      <h1>{game.title}</h1>
      <h2>Description: {game.description}</h2>
      <h3>Rating: {game.averagerating || 'N/A'}</h3>
      <h3>Reviews Count: {game.reviewcount || 0}</h3>
    </div>
  );
};

const styles = {
  card: { border: '1px solid #ddd', 
    padding: '10px', 
    borderRadius: '8px',
    width: '400px',
    cursor: 'pointer', 
  },
  image: { width: '100%', borderRadius: '8px' },
};

export default GameCard;
