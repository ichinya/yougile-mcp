#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { createServer } from "./server.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env"), quiet: true });

// Check if the required environment variables are set
if (!process.env.YOUGILE_API_KEY) {
  console.error("Error: YOUGILE_API_KEY environment variable is not set.");
  console.error("Please add YOUGILE_API_KEY to your .env file or environment.");
  process.exit(1);
}

try {
  const { server } = createServer();
  const transport = new StdioServerTransport();

  // Connect the server to the transport
  server.connect(transport).catch((error) => {
    console.error("Fatal error connecting server:", error);
    process.exit(1);
  });
} catch (error) {
  console.error("Fatal error in main():", error);
  process.exit(1);
}
