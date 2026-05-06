import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import axios from "axios";

import { makeYougileRequest } from "../common/request-helper.js";

export const registerTaskChatTools = (server: McpServer) => {
  server.tool(
    "get_task_chat",
    "Get chat messages for a specific task",
    {
      taskId: z.string().describe("The ID of the task to get chat messages for (use the task UUID)"),
      limit: z.number().optional().describe("Limit number of messages returned"),
      offset: z.number().optional().describe("Offset for pagination"),
    },
    async ({ taskId, limit, offset }) => {
      try {
        // Build query parameters for pagination
        let queryString = '';
        if (limit !== undefined || offset !== undefined) {
          const params = new URLSearchParams();
          if (limit !== undefined) params.append('limit', limit.toString());
          if (offset !== undefined) params.append('offset', offset.toString());
          queryString = '?' + params.toString();
        }

        // Use the correct Yougile API endpoint: /api-v2/chats/{taskId}/messages
        const path = `chats/${taskId}/messages${queryString}`;
        const messages = await makeYougileRequest("GET", path);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(messages, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [
            {
              type: "text",
              text: `Error retrieving chat messages: ${errorMessage}`,
            },
          ],
        };
      }
    }
  );

  server.tool(
    "send_task_message",
    "Send a message to a specific task's chat. For images/files, upload first then use text='/root/#file:/user-data/.../file.jpg'",
    {
      taskId: z.string().describe("The ID of the task to send the message to (use the task UUID)"),
      text: z.string().describe("The message text. For files: /root/#file:/user-data/.../file.jpg"),
      textHtml: z.string().optional().describe("HTML formatted message (optional, rarely needed)"),
      label: z.string().optional().describe("Quick link label (optional)"),
    },
    async ({ taskId, text, textHtml, label }) => {
      try {
        const messageData: any = { 
          text,
          textHtml: textHtml || "",
          label: label || ""
        };
        
        const result = await makeYougileRequest("POST", `chats/${taskId}/messages`, messageData);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [
            {
              type: "text",
              text: `Error sending message: ${errorMessage}`,
            },
          ],
        };
      }
    }
  );

  server.tool(
    "update_task_message",
    "Edit an existing chat message in a task. Use to update a previously sent status/summary message instead of posting a new one.",
    {
      taskId: z.string().describe("The ID of the task containing the message (use the task UUID)"),
      messageId: z.union([z.string(), z.number()]).describe("The ID of the message to edit (numeric id from get_task_chat)"),
      text: z.string().describe("New message text"),
      textHtml: z.string().optional().describe("HTML formatted message (optional)"),
      label: z.string().optional().describe("Quick link label (optional)"),
    },
    async ({ taskId, messageId, text, textHtml, label }) => {
      try {
        const messageData: any = {
          text,
          textHtml: textHtml || "",
          label: label || "",
        };
        const result = await makeYougileRequest(
          "PUT",
          `chats/${taskId}/messages/${messageId}`,
          messageData,
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return {
          content: [
            {
              type: "text",
              text: `Error updating message: ${errorMessage}`,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "send_task_file",
    "Upload a file and send it to task chat in one step. Handles the /root/#file: prefix automatically.",
    {
      taskId: z.string().describe("The ID of the task to send the file to (use the task UUID)"),
      filePath: z.string().describe("Local path to the file to upload and send"),
      caption: z.string().optional().describe("Optional caption text before the file"),
    },
    async ({ taskId, filePath, caption }) => {
      try {
        // First upload the file
        const hostUrl = process.env.YOUGILE_API_HOST_URL || "https://yougile.com/api-v2/";
        const host = hostUrl.endsWith("/") ? hostUrl : `${hostUrl}`;
        const uploadUrl = `${host}upload-file`;
        
        const headers: Record<string, string> = {
          "Authorization": `Bearer ${process.env.YOUGILE_API_KEY || ""}`,
        };

        const formData = new FormData();
        const fileContent = fs.readFileSync(filePath);
        const fileName = path.basename(filePath);
        formData.append("file", new Blob([fileContent]), fileName);

        const uploadResponse = await axios.post(uploadUrl, formData, {
          headers: {
            ...headers,
            "Content-Type": "multipart/form-data",
          },
        });

        const fileUrl = uploadResponse.data.url || uploadResponse.data.fileUrl;
        
        if (!fileUrl) {
          throw new Error("Failed to get file URL from upload response");
        }

        // Then send message with file
        const messageText = caption 
          ? `${caption}\n/root/#file:${fileUrl}`
          : `/root/#file:${fileUrl}`;
        
        const messageData = { 
          text: messageText,
          textHtml: "",
          label: ""
        };
        
        const result = await makeYougileRequest("POST", `chats/${taskId}/messages`, messageData) as any;
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                fileUrl,
                messageId: result?.id,
              }, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: false,
                error: errorMessage,
              }, null, 2),
            },
          ],
        };
      }
    }
  );

  server.tool(
    "get_task_messages",
    "Get messages for a specific task (alternative method)",
    {
      taskId: z.string().describe("The ID of the task to get messages for (use the task UUID)"),
      limit: z.number().optional().describe("Limit number of messages returned"),
      offset: z.number().optional().describe("Offset for pagination"),
    },
    async ({ taskId, limit, offset }) => {
      try {
        // Build query parameters for pagination
        let queryString = '';
        if (limit !== undefined || offset !== undefined) {
          const params = new URLSearchParams();
          if (limit !== undefined) params.append('limit', limit.toString());
          if (offset !== undefined) params.append('offset', offset.toString());
          queryString = '?' + params.toString();
        }

        // Alternative method using the correct endpoint
        const path = `chats/${taskId}/messages${queryString}`;
        const messages = await makeYougileRequest("GET", path);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(messages, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [
            {
              type: "text",
              text: `Error retrieving messages: ${errorMessage}`,
            },
          ],
        };
      }
    }
  );
};
