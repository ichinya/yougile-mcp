import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { getVersion } from "./common/version.js";
import { registerTools } from "./tools/index.js";

/**
 * Create and configure the MCP server
 * @returns Object containing the server instance and version
 */
export function createServer() {
  const version = getVersion();

  const server = new McpServer({
    name: "yougile-mcp-server",
    version,
  });

  registerTools(server);

  return { server, version };
}