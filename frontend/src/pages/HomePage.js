import React, { useEffect, useState } from 'react';
import GameCard from '../components/GameCard';
import { fetchGames } from '../services/api';

const HomePage = () => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetchGames().then((response) => setGames(response.data));
  }, []);

  /*useEffect(() => {
    fetchGames().then((response) => {
      console.log('Fetched games:', response.data);
      setGames(response.data);
    });
  }, []);*/

  return (
    <div>
      <h1 style={styles.title}>Games</h1>
      <div style={styles.grid}>
        {games.map((game) => (
          <GameCard key={game.gameid} game={game} />
        ))}
      </div>
    </div>
  );
};

const styles = { grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }, 
title: { display: 'flex', justifyContent : 'center', }
};

export default HomePage;
