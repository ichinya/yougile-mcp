import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { makeYougileRequest } from "../common/request-helper.js";
import { buildQueryString } from "../common/helpers.js";
import type { User, ApiResponse } from "../types/index.js";

/**
 * Register user-related MCP tools
 * @param server - MCP server instance
 */
export const registerUserTools = (server: McpServer) => {
  server.tool(
    "get_users",
    "Get all users in the company",
    {
      limit: z.number().optional().describe("Limit number of users returned"),
      offset: z.number().optional().describe("Offset for pagination"),
      email: z.string().optional().describe("Filter by user email"),
      projectId: z.string().optional().describe("Filter by project ID"),
    },
    async ({ limit, offset, email, projectId }) => {
      const queryString = buildQueryString({ limit, offset, email, projectId });
      const path = `users${queryString ? '?' + queryString : ''}`;
      
      const users = await makeYougileRequest<ApiResponse<User>>("GET", path);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(users, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "get_user",
    "Get a specific user by ID",
    {
      id: z.string().describe("The ID of the user to retrieve"),
    },
    async ({ id }) => {
      const user = await makeYougileRequest<User>("GET", `users/${id}`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(user, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "create_user",
    "Invite a user to the company",
    {
      email: z.string().email().describe("The email of the user to invite"),
      firstName: z.string().optional().describe("The first name of the user"),
      lastName: z.string().optional().describe("The last name of the user"),
      role: z.string().optional().describe("The role of the user in the company"),
    },
    async ({ email, firstName, lastName, role }) => {
      const userData: Partial<User> = { email };
      if (firstName) userData.firstName = firstName;
      if (lastName) userData.lastName = lastName;
      if (role) userData.role = role;

      const result = await makeYougileRequest<User>("POST", "users", userData);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "update_user",
    "Update an existing user",
    {
      id: z.string().describe("The ID of the user to update"),
      firstName: z.string().optional().describe("The new first name of the user"),
      lastName: z.string().optional().describe("The new last name of the user"),
      role: z.string().optional().describe("The new role of the user in the company"),
    },
    async ({ id, firstName, lastName, role }) => {
      const userData: Partial<User> = {};
      if (firstName) userData.firstName = firstName;
      if (lastName) userData.lastName = lastName;
      if (role) userData.role = role;

      const result = await makeYougileRequest<User>("PUT", `users/${id}`, userData);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "delete_user",
    "Remove a user from the company",
    {
      id: z.string().describe("The ID of the user to remove"),
    },
    async ({ id }) => {
      const result = await makeYougileRequest<unknown>("DELETE", `users/${id}`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
};