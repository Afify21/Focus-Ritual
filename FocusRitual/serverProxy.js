const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');
const app = express();

app.use(
  '/api',
  createProxyMiddleware({
    target: 'http://localhost:5002',
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
  })
);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
}); 