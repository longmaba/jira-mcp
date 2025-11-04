#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
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

const server = new Server(
  {
    name: "jira-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
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
          fields: fields || ["summary", "status", "assignee", "created", "updated", "priority", "issuetype"],
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  total: searchResults.total,
                  startAt: searchResults.startAt,
                  maxResults: searchResults.maxResults,
                  issues: searchResults.issues.map((issue) => ({
                    key: issue.key,
                    id: issue.id,
                    self: issue.self,
                    fields: issue.fields,
                  })),
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

async function main() {
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

  // Store active transports by session ID
  const transports = new Map();

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "ok", server: "jira-mcp-server" });
  });

  // SSE endpoint for MCP
  app.get("/sse", async (req, res) => {
    console.error("New SSE connection established");

    // Create transport - it will generate its own sessionId
    const transport = new SSEServerTransport("/message", res);

    // Store transport by its generated sessionId
    transports.set(transport.sessionId, transport);
    console.error("Created transport with sessionId:", transport.sessionId);

    await server.connect(transport);

    // Handle client disconnect
    req.on("close", () => {
      console.error("SSE connection closed for session:", transport.sessionId);
      transports.delete(transport.sessionId);
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

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
