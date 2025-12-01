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
    .filter((node) => node.type === "paragraph")
    .map((paragraph) => extractTextFromNode(paragraph))
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
    return { issues: [] };
  }

  return {
    issues: jiraResponse.issues.map((issue) => {
      // Sort comments by updated time (most recent first) and extract text content
      const comments = (issue.fields?.comment?.comments || [])
        .sort((a, b) => new Date(b.updated) - new Date(a.updated))
        .map((comment) => extractCommentText(comment.body));

      // Filter issuelinks to only include inwardIssue with minimal fields
      const issuelinks = (issue.fields?.issuelinks || [])
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
          summary: issue.fields?.summary,
          issuelinks: issuelinks,
          comment: {
            comments: comments,
          },
          status: issue.fields?.status?.name,
          issuetype: issue.fields?.issuetype?.name,
        },
      };
    }),
  };
}

// Example usage with the provided JSON
const exampleResponse = {
  issues: [
    {
      key: "ST-156821",
      id: "2151081",
      self: "https://scopely.atlassian.net/rest/api/3/issue/2151081",
      fields: {
        summary: "M85 - OPBP Sub Events ",
        issuelinks: [
          {
            id: "491629",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/491629",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2151150",
              key: "ST-156824",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2151150",
              fields: {
                summary: "M85 - Event - The M85_OutpostSubBpEvent_SMS event is missing Icon Asset on the Dev-B Web Panel.",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10143",
                  description:
                    "Default status for newly created bugs.  Represents a new ticket that has not yet been triaged by QA. (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for Triage",
                  id: "10143",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10035",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Arabic_Question_mark_%28RTL%29.svg/90px-Arabic_Question_mark_%28RTL%29.svg.png",
                  name: "Unprioritized",
                  id: "10035",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "491630",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/491630",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2151153",
              key: "ST-156825",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2151153",
              fields: {
                summary: "M85 - Event - The M85_OutpostSubBpEvent_SMS event is missing Custom Banner on the Dev-B Web Panel.",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10143",
                  description:
                    "Default status for newly created bugs.  Represents a new ticket that has not yet been triaged by QA. (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for Triage",
                  id: "10143",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10035",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Arabic_Question_mark_%28RTL%29.svg/90px-Arabic_Question_mark_%28RTL%29.svg.png",
                  name: "Unprioritized",
                  id: "10035",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "491631",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/491631",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2151155",
              key: "ST-156826",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2151155",
              fields: {
                summary: "M85 - Event - The M85_OutpostSubBpEvent_SMS event is missing LOC on the Dev-B Web Panel.",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10143",
                  description:
                    "Default status for newly created bugs.  Represents a new ticket that has not yet been triaged by QA. (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for Triage",
                  id: "10143",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10035",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Arabic_Question_mark_%28RTL%29.svg/90px-Arabic_Question_mark_%28RTL%29.svg.png",
                  name: "Unprioritized",
                  id: "10035",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "492295",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/492295",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2154689",
              key: "ST-156908",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2154689",
              fields: {
                summary:
                  'M85 - BP Events - OPBP Sub Events - Incorrect Outpost system "Romero 9" is mentioned in the long description of the event in the config sheet and Dev B WP',
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10143",
                  description:
                    "Default status for newly created bugs.  Represents a new ticket that has not yet been triaged by QA. (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for Triage",
                  id: "10143",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10035",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Arabic_Question_mark_%28RTL%29.svg/90px-Arabic_Question_mark_%28RTL%29.svg.png",
                  name: "Unprioritized",
                  id: "10035",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
        ],
        comment: {
          comments: [
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2151081/comment/7737753",
              id: "7737753",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Hi team, we started ",
                      },
                      {
                        type: "text",
                        text: "M85 - OPBP Sub Events",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " on Dev-B.",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Validated",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ":",
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "All rewards & event on both WP and in game.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "New bugs: ",
                              },
                              {
                                type: "text",
                                text: "ST-156824",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-156824",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: ", ",
                              },
                              {
                                type: "text",
                                text: "ST-156825",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-156825",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: ", ",
                              },
                              {
                                type: "text",
                                text: "ST-156826",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-156826",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Test Rail",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.testrail.com/index.php?/plans/view/234948",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Build",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ": 1.000.46097",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Time",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ": 30m",
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-27T11:08:23.487+0000",
              updated: "2025-11-27T11:08:23.487+0000",
              jsdPublic: true,
            },
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2151081/comment/7739728",
              id: "7739728",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=62ac8931f8bd790069da47d5",
                accountId: "62ac8931f8bd790069da47d5",
                avatarUrls: {
                  "48x48":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                  "24x24":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                  "16x16":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                  "32x32":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                },
                displayName: "Kshitij Raje",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Hey!",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "We have ",
                      },
                      {
                        type: "text",
                        text: "continued ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "the ",
                      },
                      {
                        type: "text",
                        text: '"M85 - OPBP Sub Events"',
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " task on the mentioned build and server.",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "During our testing, we have encountered one new issue: ",
                      },
                      {
                        type: "text",
                        text: "ST-156908",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156908",
                            },
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " ",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Validated:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have validated the M85 - OPBP Sub Events on both the webpanel and in-game.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have validated the ",
                              },
                              {
                                type: "text",
                                text: "rewards",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " in M85 - OPBP Sub Events on both the webpanel and in-game",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have also updated the ",
                              },
                              {
                                type: "text",
                                text: "GS Testrail",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.testrail.com/index.php?/plans/view/234948",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " ",
                                marks: [
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: "as well:",
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "Completed: 35%",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "Passed: 35%",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                  {
                                    type: "textColor",
                                    attrs: {
                                      color: "#36b37e",
                                    },
                                  },
                                ],
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "Untested: 65%",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Pending:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "The ",
                              },
                              {
                                type: "text",
                                text: "LOC and",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " ",
                              },
                              {
                                type: "text",
                                text: "art",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " for the events need to be implemented and validated",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "The logged bugs need to be fixed and validated.",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "GS In-progress Man Hours: 25 minutes",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Build: M85 - 1.000.45990",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Server: Dev-B",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Thanks!",
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=62ac8931f8bd790069da47d5",
                accountId: "62ac8931f8bd790069da47d5",
                avatarUrls: {
                  "48x48":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                  "24x24":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                  "16x16":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                  "32x32":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                },
                displayName: "Kshitij Raje",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-27T23:02:45.641+0000",
              updated: "2025-11-27T23:40:38.142+0000",
              jsdPublic: true,
            },
          ],
          self: "https://scopely.atlassian.net/rest/api/3/issue/2151081/comment",
          maxResults: 2,
          total: 2,
          startAt: 0,
        },
        updated: "2025-11-27T23:40:38.176+0000",
        status: {
          self: "https://scopely.atlassian.net/rest/api/3/status/3",
          description: "",
          iconUrl: "https://scopely.atlassian.net/images/icons/statuses/inprogress.png",
          name: "In Progress",
          id: "3",
          statusCategory: {
            self: "https://scopely.atlassian.net/rest/api/3/statuscategory/4",
            id: 4,
            key: "indeterminate",
            colorName: "yellow",
            name: "In Progress",
          },
        },
      },
    },
    {
      key: "ST-156820",
      id: "2151071",
      self: "https://scopely.atlassian.net/rest/api/3/issue/2151071",
      fields: {
        summary: "M85 - OPBP IAPs",
        issuelinks: [
          {
            id: "491634",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/491634",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2151162",
              key: "ST-156827",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2151162",
              fields: {
                summary: "M85 - OPBP IAPs – The loc for all of the IAPs is missing in both the config and Dev-B WP",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10143",
                  description:
                    "Default status for newly created bugs.  Represents a new ticket that has not yet been triaged by QA. (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for Triage",
                  id: "10143",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10068",
                  iconUrl: "https://scopely.atlassian.net/images/icons/priorities/major.svg",
                  name: "P2 / Normal",
                  id: "10068",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "491636",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/491636",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2151164",
              key: "ST-156828",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2151164",
              fields: {
                summary: "M85 - OPBP IAPs – The art for all of the IAPs is missing on Dev-B WP",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10143",
                  description:
                    "Default status for newly created bugs.  Represents a new ticket that has not yet been triaged by QA. (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for Triage",
                  id: "10143",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10068",
                  iconUrl: "https://scopely.atlassian.net/images/icons/priorities/major.svg",
                  name: "P2 / Normal",
                  id: "10068",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "492512",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/492512",
            type: {
              id: "10001",
              name: "Cloners",
              inward: "is cloned by",
              outward: "clones",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10001",
            },
            inwardIssue: {
              id: "2156958",
              key: "ST-156960",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2156958",
              fields: {
                summary: "M85 - OPBP Overflow",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/1",
                  description: "",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/open.png",
                  name: "Open",
                  id: "1",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10067",
                  iconUrl: "https://scopely.atlassian.net/images/icons/priorities/critical.svg",
                  name: "P1 / Important",
                  id: "10067",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/10006",
                  id: "10006",
                  description: "Task (Migrated on 27 Mar 2025 15:27 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10318?size=medium",
                  name: "Task",
                  subtask: false,
                  avatarId: 10318,
                  hierarchyLevel: 0,
                },
              },
            },
          },
        ],
        comment: {
          comments: [
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2151071/comment/7737758",
              id: "7737758",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Hi team, we started ",
                      },
                      {
                        type: "text",
                        text: "M85 - OPBP IAPs on Dev-B",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ".",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Validated",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ":",
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "All IAPs validated on WP and In-game.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "New bugs: ",
                              },
                              {
                                type: "text",
                                text: "ST-156827",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-156827",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " ",
                              },
                              {
                                type: "text",
                                text: "ST-156828",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-156828",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Test Rail",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.testrail.com/index.php?/plans/view/234943",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Pending",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ":",
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Loc and art.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "In-game Purchases.",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Build",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ": 1.000.46263",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Time",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ": 30m",
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-27T11:09:10.771+0000",
              updated: "2025-11-27T11:09:10.771+0000",
              jsdPublic: true,
            },
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2151071/comment/7739606",
              id: "7739606",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=62ac8931f8bd790069da47d5",
                accountId: "62ac8931f8bd790069da47d5",
                avatarUrls: {
                  "48x48":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                  "24x24":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                  "16x16":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                  "32x32":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                },
                displayName: "Kshitij Raje",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Hey!",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "We have ",
                      },
                      {
                        type: "text",
                        text: "continued ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "the ",
                      },
                      {
                        type: "text",
                        text: '"M85 - OPBP IAPs"',
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " task on the mentioned build and server.",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "During our testing, we have encountered no new issues.",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Validated:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have validated the M85 - OPBP IAPs on both the webpanel and in-game.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have purchased the IAPs bundles in game accordingly.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have also updated the ",
                              },
                              {
                                type: "text",
                                text: "GS Testrail",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.testrail.com/index.php?/plans/view/234943",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " ",
                                marks: [
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: "as well:",
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "Completed: 67%",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "Passed: 67%",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                  {
                                    type: "textColor",
                                    attrs: {
                                      color: "#36b37e",
                                    },
                                  },
                                ],
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "Untested: 33%",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Pending:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "The ",
                              },
                              {
                                type: "text",
                                text: "LOC and",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " ",
                              },
                              {
                                type: "text",
                                text: "art",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " for all the IAPs need to be implemented and validated",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "The logged bugs need to be fixed and validated.",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "GS In-progress Man Hours: 35 minutes",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Build: M85 - 1.000.46317",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Server: Dev-B",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Thanks!",
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=62ac8931f8bd790069da47d5",
                accountId: "62ac8931f8bd790069da47d5",
                avatarUrls: {
                  "48x48":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                  "24x24":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                  "16x16":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                  "32x32":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                },
                displayName: "Kshitij Raje",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-27T22:15:01.222+0000",
              updated: "2025-11-27T22:15:01.222+0000",
              jsdPublic: true,
            },
          ],
          self: "https://scopely.atlassian.net/rest/api/3/issue/2151071/comment",
          maxResults: 2,
          total: 2,
          startAt: 0,
        },
        updated: "2025-11-28T23:17:33.844+0000",
        status: {
          self: "https://scopely.atlassian.net/rest/api/3/status/3",
          description: "",
          iconUrl: "https://scopely.atlassian.net/images/icons/statuses/inprogress.png",
          name: "In Progress",
          id: "3",
          statusCategory: {
            self: "https://scopely.atlassian.net/rest/api/3/statuscategory/4",
            id: 4,
            key: "indeterminate",
            colorName: "yellow",
            name: "In Progress",
          },
        },
      },
    },
    {
      key: "ST-156819",
      id: "2151068",
      self: "https://scopely.atlassian.net/rest/api/3/issue/2151068",
      fields: {
        summary: " M85 - OPBP (Seasons Profiles, Free/Elite Rewards)",
        issuelinks: [
          {
            id: "491637",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/491637",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2151165",
              key: "ST-156829",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2151165",
              fields: {
                summary:
                  'M85 - Event - The M85_OPBP_Elite Season Profile is using "M85_OPBP_FreeTrack_MS11_" rewards instead of Elite rewards on both the Config Sheet and Dev-B Web Panel',
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10143",
                  description:
                    "Default status for newly created bugs.  Represents a new ticket that has not yet been triaged by QA. (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for Triage",
                  id: "10143",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10035",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Arabic_Question_mark_%28RTL%29.svg/90px-Arabic_Question_mark_%28RTL%29.svg.png",
                  name: "Unprioritized",
                  id: "10035",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "491639",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/491639",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2151166",
              key: "ST-156830",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2151166",
              fields: {
                summary: "M85 - Event - The OPBP Season Profiles are missing Custom Banner on the Dev-B Web Panel.",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10143",
                  description:
                    "Default status for newly created bugs.  Represents a new ticket that has not yet been triaged by QA. (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for Triage",
                  id: "10143",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10035",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Arabic_Question_mark_%28RTL%29.svg/90px-Arabic_Question_mark_%28RTL%29.svg.png",
                  name: "Unprioritized",
                  id: "10035",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "492282",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/492282",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2154631",
              key: "ST-156904",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2154631",
              fields: {
                summary: "M85 - BP Season - M85_OPBP_Free/Elite - The BP Type 'Standard' is absent on the Dev B WP",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10143",
                  description:
                    "Default status for newly created bugs.  Represents a new ticket that has not yet been triaged by QA. (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for Triage",
                  id: "10143",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10035",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Arabic_Question_mark_%28RTL%29.svg/90px-Arabic_Question_mark_%28RTL%29.svg.png",
                  name: "Unprioritized",
                  id: "10035",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "492284",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/492284",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2154663",
              key: "ST-156905",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2154663",
              fields: {
                summary:
                  "M85 - BP Season - M85_OPBP_## - The Outpost Battle Pass is incorrectly appearing in the Events tab instead of the Season Passes tab on Dev-B",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10143",
                  description:
                    "Default status for newly created bugs.  Represents a new ticket that has not yet been triaged by QA. (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for Triage",
                  id: "10143",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10035",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Arabic_Question_mark_%28RTL%29.svg/90px-Arabic_Question_mark_%28RTL%29.svg.png",
                  name: "Unprioritized",
                  id: "10035",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
        ],
        comment: {
          comments: [
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2151068/comment/7737761",
              id: "7737761",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Hi team, we started M85 - OPBP (Seasons Profiles, Free/Elite Rewards) on ",
                      },
                      {
                        type: "text",
                        text: "Dev-B.",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Validated:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "All rewards and event on both WP & in game",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Testrail",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.testrail.com/index.php?/plans/view/234938",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: ": 45% passed",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "2 New Issues Found: ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "ST-156829",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156829",
                            },
                          },
                          {
                            type: "underline",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ", ",
                      },
                      {
                        type: "text",
                        text: "ST-156830",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156830",
                            },
                          },
                          {
                            type: "underline",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ".",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Pending:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Art Testing.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Reported issues need to be fixed and validated.",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Build: ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "1.000.46309",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Server: ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "Dev-B",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "In-progress man-hours:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " 1h",
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-27T11:09:48.638+0000",
              updated: "2025-11-27T11:09:48.638+0000",
              jsdPublic: true,
            },
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2151068/comment/7739710",
              id: "7739710",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=712020%3Aa83f7e5f-a916-4467-b7bb-fefea348c651",
                accountId: "712020:a83f7e5f-a916-4467-b7bb-fefea348c651",
                avatarUrls: {
                  "48x48":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "24x24":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "16x16":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "32x32":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                },
                displayName: "Abhishek Mane",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Hey!",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "We have ",
                      },
                      {
                        type: "text",
                        text: "continued",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " this ",
                      },
                      {
                        type: "text",
                        text: '"M85 - OPBP (Seasons Profiles, Free/Elite Rewards)"',
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " task on the mentioned build and server.",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "During our validation, we encoutered two new issues: ",
                      },
                      {
                        type: "text",
                        text: "ST-156904",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156904",
                            },
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " & ",
                      },
                      {
                        type: "text",
                        text: "ST-156905",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156905",
                            },
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Validated:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have validated the ",
                              },
                              {
                                type: "text",
                                text: "OPBP Season Profile",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " on both the webpanel and in-game.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We validated the ",
                              },
                              {
                                type: "text",
                                text: "Outpost BP Free/Elite Rewards",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " on both webpanel and in-game.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have verified the loc for both the ",
                              },
                              {
                                type: "text",
                                text: "OPBP Season Profile",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " on both the webpanel and in-game.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have also updated the ",
                              },
                              {
                                type: "text",
                                text: "test run",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.testrail.com/index.php?/plans/view/234938",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " as well, & our progression is listed below:",
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "Completed: 86%",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "Passed: 82%",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "Failed: 4%",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "Untested: 12%",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Pending:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "The Art needs to be implemented and validated (",
                              },
                              {
                                type: "text",
                                text: "ST-156830",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-156830",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: ").",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "The reported issues need to be fixed and revalidated.",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "GS total Man Hours: 2 Hours 20 mins",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Build: M84 - 1.000.45716",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Server: Dev-D",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Thanks!",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=712020%3Aa83f7e5f-a916-4467-b7bb-fefea348c651",
                accountId: "712020:a83f7e5f-a916-4467-b7bb-fefea348c651",
                avatarUrls: {
                  "48x48":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "24x24":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "16x16":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "32x32":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                },
                displayName: "Abhishek Mane",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-27T22:59:19.693+0000",
              updated: "2025-11-27T23:03:56.404+0000",
              jsdPublic: true,
            },
          ],
          self: "https://scopely.atlassian.net/rest/api/3/issue/2151068/comment",
          maxResults: 2,
          total: 2,
          startAt: 0,
        },
        updated: "2025-11-27T23:03:56.431+0000",
        status: {
          self: "https://scopely.atlassian.net/rest/api/3/status/3",
          description: "",
          iconUrl: "https://scopely.atlassian.net/images/icons/statuses/inprogress.png",
          name: "In Progress",
          id: "3",
          statusCategory: {
            self: "https://scopely.atlassian.net/rest/api/3/statuscategory/4",
            id: 4,
            key: "indeterminate",
            colorName: "yellow",
            name: "In Progress",
          },
        },
      },
    },
    {
      key: "ST-156816",
      id: "2151055",
      self: "https://scopely.atlassian.net/rest/api/3/issue/2151055",
      fields: {
        summary: "M85 - D1 VBs",
        issuelinks: [
          {
            id: "491640",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/491640",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2151168",
              key: "ST-156831",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2151168",
              fields: {
                summary: "M85 - D1 VBs - Loc is missing on Dev-B",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10143",
                  description:
                    "Default status for newly created bugs.  Represents a new ticket that has not yet been triaged by QA. (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for Triage",
                  id: "10143",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10035",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Arabic_Question_mark_%28RTL%29.svg/90px-Arabic_Question_mark_%28RTL%29.svg.png",
                  name: "Unprioritized",
                  id: "10035",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "491641",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/491641",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2151170",
              key: "ST-156832",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2151170",
              fields: {
                summary: "M85 - D1 VBs - Bucket 328212640 is unavailable on Dev-B",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10143",
                  description:
                    "Default status for newly created bugs.  Represents a new ticket that has not yet been triaged by QA. (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for Triage",
                  id: "10143",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10035",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Arabic_Question_mark_%28RTL%29.svg/90px-Arabic_Question_mark_%28RTL%29.svg.png",
                  name: "Unprioritized",
                  id: "10035",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "492290",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/492290",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2154670",
              key: "ST-156906",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2154670",
              fields: {
                summary: 'M85 - M85_MatrixDiodesGift_Week2/3/4 - The word "Matrix" is misspelled as "Matrid" on both Dev B webpanel and config sheet',
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10143",
                  description:
                    "Default status for newly created bugs.  Represents a new ticket that has not yet been triaged by QA. (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for Triage",
                  id: "10143",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10035",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Arabic_Question_mark_%28RTL%29.svg/90px-Arabic_Question_mark_%28RTL%29.svg.png",
                  name: "Unprioritized",
                  id: "10035",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
        ],
        comment: {
          comments: [
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2151055/comment/7737762",
              id: "7737762",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Hi, we started M85 - ",
                      },
                      {
                        type: "text",
                        text: "D1 VBs - Test",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " on ",
                      },
                      {
                        type: "text",
                        text: "Dev-B.",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Validated:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "All VBs: WP and in-game (excluding in-game holodeck mission VBs).",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Testrail",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.testrail.com/index.php?/plans/view/234933",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: ": 88% passed",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "2 New Issues Found",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ": ",
                      },
                      {
                        type: "text",
                        text: "ST-156831",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156831",
                            },
                          },
                          {
                            type: "underline",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ", ",
                      },
                      {
                        type: "inlineCard",
                        attrs: {
                          url: "https://scopely.atlassian.net/browse/ST-156832",
                        },
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Pending:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Loc Testing.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Holodeck mission VBs in-game testing(blocked by ",
                              },
                              {
                                type: "text",
                                text: "ST-156832",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-156832",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: ")",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Reported issues need to be fixed and validated.",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Build: ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "Latest",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Server: ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "Dev-B",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "In-progress man-hours:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " 20m",
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-27T11:10:13.421+0000",
              updated: "2025-11-27T11:10:13.421+0000",
              jsdPublic: true,
            },
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2151055/comment/7739741",
              id: "7739741",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=712020%3A5bbe172a-620f-4fdb-becb-44ae73d9854a",
                accountId: "712020:5bbe172a-620f-4fdb-becb-44ae73d9854a",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:5bbe172a-620f-4fdb-becb-44ae73d9854a/580b4b4b-c0c6-41b7-a92c-bcc2ff93c606/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:5bbe172a-620f-4fdb-becb-44ae73d9854a/580b4b4b-c0c6-41b7-a92c-bcc2ff93c606/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:5bbe172a-620f-4fdb-becb-44ae73d9854a/580b4b4b-c0c6-41b7-a92c-bcc2ff93c606/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:5bbe172a-620f-4fdb-becb-44ae73d9854a/580b4b4b-c0c6-41b7-a92c-bcc2ff93c606/32",
                },
                displayName: "Nishad Todewale",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Hello!",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "We have ",
                      },
                      {
                        type: "text",
                        text: "started ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "the ",
                      },
                      {
                        type: "text",
                        text: '"M85 - D1 VBs"',
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " task on the mentioned server.",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "During our validation, we encountered one new issue: ",
                      },
                      {
                        type: "text",
                        text: "ST-156906",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156906",
                            },
                          },
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Validated:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have validated the VBs on the webpanel and in-game",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We were unable to validate holodeck VBs in-game due to the ",
                              },
                              {
                                type: "inlineCard",
                                attrs: {
                                  url: "https://scopely.atlassian.net/browse/ST-156832",
                                },
                              },
                              {
                                type: "text",
                                text: " issue",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have verified the art on both webpanel and in-game.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have also updated the GS WP ",
                              },
                              {
                                type: "text",
                                text: "testrail",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.testrail.com/index.php?/runs/view/234935&group_by=cases:section_id&group_order=asc&display=tree",
                                    },
                                  },
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: ":",
                              },
                            ],
                          },
                          {
                            type: "bulletList",
                            content: [
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    content: [
                                      {
                                        type: "text",
                                        text: "Completed: 87%",
                                        marks: [
                                          {
                                            type: "strong",
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    content: [
                                      {
                                        type: "text",
                                        text: "Passed: 63%",
                                        marks: [
                                          {
                                            type: "strong",
                                          },
                                          {
                                            type: "textColor",
                                            attrs: {
                                              color: "#36b37e",
                                            },
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    content: [
                                      {
                                        type: "text",
                                        text: "PWN: 25%",
                                        marks: [
                                          {
                                            type: "strong",
                                          },
                                          {
                                            type: "textColor",
                                            attrs: {
                                              color: "#ffc400",
                                            },
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    content: [
                                      {
                                        type: "text",
                                        text: "Untested: 13%",
                                        marks: [
                                          {
                                            type: "strong",
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Pending:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "in-game validation of Holodeck VB",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Loc of the VBs",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Logged bugs needs to be fixed and validated",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Server",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ": Dev-B",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "GS In-Progress Man Hours: 25 Min",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Thanks!",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=712020%3A5bbe172a-620f-4fdb-becb-44ae73d9854a",
                accountId: "712020:5bbe172a-620f-4fdb-becb-44ae73d9854a",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:5bbe172a-620f-4fdb-becb-44ae73d9854a/580b4b4b-c0c6-41b7-a92c-bcc2ff93c606/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:5bbe172a-620f-4fdb-becb-44ae73d9854a/580b4b4b-c0c6-41b7-a92c-bcc2ff93c606/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:5bbe172a-620f-4fdb-becb-44ae73d9854a/580b4b4b-c0c6-41b7-a92c-bcc2ff93c606/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:5bbe172a-620f-4fdb-becb-44ae73d9854a/580b4b4b-c0c6-41b7-a92c-bcc2ff93c606/32",
                },
                displayName: "Nishad Todewale",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-27T23:35:30.501+0000",
              updated: "2025-11-27T23:37:19.823+0000",
              jsdPublic: true,
            },
          ],
          self: "https://scopely.atlassian.net/rest/api/3/issue/2151055/comment",
          maxResults: 2,
          total: 2,
          startAt: 0,
        },
        updated: "2025-11-27T23:37:19.844+0000",
        status: {
          self: "https://scopely.atlassian.net/rest/api/3/status/3",
          description: "",
          iconUrl: "https://scopely.atlassian.net/images/icons/statuses/inprogress.png",
          name: "In Progress",
          id: "3",
          statusCategory: {
            self: "https://scopely.atlassian.net/rest/api/3/statuscategory/4",
            id: 4,
            key: "indeterminate",
            colorName: "yellow",
            name: "In Progress",
          },
        },
      },
    },
    {
      key: "ST-156814",
      id: "2151049",
      self: "https://scopely.atlassian.net/rest/api/3/issue/2151049",
      fields: {
        summary: "M85 MidOps - Choice Weekend Events & Rewards",
        issuelinks: [],
        comment: {
          comments: [
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2151049/comment/7737766",
              id: "7737766",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Hi team, we ",
                      },
                      {
                        type: "text",
                        text: "completed ",
                        marks: [
                          {
                            type: "strong",
                          },
                          {
                            type: "textColor",
                            attrs: {
                              color: "#36b37e",
                            },
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "M85 MidOps - Choice Weekend Events & Rewards on Staging-A, and found no issue.",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Validated",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ":",
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "All rewards & event on both WP and in game.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Test Rail",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.testrail.com/index.php?/plans/view/234928",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: 'NOTE: These events are intended for players in the level 20–50 range, and the appearance of the scoring metric "Spend 1 G7 Material" seems inappropriate. Please re-check and adjust if necessary.',
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Build",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ": 1.000.46309",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Time",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ": 30m",
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-27T11:10:35.082+0000",
              updated: "2025-11-27T11:10:35.082+0000",
              jsdPublic: true,
            },
          ],
          self: "https://scopely.atlassian.net/rest/api/3/issue/2151049/comment",
          maxResults: 1,
          total: 1,
          startAt: 0,
        },
        updated: "2025-11-27T11:10:38.338+0000",
        status: {
          self: "https://scopely.atlassian.net/rest/api/3/status/3",
          description: "",
          iconUrl: "https://scopely.atlassian.net/images/icons/statuses/inprogress.png",
          name: "In Progress",
          id: "3",
          statusCategory: {
            self: "https://scopely.atlassian.net/rest/api/3/statuscategory/4",
            id: 4,
            key: "indeterminate",
            colorName: "yellow",
            name: "In Progress",
          },
        },
      },
    },
    {
      key: "ST-156813",
      id: "2151045",
      self: "https://scopely.atlassian.net/rest/api/3/issue/2151045",
      fields: {
        summary: "M85 MidOps - W1 IAPs",
        issuelinks: [
          {
            id: "491644",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/491644",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2151580",
              key: "ST-156833",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2151580",
              fields: {
                summary: "M85 MidOps - W1 IAPs - Loc is missing on Staging-A",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10143",
                  description:
                    "Default status for newly created bugs.  Represents a new ticket that has not yet been triaged by QA. (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for Triage",
                  id: "10143",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10035",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Arabic_Question_mark_%28RTL%29.svg/90px-Arabic_Question_mark_%28RTL%29.svg.png",
                  name: "Unprioritized",
                  id: "10035",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "491647",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/491647",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2151602",
              key: "ST-156834",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2151602",
              fields: {
                summary: "M85 MidOps - W1 IAPs - Some IAPs are missing on Staging-A",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10143",
                  description:
                    "Default status for newly created bugs.  Represents a new ticket that has not yet been triaged by QA. (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for Triage",
                  id: "10143",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10035",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Arabic_Question_mark_%28RTL%29.svg/90px-Arabic_Question_mark_%28RTL%29.svg.png",
                  name: "Unprioritized",
                  id: "10035",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "491648",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/491648",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2151625",
              key: "ST-156835",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2151625",
              fields: {
                summary: "M85 MidOps - W1 IAPs - Some M85_MidOps_SNW IAPs have incorrect Max Level",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10143",
                  description:
                    "Default status for newly created bugs.  Represents a new ticket that has not yet been triaged by QA. (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for Triage",
                  id: "10143",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10035",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Arabic_Question_mark_%28RTL%29.svg/90px-Arabic_Question_mark_%28RTL%29.svg.png",
                  name: "Unprioritized",
                  id: "10035",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "491659",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/491659",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2151841",
              key: "ST-156836",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2151841",
              fields: {
                summary:
                  'M85 - D1 VBs - M85_MidOps_FranklinUnlock_50.20L - The number of Franklin blueprints on the Art "franklin_hull_unlock" is 45 instead of 90',
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10143",
                  description:
                    "Default status for newly created bugs.  Represents a new ticket that has not yet been triaged by QA. (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for Triage",
                  id: "10143",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10035",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Arabic_Question_mark_%28RTL%29.svg/90px-Arabic_Question_mark_%28RTL%29.svg.png",
                  name: "Unprioritized",
                  id: "10035",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "491667",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/491667",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2151870",
              key: "ST-156837",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2151870",
              fields: {
                summary: "M85 MidOps - W1 IAPs - m66_hidden_event_token_1 is unavailable on Staging-A",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10143",
                  description:
                    "Default status for newly created bugs.  Represents a new ticket that has not yet been triaged by QA. (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for Triage",
                  id: "10143",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10035",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Arabic_Question_mark_%28RTL%29.svg/90px-Arabic_Question_mark_%28RTL%29.svg.png",
                  name: "Unprioritized",
                  id: "10035",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "492498",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/492498",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2156867",
              key: "ST-156955",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2156867",
              fields: {
                summary:
                  "M85 MidOps - W1 IAPs - M85_MidOps_SNW_BOChapel_50### - Exclamation mark is missing in Popularity label for several IAPs in config sheet and Staging-A WP",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10143",
                  description:
                    "Default status for newly created bugs.  Represents a new ticket that has not yet been triaged by QA. (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for Triage",
                  id: "10143",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10035",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Arabic_Question_mark_%28RTL%29.svg/90px-Arabic_Question_mark_%28RTL%29.svg.png",
                  name: "Unprioritized",
                  id: "10035",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "492503",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/492503",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2156911",
              key: "ST-156958",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2156911",
              fields: {
                summary: "M85 MidOps - W1 IAPs - M85_MidOps_SNW_PvECrit_100### - Art is missing on the Staging-A WP but is visible in-game",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10143",
                  description:
                    "Default status for newly created bugs.  Represents a new ticket that has not yet been triaged by QA. (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for Triage",
                  id: "10143",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10035",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Arabic_Question_mark_%28RTL%29.svg/90px-Arabic_Question_mark_%28RTL%29.svg.png",
                  name: "Unprioritized",
                  id: "10035",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
        ],
        comment: {
          comments: [
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2151045/comment/7737769",
              id: "7737769",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Hi, we started ",
                      },
                      {
                        type: "text",
                        text: "M85 MidOps - W1 IAPs - Test",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " on ",
                      },
                      {
                        type: "text",
                        text: "Staging-A.",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Validated:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "All IAPs: WP and in-game",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Testrail",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.testrail.com/index.php?/plans/view/234923",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: ": 67% passed",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "5 New Issues Found",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ": ",
                      },
                      {
                        type: "text",
                        text: "ST-156833",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156833",
                            },
                          },
                          {
                            type: "underline",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ", ",
                      },
                      {
                        type: "text",
                        text: "ST-156834",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156834",
                            },
                          },
                          {
                            type: "underline",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ", ",
                      },
                      {
                        type: "text",
                        text: "ST-156835",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156835",
                            },
                          },
                          {
                            type: "underline",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ", ",
                      },
                      {
                        type: "text",
                        text: "ST-156836",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156836",
                            },
                          },
                          {
                            type: "underline",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ", ",
                      },
                      {
                        type: "text",
                        text: "ST-156837",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156837",
                            },
                          },
                          {
                            type: "underline",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Pending:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Loc and Art Testing.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Successful Purchase Testing.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Reported issues need to be fixed and validated.",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Build: ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "Latest",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Server: ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "Staging-A",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "In-progress man-hours:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " 1.5h",
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-27T11:11:00.474+0000",
              updated: "2025-11-27T11:11:00.474+0000",
              jsdPublic: true,
            },
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2151045/comment/7746696",
              id: "7746696",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=62ac8931f8bd790069da47d5",
                accountId: "62ac8931f8bd790069da47d5",
                avatarUrls: {
                  "48x48":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                  "24x24":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                  "16x16":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                  "32x32":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                },
                displayName: "Kshitij Raje",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Hey!",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "We have ",
                      },
                      {
                        type: "text",
                        text: "continued ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "the ",
                      },
                      {
                        type: "text",
                        text: '"M85 MidOps - W1 IAPs"',
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " task on the mentioned build and server.",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "During our testing, we have encountered two new issues: ",
                      },
                      {
                        type: "text",
                        text: "ST-156955",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156955",
                            },
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " and ",
                      },
                      {
                        type: "text",
                        text: "ST-156958",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156958",
                            },
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " ",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Validated:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have validated the M85 MidOps - W1 IAPs on both the webpanel and in-game.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have validated the ",
                              },
                              {
                                type: "text",
                                text: "Art ",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: "for M85 MidOps - W1 IAPs on both the webpanel and in-game.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have purchased the IAPs bundles in game accordingly.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have also updated the ",
                              },
                              {
                                type: "text",
                                text: "GS Testrail",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.testrail.com/index.php?/plans/view/234923",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " ",
                                marks: [
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: "as well:",
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "Completed: 67%",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "Passed: 67%",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                  {
                                    type: "textColor",
                                    attrs: {
                                      color: "#36b37e",
                                    },
                                  },
                                ],
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "Untested: 33%",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                  {
                                    type: "textColor",
                                    attrs: {
                                      color: "#97a0af",
                                    },
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Pending:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "The ",
                              },
                              {
                                type: "text",
                                text: "LOC",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " for all the IAPs needs to be implemented and validated.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "The ",
                              },
                              {
                                type: "text",
                                text: "Art ",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: "for some IAPs needs to be implemented and validated.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "The logged bugs need to be fixed and validated.",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "GS In-progress Man Hours: 2 hrs 15 mins",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Build: M85 - 1.000.46317",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Server: Staging-A",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Thanks!",
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=62ac8931f8bd790069da47d5",
                accountId: "62ac8931f8bd790069da47d5",
                avatarUrls: {
                  "48x48":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                  "24x24":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                  "16x16":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                  "32x32":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                },
                displayName: "Kshitij Raje",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-28T20:45:52.821+0000",
              updated: "2025-11-28T20:45:52.821+0000",
              jsdPublic: true,
            },
          ],
          self: "https://scopely.atlassian.net/rest/api/3/issue/2151045/comment",
          maxResults: 2,
          total: 2,
          startAt: 0,
        },
        updated: "2025-11-28T20:45:52.959+0000",
        status: {
          self: "https://scopely.atlassian.net/rest/api/3/status/3",
          description: "",
          iconUrl: "https://scopely.atlassian.net/images/icons/statuses/inprogress.png",
          name: "In Progress",
          id: "3",
          statusCategory: {
            self: "https://scopely.atlassian.net/rest/api/3/statuscategory/4",
            id: 4,
            key: "indeterminate",
            colorName: "yellow",
            name: "In Progress",
          },
        },
      },
    },
    {
      key: "ST-156795",
      id: "2150673",
      self: "https://scopely.atlassian.net/rest/api/3/issue/2150673",
      fields: {
        summary: "M85 - Tokens, Targeting Properties, Avatars, Frames",
        issuelinks: [
          {
            id: "491568",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/491568",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2150698",
              key: "ST-156806",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2150698",
              fields: {
                summary: "Avatars - Christmas Hologram Ball - Animation/VFX fails to appear for the Christmas Hologram Ball avatar in-game",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/6",
                  description: "",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/closed.png",
                  name: "Closed",
                  id: "6",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/3",
                    id: 3,
                    key: "done",
                    colorName: "green",
                    name: "Done",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10068",
                  iconUrl: "https://scopely.atlassian.net/images/icons/priorities/major.svg",
                  name: "P2 / Normal",
                  id: "10068",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/10010",
                  id: "10010",
                  description: "A problem which impairs or prevents the functions of the product. (Migrated on 27 Mar 2025 15:27 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10303?size=medium",
                  name: "Bug",
                  subtask: false,
                  avatarId: 10303,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "491611",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/491611",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2151041",
              key: "ST-156811",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2151041",
              fields: {
                summary: "Cosmetics - Tokens - Elite Solo Outpost Strike Directive token rarity incorrectly displayed as Common instead of Rare",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10077",
                  description: "",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Blocked",
                  id: "10077",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/4",
                    id: 4,
                    key: "indeterminate",
                    colorName: "yellow",
                    name: "In Progress",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10067",
                  iconUrl: "https://scopely.atlassian.net/images/icons/priorities/critical.svg",
                  name: "P1 / Important",
                  id: "10067",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/10010",
                  id: "10010",
                  description: "A problem which impairs or prevents the functions of the product. (Migrated on 27 Mar 2025 15:27 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10303?size=medium",
                  name: "Bug",
                  subtask: false,
                  avatarId: 10303,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "492274",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/492274",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2154588",
              key: "ST-156903",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2154588",
              fields: {
                summary: "Tokens - Hidden Tokens - Several M85 Hidden Tokens are absent on the Dev B/Staging-A webpanel",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/6",
                  description: "",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/closed.png",
                  name: "Closed",
                  id: "6",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/3",
                    id: 3,
                    key: "done",
                    colorName: "green",
                    name: "Done",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10035",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Arabic_Question_mark_%28RTL%29.svg/90px-Arabic_Question_mark_%28RTL%29.svg.png",
                  name: "Unprioritized",
                  id: "10035",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/10010",
                  id: "10010",
                  description: "A problem which impairs or prevents the functions of the product. (Migrated on 27 Mar 2025 15:27 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10303?size=medium",
                  name: "Bug",
                  subtask: false,
                  avatarId: 10303,
                  hierarchyLevel: 0,
                },
              },
            },
          },
        ],
        comment: {
          comments: [
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2150673/comment/7734168",
              id: "7734168",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=712020%3A5bbe172a-620f-4fdb-becb-44ae73d9854a",
                accountId: "712020:5bbe172a-620f-4fdb-becb-44ae73d9854a",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:5bbe172a-620f-4fdb-becb-44ae73d9854a/580b4b4b-c0c6-41b7-a92c-bcc2ff93c606/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:5bbe172a-620f-4fdb-becb-44ae73d9854a/580b4b4b-c0c6-41b7-a92c-bcc2ff93c606/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:5bbe172a-620f-4fdb-becb-44ae73d9854a/580b4b4b-c0c6-41b7-a92c-bcc2ff93c606/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:5bbe172a-620f-4fdb-becb-44ae73d9854a/580b4b4b-c0c6-41b7-a92c-bcc2ff93c606/32",
                },
                displayName: "Nishad Todewale",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Hey!",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "We have ",
                      },
                      {
                        type: "text",
                        text: "started",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " this ",
                      },
                      {
                        type: "text",
                        text: '"M85 - Tokens, Targeting Properties, Avatars, Frames"',
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " task on the mentioned build and server.",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "During our testing we encountered 2 new issues and logged them as: ",
                      },
                      {
                        type: "text",
                        text: "ST-156806",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156806",
                            },
                          },
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ", ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "ST-156811",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156811",
                            },
                          },
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Validated:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have verified the ",
                              },
                              {
                                type: "text",
                                text: "M85 tokens Art, Text, Bundle purchase using tokens, Targeting Properties",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " for the ",
                              },
                              {
                                type: "text",
                                text: "Tokens, Avatar ",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: "and",
                              },
                              {
                                type: "text",
                                text: " Frames",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: ".",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Pending:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Targeting properties of Hidden Tokens",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "New Token Resources/Metrics",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " of M85 Tokens, Hidden Tokens, Avatars and Frames",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Logged bugs needs to be fixed and verified",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "GS in- progress Man Hours: 4 Hours",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Tracker Sheet: ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "Here",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://docs.google.com/spreadsheets/d/1azFhUzexDLx0ujehRNqvfM2-VYdl-GG-rOPUKtrDCKA/edit?gid=0#gid=0",
                            },
                          },
                          {
                            type: "strong",
                          },
                          {
                            type: "underline",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Build:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " M85 - 1.000.46320",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Server:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " Staging A",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Thanks!",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=712020%3A5bbe172a-620f-4fdb-becb-44ae73d9854a",
                accountId: "712020:5bbe172a-620f-4fdb-becb-44ae73d9854a",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:5bbe172a-620f-4fdb-becb-44ae73d9854a/580b4b4b-c0c6-41b7-a92c-bcc2ff93c606/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:5bbe172a-620f-4fdb-becb-44ae73d9854a/580b4b4b-c0c6-41b7-a92c-bcc2ff93c606/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:5bbe172a-620f-4fdb-becb-44ae73d9854a/580b4b4b-c0c6-41b7-a92c-bcc2ff93c606/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:5bbe172a-620f-4fdb-becb-44ae73d9854a/580b4b4b-c0c6-41b7-a92c-bcc2ff93c606/32",
                },
                displayName: "Nishad Todewale",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-27T00:24:19.222+0000",
              updated: "2025-11-27T22:10:24.776+0000",
              jsdPublic: true,
            },
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2150673/comment/7739611",
              id: "7739611",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=712020%3A5bbe172a-620f-4fdb-becb-44ae73d9854a",
                accountId: "712020:5bbe172a-620f-4fdb-becb-44ae73d9854a",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:5bbe172a-620f-4fdb-becb-44ae73d9854a/580b4b4b-c0c6-41b7-a92c-bcc2ff93c606/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:5bbe172a-620f-4fdb-becb-44ae73d9854a/580b4b4b-c0c6-41b7-a92c-bcc2ff93c606/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:5bbe172a-620f-4fdb-becb-44ae73d9854a/580b4b4b-c0c6-41b7-a92c-bcc2ff93c606/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:5bbe172a-620f-4fdb-becb-44ae73d9854a/580b4b4b-c0c6-41b7-a92c-bcc2ff93c606/32",
                },
                displayName: "Nishad Todewale",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Hey!",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "We have ",
                      },
                      {
                        type: "text",
                        text: "continued",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " this ",
                      },
                      {
                        type: "text",
                        text: '"M85 - Tokens, Targeting Properties, Avatars, Frames"',
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " task on the mentioned build and server.",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "During our testing we encountered 1 new issue and logged it as: ",
                      },
                      {
                        type: "text",
                        text: " ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "ST-156903",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156903",
                            },
                          },
                          {
                            type: "strong",
                          },
                          {
                            type: "underline",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Validated:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have verified the targeting properties of M85 Hidden Tokens.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have verified the ",
                              },
                              {
                                type: "text",
                                text: "New Token Resources/Metrics",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " of M85 Tokens, Hidden Tokens, Avatars and Frames.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have regressed the issue ",
                              },
                              {
                                type: "text",
                                text: "ST-156806",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-156806",
                                    },
                                  },
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " ",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Our progression for “",
                      },
                      {
                        type: "text",
                        text: "M85 - Tokens, Targeting Properties, Avatars, Frames",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "“ can be found ",
                      },
                      {
                        type: "text",
                        text: "here",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.testrail.com/index.php?/plans/view/234861",
                            },
                          },
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ":",
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Completed: 85%",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Passed: 77%",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                  {
                                    type: "textColor",
                                    attrs: {
                                      color: "#36b37e",
                                    },
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Failed: 8%",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                  {
                                    type: "textColor",
                                    attrs: {
                                      color: "#ff5630",
                                    },
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Untested: 15%",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Pending:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Logged bugs needs to be fixed and verified",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "GS in- progress Man Hours: 4 Hours 45 minutes (Today) + 4 Hours (Previous) ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Tracker Sheet: ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "Here",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://docs.google.com/spreadsheets/d/1azFhUzexDLx0ujehRNqvfM2-VYdl-GG-rOPUKtrDCKA/edit?gid=0#gid=0",
                            },
                          },
                          {
                            type: "strong",
                          },
                          {
                            type: "underline",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Build:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " M85 - 1.000.46320",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Server:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " Staging A",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Thanks!",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=712020%3A5bbe172a-620f-4fdb-becb-44ae73d9854a",
                accountId: "712020:5bbe172a-620f-4fdb-becb-44ae73d9854a",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:5bbe172a-620f-4fdb-becb-44ae73d9854a/580b4b4b-c0c6-41b7-a92c-bcc2ff93c606/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:5bbe172a-620f-4fdb-becb-44ae73d9854a/580b4b4b-c0c6-41b7-a92c-bcc2ff93c606/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:5bbe172a-620f-4fdb-becb-44ae73d9854a/580b4b4b-c0c6-41b7-a92c-bcc2ff93c606/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:5bbe172a-620f-4fdb-becb-44ae73d9854a/580b4b4b-c0c6-41b7-a92c-bcc2ff93c606/32",
                },
                displayName: "Nishad Todewale",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-27T22:22:53.672+0000",
              updated: "2025-11-27T23:38:43.144+0000",
              jsdPublic: true,
            },
          ],
          self: "https://scopely.atlassian.net/rest/api/3/issue/2150673/comment",
          maxResults: 2,
          total: 2,
          startAt: 0,
        },
        updated: "2025-11-27T23:38:43.167+0000",
        status: {
          self: "https://scopely.atlassian.net/rest/api/3/status/3",
          description: "",
          iconUrl: "https://scopely.atlassian.net/images/icons/statuses/inprogress.png",
          name: "In Progress",
          id: "3",
          statusCategory: {
            self: "https://scopely.atlassian.net/rest/api/3/statuscategory/4",
            id: 4,
            key: "indeterminate",
            colorName: "yellow",
            name: "In Progress",
          },
        },
      },
    },
    {
      key: "ST-156723",
      id: "2147629",
      self: "https://scopely.atlassian.net/rest/api/3/issue/2147629",
      fields: {
        summary: "M84 - December MRP2s",
        issuelinks: [
          {
            id: "491321",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/491321",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2147668",
              key: "ST-156727",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2147668",
              fields: {
                summary: "M84 - IAP - The December MRP2 IAP/VBs are missing LOC on the Staging-A Web Panel.",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10148",
                  description: "Work is ready for QA to pick up (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for QA",
                  id: "10148",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/4",
                    id: 4,
                    key: "indeterminate",
                    colorName: "yellow",
                    name: "In Progress",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10068",
                  iconUrl: "https://scopely.atlassian.net/images/icons/priorities/major.svg",
                  name: "P2 / Normal",
                  id: "10068",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "491582",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/491582",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2150719",
              key: "ST-156808",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2150719",
              fields: {
                summary:
                  "M84 - IAPs - 2025_December_MRP2_### - The IAPs have incorrect art implemented and it fails to align with the rewards configured on the Staging-A WP",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10143",
                  description:
                    "Default status for newly created bugs.  Represents a new ticket that has not yet been triaged by QA. (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for Triage",
                  id: "10143",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10035",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Arabic_Question_mark_%28RTL%29.svg/90px-Arabic_Question_mark_%28RTL%29.svg.png",
                  name: "Unprioritized",
                  id: "10035",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
        ],
        comment: {
          comments: [
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2147629/comment/7729656",
              id: "7729656",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Hi team, we started M84 - December MRP2s ",
                      },
                      {
                        type: "text",
                        text: "on Staging-A.",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Validated:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "WP & in game.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "New bug: ",
                              },
                              {
                                type: "text",
                                text: "ST-156727",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-156727",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Test Rail",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.testrail.com/index.php?/plans/view/234768",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: ": 39% passed",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Pending",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ":",
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "LOC testing.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Purchasing not support in our side.",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Build: 1.000.46097",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Server: ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "Staging-A",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "In-progress man-hours:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " 45m",
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-26T10:26:24.218+0000",
              updated: "2025-11-26T10:26:24.218+0000",
              jsdPublic: true,
            },
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2147629/comment/7733709",
              id: "7733709",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=712020%3A9dd73635-f325-4222-b42b-6713ed983726",
                accountId: "712020:9dd73635-f325-4222-b42b-6713ed983726",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:9dd73635-f325-4222-b42b-6713ed983726/fe69d45c-08eb-46ef-9fcf-b771206d9314/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:9dd73635-f325-4222-b42b-6713ed983726/fe69d45c-08eb-46ef-9fcf-b771206d9314/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:9dd73635-f325-4222-b42b-6713ed983726/fe69d45c-08eb-46ef-9fcf-b771206d9314/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:9dd73635-f325-4222-b42b-6713ed983726/fe69d45c-08eb-46ef-9fcf-b771206d9314/32",
                },
                displayName: "Ahmed Deedat",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Hey!",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "We have ",
                      },
                      {
                        type: "text",
                        text: "continued",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " the ",
                      },
                      {
                        type: "text",
                        text: '"M84 - December MRP2s"',
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " task on the mentioned build and server.",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "During our testing, we have encountered three issues: ",
                      },
                      {
                        type: "text",
                        text: "ST-156808",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156808",
                            },
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " . ",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Validated:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have validated all the IAPs on both the webpanel and In-game.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have validated all the MRP VBs on both the webpanel and In-game.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We validated the art for the VBs on the in-game and webpanel.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We purchased the IAPs In-game.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have also updated the ",
                              },
                              {
                                type: "text",
                                text: "GS Testrail ",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.testrail.com/index.php?/plans/view/234740",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: "as well:",
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "Completed: 100%",
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "Passed: 67%",
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "PWN:33%",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Pending:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "The logged bug for art needs to be fixed and validated.(",
                              },
                              {
                                type: "text",
                                text: "ST-156808",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-156808",
                                    },
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: ") ",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "The LOC bug needs to be fixed and revalidated.(",
                              },
                              {
                                type: "text",
                                text: "ST-156727",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-156727",
                                    },
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: ")",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "GS In-progress Man Hours: 55 minutes",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Build: M84 - 1.000.45486",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Server: Staging-A",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Thanks!",
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=712020%3A9dd73635-f325-4222-b42b-6713ed983726",
                accountId: "712020:9dd73635-f325-4222-b42b-6713ed983726",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:9dd73635-f325-4222-b42b-6713ed983726/fe69d45c-08eb-46ef-9fcf-b771206d9314/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:9dd73635-f325-4222-b42b-6713ed983726/fe69d45c-08eb-46ef-9fcf-b771206d9314/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:9dd73635-f325-4222-b42b-6713ed983726/fe69d45c-08eb-46ef-9fcf-b771206d9314/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:9dd73635-f325-4222-b42b-6713ed983726/fe69d45c-08eb-46ef-9fcf-b771206d9314/32",
                },
                displayName: "Ahmed Deedat",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-26T19:59:08.529+0000",
              updated: "2025-11-26T19:59:08.529+0000",
              jsdPublic: true,
            },
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2147629/comment/7739386",
              id: "7739386",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=712020%3Aa83f7e5f-a916-4467-b7bb-fefea348c651",
                accountId: "712020:a83f7e5f-a916-4467-b7bb-fefea348c651",
                avatarUrls: {
                  "48x48":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "24x24":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "16x16":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "32x32":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                },
                displayName: "Abhishek Mane",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Hey!",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "We have ",
                      },
                      {
                        type: "text",
                        text: "continued",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " the ",
                      },
                      {
                        type: "text",
                        text: '"M84 - December MRP2s"',
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " task on the mentioned build and server.",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "During our testing, we have encountered no issues.",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Validated:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have validated the loc for all the MRP VBs & IAPs on both the webpanel and In-game.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have also updated the ",
                              },
                              {
                                type: "text",
                                text: "GS Testrail",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.testrail.com/index.php?/plans/view/234768",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " ",
                                marks: [
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: "as well:",
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "Completed: 100%",
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "Passed: 78%",
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "Failed:22%",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Pending:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "The logged bug for art needs to be fixed and validated.(",
                              },
                              {
                                type: "text",
                                text: "ST-156808",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-156808",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: ")",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "GS In-progress Man Hours: 1 hr 15 minutes",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Build: M84 - 1.000.45486",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Server: Staging-A",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Thanks!",
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=712020%3Aa83f7e5f-a916-4467-b7bb-fefea348c651",
                accountId: "712020:a83f7e5f-a916-4467-b7bb-fefea348c651",
                avatarUrls: {
                  "48x48":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "24x24":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "16x16":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "32x32":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                },
                displayName: "Abhishek Mane",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-27T18:36:38.454+0000",
              updated: "2025-11-27T18:36:38.454+0000",
              jsdPublic: true,
            },
          ],
          self: "https://scopely.atlassian.net/rest/api/3/issue/2147629/comment",
          maxResults: 3,
          total: 3,
          startAt: 0,
        },
        updated: "2025-11-27T18:36:38.598+0000",
        status: {
          self: "https://scopely.atlassian.net/rest/api/3/status/3",
          description: "",
          iconUrl: "https://scopely.atlassian.net/images/icons/statuses/inprogress.png",
          name: "In Progress",
          id: "3",
          statusCategory: {
            self: "https://scopely.atlassian.net/rest/api/3/statuscategory/4",
            id: 4,
            key: "indeterminate",
            colorName: "yellow",
            name: "In Progress",
          },
        },
      },
    },
    {
      key: "ST-156244",
      id: "2136552",
      self: "https://scopely.atlassian.net/rest/api/3/issue/2136552",
      fields: {
        summary: "M85 - MidOps VB's",
        issuelinks: [
          {
            id: "489862",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/489862",
            type: {
              id: "10001",
              name: "Cloners",
              inward: "is cloned by",
              outward: "clones",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10001",
            },
            outwardIssue: {
              id: "2136504",
              key: "ST-156242",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2136504",
              fields: {
                summary: "M84 BF Away Teams IAPs",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/6",
                  description: "",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/closed.png",
                  name: "Closed",
                  id: "6",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/3",
                    id: 3,
                    key: "done",
                    colorName: "green",
                    name: "Done",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10068",
                  iconUrl: "https://scopely.atlassian.net/images/icons/priorities/major.svg",
                  name: "P2 / Normal",
                  id: "10068",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/10006",
                  id: "10006",
                  description: "Task (Migrated on 27 Mar 2025 15:27 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10318?size=medium",
                  name: "Task",
                  subtask: false,
                  avatarId: 10318,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "490121",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/490121",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2138096",
              key: "ST-156416",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2138096",
              fields: {
                summary: "M85 - MidOps VB's – The bucket for holodeck VBs is missing in both the config and Staging-A WP",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10148",
                  description: "Work is ready for QA to pick up (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for QA",
                  id: "10148",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/4",
                    id: 4,
                    key: "indeterminate",
                    colorName: "yellow",
                    name: "In Progress",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10066",
                  iconUrl: "https://upload.wikimedia.org/wikipedia/commons/9/99/FireIcon.svg",
                  name: "P0 / Critical",
                  id: "10066",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "490123",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/490123",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2138099",
              key: "ST-156417",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2138099",
              fields: {
                summary: "M85 - MidOps VB's – The segmentations for the event store VBs are incorrect on Staging-A WP",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/1",
                  description: "",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/open.png",
                  name: "Open",
                  id: "1",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10066",
                  iconUrl: "https://upload.wikimedia.org/wikipedia/commons/9/99/FireIcon.svg",
                  name: "P0 / Critical",
                  id: "10066",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "490125",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/490125",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2138100",
              key: "ST-156418",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2138100",
              fields: {
                summary: "M85 - MidOps VB's – The art for most of the VBs is missing on Staging-A WP",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/1",
                  description: "",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/open.png",
                  name: "Open",
                  id: "1",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10067",
                  iconUrl: "https://scopely.atlassian.net/images/icons/priorities/critical.svg",
                  name: "P1 / Important",
                  id: "10067",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "490129",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/490129",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2138101",
              key: "ST-156419",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2138101",
              fields: {
                summary: "M85 - MidOps VB's – The loc for all of the VBs is missing in both the config and Staging-A WP",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10148",
                  description: "Work is ready for QA to pick up (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for QA",
                  id: "10148",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/4",
                    id: 4,
                    key: "indeterminate",
                    colorName: "yellow",
                    name: "In Progress",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10067",
                  iconUrl: "https://scopely.atlassian.net/images/icons/priorities/critical.svg",
                  name: "P1 / Important",
                  id: "10067",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
        ],
        comment: {
          comments: [
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2136552/comment/7716497",
              id: "7716497",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Hi team, we started M85 - MidOps VB's on Staging-A",
                      },
                      {
                        type: "text",
                        text: ".",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Validated:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "All VBs on WP.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "In-game testing is currently blocked by ",
                              },
                              {
                                type: "text",
                                text: "ST-156416",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-156416",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " and ",
                              },
                              {
                                type: "text",
                                text: "ST-156417",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-156417",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: ".",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Testrail",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.testrail.com/index.php?/plans/view/234029",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: ": 25% passed",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "4 New Issues Found:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " ",
                      },
                      {
                        type: "text",
                        text: "ST-156416",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156416",
                            },
                          },
                          {
                            type: "underline",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " ",
                      },
                      {
                        type: "text",
                        text: "ST-156417",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156417",
                            },
                          },
                          {
                            type: "underline",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " ",
                      },
                      {
                        type: "text",
                        text: "ST-156418",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156418",
                            },
                          },
                          {
                            type: "underline",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "  ",
                      },
                      {
                        type: "text",
                        text: "ST-156419",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156419",
                            },
                          },
                          {
                            type: "underline",
                          },
                        ],
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Pending:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Report issues need to be fixed before in-game testing.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Loc and Art are still missing for most of the VBs.",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Build: ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "Latest",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Server: Staging-A",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "In-progress man-hours:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " 45m",
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-24T10:57:34.432+0000",
              updated: "2025-11-24T10:57:34.432+0000",
              jsdPublic: true,
            },
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2136552/comment/7746614",
              id: "7746614",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=712020%3Aa83f7e5f-a916-4467-b7bb-fefea348c651",
                accountId: "712020:a83f7e5f-a916-4467-b7bb-fefea348c651",
                avatarUrls: {
                  "48x48":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "24x24":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "16x16":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "32x32":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                },
                displayName: "Abhishek Mane",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Hello!",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "We have ",
                      },
                      {
                        type: "text",
                        text: "continued ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "the ",
                      },
                      {
                        type: "text",
                        text: '"M85 - MidOps VB\'s"',
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " task on the mentioned server.",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "During our validation, we encountered no new issues.",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Validated:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have validated the VBs on both the webpanel and in-game",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We were unable to validate the following VBs in-game due to the ",
                              },
                              {
                                type: "text",
                                text: "ST-156417",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-156417",
                                    },
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " issue.",
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "M85_MidOps_FranklinSchematic_PARTs_20-21",
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "M85_MidOps_FranklinSchematic_PARTs_22-25",
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "M85_MidOps_FranklinSchematic_PARTs_26-29",
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "M85_MidOps_SquallSchematic_PARTs=30-39",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have verified the localization and art on both the web panel and in-game, except for the above VBs in-game.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We retested the below listed issues and observed that they are now ",
                              },
                              {
                                type: "text",
                                text: "verified as fixed",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: ".",
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "ST-156416",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-156416",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " ",
                              },
                              {
                                type: "text",
                                text: "&",
                                marks: [
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " ",
                              },
                              {
                                type: "text",
                                text: "ST-156419",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-156419",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have also updated the GS WP ",
                              },
                              {
                                type: "text",
                                text: "testrail",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.testrail.com/index.php?/runs/view/234935&group_by=cases:section_id&group_order=asc&display=tree",
                                    },
                                  },
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: ":",
                              },
                            ],
                          },
                          {
                            type: "bulletList",
                            content: [
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    content: [
                                      {
                                        type: "text",
                                        text: "Completed: 100%",
                                        marks: [
                                          {
                                            type: "strong",
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    content: [
                                      {
                                        type: "text",
                                        text: "Passed: 88%",
                                        marks: [
                                          {
                                            type: "strong",
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    content: [
                                      {
                                        type: "text",
                                        text: "Failed 12%",
                                        marks: [
                                          {
                                            type: "strong",
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Pending:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "In-game validation of for following Vb’s:",
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "M85_MidOps_FranklinSchematic_PARTs_20-21",
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "M85_MidOps_FranklinSchematic_PARTs_22-25",
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "M85_MidOps_FranklinSchematic_PARTs_26-29",
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "M85_MidOps_SquallSchematic_PARTs=30-39",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "The logged bugs needs to be fixed and validated",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "GS In-Progress Man Hours: 1 hr 15 mins",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Server",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ": Server: Staging A",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Build: M85 - 1.000.45320",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Thanks!",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=712020%3Aa83f7e5f-a916-4467-b7bb-fefea348c651",
                accountId: "712020:a83f7e5f-a916-4467-b7bb-fefea348c651",
                avatarUrls: {
                  "48x48":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "24x24":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "16x16":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "32x32":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                },
                displayName: "Abhishek Mane",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-28T19:33:42.929+0000",
              updated: "2025-11-28T19:34:47.721+0000",
              jsdPublic: true,
            },
          ],
          self: "https://scopely.atlassian.net/rest/api/3/issue/2136552/comment",
          maxResults: 2,
          total: 2,
          startAt: 0,
        },
        updated: "2025-11-28T19:34:47.745+0000",
        status: {
          self: "https://scopely.atlassian.net/rest/api/3/status/3",
          description: "",
          iconUrl: "https://scopely.atlassian.net/images/icons/statuses/inprogress.png",
          name: "In Progress",
          id: "3",
          statusCategory: {
            self: "https://scopely.atlassian.net/rest/api/3/statuscategory/4",
            id: 4,
            key: "indeterminate",
            colorName: "yellow",
            name: "In Progress",
          },
        },
      },
    },
    {
      key: "ST-156150",
      id: "2134170",
      self: "https://scopely.atlassian.net/rest/api/3/issue/2134170",
      fields: {
        summary: "M85 MidOps - BP Events - Test",
        issuelinks: [
          {
            id: "490130",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/490130",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2138202",
              key: "ST-156420",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2138202",
              fields: {
                summary: "M85 - MidOps BP Events - Loc is missing on Staging-A",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/1",
                  description: "",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/open.png",
                  name: "Open",
                  id: "1",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10068",
                  iconUrl: "https://scopely.atlassian.net/images/icons/priorities/major.svg",
                  name: "P2 / Normal",
                  id: "10068",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "490131",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/490131",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2138214",
              key: "ST-156421",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2138214",
              fields: {
                summary: 'M85 - MidOps BP Events - "Icon Asset:Fixed" is missing on Staging-A',
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/1",
                  description: "",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/open.png",
                  name: "Open",
                  id: "1",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10067",
                  iconUrl: "https://scopely.atlassian.net/images/icons/priorities/critical.svg",
                  name: "P1 / Important",
                  id: "10067",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "490132",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/490132",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2138230",
              key: "ST-156422",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2138230",
              fields: {
                summary: "M85 - MidOps BP Events - Art is missing on Staging-A",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/1",
                  description: "",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/open.png",
                  name: "Open",
                  id: "1",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10068",
                  iconUrl: "https://scopely.atlassian.net/images/icons/priorities/major.svg",
                  name: "P2 / Normal",
                  id: "10068",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "492528",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/492528",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2156980",
              key: "ST-156966",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2156980",
              fields: {
                summary:
                  "M85 - MidOps BP Events - M85_MidOps_Bp_swarm_SMS - Segmentations from ops level 29 to 32 are present in Staging-A WP but missing in the config sheet",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10143",
                  description:
                    "Default status for newly created bugs.  Represents a new ticket that has not yet been triaged by QA. (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for Triage",
                  id: "10143",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10035",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Arabic_Question_mark_%28RTL%29.svg/90px-Arabic_Question_mark_%28RTL%29.svg.png",
                  name: "Unprioritized",
                  id: "10035",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
        ],
        comment: {
          comments: [
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2134170/comment/7706386",
              id: "7706386",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=60ac1fe45dc18500702d686b",
                accountId: "60ac1fe45dc18500702d686b",
                avatarUrls: {
                  "48x48":
                    "https://secure.gravatar.com/avatar/41e28325f0187d3a4b34bb0c400e372b?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FJK-5.png",
                  "24x24":
                    "https://secure.gravatar.com/avatar/41e28325f0187d3a4b34bb0c400e372b?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FJK-5.png",
                  "16x16":
                    "https://secure.gravatar.com/avatar/41e28325f0187d3a4b34bb0c400e372b?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FJK-5.png",
                  "32x32":
                    "https://secure.gravatar.com/avatar/41e28325f0187d3a4b34bb0c400e372b?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FJK-5.png",
                },
                displayName: "Jenny Kim",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Please note that the system ID in the metrics were updated to match the long description on Nov 21 9am PST.",
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=60ac1fe45dc18500702d686b",
                accountId: "60ac1fe45dc18500702d686b",
                avatarUrls: {
                  "48x48":
                    "https://secure.gravatar.com/avatar/41e28325f0187d3a4b34bb0c400e372b?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FJK-5.png",
                  "24x24":
                    "https://secure.gravatar.com/avatar/41e28325f0187d3a4b34bb0c400e372b?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FJK-5.png",
                  "16x16":
                    "https://secure.gravatar.com/avatar/41e28325f0187d3a4b34bb0c400e372b?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FJK-5.png",
                  "32x32":
                    "https://secure.gravatar.com/avatar/41e28325f0187d3a4b34bb0c400e372b?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FJK-5.png",
                },
                displayName: "Jenny Kim",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-21T16:57:20.650+0000",
              updated: "2025-11-21T16:57:20.650+0000",
              jsdPublic: true,
            },
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2134170/comment/7716633",
              id: "7716633",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Hi team, we started ",
                      },
                      {
                        type: "text",
                        text: "M85 MidOps - BP Events - Test",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " on ",
                      },
                      {
                        type: "text",
                        text: "Staging-A.",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Validated:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "All Events and Rewards: WP and In-game",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Testrail",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.testrail.com/index.php?/plans/view/233767",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: ": 39% passed",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "3 New Issues Found: ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "ST-156420",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156420",
                            },
                          },
                          {
                            type: "underline",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ", ",
                      },
                      {
                        type: "text",
                        text: "ST-156421",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156421",
                            },
                          },
                          {
                            type: "underline",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ", ",
                      },
                      {
                        type: "text",
                        text: "ST-156422",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156422",
                            },
                          },
                          {
                            type: "underline",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Pending:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Loc and Art Testing.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Reported issues need to be fixed and validated.",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Build: ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "Latest",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Server: ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "Staging-A",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "In-progress man-hours:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " 1.5h",
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-24T11:00:56.265+0000",
              updated: "2025-11-24T11:00:56.265+0000",
              jsdPublic: true,
            },
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2134170/comment/7729670",
              id: "7729670",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Hi team, we continued ",
                      },
                      {
                        type: "text",
                        text: "M85 MidOps - BP Events - Test ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "on Staging-A.",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Validated",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ":",
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "ST-156421",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-156421",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " > Still happen.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "ST-156422",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-156422",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " > Still happen.",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Build",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ": 1.000.46320",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Time",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ": 15m",
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-26T10:28:48.003+0000",
              updated: "2025-11-26T10:28:48.003+0000",
              jsdPublic: true,
            },
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2134170/comment/7746909",
              id: "7746909",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=62ac8931f8bd790069da47d5",
                accountId: "62ac8931f8bd790069da47d5",
                avatarUrls: {
                  "48x48":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                  "24x24":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                  "16x16":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                  "32x32":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                },
                displayName: "Kshitij Raje",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Hey!",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "We have ",
                      },
                      {
                        type: "text",
                        text: "continued ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "the ",
                      },
                      {
                        type: "text",
                        text: '"M85 MidOps - BP Events - Test"',
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " task on the mentioned build and server.",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "During our testing, we have encountered one new issue: ",
                      },
                      {
                        type: "text",
                        text: "ST-156966",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156966",
                            },
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Validated:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have validated the M85 MidOps - BP Events - Test on the webpanel.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have validated the ",
                              },
                              {
                                type: "text",
                                text: "Rewards ",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: "of M85 MidOps - BP Events - Test on the webpanel.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have also updated the ",
                              },
                              {
                                type: "text",
                                text: "GS Testrail",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.testrail.com/index.php?/plans/view/233767",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " ",
                                marks: [
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: "as well:",
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "Completed: 15%",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "Passed: 15%",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                  {
                                    type: "textColor",
                                    attrs: {
                                      color: "#36b37e",
                                    },
                                  },
                                ],
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "Untested: 75%",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                  {
                                    type: "textColor",
                                    attrs: {
                                      color: "#97a0af",
                                    },
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Pending:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "The ",
                              },
                              {
                                type: "text",
                                text: "LOC and Art",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " for all the events needs to be implemented and validated.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "The events and Rewards need to be validated in-game",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "The logged bugs need to be fixed and validated.",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "GS In-progress Man Hours: 3 hrs",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Build: M85 - 1.000.46320",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Server: Staging-A",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Thanks!",
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=62ac8931f8bd790069da47d5",
                accountId: "62ac8931f8bd790069da47d5",
                avatarUrls: {
                  "48x48":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                  "24x24":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                  "16x16":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                  "32x32":
                    "https://secure.gravatar.com/avatar/0f3a0f7107ca53abd8fe2fefbc8c4d67?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKR-5.png",
                },
                displayName: "Kshitij Raje",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-29T00:28:13.795+0000",
              updated: "2025-11-29T00:28:13.795+0000",
              jsdPublic: true,
            },
          ],
          self: "https://scopely.atlassian.net/rest/api/3/issue/2134170/comment",
          maxResults: 4,
          total: 4,
          startAt: 0,
        },
        updated: "2025-11-29T00:28:13.969+0000",
        status: {
          self: "https://scopely.atlassian.net/rest/api/3/status/3",
          description: "",
          iconUrl: "https://scopely.atlassian.net/images/icons/statuses/inprogress.png",
          name: "In Progress",
          id: "3",
          statusCategory: {
            self: "https://scopely.atlassian.net/rest/api/3/statuscategory/4",
            id: 4,
            key: "indeterminate",
            colorName: "yellow",
            name: "In Progress",
          },
        },
      },
    },
    {
      key: "ST-156148",
      id: "2134167",
      self: "https://scopely.atlassian.net/rest/api/3/issue/2134167",
      fields: {
        summary: "M85 MidOps - BP Overflow Event - Test",
        issuelinks: [
          {
            id: "489600",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/489600",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2134232",
              key: "ST-156152",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2134232",
              fields: {
                summary:
                  "M85 - Event - The M85_MidOps_20kBpPoints_SMS_10-99_ VBs appear on the Config sheet but are not used in any event milestone.",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10148",
                  description: "Work is ready for QA to pick up (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for QA",
                  id: "10148",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/4",
                    id: 4,
                    key: "indeterminate",
                    colorName: "yellow",
                    name: "In Progress",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10068",
                  iconUrl: "https://scopely.atlassian.net/images/icons/priorities/major.svg",
                  name: "P2 / Normal",
                  id: "10068",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "489601",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/489601",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2134234",
              key: "ST-156153",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2134234",
              fields: {
                summary: "M85 - Event - The M85_MidOps_BpPointOverflow_SMS event is missing LOC on the Staging-A Web Panel.",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10148",
                  description: "Work is ready for QA to pick up (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for QA",
                  id: "10148",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/4",
                    id: 4,
                    key: "indeterminate",
                    colorName: "yellow",
                    name: "In Progress",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10066",
                  iconUrl: "https://upload.wikimedia.org/wikipedia/commons/9/99/FireIcon.svg",
                  name: "P0 / Critical",
                  id: "10066",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "489603",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/489603",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2134235",
              key: "ST-156154",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2134235",
              fields: {
                summary: "M85 - Event - The M85_MidOps_BpPointOverflow_SMS event is missing Asset on the Staging-A Web Panel.",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/1",
                  description: "",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/open.png",
                  name: "Open",
                  id: "1",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10067",
                  iconUrl: "https://scopely.atlassian.net/images/icons/priorities/critical.svg",
                  name: "P1 / Important",
                  id: "10067",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "492505",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/492505",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2156910",
              key: "ST-156957",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2156910",
              fields: {
                summary: "M85 - Events - M85_MidOps_BpPointOverflow_SMS – The loc is absent for events long description on the Staging A WP",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10143",
                  description:
                    "Default status for newly created bugs.  Represents a new ticket that has not yet been triaged by QA. (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for Triage",
                  id: "10143",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10035",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Arabic_Question_mark_%28RTL%29.svg/90px-Arabic_Question_mark_%28RTL%29.svg.png",
                  name: "Unprioritized",
                  id: "10035",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
        ],
        comment: {
          comments: [
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2134167/comment/7723975",
              id: "7723975",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Hi team, we ",
                      },
                      {
                        type: "text",
                        text: "completed ",
                        marks: [
                          {
                            type: "strong",
                          },
                          {
                            type: "textColor",
                            attrs: {
                              color: "#36b37e",
                            },
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "BP Overflow Event - Test",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " on ",
                      },
                      {
                        type: "text",
                        text: "Staging-A.",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Validated:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Loc and Art Testing",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Verified Fixed Issues: ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "ST-156152",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156152",
                            },
                          },
                          {
                            type: "underline",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ", ",
                      },
                      {
                        type: "text",
                        text: "ST-156153",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156153",
                            },
                          },
                          {
                            type: "underline",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ", ",
                      },
                      {
                        type: "text",
                        text: "ST-156154",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156154",
                            },
                          },
                          {
                            type: "underline",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Build: ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "Latest",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Server: ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "Staging-A",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "In-progress man-hours:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " 20m",
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-25T11:03:09.873+0000",
              updated: "2025-11-25T11:03:14.766+0000",
              jsdPublic: true,
            },
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2134167/comment/7746709",
              id: "7746709",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=712020%3Aa83f7e5f-a916-4467-b7bb-fefea348c651",
                accountId: "712020:a83f7e5f-a916-4467-b7bb-fefea348c651",
                avatarUrls: {
                  "48x48":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "24x24":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "16x16":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "32x32":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                },
                displayName: "Abhishek Mane",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Hey!",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "We have ",
                      },
                      {
                        type: "text",
                        text: "continued ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "the ",
                      },
                      {
                        type: "text",
                        text: '"M85 MidOps - BP Overflow Event - Test"',
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " task on the mentioned build and server.",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "During our testing, we have encountered one new issue: ",
                      },
                      {
                        type: "text",
                        text: "ST-156957",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156957",
                            },
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Validated:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have validated the ",
                              },
                              {
                                type: "text",
                                text: "M85_MidOps_BpPointOverflow_SMS",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " event on both the web panel and in-game.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have validated the rewards for ",
                              },
                              {
                                type: "text",
                                text: "M85_MidOps_BpPointOverflow_SMS",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " event on both the web panel and in-game.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have validated the LOC for the ",
                              },
                              {
                                type: "text",
                                text: "M85_MidOps_BpPointOverflow_SMS",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " event on both the web panel and in-game.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have retested ",
                              },
                              {
                                type: "text",
                                text: "ST-156152",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-156152",
                                    },
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " & ",
                              },
                              {
                                type: "text",
                                text: "ST-156153",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-156153",
                                    },
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " and observed that they have been verified as fixed.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have also updated the ",
                              },
                              {
                                type: "text",
                                text: "GS Testrail",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.testrail.com/index.php?/plans/view/233762",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " ",
                                marks: [
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: "as well:",
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "Completed: 36%",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "Passed: 36%",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                  {
                                    type: "textColor",
                                    attrs: {
                                      color: "#36b37e",
                                    },
                                  },
                                ],
                              },
                              {
                                type: "hardBreak",
                              },
                              {
                                type: "text",
                                text: "Untested: 64%",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Pending:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "The ",
                              },
                              {
                                type: "text",
                                text: "art",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " for the event needs to be implemented and validated (",
                              },
                              {
                                type: "text",
                                text: "ST-156154",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-156154",
                                    },
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: ")",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "The logged bugs need to be fixed and validated.",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "GS In-progress Man Hours: 30 minutes",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Build: M85 - 1.000.46320",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Server: Staging A",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Thanks!",
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=712020%3Aa83f7e5f-a916-4467-b7bb-fefea348c651",
                accountId: "712020:a83f7e5f-a916-4467-b7bb-fefea348c651",
                avatarUrls: {
                  "48x48":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "24x24":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "16x16":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "32x32":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                },
                displayName: "Abhishek Mane",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-28T21:00:49.898+0000",
              updated: "2025-11-28T21:00:49.898+0000",
              jsdPublic: true,
            },
          ],
          self: "https://scopely.atlassian.net/rest/api/3/issue/2134167/comment",
          maxResults: 2,
          total: 2,
          startAt: 0,
        },
        updated: "2025-11-28T21:00:53.571+0000",
        status: {
          self: "https://scopely.atlassian.net/rest/api/3/status/3",
          description: "",
          iconUrl: "https://scopely.atlassian.net/images/icons/statuses/inprogress.png",
          name: "In Progress",
          id: "3",
          statusCategory: {
            self: "https://scopely.atlassian.net/rest/api/3/statuscategory/4",
            id: 4,
            key: "indeterminate",
            colorName: "yellow",
            name: "In Progress",
          },
        },
      },
    },
    {
      key: "ST-155755",
      id: "2117662",
      self: "https://scopely.atlassian.net/rest/api/3/issue/2117662",
      fields: {
        summary: "M85 - ESBP - test",
        issuelinks: [
          {
            id: "487605",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/487605",
            type: {
              id: "10001",
              name: "Cloners",
              inward: "is cloned by",
              outward: "clones",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10001",
            },
            outwardIssue: {
              id: "2117661",
              key: "ST-155754",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2117661",
              fields: {
                summary: "M85 - ESBP - Build",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/3",
                  description: "",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/inprogress.png",
                  name: "In Progress",
                  id: "3",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/4",
                    id: 4,
                    key: "indeterminate",
                    colorName: "yellow",
                    name: "In Progress",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10068",
                  iconUrl: "https://scopely.atlassian.net/images/icons/priorities/major.svg",
                  name: "P2 / Normal",
                  id: "10068",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/10006",
                  id: "10006",
                  description: "Task (Migrated on 27 Mar 2025 15:27 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10318?size=medium",
                  name: "Task",
                  subtask: false,
                  avatarId: 10318,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "488834",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/488834",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2126069",
              key: "ST-155972",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2126069",
              fields: {
                summary: "M85 - ESBP – The loc for BP Season Profiles and event is missing in both the Config and the Dev-B Web Panel",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10148",
                  description: "Work is ready for QA to pick up (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for QA",
                  id: "10148",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/4",
                    id: 4,
                    key: "indeterminate",
                    colorName: "yellow",
                    name: "In Progress",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10067",
                  iconUrl: "https://scopely.atlassian.net/images/icons/priorities/critical.svg",
                  name: "P1 / Important",
                  id: "10067",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "488836",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/488836",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2126092",
              key: "ST-155973",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2126092",
              fields: {
                summary: "M85 - ESBP – The art for BP Season Profiles and event is missing on Dev-B Web Panel",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10148",
                  description: "Work is ready for QA to pick up (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for QA",
                  id: "10148",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/4",
                    id: 4,
                    key: "indeterminate",
                    colorName: "yellow",
                    name: "In Progress",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10067",
                  iconUrl: "https://scopely.atlassian.net/images/icons/priorities/critical.svg",
                  name: "P1 / Important",
                  id: "10067",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "488849",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/488849",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2126110",
              key: "ST-155974",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2126110",
              fields: {
                summary: "M85 – ESBP – The art for “Resource_M85_Generic_Token_1” and “Resource_M85_Generic_Token_2” is missing in-game on Dev-B",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/6",
                  description: "",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/closed.png",
                  name: "Closed",
                  id: "6",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/3",
                    id: 3,
                    key: "done",
                    colorName: "green",
                    name: "Done",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10068",
                  iconUrl: "https://scopely.atlassian.net/images/icons/priorities/major.svg",
                  name: "P2 / Normal",
                  id: "10068",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/10010",
                  id: "10010",
                  description: "A problem which impairs or prevents the functions of the product. (Migrated on 27 Mar 2025 15:27 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10303?size=medium",
                  name: "Bug",
                  subtask: false,
                  avatarId: 10303,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "488856",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/488856",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2126134",
              key: "ST-155975",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2126134",
              fields: {
                summary: "M85 – ESBP – The colorized segmentation for BP Season Profiles is missing on the Dev-B Web Panel",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10148",
                  description: "Work is ready for QA to pick up (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for QA",
                  id: "10148",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/4",
                    id: 4,
                    key: "indeterminate",
                    colorName: "yellow",
                    name: "In Progress",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10068",
                  iconUrl: "https://scopely.atlassian.net/images/icons/priorities/major.svg",
                  name: "P2 / Normal",
                  id: "10068",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "491339",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/491339",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2148266",
              key: "ST-156734",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2148266",
              fields: {
                summary:
                  'M85 – ESBP – The Japanese and Portuguese translations for the short description of the event "M85_EventStoreBpOverflow_SMS" are incorrect in both the config and Dev-B WP',
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10148",
                  description: "Work is ready for QA to pick up (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for QA",
                  id: "10148",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/4",
                    id: 4,
                    key: "indeterminate",
                    colorName: "yellow",
                    name: "In Progress",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10067",
                  iconUrl: "https://scopely.atlassian.net/images/icons/priorities/critical.svg",
                  name: "P1 / Important",
                  id: "10067",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
        ],
        comment: {
          comments: [
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2117662/comment/7682933",
              id: "7682933",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Hi team, we started M85 - ESBP - test ",
                      },
                      {
                        type: "text",
                        text: "on Dev-B",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ", and observed that:",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "New bugs: ",
                      },
                      {
                        type: "text",
                        text: "ST-155972",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-155972",
                            },
                          },
                          {
                            type: "underline",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " ",
                      },
                      {
                        type: "text",
                        text: "ST-155973",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-155973",
                            },
                          },
                          {
                            type: "underline",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " ",
                      },
                      {
                        type: "text",
                        text: "ST-155974",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-155974",
                            },
                          },
                          {
                            type: "underline",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " ",
                      },
                      {
                        type: "text",
                        text: "ST-155975",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-155975",
                            },
                          },
                          {
                            type: "underline",
                          },
                        ],
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Validated:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "All rewards and events on WP & in game.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Testrun:",
                              },
                            ],
                          },
                          {
                            type: "bulletList",
                            content: [
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    content: [
                                      {
                                        type: "text",
                                        text: "Web Panel",
                                        marks: [
                                          {
                                            type: "link",
                                            attrs: {
                                              href: "https://scopely.testrail.com/index.php?/runs/view/232951",
                                            },
                                          },
                                          {
                                            type: "underline",
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    content: [
                                      {
                                        type: "text",
                                        text: "In Game",
                                        marks: [
                                          {
                                            type: "link",
                                            attrs: {
                                              href: "https://scopely.testrail.com/index.php?/runs/view/232950",
                                            },
                                          },
                                          {
                                            type: "underline",
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Pending:",
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Loc and Art.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Reported issue need to be fixed.",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Build: ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "Latest",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Server: Dev-B",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "In-progress man-hours:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " 45m",
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-19T10:47:44.428+0000",
              updated: "2025-11-19T10:47:44.428+0000",
              jsdPublic: true,
            },
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2117662/comment/7720001",
              id: "7720001",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5bfc460853cd043c8c610254",
                accountId: "5bfc460853cd043c8c610254",
                avatarUrls: {
                  "48x48":
                    "https://secure.gravatar.com/avatar/fe0b920c94ebd36eaec06c4dfb6ff1da?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKK-6.png",
                  "24x24":
                    "https://secure.gravatar.com/avatar/fe0b920c94ebd36eaec06c4dfb6ff1da?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKK-6.png",
                  "16x16":
                    "https://secure.gravatar.com/avatar/fe0b920c94ebd36eaec06c4dfb6ff1da?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKK-6.png",
                  "32x32":
                    "https://secure.gravatar.com/avatar/fe0b920c94ebd36eaec06c4dfb6ff1da?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKK-6.png",
                },
                displayName: "Kristopher Kauthen",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "mention",
                        attrs: {
                          id: "712020:5715ee3f-0aba-40ea-aa41-75d44853bcc0",
                          text: "@Gyanachandra Bhujabal",
                          accessLevel: "",
                          localId: "8c92a2b3-97fa-4a23-a3dd-d26d355a154d",
                        },
                      },
                      {
                        type: "text",
                        text: " ",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "The M85_EventStoreBpOverflow_SMS event was incorrectly built as a Battle Pass Event. I have archived/deleted that BP Event template from Dev-B. I have rebuilt the event as a normal tournament event and it is now ready for validation testing on Dev-B. Can you ensure that the team is aware that this was rebuilt and needs to be re-validated?",
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5bfc460853cd043c8c610254",
                accountId: "5bfc460853cd043c8c610254",
                avatarUrls: {
                  "48x48":
                    "https://secure.gravatar.com/avatar/fe0b920c94ebd36eaec06c4dfb6ff1da?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKK-6.png",
                  "24x24":
                    "https://secure.gravatar.com/avatar/fe0b920c94ebd36eaec06c4dfb6ff1da?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKK-6.png",
                  "16x16":
                    "https://secure.gravatar.com/avatar/fe0b920c94ebd36eaec06c4dfb6ff1da?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKK-6.png",
                  "32x32":
                    "https://secure.gravatar.com/avatar/fe0b920c94ebd36eaec06c4dfb6ff1da?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKK-6.png",
                },
                displayName: "Kristopher Kauthen",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-24T23:27:19.900+0000",
              updated: "2025-11-24T23:27:19.900+0000",
              jsdPublic: true,
            },
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2117662/comment/7729666",
              id: "7729666",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Hi team, we continued M85 - ESBP - test on Dev-B.",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Validated",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ":",
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Loc and Art on WP and In-game.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Re-validated the event ",
                              },
                              {
                                type: "text",
                                text: "M85_EventStoreBpOverflow_SMS ",
                                marks: [
                                  {
                                    type: "em",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: "after it was rebuilt as a normal tournament event.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "ST-155975",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-155975",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " > Fixed.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "ST-155973",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-155973",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " > Fixed.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "ST-155972",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-155972",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " > Fixed.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "New issue: ",
                              },
                              {
                                type: "text",
                                text: "ST-156734",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-156734",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Test Rail",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.testrail.com/index.php?/plans/view/232947",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Build",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ": 1.000.46320",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Time",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ": 45m",
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-26T10:28:24.727+0000",
              updated: "2025-11-26T10:28:24.727+0000",
              jsdPublic: true,
            },
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2117662/comment/7737796",
              id: "7737796",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Hi team, we ",
                      },
                      {
                        type: "text",
                        text: "completed ",
                        marks: [
                          {
                            type: "strong",
                          },
                          {
                            type: "textColor",
                            attrs: {
                              color: "#36b37e",
                            },
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "M85 - ESBP - test on Dev-B.",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Validated",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ":",
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "ST-156734",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-156734",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " Fixed",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "Test Rail",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.testrail.com/index.php?/plans/view/232947",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: ": 100% Pass",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Build",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ": 1.000.46320",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Time",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ": 5m",
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-27T11:12:37.116+0000",
              updated: "2025-11-27T11:12:37.116+0000",
              jsdPublic: true,
            },
          ],
          self: "https://scopely.atlassian.net/rest/api/3/issue/2117662/comment",
          maxResults: 4,
          total: 4,
          startAt: 0,
        },
        updated: "2025-11-27T11:12:37.116+0000",
        status: {
          self: "https://scopely.atlassian.net/rest/api/3/status/3",
          description: "",
          iconUrl: "https://scopely.atlassian.net/images/icons/statuses/inprogress.png",
          name: "In Progress",
          id: "3",
          statusCategory: {
            self: "https://scopely.atlassian.net/rest/api/3/statuscategory/4",
            id: 4,
            key: "indeterminate",
            colorName: "yellow",
            name: "In Progress",
          },
        },
      },
    },
    {
      key: "ST-155669",
      id: "2115076",
      self: "https://scopely.atlassian.net/rest/api/3/issue/2115076",
      fields: {
        summary: "M85 MidOps- W1 Engagement Events",
        issuelinks: [
          {
            id: "487349",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/487349",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2115790",
              key: "ST-155678",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2115790",
              fields: {
                summary: 'M85 - Event - The "M85_MidOps_SnmUnseenThreats_SMS" event has invalid metrics and cannot be built on the Dev-B Web Panel.',
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10148",
                  description: "Work is ready for QA to pick up (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for QA",
                  id: "10148",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/4",
                    id: 4,
                    key: "indeterminate",
                    colorName: "yellow",
                    name: "In Progress",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10067",
                  iconUrl: "https://scopely.atlassian.net/images/icons/priorities/critical.svg",
                  name: "P1 / Important",
                  id: "10067",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "492514",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/492514",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2156953",
              key: "ST-156959",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2156953",
              fields: {
                summary:
                  "M85 - D1 W1 Engagement Events - M85_MidOps_SnmCriticalCrew_SLB – The reward tier Pts/Rank is incorrectly shown as “4-10” instead of “4–5” & “6–10” for all level segmentation on both the Web Panel and config sheet",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10143",
                  description:
                    "Default status for newly created bugs.  Represents a new ticket that has not yet been triaged by QA. (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for Triage",
                  id: "10143",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10035",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Arabic_Question_mark_%28RTL%29.svg/90px-Arabic_Question_mark_%28RTL%29.svg.png",
                  name: "Unprioritized",
                  id: "10035",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "492515",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/492515",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2156959",
              key: "ST-156961",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2156959",
              fields: {
                summary: "M85 - D1 W1 Engagement Events - The LOC is absent for all the D1 Events on both the Config sheet and the Dev B Web panel",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10143",
                  description:
                    "Default status for newly created bugs.  Represents a new ticket that has not yet been triaged by QA. (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for Triage",
                  id: "10143",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10035",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Arabic_Question_mark_%28RTL%29.svg/90px-Arabic_Question_mark_%28RTL%29.svg.png",
                  name: "Unprioritized",
                  id: "10035",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
          {
            id: "492523",
            self: "https://scopely.atlassian.net/rest/api/3/issueLink/492523",
            type: {
              id: "10000",
              name: "Blocks",
              inward: "is blocked by",
              outward: "blocks",
              self: "https://scopely.atlassian.net/rest/api/3/issueLinkType/10000",
            },
            inwardIssue: {
              id: "2156970",
              key: "ST-156963",
              self: "https://scopely.atlassian.net/rest/api/3/issue/2156970",
              fields: {
                summary: "M85 - D1 W1 Engagement Events - The custom asset art appears as a 'missing asset' on the Dev-B WP",
                status: {
                  self: "https://scopely.atlassian.net/rest/api/3/status/10143",
                  description:
                    "Default status for newly created bugs.  Represents a new ticket that has not yet been triaged by QA. (Migrated on 29 Mar 2025 18:46 UTC)",
                  iconUrl: "https://scopely.atlassian.net/images/icons/statuses/generic.png",
                  name: "Ready for Triage",
                  id: "10143",
                  statusCategory: {
                    self: "https://scopely.atlassian.net/rest/api/3/statuscategory/2",
                    id: 2,
                    key: "new",
                    colorName: "blue-gray",
                    name: "To Do",
                  },
                },
                priority: {
                  self: "https://scopely.atlassian.net/rest/api/3/priority/10035",
                  iconUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Arabic_Question_mark_%28RTL%29.svg/90px-Arabic_Question_mark_%28RTL%29.svg.png",
                  name: "Unprioritized",
                  id: "10035",
                },
                issuetype: {
                  self: "https://scopely.atlassian.net/rest/api/3/issuetype/11391",
                  id: "11391",
                  description: "(Migrated on 15 Jun 2025 07:29 UTC)",
                  iconUrl: "https://scopely.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10666?size=medium",
                  name: "LO Bug",
                  subtask: false,
                  avatarId: 10666,
                  hierarchyLevel: 0,
                },
              },
            },
          },
        ],
        comment: {
          comments: [
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2115076/comment/7621937",
              id: "7621937",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Hi team,",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "We have started building the ",
                      },
                      {
                        type: "text",
                        text: "M85 MidOps – W1 Engagement Events",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " on ",
                      },
                      {
                        type: "text",
                        text: "Dev-B",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ". ",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "During the process, we identified an issue: ",
                      },
                      {
                        type: "text",
                        text: "ST-155678",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-155678",
                            },
                          },
                          {
                            type: "underline",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ".",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "All events and rewards have been successfully built and are ready for validation ",
                      },
                      {
                        type: "text",
                        text: "except for the",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " ",
                      },
                      {
                        type: "text",
                        text: '"M85_MidOps_SnmUnseenThreats_SMS"',
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " event, which is currently blocked by the issue mentioned above.",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Build Time:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " 30 min",
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5a976d68d4a47e29266d8f7f",
                accountId: "5a976d68d4a47e29266d8f7f",
                emailAddress: "longlt@geargames.com",
                avatarUrls: {
                  "48x48":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/48",
                  "24x24":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/24",
                  "16x16":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/16",
                  "32x32":
                    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5a976d68d4a47e29266d8f7f/70d9a5af-ee13-428e-b23c-e12487e0f0f3/32",
                },
                displayName: "Long Le Tuan",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-14T10:38:08.591+0000",
              updated: "2025-11-14T10:38:08.591+0000",
              jsdPublic: true,
            },
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2115076/comment/7629588",
              id: "7629588",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5bfc460853cd043c8c610254",
                accountId: "5bfc460853cd043c8c610254",
                avatarUrls: {
                  "48x48":
                    "https://secure.gravatar.com/avatar/fe0b920c94ebd36eaec06c4dfb6ff1da?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKK-6.png",
                  "24x24":
                    "https://secure.gravatar.com/avatar/fe0b920c94ebd36eaec06c4dfb6ff1da?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKK-6.png",
                  "16x16":
                    "https://secure.gravatar.com/avatar/fe0b920c94ebd36eaec06c4dfb6ff1da?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKK-6.png",
                  "32x32":
                    "https://secure.gravatar.com/avatar/fe0b920c94ebd36eaec06c4dfb6ff1da?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKK-6.png",
                },
                displayName: "Kristopher Kauthen",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "The metrics were updated to fix the invalid metrics error. Updated metrics are highlighted cyan on the config sheet. ",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "This event has been built on Dev-B and is now ready for validation.",
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=5bfc460853cd043c8c610254",
                accountId: "5bfc460853cd043c8c610254",
                avatarUrls: {
                  "48x48":
                    "https://secure.gravatar.com/avatar/fe0b920c94ebd36eaec06c4dfb6ff1da?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKK-6.png",
                  "24x24":
                    "https://secure.gravatar.com/avatar/fe0b920c94ebd36eaec06c4dfb6ff1da?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKK-6.png",
                  "16x16":
                    "https://secure.gravatar.com/avatar/fe0b920c94ebd36eaec06c4dfb6ff1da?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKK-6.png",
                  "32x32":
                    "https://secure.gravatar.com/avatar/fe0b920c94ebd36eaec06c4dfb6ff1da?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKK-6.png",
                },
                displayName: "Kristopher Kauthen",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-14T20:26:45.826+0000",
              updated: "2025-11-14T20:26:45.826+0000",
              jsdPublic: true,
            },
            {
              self: "https://scopely.atlassian.net/rest/api/3/issue/2115076/comment/7746905",
              id: "7746905",
              author: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=712020%3Aa83f7e5f-a916-4467-b7bb-fefea348c651",
                accountId: "712020:a83f7e5f-a916-4467-b7bb-fefea348c651",
                avatarUrls: {
                  "48x48":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "24x24":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "16x16":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "32x32":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                },
                displayName: "Abhishek Mane",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Hey!",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "We have ",
                      },
                      {
                        type: "text",
                        text: "started ",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: "the ",
                      },
                      {
                        type: "text",
                        text: '"M85 MidOps - BP Overflow Event - Test"',
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " task on the mentioned build and server.",
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "During our testing, we have encountered three new issues: ",
                      },
                      {
                        type: "text",
                        text: "ST-156959",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156959",
                            },
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: ", ",
                      },
                      {
                        type: "text",
                        text: "ST-156961",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156961",
                            },
                          },
                        ],
                      },
                      {
                        type: "text",
                        text: " & ",
                      },
                      {
                        type: "text",
                        text: "ST-156963",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://scopely.atlassian.net/browse/ST-156963",
                            },
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Validated:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have validated all the D1 events on both the web panel and in-game.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have validated the ",
                              },
                              {
                                type: "text",
                                text: "D1 Reward",
                                marks: [
                                  {
                                    type: "strong",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " on both the web panel and in-game.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have retested ",
                              },
                              {
                                type: "text",
                                text: "ST-155678",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-155678",
                                    },
                                  },
                                  {
                                    type: "underline",
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " and observed that it has been verified as fixed.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "We have not updated the GS testrail, as it is common for all D1, D2 & D3+ events",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Pending:",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "bulletList",
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "The remaining D2 & D3+ events & rewards need to be validated.",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "The LOC & art for the event need to be implemented and validated (",
                              },
                              {
                                type: "text",
                                text: "ST-156961",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-156961",
                                    },
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: " & ",
                              },
                              {
                                type: "text",
                                text: "ST-156963",
                                marks: [
                                  {
                                    type: "link",
                                    attrs: {
                                      href: "https://scopely.atlassian.net/browse/ST-156963",
                                    },
                                  },
                                ],
                              },
                              {
                                type: "text",
                                text: ")",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "text",
                                text: "The logged bugs need to be fixed and validated.",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "GS In-progress Man Hours:  1 hour 30 minutes",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Build: M85 - 1.000.46320",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Server: Dev B",
                        marks: [
                          {
                            type: "strong",
                          },
                        ],
                      },
                      {
                        type: "hardBreak",
                      },
                      {
                        type: "text",
                        text: "Thanks!",
                      },
                    ],
                  },
                ],
              },
              updateAuthor: {
                self: "https://scopely.atlassian.net/rest/api/3/user?accountId=712020%3Aa83f7e5f-a916-4467-b7bb-fefea348c651",
                accountId: "712020:a83f7e5f-a916-4467-b7bb-fefea348c651",
                avatarUrls: {
                  "48x48":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "24x24":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "16x16":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                  "32x32":
                    "https://secure.gravatar.com/avatar/ea5230443541980444998f63278430ee?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FAM-3.png",
                },
                displayName: "Abhishek Mane",
                active: true,
                timeZone: "Etc/GMT",
                accountType: "atlassian",
              },
              created: "2025-11-29T00:08:43.027+0000",
              updated: "2025-11-29T00:08:43.027+0000",
              jsdPublic: true,
            },
          ],
          self: "https://scopely.atlassian.net/rest/api/3/issue/2115076/comment",
          maxResults: 3,
          total: 3,
          startAt: 0,
        },
        updated: "2025-11-29T00:08:43.178+0000",
        status: {
          self: "https://scopely.atlassian.net/rest/api/3/status/3",
          description: "",
          iconUrl: "https://scopely.atlassian.net/images/icons/statuses/inprogress.png",
          name: "In Progress",
          id: "3",
          statusCategory: {
            self: "https://scopely.atlassian.net/rest/api/3/statuscategory/4",
            id: 4,
            key: "indeterminate",
            colorName: "yellow",
            name: "In Progress",
          },
        },
      },
    },
  ],
};

// Run the filter function and output the result
console.log("=== Filtered JIRA Response ===");
console.log(JSON.stringify(filterJiraResponse(exampleResponse), null, 2));

// Export the function for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = { filterJiraResponse };
}
