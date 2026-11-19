#!/usr/bin/env node
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env"), quiet: true });

// Check if the required environment variables are set
if (!process.env.YOUGILE_API_KEY) {
  console.error("Error: YOUGILE_API_KEY environment variable is not set.");
  console.error("Please add YOUGILE_API_KEY to your .env file or environment.");
  process.exit(1);
}

// Check if build directory exists and build if needed
const buildPath = join(__dirname, "build", "index.js");

if (!existsSync(buildPath)) {
  console.error("Build file does not exist, attempting to build...");
  const result = spawnSync("npx", ["tsc"], {
    cwd: __dirname,
    stdio: "pipe",
    shell: true,
  });

  if (result.status !== 0) {
    console.error("TypeScript compilation failed");
    console.error(result.stderr?.toString() || "Unknown error");
    process.exit(1);
  }
  console.error("Build completed successfully");
}

// Import and run the built server
async function startServer() {
  try {
    const serverUrl = new URL(`file://${buildPath}`);
    await import(serverUrl);
  } catch (error) {
    process.exit(1);
  }
}

startServer();

// Keep the process alive for MCP communication through stdio
// Using a more robust method to keep the process alive
const keepAlive = setInterval(() => {
  // Do nothing, just keep the event loop alive
}, 60000); // Run every minute

process.stdin.setEncoding("utf8");
process.stdin.on("readable", () => {
  // Process stdin data if needed
});
