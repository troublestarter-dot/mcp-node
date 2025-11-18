require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load agent configurations from environment variable
let agentConfig = { agents: {} };
try {
  if (process.env.MCP_ROUTER_CONFIG) {
    agentConfig = JSON.parse(process.env.MCP_ROUTER_CONFIG);
  }
} catch (error) {
  console.error('Error parsing MCP_ROUTER_CONFIG:', error.message);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// MCP agent proxy route
app.all('/mcp/:agent/*', async (req, res) => {
  const { agent } = req.params;
  const restOfPath = req.params[0]; // Captures everything after /mcp/:agent/

  // Check if agent exists in configuration
  if (!agentConfig.agents || !agentConfig.agents[agent]) {
    return res.status(404).json({ 
      error: 'Agent not found',
      agent: agent
    });
  }

  const agentUrl = agentConfig.agents[agent].url;
  const targetUrl = `${agentUrl}/${restOfPath}`;

  try {
    // Prepare headers (exclude host header to avoid conflicts)
    const headers = { ...req.headers };
    delete headers.host;

    // Make the proxy request
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: headers,
      validateStatus: () => true // Accept any status code
    });

    // Forward the response
    res.status(response.status).set(response.headers).send(response.data);
  } catch (error) {
    console.error(`Error proxying to ${targetUrl}:`, error.message);
    res.status(502).json({ 
      error: 'Bad Gateway',
      message: 'Failed to proxy request to agent',
      details: error.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`MCP Router server running on port ${PORT}`);
  console.log(`Configured agents:`, Object.keys(agentConfig.agents || {}));
});
