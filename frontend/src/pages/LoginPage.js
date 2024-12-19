import React, { useState, useEffect } from 'react';
import { loginUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null); // Состояние для ошибки
  const [loading, setLoading] = useState(false); // Состояние для загрузки
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    !!token && navigate('/profile');
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true); // Начинаем загрузку
    loginUser(formData)
      .then((response) => {
        const { token } = response.data;
        localStorage.setItem('token', token);
        window.dispatchEvent(new Event('storage'));
        navigate('/profile');
      })
      .catch((err) => {
        if (err.response && err.response.status === 504) {
          setError('Authorization service is currently unavailable. Please try again later.');
        } else {
          setError(`Error: ${err.response?.data?.message || 'Login failed'}`);
        }
      })
      .finally(() => {
        setLoading(false); // Завершаем загрузку
      });
  };

  return (
    <div className="login-page">
      <h1 className="login-title">Login</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          value={formData.email}
          required
          className="input-field"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          value={formData.password}
          required
          className="input-field"
        />
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {/* Показываем сообщение об ошибке */}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default LoginPage;
