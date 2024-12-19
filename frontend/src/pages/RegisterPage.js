import React, { useState, useEffect } from 'react';
import { registerUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
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
    registerUser(formData)
      .then(() => {
        alert('User registered successfully!');
        navigate('/login');
      })
      .catch((err) => {
        if (err.response && err.response.status === 504) {
          setError('Registration service is currently unavailable. Please try again later.');
        } else {
          setError(`Error: ${err.response?.data?.message || 'Registration failed'}`);
        }
      })
      .finally(() => {
        setLoading(false); // Завершаем загрузку
      });
  };

  return (
    <div className="register-page">
      <h1 className="register-title">Register</h1>
      <form onSubmit={handleSubmit} className="register-form">
        <input
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
          value={formData.username}
          required
          className="input-field"
        />
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
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {/* Показываем сообщение об ошибке */}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default RegisterPage;
