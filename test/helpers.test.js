import assert from "node:assert/strict";
import test from "node:test";
import { buildQueryString } from "../build/common/helpers.js";
import { getVersion } from "../build/common/version.js";
import { createServer } from "../build/server.js";

test("buildQueryString encodes values and keeps false/zero values", () => {
  assert.equal(
    buildQueryString({
      title: "task & more",
      limit: 50,
      offset: 0,
      includeArchived: false,
    }),
    "title=task+%26+more&limit=50&offset=0&includeArchived=false",
  );
});

test("buildQueryString omits empty values", () => {
  assert.equal(
    buildQueryString({ empty: "", omitted: undefined, missing: null }),
    "",
  );
});

test("getVersion reads the package version", () => {
  assert.match(getVersion(), /^\d+\.\d+\.\d+$/);
});

test("createServer registers the MCP tools without starting a process", () => {
  const { server, version } = createServer();
  assert.equal(version, getVersion());
  assert.ok(server);
});
