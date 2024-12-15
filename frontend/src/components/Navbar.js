import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTokenInfo } from '../services/api';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    const fetchTokenInfo = async () => {
      try {
        const response = await getTokenInfo();
        //console.log('Token Info Response:', response.data);
        // console.log(response.data.username); // Логируем данные сразу после получения
        setTokenInfo(response.data);
        //console.log(tokenInfo.username);
      } catch (error) {
        console.error('Failed to fetch token info:', error);
      }
    };

    checkLoginStatus();
    isLoggedIn && fetchTokenInfo();

    const handleStorageChange = async () => checkLoginStatus();

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [tokenInfo?.username, isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false); // Локально обновляем состояние
    //alert('You have been logged out!');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">
          🎮 RatSite
        </Link>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/" className="nav-link">Home</Link>
        </li>
        {isLoggedIn && (
          <li>
            <Link to="/profile" className="nav-link">Profile</Link>
          </li>
        )}
        {!isLoggedIn && (
          <>
            <li>
              <Link to="/register" className="nav-link">Register</Link>
            </li>
            <li>
              <Link to="/login" className="nav-link">Login</Link>
            </li>
          </>
        )}
        {isLoggedIn && (
          <li>
            <span onClick={handleLogout} className="nav-link logout-link">Logout</span>
          </li>
        )}
      </ul>
      {isLoggedIn && tokenInfo && (
        <div className="navbar-user">
          <span>Welcome, <strong>{tokenInfo.username}</strong>!</span>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
