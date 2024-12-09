import React, { useState, useEffect } from 'react';
import { loginUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
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
    loginUser(formData)
      .then((response) => {
        const { token } = response.data;
        localStorage.setItem('token', token);
        window.dispatchEvent(new Event('storage'));
        alert('Login successful!');
        navigate('/profile');
  })
  .catch((err) => alert(`Error: ${err.response?.data?.message || 'Login failed'}`));

  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
        value={formData.email}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        value={formData.password}
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginPage;
