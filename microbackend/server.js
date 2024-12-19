const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// app.use((req, res, next) => {
//   console.log('Incoming request:', req.method, req.url);
//   next();
// });


app.use(cors({
    origin: 'http://localhost:3000', // Укажите домен фронтенда
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
//app.use(bodyParser.json());

// Проксируем запросы к Auth Service
// app.use('/api/auth', createProxyMiddleware({
//   target: 'http://localhost:5001/api/auth',
//   changeOrigin: true,
//   onProxyReq: (proxyReq, req, res) => {
//     if (req.headers.authorization) {
//       proxyReq.setHeader('Authorization', req.headers.authorization);
//     }
//   },
// }));

app.use('/api/auth', createProxyMiddleware({
  target: 'http://localhost:5001/api/auth',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    //console.log("ok");
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
}));



// Проксируем запросы к Comment Service
app.use('/api/comments', createProxyMiddleware({
    target: 'http://localhost:5002/api/comments',
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      if (req.headers.authorization) {
        proxyReq.setHeader('Authorization', req.headers.authorization);
      }
    },
  }));

// Проксируем запросы к Comment Service
app.use('/api/favorites', createProxyMiddleware({
    target: 'http://localhost:5003/api/favorites',
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      if (req.headers.authorization) {
        proxyReq.setHeader('Authorization', req.headers.authorization);
      }
    },
  }));

// Проксируем запросы к Game Service
app.use('/api/games', createProxyMiddleware({
  target: 'http://localhost:5004/api/games',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
  },
}));

// app.use('/api/games', (req, res, next) => {
//   console.log(`Request to /api/games: ${req.method} ${req.url}`);
//   next();
// });

// Проксируем запросы к Review Service
app.use('/api/reviews', createProxyMiddleware({
  target: 'http://localhost:5005/api/reviews',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
  },
}));

// Проксируем запросы к Comment Service
app.use('/api/users', createProxyMiddleware({
    target: 'http://localhost:5006/api/users',
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      if (req.headers.authorization) {
        proxyReq.setHeader('Authorization', req.headers.authorization);
      }
    },
  }));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`API Gateway is running on http://localhost:${PORT}`);
});