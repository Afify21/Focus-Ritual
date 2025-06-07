const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const findBackendPort = async () => {
    try {
      const response = await fetch('http://localhost:5002/health');
      if (response.ok) return 5002;
    } catch (e) {
      try {
        const response = await fetch('http://localhost:5003/health');
        if (response.ok) return 5003;
      } catch (e) {
        try {
          const response = await fetch('http://localhost:5004/health');
          if (response.ok) return 5004;
        } catch (e) {
          console.error('Could not find backend server');
          return 5002; // Default to 5002
        }
      }
    }
  };

  // Set up proxy middleware
  const setupProxy = async () => {
    const port = await findBackendPort();
    app.use(
      '/api',
      createProxyMiddleware({
        target: `http://localhost:${port}`,
        changeOrigin: true,
        pathRewrite: {
          '^/api': '', // remove /api prefix when forwarding to backend
        },
        onError: (err, req, res) => {
          console.error('Proxy Error:', err);
          res.status(500).send('Proxy Error');
        },
        logLevel: 'debug'
      })
    );
  };

  setupProxy();
}; 