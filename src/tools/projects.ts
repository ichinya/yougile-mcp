import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { makeYougileRequest } from "../common/request-helper.js";
import type { Project } from "../types/index.js";

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
    },
    async ({ title, description, color }) => {
      const projectData: Partial<Project> = { title };
      if (description) projectData.description = description;
      if (color) projectData.color = color;

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
    },
    async ({ id, title, description, color }) => {
      const projectData: Partial<Project> = {};
      if (title) projectData.title = title;
      if (description) projectData.description = description;
      if (color) projectData.color = color;

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