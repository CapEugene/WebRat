import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTokenInfo } from '../services/api';

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
    alert('You have been logged out!');
    navigate('/');
  };

  return (
    <nav style={styles.navbar}>
      <Link to="/" style={styles.link}>Home</Link>
      {isLoggedIn && <Link to="/profile" style={styles.link}>Profile</Link>}
      {!isLoggedIn && <Link to="/register" style={styles.link}>Register</Link>}
      {!isLoggedIn && <Link to="/login" style={styles.link}>Login</Link>}
      {isLoggedIn && <span onClick={handleLogout} style={styles.link}>Logout</span>}
      <h1>{isLoggedIn && tokenInfo ? `Welcome, ${tokenInfo.username}!` : 'Please, log in!'}</h1>
    </nav>
  );
};

const styles = {
  navbar: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '15px', paddingLeft: '70px', paddingRight: '70px', background: '#333', color: '#fff', },
  link: { color: '#fff', textDecoration: 'none' },
  logoutButton: { background: 'none', border: 'none', color: '#fff', textDecoration: 'none', cursor: 'pointer' },
};

export default Navbar;
