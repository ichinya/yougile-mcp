#!/usr/bin/env node
const { spawnSync } = require("child_process");
const { existsSync } = require("fs");
const { join } = require("path");
const dotenv = require("dotenv");

const projectRoot = join(__dirname, "..");
dotenv.config({ path: join(projectRoot, ".env"), quiet: true });

// Check API key
if (!process.env.YOUGILE_API_KEY) {
  console.error("Error: YOUGILE_API_KEY environment variable is not set.");
  console.error("Set it via: export YOUGILE_API_KEY=your_key");
  console.error("Or create a .env file with: YOUGILE_API_KEY=your_key");
  process.exit(1);
}

// Build if needed
const buildPath = join(projectRoot, "build", "cli.js");
if (!existsSync(buildPath)) {
  console.error("Building...");
  const result = spawnSync("npx", ["tsc"], {
    cwd: projectRoot,
    stdio: "inherit",
    shell: true,
  });
  if (result.status !== 0) {
    console.error("Build failed");
    process.exit(1);
  }
}

// Run CLI
require(buildPath);
