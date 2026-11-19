import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerProjectTools } from "./projects.js";
import { registerTaskTools } from "./tasks.js";
import { registerUserTools } from "./users.js";
import { registerBoardTools } from "./boards.js";
import { registerColumnTools } from "./columns.js";
import { registerTaskChatTools } from "./task-chat.js";
import { registerFileTools } from "./files.js";
import { registerStickerTools } from "./stickers.js";

export const registerTools = (server: McpServer) => {
  registerUserTools(server);
  registerProjectTools(server);
  registerBoardTools(server);
  registerColumnTools(server);
  registerTaskTools(server);
  registerTaskChatTools(server);
  registerFileTools(server);
  registerStickerTools(server);
};
