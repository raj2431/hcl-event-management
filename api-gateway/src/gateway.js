const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const { verifyTokenSignature } = require('./middleware/jwt');

const app = express();
const PORT = 8000; // Gateway port

// 1. Rate Limiting Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many requests, please try again later.' }
});

app.use(limiter);
app.use(verifyTokenSignature);
const excludedPaths = ['/auth/login', '/api/events', '/auth/register'];

app.use((req, res, next) => {
  if (excludedPaths.includes(req.path)) {
    return next(); // Skip JWT verification
  }
  // Run JWT verification here...
  next();
});

// 2. Simple Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} to ${req.url}`);
  next();
});

// 3. Define Microservice Targets
const SERVICES = {
  auth: 'http://localhost:7066',
  admin_booking: 'http://localhost:3000'
};

// 4. Proxy Configurations
// Redirects /users/* -> http://localhost:3001/*
app.use('/auth', createProxyMiddleware({
  target: SERVICES.auth,
  changeOrigin: true,
  pathRewrite: {
    '^/auth': '', // 
  }
}));

// Redirects /orders/* -> http://localhost:3002/*
app.use('/admin_booking', createProxyMiddleware({
  target: SERVICES.admin_booking,
  changeOrigin: true,
  pathRewrite: {
    '^/admin_booking': '',
  }
}));

// 5. Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found on API Gateway.' });
});

app.listen(PORT, () => {
  console.log(`API Gateway is running on http://localhost:${PORT}`);
});