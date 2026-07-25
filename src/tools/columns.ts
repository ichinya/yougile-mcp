import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { makeYougileRequest } from "../common/request-helper.js";
import { buildQueryString } from "../common/helpers.js";
import type { Column } from "../types/index.js";

/**
 * Register column-related MCP tools
 * @param server - MCP server instance
 */
export const registerColumnTools = (server: McpServer) => {
  server.tool(
    "get_columns",
    "Get all columns in a board",
    {
      boardId: z.string().describe("The ID of the board to get columns from"),
      limit: z.number().optional().describe("Limit number of columns returned"),
      offset: z.number().optional().describe("Offset for pagination"),
      title: z.string().optional().describe("Filter by column title"),
    },
    async ({ boardId, limit, offset, title }) => {
      const queryString = buildQueryString({ boardId, limit, offset, title });
      const path = `columns${queryString ? '?' + queryString : ''}`;
      
      const columns = await makeYougileRequest<unknown>("GET", path);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(columns, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "get_column",
    "Get a specific column by ID",
    {
      id: z.string().describe("The ID of the column to retrieve"),
    },
    async ({ id }) => {
      const column = await makeYougileRequest<unknown>("GET", `columns/${id}`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(column, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "create_column",
    "Create a new column",
    {
      title: z.string().describe("The title of the column"),
      boardId: z.string().describe("The ID of the board the column belongs to"),
      description: z.string().optional().describe("The description of the column"),
    },
    async ({ title, boardId, description }) => {
      const columnData: Partial<Column> = { 
        title,
        boardId
      };
      if (description) columnData.description = description;

      const result = await makeYougileRequest<Column>("POST", "columns", columnData);
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
    "update_column",
    "Update an existing column",
    {
      id: z.string().describe("The ID of the column to update"),
      title: z.string().optional().describe("The new title of the column"),
      description: z.string().optional().describe("The new description of the column"),
    },
    async ({ id, title, description }) => {
      const columnData: Partial<Column> = {};
      if (title) columnData.title = title;
      if (description) columnData.description = description;

      const result = await makeYougileRequest<Column>("PUT", `columns/${id}`, columnData);
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