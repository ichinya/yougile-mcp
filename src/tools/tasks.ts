import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { makeYougileRequest } from "../common/request-helper.js";
import { buildQueryString } from "../common/helpers.js";
import type { Task, ApiResponse, IdempotentCreate } from "../types/index.js";

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
      subtasks: z.array(z.string()).optional().describe("Array of task IDs to attach as subtasks"),
      idempotencyKey: z.string().optional().describe("Idempotency key: retrying the request with the same key returns the already created task instead of duplicating it"),
    },
    async ({ title, columnId, description, assigned, stickers, subtasks, idempotencyKey }) => {
      const taskData: Partial<Task> & IdempotentCreate = {
        title,
        columnId
      };
      if (description) taskData.description = description;
      if (assigned) taskData.assigned = assigned;
      if (stickers) taskData.stickers = stickers;
      if (subtasks) taskData.subtasks = subtasks;
      if (idempotencyKey) taskData.idempotencyKey = idempotencyKey;

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
      subtasks: z.array(z.string()).optional().describe("Array of subtask IDs to set on this task (replaces existing subtasks)"),
    },
    async ({ id, title, description, columnId, assigned, completed, archived, stickers, subtasks }) => {
      const taskData: Partial<Task> = {};
      if (title !== undefined) taskData.title = title;
      if (description !== undefined) taskData.description = description;
      if (columnId !== undefined) taskData.columnId = columnId;
      if (assigned !== undefined) taskData.assigned = assigned;
      if (completed !== undefined) taskData.completed = completed;
      if (archived !== undefined) taskData.archived = archived;
      if (stickers !== undefined) taskData.stickers = stickers;
      if (subtasks !== undefined) taskData.subtasks = subtasks;

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

  server.tool(
    "add_subtask",
    "Add a subtask to a parent task. Reads the parent, appends the child ID to its subtasks and updates the parent",
    {
      parentTaskId: z.string().describe("The ID of the parent task"),
      childTaskId: z.string().describe("The ID of the task to attach as a subtask"),
    },
    async ({ parentTaskId, childTaskId }) => {
      const parentTask = await makeYougileRequest<Task>("GET", `tasks/${parentTaskId}`);
      const currentSubtasks = parentTask.subtasks ?? [];

      if (currentSubtasks.includes(childTaskId)) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                message: "Child task is already a subtask of the parent",
                parentTaskId,
                childTaskId,
                subtasks: currentSubtasks,
              }, null, 2),
            },
          ],
        };
      }

      const update: Partial<Task> = { subtasks: [...currentSubtasks, childTaskId] };
      const result = await makeYougileRequest<Task>("PUT", `tasks/${parentTaskId}`, update);
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
    "get_subtasks",
    "Get subtasks of a task: their IDs and the details of each subtask",
    {
      taskId: z.string().describe("The ID of the parent task"),
    },
    async ({ taskId }) => {
      const task = await makeYougileRequest<Task>("GET", `tasks/${taskId}`);
      const subtaskIds = task.subtasks ?? [];

      const subtasks = await Promise.all(
        subtaskIds.map(async (id): Promise<Task | { id: string; error: string }> => {
          try {
            return await makeYougileRequest<Task>("GET", `tasks/${id}`);
          } catch {
            return { id, error: "Failed to fetch subtask details" };
          }
        })
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              parentTaskId: taskId,
              subtaskCount: subtasks.length,
              subtasks,
            }, null, 2),
          },
        ],
      };
    }
  );
};
