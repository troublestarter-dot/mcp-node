# mcp-node

A minimal HTTP router that proxies requests to MCP (Model Context Protocol) agents.

## Features

- Simple HTTP router built with Express
- Proxies requests to configured MCP agents
- Preserves HTTP method, headers, and body
- Health check endpoint
- Ready for Render deployment

## Installation

```bash
npm install
```

## Configuration

The router uses environment variables for configuration. Copy `.env.example` to `.env` and configure your agents:

```bash
cp .env.example .env
```

Edit `.env` and set the `MCP_ROUTER_CONFIG` variable with your agent configurations:

```env
MCP_ROUTER_CONFIG={"agents":{"agent-name":{"url":"http://agent-host:port"}}}
```

### Configuration Format

The `MCP_ROUTER_CONFIG` should be a JSON string with the following structure:

```json
{
  "agents": {
    "agent-name": {
      "url": "http://agent-host:port"
    },
    "another-agent": {
      "url": "http://another-host:port"
    }
  }
}
```

## Running Locally

```bash
npm start
```

The server will start on port 3000 by default (or the port specified in `PORT` environment variable).

## API Endpoints

### Health Check

```
GET /health
```

Returns `{"status":"ok"}` to indicate the server is running.

### Agent Proxy

```
/mcp/:agent/*
```

Proxies requests to the configured agent. Replace `:agent` with your agent name from the configuration, and the rest of the path will be forwarded to the agent's URL.

**Example:**
- Configuration: `{"agents":{"whitepower":{"url":"http://localhost:8001"}}}`
- Request: `GET /mcp/whitepower/api/data`
- Proxied to: `http://localhost:8001/api/data`

The router preserves:
- HTTP method (GET, POST, PUT, DELETE, etc.)
- Request body
- Request headers

## Deployment to Render

### Step 1: Create a Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository

### Step 2: Configure the Service

- **Name:** mcp-node (or your preferred name)
- **Environment:** Node
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### Step 3: Set Environment Variables

In the Render dashboard, add the following environment variable:

- **Key:** `MCP_ROUTER_CONFIG`
- **Value:** Your JSON configuration (e.g., `{"agents":{"whitepower":{"url":"http://localhost:8001"}}}`)

Optionally, you can also set:
- **Key:** `PORT`
- **Value:** (Render sets this automatically, but you can override if needed)

### Step 4: Deploy

Click "Create Web Service" and Render will automatically deploy your application.

## Testing

Once deployed, you can test the health endpoint:

```bash
curl https://your-app.onrender.com/health
```

And proxy requests through your agents:

```bash
curl https://your-app.onrender.com/mcp/agent-name/endpoint
```

## License

ISC