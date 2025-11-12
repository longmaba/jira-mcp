# JIRA MCP Server

A Model Context Protocol (MCP) server that provides JIRA integration capabilities. This server allows AI assistants to search, view, create, and update JIRA issues using natural language.

## Features

- **Search Issues**: Search for JIRA issues using JQL (JIRA Query Language)
- **Get Issue Details**: Retrieve detailed information about specific issues
- **Create Issues**: Create new JIRA issues with customizable fields
- **Update Issues**: Update existing issues including status transitions

## Installation

```bash
npm install
```

## Configuration

The server requires three environment variables:

- `JIRA_URL`: Your JIRA instance URL (e.g., `https://your-domain.atlassian.net`)
- `JIRA_EMAIL`: Your JIRA account email
- `JIRA_API_TOKEN`: Your JIRA API token

### Getting a JIRA API Token

1. Log in to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Give it a label and copy the token

### Setup for Claude Desktop

The server supports both **stdio** and **SSE** transport modes. For Claude Desktop and other MCP clients that spawn processes, stdio mode is used automatically.

Add this to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "jira": {
      "command": "npx",
      "args": ["-y", "jira-mcp-server"],
      "env": {
        "JIRA_URL": "https://your-domain.atlassian.net",
        "JIRA_EMAIL": "your-email@example.com",
        "JIRA_API_TOKEN": "your-api-token-here"
      }
    }
  }
}
```

Alternatively, if running locally:

```json
{
  "mcpServers": {
    "jira": {
      "command": "node",
      "args": ["O:\\projects\\jira-mcp\\index.js"],
      "env": {
        "JIRA_URL": "https://your-domain.atlassian.net",
        "JIRA_EMAIL": "your-email@example.com",
        "JIRA_API_TOKEN": "your-api-token-here"
      }
    }
  }
}
```

The server will automatically detect that it's being run by an MCP client (stdin is not a TTY) and use stdio transport mode.

## Available Resources

The MCP server exposes JIRA data as resources that can be listed and read:

### jira://search?jql={query}

Search for JIRA issues using JQL queries.

**Example URIs:**

- `jira://search?jql=project=ST AND status=Open`
- `jira://search?jql=project=ST AND type=Task AND component in (BuildReq, ValidationReq) AND status=Open ORDER BY priority DESC`
- `jira://search?jql=assignee=currentUser() AND status!=Done`

### jira://issue/{issueKey}

Get detailed information about a specific issue.

**Example URIs:**

- `jira://issue/ST-123`
- `jira://issue/PROJ-456`

## Available Tools

### jira_search

Search for JIRA issues using JQL.

**Parameters:**

- `jql` (required): JQL query string
- `maxResults` (optional): Maximum results to return (default: 50)
- `startAt` (optional): Starting index for pagination (default: 0)
- `fields` (optional): Array of field names to return

**Example:**

```
Search for all open bugs in the PROJ project
```

### jira_get_issue

Get detailed information about a specific issue.

**Parameters:**

- `issueKey` (required): Issue key (e.g., "PROJ-123")
- `fields` (optional): Array of field names to return

**Example:**

```
Get details for issue PROJ-123
```

### jira_create_issue

Create a new JIRA issue.

**Parameters:**

- `projectKey` (required): Project key
- `summary` (required): Issue title
- `issueType` (required): Issue type (e.g., "Task", "Bug", "Story")
- `description` (optional): Issue description
- `priority` (optional): Priority level
- `assignee` (optional): Assignee account ID
- `labels` (optional): Array of labels

**Example:**

```
Create a new bug in project PROJ with summary "Login page not working"
```

### jira_update_issue

Update an existing JIRA issue.

**Parameters:**

- `issueKey` (required): Issue key to update
- `summary` (optional): New summary
- `description` (optional): New description
- `priority` (optional): New priority
- `assignee` (optional): New assignee account ID
- `labels` (optional): New labels array
- `status` (optional): New status (triggers transition)

**Example:**

```
Update issue PROJ-123 to set status to "In Progress"
```

## Usage Examples

After configuring the server in Claude Desktop, you can use natural language commands like:

- "Search for all issues in the PROJ project that are in progress"
- "Show me details for issue PROJ-123"
- "Create a new task in PROJ with title 'Update documentation'"
- "Update PROJ-456 and set its status to Done"

## Transport Modes

The server supports two transport modes:

### Stdio Mode (Default for MCP Clients)

When the server is spawned by an MCP client (like Claude Desktop), it automatically detects that stdin is not a TTY and uses stdio transport. This is the standard mode for local MCP integrations.

You can also explicitly force stdio mode by setting:
```bash
MCP_TRANSPORT=stdio node index.js
```

### SSE Mode (HTTP Server)

The server can also run as an HTTP server using Server-Sent Events (SSE) transport. This allows it to be used by any MCP client that supports SSE connections over HTTP.

### Start the Server in SSE Mode

To start the server in SSE mode (HTTP server), set the `PORT` environment variable:

```bash
# Set environment variables
export JIRA_URL="https://your-domain.atlassian.net"
export JIRA_EMAIL="your-email@example.com"
export JIRA_API_TOKEN="your-api-token-here"

# Start the server in SSE mode
PORT=3000 npm start
```

Or explicitly set the transport mode:

```bash
MCP_TRANSPORT=sse PORT=3000 npm start
```

The server will automatically use SSE mode if:
- `PORT` environment variable is set
- `MCP_TRANSPORT=sse` is set
- stdin is a TTY (running interactively)

### SSE Endpoints

Once running, the server exposes:

- **SSE Connection**: `GET http://localhost:3000/sse` - Main SSE endpoint for MCP communication
- **Message Endpoint**: `POST http://localhost:3000/message` - Endpoint for sending messages to the server
- **Health Check**: `GET http://localhost:3000/health` - Server health status

### Connecting MCP Clients

To connect an MCP client to the SSE server, use the SSE endpoint URL:

```
http://localhost:3000/sse
```

### Testing the Server

You can test if the server is running:

```bash
# Health check
curl http://localhost:3000/health

# Response: {"status":"ok","server":"jira-mcp-server"}
```

## Development

The server follows the Model Context Protocol specification and supports both stdio and SSE transports:

- **Stdio transport**: For local MCP clients that spawn processes (e.g., Claude Desktop)
- **SSE transport**: For HTTP-based MCP clients and web applications

The transport mode is automatically detected based on the execution context, but can be explicitly controlled via the `MCP_TRANSPORT` environment variable (`stdio` or `sse`).

## License

MIT
