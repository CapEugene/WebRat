# ПОРТЫ #

# 5000  - основной сервер #

# 5001 - auth-service #

# 5002 - comment-service #

# 5003 - favorite-service #

# 5004 - game-service #

# 5005 - review-service #

# 5006 - user-service #

# 5. API Gateway (api-gateway/server.js) #

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Проксируем запросы к Auth Service
app.use('/api/auth', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
}));

// Проксируем запросы к Game Service
app.use('/api/games', createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true,
}));

// Проксируем запросы к Review Service
app.use('/api/reviews', createProxyMiddleware({
  target: 'http://localhost:3003',
  changeOrigin: true,
}));

// Проксируем запросы к Comment Service
app.use('/api/comments', createProxyMiddleware({
  target: 'http://localhost:3004',
  changeOrigin: true,
}));

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API Gateway is running on http://localhost:${PORT}`);
});
