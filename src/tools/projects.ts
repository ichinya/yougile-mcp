import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { makeYougileRequest } from "../common/request-helper.js";
import type { Project, IdempotentCreate } from "../types/index.js";

/**
 * Register project-related MCP tools
 * @param server - MCP server instance
 */
export const registerProjectTools = (server: McpServer) => {
  server.tool(
    "get_projects",
    "Get all projects for the current user",
    {},
    async () => {
      const projects = await makeYougileRequest<unknown>("GET", "projects");
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(projects, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "get_project",
    "Get a specific project by ID",
    {
      id: z.string().describe("The ID of the project to retrieve"),
    },
    async ({ id }) => {
      const project = await makeYougileRequest<unknown>("GET", `projects/${id}`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(project, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "create_project",
    "Create a new project",
    {
      title: z.string().describe("The name/title of the project"),
      description: z.string().optional().describe("The description of the project"),
      color: z.string().optional().describe("Color code for the project"),
      departments: z.record(z.string(), z.record(z.string(), z.string())).optional().describe("Departments on the project and role mapping: department ID → { manager, member }"),
      idempotencyKey: z.string().optional().describe("Idempotency key: retrying the request with the same key returns the already created project instead of duplicating it"),
    },
    async ({ title, description, color, departments, idempotencyKey }) => {
      const projectData: Partial<Project> & IdempotentCreate = { title };
      if (description) projectData.description = description;
      if (color) projectData.color = color;
      if (departments) projectData.departments = departments;
      if (idempotencyKey) projectData.idempotencyKey = idempotencyKey;

      const result = await makeYougileRequest<Project>("POST", "projects", projectData);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "update_project",
    "Update an existing project",
    {
      id: z.string().describe("The ID of the project to update"),
      title: z.string().optional().describe("The new name/title of the project"),
      description: z.string().optional().describe("The new description of the project"),
      color: z.string().optional().describe("New color code for the project"),
      departments: z.record(z.string(), z.record(z.string(), z.string())).optional().describe("Departments and role mapping: department ID → { manager, member }. Use department ID '-' to remove a department binding"),
    },
    async ({ id, title, description, color, departments }) => {
      const projectData: Partial<Project> = {};
      if (title) projectData.title = title;
      if (description) projectData.description = description;
      if (color) projectData.color = color;
      if (departments) projectData.departments = departments;

      const result = await makeYougileRequest<Project>("PUT", `projects/${id}`, projectData);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
};