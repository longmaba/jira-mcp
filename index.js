#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Version3Client } from "jira.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Store original stdout.write for later use
const originalStdoutWrite = process.stdout.write.bind(process.stdout);
let transportStarted = false;

// Check early if we're likely to use stdio (stdin is piped)
// If so, set up stdout interception immediately to catch any early writes
const isStdinLikelyPiped = !process.stdin.isTTY;
if (isStdinLikelyPiped) {
  // Intercept stdout immediately to prevent any early non-JSON-RPC output
  process.stdout.write = function (chunk, encoding, callback) {
    if (!transportStarted) {
      // Check if it looks like JSON-RPC
      const str = chunk?.toString() || "";
      if (str.trim().startsWith("{") && str.includes('"jsonrpc"')) {
        // Allow JSON-RPC messages
        return originalStdoutWrite(chunk, encoding, callback);
      }
      // Discard non-JSON-RPC output
      if (typeof callback === "function") {
        callback();
      }
      return true;
    }
    return originalStdoutWrite(chunk, encoding, callback);
  };
}

dotenv.config();

const JIRA_URL = process.env.JIRA_URL;
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;

if (!JIRA_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
  console.error("Error: Missing required environment variables:");
  console.error("- JIRA_URL (e.g., https://your-domain.atlassian.net)");
  console.error("- JIRA_EMAIL");
  console.error("- JIRA_API_TOKEN");
  process.exit(1);
}

const client = new Version3Client({
  host: JIRA_URL,
  authentication: {
    basic: {
      email: JIRA_EMAIL,
      apiToken: JIRA_API_TOKEN,
    },
  },
});

// Function to create a new server instance
function createServer() {
  const server = new Server(
    {
      name: "jira-mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "jira_search",
          description: "Search for JIRA issues using JQL (JIRA Query Language). Returns a list of issues matching the query.",
          inputSchema: {
            type: "object",
            properties: {
              jql: {
                type: "string",
                description: "JQL query string (e.g., 'project = PROJ AND status = Open')",
              },
              maxResults: {
                type: "number",
                description: "Maximum number of results to return (default: 50)",
                default: 50,
              },
              startAt: {
                type: "number",
                description: "Starting index for pagination (default: 0)",
                default: 0,
              },
              fields: {
                type: "array",
                items: { type: "string" },
                description: "Array of field names to return (e.g., ['summary', 'status', 'assignee'])",
              },
            },
            required: ["jql"],
          },
        },
        {
          name: "jira_get_issue",
          description: "Get detailed information about a specific JIRA issue by its key (e.g., PROJ-123)",
          inputSchema: {
            type: "object",
            properties: {
              issueKey: {
                type: "string",
                description: "JIRA issue key (e.g., 'PROJ-123')",
              },
              fields: {
                type: "array",
                items: { type: "string" },
                description: "Array of field names to return (optional)",
              },
            },
            required: ["issueKey"],
          },
        },
        {
          name: "jira_create_issue",
          description: "Create a new JIRA issue",
          inputSchema: {
            type: "object",
            properties: {
              projectKey: {
                type: "string",
                description: "Project key (e.g., 'PROJ')",
              },
              summary: {
                type: "string",
                description: "Issue summary/title",
              },
              description: {
                type: "string",
                description: "Issue description",
              },
              issueType: {
                type: "string",
                description: "Issue type (e.g., 'Task', 'Bug', 'Story')",
              },
              priority: {
                type: "string",
                description: "Priority (e.g., 'High', 'Medium', 'Low') - optional",
              },
              assignee: {
                type: "string",
                description: "Assignee account ID - optional",
              },
              labels: {
                type: "array",
                items: { type: "string" },
                description: "Array of labels - optional",
              },
            },
            required: ["projectKey", "summary", "issueType"],
          },
        },
        {
          name: "jira_update_issue",
          description: "Update an existing JIRA issue",
          inputSchema: {
            type: "object",
            properties: {
              issueKey: {
                type: "string",
                description: "JIRA issue key (e.g., 'PROJ-123')",
              },
              summary: {
                type: "string",
                description: "New summary/title - optional",
              },
              description: {
                type: "string",
                description: "New description - optional",
              },
              priority: {
                type: "string",
                description: "New priority - optional",
              },
              assignee: {
                type: "string",
                description: "New assignee account ID - optional",
              },
              labels: {
                type: "array",
                items: { type: "string" },
                description: "New labels array - optional",
              },
              status: {
                type: "string",
                description: "New status/transition name (e.g., 'In Progress', 'Done') - optional",
              },
            },
            required: ["issueKey"],
          },
        },
      ],
    };
  });

  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [
        {
          uri: "jira://search?jql=",
          name: "JIRA Search",
          description: "Search JIRA issues using JQL query. Append your JQL query after 'jql='",
          mimeType: "application/json",
        },
        {
          uri: "jira://issue/",
          name: "JIRA Issue",
          description: "Get a specific JIRA issue. Append issue key after 'issue/' (e.g., jira://issue/PROJ-123)",
          mimeType: "application/json",
        },
      ],
    };
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;

    try {
      if (uri.startsWith("jira://search?jql=")) {
        const jql = decodeURIComponent(uri.replace("jira://search?jql=", ""));

        const searchResults = await client.issueSearch.searchForIssuesUsingJqlEnhancedSearch({
          jql,
          maxResults: 100,
          startAt: 0,
          fields: ["summary", "status", "assignee", "created", "updated", "priority", "issuetype", "description", "labels", "components"],
        });

        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify(
                {
                  total: searchResults.total,
                  issues: searchResults.issues.map((issue) => ({
                    key: issue.key,
                    id: issue.id,
                    summary: issue.fields.summary,
                    status: issue.fields.status?.name,
                    assignee: issue.fields.assignee?.displayName || "Unassigned",
                    priority: issue.fields.priority?.name,
                    type: issue.fields.issuetype?.name,
                    created: issue.fields.created,
                    updated: issue.fields.updated,
                    description: issue.fields.description,
                    labels: issue.fields.labels,
                    components: issue.fields.components?.map((c) => c.name),
                    url: `${JIRA_URL}/browse/${issue.key}`,
                  })),
                },
                null,
                2
              ),
            },
          ],
        };
      } else if (uri.startsWith("jira://issue/")) {
        const issueKey = uri.replace("jira://issue/", "");

        const issue = await client.issues.getIssue({
          issueIdOrKey: issueKey,
        });

        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify(
                {
                  key: issue.key,
                  id: issue.id,
                  summary: issue.fields.summary,
                  description: issue.fields.description,
                  status: issue.fields.status?.name,
                  assignee: issue.fields.assignee?.displayName || "Unassigned",
                  reporter: issue.fields.reporter?.displayName,
                  priority: issue.fields.priority?.name,
                  type: issue.fields.issuetype?.name,
                  created: issue.fields.created,
                  updated: issue.fields.updated,
                  labels: issue.fields.labels,
                  components: issue.fields.components?.map((c) => c.name),
                  comments: issue.fields.comment?.comments?.map((c) => ({
                    author: c.author?.displayName,
                    body: c.body,
                    created: c.created,
                  })),
                  url: `${JIRA_URL}/browse/${issue.key}`,
                },
                null,
                2
              ),
            },
          ],
        };
      } else {
        throw new Error(`Unsupported resource URI: ${uri}`);
      }
    } catch (error) {
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                error: error.message,
                details: error.response?.data || error.stack,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "jira_search": {
          const { jql, maxResults = 50, startAt = 0, fields } = args;

          const searchResults = await client.issueSearch.searchForIssuesUsingJqlEnhancedSearch({
            jql,
            maxResults,
            startAt,
            fields: fields || ["summary", "status", "issuetype", "issuelinks", "comment", "updated"],
            expand: "renderedFields",
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    issues: searchResults.issues.map((issue) => {
                      // Helper function to extract text from document structure
                      const extractTextFromNode = (node) => {
                        if (!node) return "";
                        if (node.type === "text") return node.text || "";
                        if (node.type === "hardBreak") return "\n";
                        if (node.type === "paragraph" && node.content) {
                          return node.content.map(extractTextFromNode).join("");
                        }
                        // Handle bullet lists
                        if (node.type === "bulletList" && node.content) {
                          return node.content.map((item) => extractTextFromNode(item)).join("\n");
                        }
                        // Handle ordered lists
                        if (node.type === "orderedList" && node.content) {
                          return node.content.map((item) => extractTextFromNode(item)).join("\n");
                        }
                        // Handle list items - prefix with bullet or number
                        if (node.type === "listItem" && node.content) {
                          const itemText = node.content.map(extractTextFromNode).join("");
                          return `• ${itemText}`;
                        }
                        if (node.content && Array.isArray(node.content)) {
                          return node.content.map(extractTextFromNode).join("");
                        }
                        return "";
                      };

                      const extractCommentText = (body) => {
                        if (!body || !body.content) return "";
                        return body.content
                          .map((node) => extractTextFromNode(node))
                          .join("\n")
                          .trim();
                      };

                      // Sort comments by updated time (most recent first) and extract text content
                      const comments = (issue.fields.comment?.comments || [])
                        .sort((a, b) => new Date(b.updated) - new Date(a.updated))
                        .map((comment) => extractCommentText(comment.body));

                      // Filter issuelinks to only include inwardIssue with minimal fields
                      const issuelinks = (issue.fields.issuelinks || [])
                        .filter((link) => link.inwardIssue)
                        .map((link) => ({
                          inwardIssue: {
                            key: link.inwardIssue.key,
                            fields: {
                              status: link.inwardIssue.fields?.status?.name,
                              issuetype: link.inwardIssue.fields?.issuetype?.name,
                            },
                          },
                        }));

                      return {
                        key: issue.key,
                        fields: {
                          summary: issue.fields.summary,
                          issuelinks: issuelinks,
                          comment: {
                            comments: comments,
                          },
                          status: issue.fields.status?.name,
                          issuetype: issue.fields.issuetype?.name,
                        },
                      };
                    }),
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        case "jira_get_issue": {
          const { issueKey, fields } = args;

          const issue = await client.issues.getIssue({
            issueIdOrKey: issueKey,
            fields: fields,
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    key: issue.key,
                    id: issue.id,
                    self: issue.self,
                    fields: issue.fields,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        case "jira_create_issue": {
          const { projectKey, summary, description, issueType, priority, assignee, labels } = args;

          const fields = {
            project: { key: projectKey },
            summary,
            issuetype: { name: issueType },
          };

          if (description) {
            fields.description = {
              type: "doc",
              version: 1,
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: description,
                    },
                  ],
                },
              ],
            };
          }

          if (priority) {
            fields.priority = { name: priority };
          }

          if (assignee) {
            fields.assignee = { id: assignee };
          }

          if (labels) {
            fields.labels = labels;
          }

          const issue = await client.issues.createIssue({
            fields,
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    key: issue.key,
                    id: issue.id,
                    self: issue.self,
                    message: "Issue created successfully",
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        case "jira_update_issue": {
          const { issueKey, summary, description, priority, assignee, labels, status } = args;

          const updateData = { fields: {} };

          if (summary) {
            updateData.fields.summary = summary;
          }

          if (description) {
            updateData.fields.description = {
              type: "doc",
              version: 1,
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: description,
                    },
                  ],
                },
              ],
            };
          }

          if (priority) {
            updateData.fields.priority = { name: priority };
          }

          if (assignee) {
            updateData.fields.assignee = { id: assignee };
          }

          if (labels) {
            updateData.fields.labels = labels;
          }

          await client.issues.editIssue({
            issueIdOrKey: issueKey,
            ...updateData,
          });

          if (status) {
            const transitions = await client.issues.getTransitions({
              issueIdOrKey: issueKey,
            });

            const transition = transitions.transitions.find((t) => t.name.toLowerCase() === status.toLowerCase());

            if (transition) {
              await client.issues.doTransition({
                issueIdOrKey: issueKey,
                transition: { id: transition.id },
              });
            }
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    issueKey,
                    message: "Issue updated successfully",
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                error: error.message,
                details: error.response?.data || error.stack,
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

async function main() {
  // Determine transport mode:
  // Priority order:
  // 1. If MCP_TRANSPORT is explicitly set, use that
  // 2. If stdin is not a TTY (piped from MCP client), use stdio (this takes precedence over PORT)
  // 3. Otherwise, use SSE if PORT is set or stdin is a TTY (for manual testing)
  const transportMode = process.env.MCP_TRANSPORT;

  // Check if stdin is NOT a TTY (piped) - this handles both false and undefined
  const isStdinPiped = !process.stdin.isTTY;

  let useStdio = false;
  let useSSE = false;

  if (transportMode === "stdio") {
    useStdio = true;
  } else if (transportMode === "sse") {
    useSSE = true;
  } else if (isStdinPiped) {
    // stdin is piped (not a TTY) - ALWAYS use stdio for MCP clients
    // This takes precedence over everything else except explicit transport mode
    useStdio = true;
  } else if (process.env.PORT && process.stdin.isTTY === true) {
    // Only use SSE if PORT is explicitly set AND stdin is a TTY
    useSSE = true;
  } else {
    // Default to stdio if we can't determine (safer for MCP clients)
    useStdio = true;
  }

  if (useStdio) {
    // Stdio mode - for MCP clients like Claude Desktop
    // IMPORTANT: All logging must go to stderr, not stdout, in stdio mode

    // Handle EPIPE errors gracefully (broken pipe when client disconnects)
    process.stdout.on("error", (err) => {
      if (err.code === "EPIPE") {
        // Client disconnected, this is normal - exit gracefully
        process.exit(0);
      } else {
        console.error("stdout error:", err);
      }
    });

    // If we didn't intercept stdout earlier (when stdin wasn't piped),
    // do it now (handles MCP_TRANSPORT=stdio explicit setting)
    // Note: if isStdinLikelyPiped was true, we already intercepted above
    if (!isStdinLikelyPiped) {
      // Check if stdout.write was already intercepted
      const currentWrite = process.stdout.write;
      if (currentWrite === originalStdoutWrite || currentWrite.toString().includes("transportStarted")) {
        // Not yet intercepted, or it's our interceptor - set it up
        process.stdout.write = function (chunk, encoding, callback) {
          if (!transportStarted) {
            const str = chunk?.toString() || "";
            if (str.trim().startsWith("{") && str.includes('"jsonrpc"')) {
              return originalStdoutWrite(chunk, encoding, callback);
            }
            if (typeof callback === "function") {
              callback();
            }
            return true;
          }
          return originalStdoutWrite(chunk, encoding, callback);
        };
      }
    }

    console.error("Starting JIRA MCP Server in stdio mode...");
    const server = createServer();
    const transport = new StdioServerTransport();
    // Enable stdout writes now so transport can write JSON-RPC messages
    transportStarted = true;
    await server.connect(transport);
    console.error("JIRA MCP Server connected via stdio");
  } else {
    // SSE mode - for HTTP-based clients
    const app = express();
    const PORT = process.env.PORT || 3000;

    // Enable CORS for all origins (adjust as needed for production)
    app.use(
      cors({
        origin: "*",
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

    app.use(express.json());

    // Store active transports and servers by session ID
    const transports = new Map();
    const servers = new Map();

    // Health check endpoint
    app.get("/health", (req, res) => {
      res.json({ status: "ok", server: "jira-mcp-server" });
    });

    // SSE endpoint for MCP
    app.get("/sse", async (req, res) => {
      console.error("New SSE connection established");

      // Create a new server instance for this connection
      const server = createServer();

      // Create transport - it will generate its own sessionId
      const transport = new SSEServerTransport("/message", res);

      // Store transport and server by sessionId
      transports.set(transport.sessionId, transport);
      servers.set(transport.sessionId, server);
      console.error("Created transport with sessionId:", transport.sessionId);

      await server.connect(transport);

      // Handle client disconnect
      req.on("close", () => {
        console.error("SSE connection closed for session:", transport.sessionId);
        transports.delete(transport.sessionId);
        servers.delete(transport.sessionId);
      });
    });

    // Message endpoint for client requests
    app.post("/message", async (req, res) => {
      const sessionId = req.query.sessionId;
      console.error("Received message for session:", sessionId);

      const transport = transports.get(sessionId);
      if (!transport) {
        console.error("No transport found for session:", sessionId);
        return res.status(404).json({ error: "Session not found" });
      }

      // Let the transport handle the message
      // Note: We pass the raw request body (already parsed by express.json())
      await transport.handlePostMessage(req, res, req.body);
    });

    app.listen(PORT, () => {
      console.error(`JIRA MCP Server running on http://localhost:${PORT}`);
      console.error(`SSE endpoint: http://localhost:${PORT}/sse`);
    });
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
