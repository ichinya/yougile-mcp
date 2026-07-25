import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { makeYougileRequest } from "../common/request-helper.js";
import { buildQueryString } from "../common/helpers.js";

/**
 * Register sticker-related MCP tools
 * @param server - MCP server instance
 */
export const registerStickerTools = (server: McpServer) => {
  server.tool(
    "get_string_stickers",
    "Get all string stickers (custom stickers with states) for a board",
    {
      boardId: z.string().optional().describe("Filter by board ID"),
      limit: z.number().optional().describe("Limit number of stickers returned"),
      offset: z.number().optional().describe("Offset for pagination"),
      name: z.string().optional().describe("Filter by sticker name"),
    },
    async ({ boardId, limit, offset, name }) => {
      const queryString = buildQueryString({ boardId, limit, offset, name });
      const path = `string-stickers${queryString ? '?' + queryString : ''}`;
      
      const stickers = await makeYougileRequest<unknown>("GET", path);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(stickers, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "get_string_sticker",
    "Get a specific string sticker by ID with its states",
    {
      id: z.string().describe("The ID of the sticker to retrieve"),
    },
    async ({ id }) => {
      const sticker = await makeYougileRequest("GET", `string-stickers/${id}`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(sticker, null, 2),
          },
        ],
      };
    }
  );
};
