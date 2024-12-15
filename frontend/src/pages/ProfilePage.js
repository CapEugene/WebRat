import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, fetchFavorites } from '../services/api';
import { format } from 'date-fns';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState();
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if(!token){
      navigate('/');
    }
    else{
      getUserProfile().then((response) => setProfile(response.data));
    }

  }, [navigate]);

  useEffect(() => {
    const loadFavorites = async () => {
      const favorites = await fetchFavorites();
      setFavorites(favorites);
    }

    loadFavorites();
  }, []);

  const formatSafeDate = (dataString) => {
    const date = new Date(dataString);
    if (isNaN(date)) {
      return 'Invalid Date';
    }
    return format(date, 'dd.MM.yyyy HH:mm:ss');
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile Page</h1>
        <h2>Welcome back, {profile ? profile.username : 'User'}!</h2>
        <p>Member since: {profile ? formatSafeDate(profile.joindate) : 'Loading...'}</p>
      </div>

      <div className="favorites-section">
        <h2>Your Favorite Games</h2>
        {favorites.length > 0 ? (
          <div className="favorites-grid">
            {favorites.map((game) => (
              <div key={game.gameid} className="favorite-card">
                <img
                  src={game.coverimage || '../styles/placeholder.jpg'}
                  alt={game.title}
                  className="favorite-card-image"
                />
                <h3 className="favorite-card-title">{game.title}</h3>
                <p className="favorite-card-release-date">
                  Release Date: {formatSafeDate(game.releasedate)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>You have no favorite games yet.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
