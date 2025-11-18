const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

// Parse MCP_ROUTER_CONFIG from environment
// Expected format: JSON object mapping agent names to URLs
// Example: {"agent1": "http://localhost:4001", "agent2": "http://localhost:4002"}
let agentConfig = {};
try {
  if (process.env.MCP_ROUTER_CONFIG) {
    agentConfig = JSON.parse(process.env.MCP_ROUTER_CONFIG);
  }
} catch (error) {
  console.error('Error parsing MCP_ROUTER_CONFIG:', error.message);
}

// Health check endpoint
app.get('/mcp/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Proxy requests to agents
app.use('/mcp/:agent', (req, res, next) => {
  const agentName = req.params.agent;
  const agentUrl = agentConfig[agentName];

  if (!agentUrl) {
    return res.status(404).json({
      error: 'Agent not found',
      agent: agentName,
      message: `No URL configured for agent "${agentName}"`
    });
  }

  // Create proxy middleware for this specific agent
  const proxy = createProxyMiddleware({
    target: agentUrl,
    changeOrigin: true,
    pathRewrite: (path) => {
      // Remove /mcp/:agent prefix and keep the rest
      return path.replace(`/mcp/${agentName}`, '');
    },
    onError: (err, req, res) => {
      console.error(`Proxy error for agent "${agentName}":`, err.message);
      res.status(502).json({
        error: 'Proxy error',
        agent: agentName,
        message: err.message
      });
    },
    onProxyReq: (proxyReq, req) => {
      console.log(`[${new Date().toISOString()}] Proxying ${req.method} ${req.path} -> ${agentUrl}${proxyReq.path}`);
    }
  });

  proxy(req, res, next);
});

// Start server
app.listen(PORT, () => {
  console.log(`MCP Router listening on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/mcp/health`);
  console.log('Configured agents:', Object.keys(agentConfig).length > 0 ? Object.keys(agentConfig).join(', ') : 'none');
});
