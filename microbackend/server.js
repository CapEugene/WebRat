const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Проксируем запросы к Auth Service
app.use('/api/auth', createProxyMiddleware({
  target: 'http://localhost:5001',
  changeOrigin: true,
}));

// Проксируем запросы к Comment Service
app.use('/api/comments', createProxyMiddleware({
    target: 'http://localhost:5002',
    changeOrigin: true,
  }));

// Проксируем запросы к Comment Service
app.use('/api/favorites', createProxyMiddleware({
    target: 'http://localhost:5003',
    changeOrigin: true,
  }));

// Проксируем запросы к Game Service
app.use('/api/games', createProxyMiddleware({
  target: 'http://localhost:5004',
  changeOrigin: true,
}));

// Проксируем запросы к Review Service
app.use('/api/reviews', createProxyMiddleware({
  target: 'http://localhost:5005',
  changeOrigin: true,
}));

// Проксируем запросы к Comment Service
app.use('/api/users', createProxyMiddleware({
    target: 'http://localhost:5006',
    changeOrigin: true,
  }));

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`API Gateway is running on http://localhost:${PORT}`);
});