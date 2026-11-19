import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  DEFAULT_INHERITED_ENV_VARS,
  StdioClientTransport,
} from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import test from "node:test";

function createClient() {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [fileURLToPath(new URL("../yougile.cjs", import.meta.url))],
    env: {
      ...Object.fromEntries(
        DEFAULT_INHERITED_ENV_VARS.map((name) => [
          name,
          process.env[name],
        ]).filter(([, value]) => value !== undefined),
      ),
      YOUGILE_API_KEY: "test-token",
      YOUGILE_DEBUG: "0",
    },
    stderr: "pipe",
  });
  const client = new Client({ name: "yougile-tests", version: "1.0.0" });
  return { client, transport };
}

test("MCP stdio server initializes and lists all tools", async (t) => {
  const { client, transport } = createClient();
  let stderr = "";
  transport.stderr.setEncoding("utf8");
  transport.stderr.on("data", (chunk) => {
    stderr += chunk;
  });
  t.after(() => client.close());

  await client.connect(transport);
  const tools = await client.listTools();

  assert.equal(tools.tools.length, 30);
  assert.ok(tools.tools.some(({ name }) => name === "get_task"));
  assert.ok(tools.tools.some(({ name }) => name === "create_task"));
  assert.equal(stderr, "");
});
