import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";

function startApi(t) {
  const requests = [];
  const server = createServer((request, response) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      requests.push({
        body,
        headers: request.headers,
        method: request.method,
        url: request.url,
      });
      response.setHeader("Content-Type", "application/json");
      if (request.url === "/fail") {
        response.writeHead(400);
        response.end(JSON.stringify({ error: "Invalid request" }));
      } else {
        response.end(JSON.stringify({ ok: true, body: body || null }));
      }
    });
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      t.after(() => {
        delete process.env.YOUGILE_API_HOST_URL;
        delete process.env.YOUGILE_API_KEY;
        return new Promise((done) => server.close(done));
      });
      resolve({ baseUrl: `http://127.0.0.1:${port}/`, requests });
    });
  });
}

test("makeYougileRequest sends auth, query, body and parses JSON", async (t) => {
  const { baseUrl, requests } = await startApi(t);
  process.env.YOUGILE_API_HOST_URL = baseUrl;
  process.env.YOUGILE_API_KEY = "test-token";
  process.env.YOUGILE_DEBUG = "0";
  const { makeYougileRequest } =
    await import("../build/common/request-helper.js");

  const payload = { title: "Test task" };
  const result = await makeYougileRequest(
    "POST",
    "tasks?columnId=column-1",
    payload,
  );

  assert.deepEqual(result, { ok: true, body: JSON.stringify(payload) });
  assert.equal(requests.length, 1);
  assert.equal(requests[0].method, "POST");
  assert.equal(requests[0].url, "/tasks?columnId=column-1");
  assert.equal(requests[0].headers.authorization, "Bearer test-token");
  assert.equal(requests[0].headers["content-type"], "application/json");
  assert.equal(requests[0].body, JSON.stringify(payload));
});

test("makeYougileRequest converts API errors to Error instances", async (t) => {
  const { baseUrl } = await startApi(t);
  process.env.YOUGILE_API_HOST_URL = baseUrl;
  process.env.YOUGILE_API_KEY = "test-token";
  process.env.YOUGILE_DEBUG = "0";
  const { makeYougileRequest } =
    await import("../build/common/request-helper.js");

  await assert.rejects(
    makeYougileRequest("GET", "fail"),
    (error) =>
      error instanceof Error &&
      error.message.startsWith("Request failed:") &&
      !error.message.includes("test-token"),
  );
});
