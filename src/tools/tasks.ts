import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { makeYougileRequest } from "../common/request-helper.js";
import { buildQueryString } from "../common/helpers.js";
import type { Task, ApiResponse } from "../types/index.js";

/**
 * Register task-related MCP tools
 * @param server - MCP server instance
 */
export const registerTaskTools = (server: McpServer) => {
  server.tool(
    "get_tasks",
    "Get tasks list. IMPORTANT: YouGile API does NOT support projectId filter! Use columnId or assignedTo instead. For complete user task list, use get_user_tasks.",
    {
      columnId: z.string().optional().describe("Filter by column ID"),
      assignedTo: z.string().optional().describe("Comma-separated user IDs to filter by assignee"),
      title: z.string().optional().describe("Filter by task title (partial match)"),
      limit: z.number().optional().describe("Limit number of tasks returned (default: 100)"),
      offset: z.number().optional().describe("Offset for pagination"),
    },
    async ({ columnId, assignedTo, title, limit, offset }) => {
      const queryString = buildQueryString({ columnId, assignedTo, title, limit, offset });
      const path = `task-list${queryString ? '?' + queryString : ''}`;
      
      const tasks = await makeYougileRequest<unknown>("GET", path);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(tasks, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "get_user_tasks",
    "Get ALL tasks assigned to a user. Uses assignedTo filter which works correctly for all projects.",
    {
      userId: z.string().describe("The user ID to get tasks for"),
      includeCompleted: z.boolean().optional().describe("Include completed tasks (default: false)"),
      includeArchived: z.boolean().optional().describe("Include archived tasks (default: false)"),
    },
    async ({ userId, includeCompleted = false, includeArchived = false }) => {
      // Use assignedTo filter directly - it works for all projects!
      const queryString = buildQueryString({ assignedTo: userId, limit: 500 });
      const response = await makeYougileRequest<ApiResponse<Task>>("GET", `task-list${queryString ? '?' + queryString : ''}`);
      
      const allTasks: Task[] = [];
      const tasks = response.content || [];
      
      for (const task of tasks) {
        // Filter by completion/archived status
        if (!includeCompleted && task.completed) continue;
        if (!includeArchived && task.archived) continue;
        allTasks.push(task);
      }
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            total: allTasks.length,
            tasks: allTasks,
          }, null, 2),
        }],
      };
    }
  );

  server.tool(
    "get_task",
    "Get a specific task by ID (supports both UUID and task code like SAI-515)",
    {
      id: z.string().describe("The ID or code of the task (e.g., 'SAI-515' or UUID)"),
    },
    async ({ id }) => {
      const task = await makeYougileRequest<unknown>("GET", `tasks/${id}`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(task, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "create_task",
    "Create a new task",
    {
      title: z.string().describe("The title of the task"),
      columnId: z.string().describe("The ID of the column to add the task to"),
      description: z.string().optional().describe("The description of the task"),
      assigned: z.array(z.string()).optional().describe("Array of user IDs to assign the task to"),
      stickers: z.record(z.string(), z.string()).optional().describe("Custom stickers as sticker ID → state ID"),
    },
    async ({ title, columnId, description, assigned, stickers }) => {
      const taskData: Partial<Task> = { 
        title,
        columnId
      };
      if (description) taskData.description = description;
      if (assigned) taskData.assigned = assigned;
      if (stickers) taskData.stickers = stickers;

      const result = await makeYougileRequest<Task>("POST", "tasks", taskData);
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
    "update_task",
    "Update an existing task",
    {
      id: z.string().describe("The ID of the task to update"),
      title: z.string().optional().describe("The new title of the task"),
      description: z.string().optional().describe("The new description of the task"),
      columnId: z.string().optional().describe("The new column ID for the task"),
      assigned: z.array(z.string()).optional().describe("Array of user IDs to assign the task to"),
      completed: z.boolean().optional().describe("Mark task as completed"),
      archived: z.boolean().optional().describe("Archive/unarchive the task"),
      stickers: z.record(z.string(), z.string()).optional().describe("Custom stickers as sticker ID → state ID. Use '-' to remove, sticker."),
    },
    async ({ id, title, description, columnId, assigned, completed, archived, stickers }) => {
      const taskData: Partial<Task> = {};
      if (title !== undefined) taskData.title = title;
      if (description !== undefined) taskData.description = description;
      if (columnId !== undefined) taskData.columnId = columnId;
      if (assigned !== undefined) taskData.assigned = assigned;
      if (completed !== undefined) taskData.completed = completed;
      if (archived !== undefined) taskData.archived = archived;
      if (stickers !== undefined) taskData.stickers = stickers;

      const result = await makeYougileRequest<Task>("PUT", `tasks/${id}`, taskData);
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
