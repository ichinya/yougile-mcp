#!/usr/bin/env node
import { spawn } from "child_process";
import { setTimeout } from "timers/promises";

// Start the Yougile MCP server
const server = spawn("node", ["build/index.js"], {
  stdio: ["pipe", "pipe", "pipe"], // stdin, stdout, stderr
});

// Handle server stderr (for logging)
server.stderr.on("data", (data) => {
  console.error(`Server stderr: ${data}`);
});

// Handle server stdout
server.stdout.on("data", (data) => {
  console.log(`Server stdout: ${data}`);
});

// Send initialization request
const initRequest = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    clientInfo: {
      name: "test-client",
      version: "1.0.0",
    },
    capabilities: {},
  },
};

console.log("Sending initialize request...");
server.stdin.write(JSON.stringify(initRequest) + "\n");

// Wait a bit and then send a test request
setTimeout(2000).then(() => {
  const listRequest = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: {},
  };

  console.log("Sending tools/list request...");
  server.stdin.write(JSON.stringify(listRequest) + "\n");
});

// Handle server exit
server.on("close", (code) => {
  console.log(`Server exited with code: ${code}`);
});
