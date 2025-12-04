import { Version3Client } from "jira.js";
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

/**
 * Extract text content from JIRA document structure
 * @param {Object} node - Document node (paragraph, text, etc.)
 * @returns {string} - Extracted text content
 */
function extractTextFromNode(node) {
  if (!node) return "";

  if (node.type === "text") {
    return node.text || "";
  }

  if (node.type === "hardBreak") {
    return "\n";
  }

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
}

/**
 * Extract text from comment body (document structure)
 * @param {Object} body - Comment body object
 * @returns {string} - Plain text content
 */
function extractCommentText(body) {
  if (!body || !body.content) return "";

  return body.content
    .map((node) => extractTextFromNode(node))
    .join("\n")
    .trim();
}

/**
 * Filter function to transform JIRA API response to only include specific fields
 * @param {Object} jiraResponse - The raw JIRA API response object
 * @returns {Object} - Filtered response with only required fields
 */
function filterJiraResponse(jiraResponse) {
  if (!jiraResponse || !jiraResponse.issues) {
    return [];
  }

  const filteredIssues = jiraResponse.issues.filter((issue) => {
    // 1. Check last comment
    const comments = (issue.fields?.comment?.comments || []).sort((a, b) => new Date(b.updated) - new Date(a.updated));
    const lastCommentBody = comments.length > 0 ? extractCommentText(comments[0].body) : "";
    if (lastCommentBody.toLowerCase().includes("completed")) {
      return false;
    }

    // 2. Check linked issues
    const issuelinks = issue.fields?.issuelinks || [];
    const allLinkedIssuesReady = issuelinks.every((link) => {
      // User requested to only check inward linked issues (issues that link TO this issue)
      if (!link.inwardIssue) return true;

      const inwardIssue = link.inwardIssue;
      const inwardIssueType = inwardIssue.fields?.issuetype?.name;

      // If the inward linked issue is a Bug or LO Bug, check its status
      if (inwardIssueType === "Bug" || inwardIssueType === "LO Bug") {
        const status = inwardIssue.fields?.status?.name;
        return status === "Ready for QA" || status === "Closed";
      }

      // If it's not a Bug/LO Bug, we don't care about its status
      return true;
    });

    if (!allLinkedIssuesReady) {
      return false;
    }

    return true;
  });

  // 3. Format return
  return filteredIssues.map((issue, index) => {
    const summary = issue.fields?.summary || "";
    // Construct URL from self link (e.g. https://scopely.atlassian.net/rest/api/3/issue/2151081 -> https://scopely.atlassian.net/browse/ST-156821)
    // A safer way might be to just use the base domain if we can infer it, or just use the key if the user knows the domain.
    // However, the user asked for "JIRA Ticket URL".
    // Let's try to parse the domain from 'self' or just assume a standard structure if 'self' is present.
    let ticketUrl = "";
    if (issue.self) {
      try {
        const url = new URL(issue.self);
        ticketUrl = `${url.origin}/browse/${issue.key}`;
      } catch (e) {
        ticketUrl = issue.key; // Fallback
      }
    } else {
      ticketUrl = issue.key;
    }

    return `${index + 1}. ${ticketUrl} - ${summary}`;
  });
}

/**
 * Test function to fetch real JIRA data and test the comment extractor
 */
async function testCommentExtractor() {
  try {
    console.log("=== Fetching JIRA issues ===");
    console.log('JQL: project = ST AND issuetype = Task AND component in (BuildReq, ValidationReq) AND status = "In Progress" AND updated >= -90m\n');

    const response = await client.issueSearch.searchForIssuesUsingJqlEnhancedSearch({
      jql: 'project = ST AND issuetype = Task AND component in (BuildReq, ValidationReq) AND status = "In Progress" AND updated >= -90m',
      fields: ["summary", "status", "comment", "updated", "key", "issuelinks"],
      maxResults: 50,
      startAt: 0,
    });

    console.log(`Found ${response.issues?.length || 0} issues\n`);

    // Test comment extraction on each issue
    if (response.issues && response.issues.length > 0) {
      response.issues.forEach((issue, index) => {
        console.log(`\n${"=".repeat(80)}`);
        console.log(`Issue ${index + 1}: ${issue.key} - ${issue.fields?.summary}`);
        console.log(`${"=".repeat(80)}`);

        const comments = issue.fields?.comment?.comments || [];
        if (comments.length > 0) {
          // Sort by updated date to get the latest comment
          const sortedComments = comments.sort((a, b) => new Date(b.updated) - new Date(a.updated));

          console.log(`\nTotal comments: ${comments.length}`);
          console.log(`\n--- Latest Comment (by ${sortedComments[0].author?.displayName}) ---`);

          const extractedText = extractCommentText(sortedComments[0].body);
          console.log(extractedText);

          // Check if it contains "completed"
          if (extractedText.toLowerCase().includes("completed")) {
            console.log("\n⚠️  This comment contains 'completed' - would be filtered out");
          }
        } else {
          console.log("\nNo comments found");
        }
      });

      // Run the filter function
      console.log("\n\n" + "=".repeat(80));
      console.log("=== Filtered Results (after applying filters) ===");
      console.log("=".repeat(80) + "\n");
      const filtered = filterJiraResponse(response);
      console.log(JSON.stringify(filtered, null, 2));
    } else {
      console.log("No issues found matching the JQL query");
    }
  } catch (error) {
    console.error("Error fetching JIRA issues:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

// Export the functions for use in other modules
export { filterJiraResponse, extractCommentText, extractTextFromNode };

// Run the test with real JIRA data
testCommentExtractor();
