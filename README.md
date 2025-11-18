# MCP Router

Minimal MCP Router built with Express.js for routing requests to multiple MCP agents.

## Features

- **Health Check**: GET `/mcp/health` returns `{status:"ok"}`
- **Agent Proxying**: Routes `/mcp/:agent/*` requests to configured agent URLs
- **Configurable**: Agent URLs configured via `MCP_ROUTER_CONFIG` environment variable

## Installation

```bash
npm install
```

## Configuration

Set the `MCP_ROUTER_CONFIG` environment variable with a JSON object mapping agent names to their URLs:

```bash
export MCP_ROUTER_CONFIG='{"agent1":"http://localhost:4001","agent2":"http://localhost:4002"}'
```

## Usage

Start the server:

```bash
npm start
```

The server will listen on port 3000.

### Endpoints

- **Health Check**: `GET http://localhost:3000/mcp/health`
  - Returns: `{"status":"ok"}`

- **Agent Proxy**: `GET/POST/etc http://localhost:3000/mcp/:agent/*`
  - Proxies requests to the configured agent URL
  - Example: `GET /mcp/agent1/some/path` → proxies to `http://localhost:4001/some/path`

## Example

```bash
# Start the router with configuration
MCP_ROUTER_CONFIG='{"my-agent":"http://localhost:4001"}' npm start

# Check health
curl http://localhost:3000/mcp/health

# Proxy to agent
curl http://localhost:3000/mcp/my-agent/api/status
```

## Error Handling

- Returns 404 if agent is not configured
- Returns 502 if proxy to agent fails
- All errors return JSON responses with error details