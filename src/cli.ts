#!/usr/bin/env node
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { makeYougileRequest } from "./common/request-helper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env"), quiet: true });

// Check API key
if (!process.env.YOUGILE_API_KEY) {
  console.error("Error: YOUGILE_API_KEY environment variable is not set.");
  console.error("Set it via: export YOUGILE_API_KEY=your_key");
  console.error("Or create a .env file with: YOUGILE_API_KEY=your_key");
  process.exit(1);
}

// Helper to output result
function output(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

type UserSummary = {
  id: string;
  email?: string;
};

async function resolveTaskUserId(
  userIdArg?: string,
  emailArg?: string,
): Promise<string> {
  const configuredUserId = userIdArg || process.env.YOUGILE_USER_ID;
  if (configuredUserId) {
    return configuredUserId;
  }

  const email = emailArg || process.env.YOUGILE_USER_EMAIL;
  if (!email) {
    throw new Error(
      "For 'yougile tasks my', specify --userId, --email, YOUGILE_USER_ID, or YOUGILE_USER_EMAIL.",
    );
  }

  const params = new URLSearchParams({
    email,
    limit: "2",
  });
  const result = await makeYougileRequest<{ content?: UserSummary[] }>(
    "GET",
    `users?${params.toString()}`,
  );
  const users = result.content || [];
  const exactMatches = users.filter(
    (user) => user.email?.toLowerCase() === email.toLowerCase(),
  );

  if (exactMatches.length === 1) {
    return exactMatches[0].id;
  }

  if (users.length === 1) {
    return users[0].id;
  }

  if (users.length === 0) {
    throw new Error(`No user found for email '${email}'.`);
  }

  throw new Error(
    `Multiple users matched email '${email}'. Pass --userId explicitly.`,
  );
}

async function main(): Promise<void> {
  const rawArgv = hideBin(process.argv);

  await yargs(rawArgv)
    .scriptName("yougile")
    .strict()
    .demandCommand(1)
    .help()
    .alias("h", "help")

    // PROJECTS commands
    .command("projects", "Manage projects", (yargs) => {
      return yargs
        .demandCommand(1)
        .command("list", "List all projects", {}, async () => {
          const result = await makeYougileRequest("GET", "projects");
          output(result);
        })
        .command("get <id>", "Get project by ID", {}, async (argv) => {
          const result = await makeYougileRequest("GET", `projects/${argv.id}`);
          output(result);
        })
        .command(
          "create",
          "Create a new project",
          {
            title: {
              type: "string",
              demandOption: true,
              describe: "Project title",
            },
            description: { type: "string", describe: "Project description" },
            color: { type: "string", describe: "Project color (hex)" },
          },
          async (argv) => {
            const data: Record<string, unknown> = { title: argv.title };
            if (argv.description) data.description = argv.description;
            if (argv.color) data.color = argv.color;
            const result = await makeYougileRequest("POST", "projects", data);
            output(result);
          },
        );
    })

    // TASKS commands
    .command("tasks", "Manage tasks", (yargs) => {
      return yargs
        .demandCommand(1)
        .command(
          "list",
          "List tasks",
          {
            assignedTo: {
              type: "string",
              describe: "Filter by user ID(s), comma-separated",
            },
            columnId: { type: "string", describe: "Filter by column ID" },
            title: {
              type: "string",
              describe: "Filter by task title (partial match)",
            },
            limit: { type: "number", describe: "Limit results", default: 100 },
            offset: { type: "number", describe: "Offset for pagination" },
          },
          async (argv) => {
            const params = new URLSearchParams();
            if (argv.assignedTo)
              params.append("assignedTo", argv.assignedTo as string);
            if (argv.columnId)
              params.append("columnId", argv.columnId as string);
            if (argv.title) params.append("title", argv.title as string);
            if (argv.limit)
              params.append("limit", (argv.limit as number).toString());
            if (argv.offset)
              params.append("offset", (argv.offset as number).toString());
            const query = params.toString();
            const result = await makeYougileRequest(
              "GET",
              `task-list${query ? "?" + query : ""}`,
            );
            output(result);
          },
        )
        .command(
          "my",
          "List tasks for the configured user",
          {
            userId: {
              type: "string",
              describe: "User ID. Falls back to YOUGILE_USER_ID.",
            },
            email: {
              type: "string",
              describe: "User email. Falls back to YOUGILE_USER_EMAIL.",
            },
            completed: {
              type: "boolean",
              describe: "Include completed tasks",
              default: false,
            },
            archived: {
              type: "boolean",
              describe: "Include archived tasks",
              default: false,
            },
          },
          async (argv) => {
            const userId = await resolveTaskUserId(
              argv.userId as string | undefined,
              argv.email as string | undefined,
            );
            const tasksResult = await makeYougileRequest<{
              content: Array<{ completed?: boolean; archived?: boolean }>;
            }>("GET", `task-list?assignedTo=${userId}&limit=500`);
            let tasks = tasksResult.content || [];
            if (!argv.completed)
              tasks = tasks.filter(
                (t: { completed?: boolean }) => !t.completed,
              );
            if (!argv.archived)
              tasks = tasks.filter((t: { archived?: boolean }) => !t.archived);
            output({ userId, total: tasks.length, tasks });
          },
        )
        .command(
          "get <id>",
          "Get task by ID or code (e.g., SAI-515)",
          {},
          async (argv) => {
            const result = await makeYougileRequest("GET", `tasks/${argv.id}`);
            output(result);
          },
        )
        .command(
          "create",
          "Create a new task",
          {
            title: {
              type: "string",
              demandOption: true,
              describe: "Task title",
            },
            columnId: {
              type: "string",
              demandOption: true,
              describe: "Column ID",
            },
            description: { type: "string", describe: "Task description" },
            assigned: {
              type: "string",
              describe: "User IDs to assign (comma-separated)",
            },
          },
          async (argv) => {
            const data: Record<string, unknown> = {
              title: argv.title,
              columnId: argv.columnId,
            };
            if (argv.description) data.description = argv.description;
            if (argv.assigned)
              data.assigned = (argv.assigned as string)
                .split(",")
                .map((s) => s.trim());
            const result = await makeYougileRequest("POST", "tasks", data);
            output(result);
          },
        )
        .command(
          "update <id>",
          "Update a task",
          {
            title: { type: "string", describe: "New task title" },
            description: { type: "string", describe: "New task description" },
            columnId: { type: "string", describe: "Move to column" },
            assigned: {
              type: "string",
              describe: "User IDs to assign (comma-separated)",
            },
            completed: { type: "boolean", describe: "Mark as completed" },
            archived: { type: "boolean", describe: "Archive/unarchive" },
          },
          async (argv) => {
            const data: Record<string, unknown> = {};
            if (argv.title !== undefined) data.title = argv.title;
            if (argv.description !== undefined)
              data.description = argv.description;
            if (argv.columnId !== undefined) data.columnId = argv.columnId;
            if (argv.assigned !== undefined)
              data.assigned = (argv.assigned as string)
                .split(",")
                .map((s) => s.trim());
            if (argv.completed !== undefined) data.completed = argv.completed;
            if (argv.archived !== undefined) data.archived = argv.archived;
            const result = await makeYougileRequest(
              "PUT",
              `tasks/${argv.id}`,
              data,
            );
            output(result);
          },
        )
        .command(
          "complete <id>",
          "Mark task as completed",
          {},
          async (argv) => {
            const result = await makeYougileRequest("PUT", `tasks/${argv.id}`, {
              completed: true,
            });
            output(result);
          },
        );
    })

    // USERS commands
    .command("users", "Manage users", (yargs) => {
      return yargs.demandCommand(1).command(
        "list",
        "List all users",
        {
          email: { type: "string", describe: "Filter by email" },
          projectId: { type: "string", describe: "Filter by project ID" },
          limit: { type: "number", describe: "Limit results" },
        },
        async (argv) => {
          const params = new URLSearchParams();
          if (argv.email) params.append("email", argv.email as string);
          if (argv.projectId)
            params.append("projectId", argv.projectId as string);
          if (argv.limit)
            params.append("limit", (argv.limit as number).toString());
          const query = params.toString();
          const result = await makeYougileRequest(
            "GET",
            `users${query ? "?" + query : ""}`,
          );
          output(result);
        },
      );
    })

    // BOARDS commands
    .command("boards", "Manage boards", (yargs) => {
      return yargs
        .demandCommand(1)
        .command(
          "list",
          "List all boards",
          {
            projectId: { type: "string", describe: "Filter by project ID" },
            title: { type: "string", describe: "Filter by title" },
            limit: { type: "number", describe: "Limit results" },
          },
          async (argv) => {
            const params = new URLSearchParams();
            if (argv.projectId)
              params.append("projectId", argv.projectId as string);
            if (argv.title) params.append("title", argv.title as string);
            if (argv.limit)
              params.append("limit", (argv.limit as number).toString());
            const query = params.toString();
            const result = await makeYougileRequest(
              "GET",
              `boards${query ? "?" + query : ""}`,
            );
            output(result);
          },
        )
        .command("get <id>", "Get board by ID", {}, async (argv) => {
          const result = await makeYougileRequest("GET", `boards/${argv.id}`);
          output(result);
        });
    })

    // COLUMNS commands
    .command("columns", "Manage columns", (yargs) => {
      return yargs.demandCommand(1).command(
        "list <boardId>",
        "List columns in a board",
        {
          title: { type: "string", describe: "Filter by title" },
        },
        async (argv) => {
          const params = new URLSearchParams();
          params.append("boardId", argv.boardId as string);
          if (argv.title) params.append("title", argv.title as string);
          const result = await makeYougileRequest(
            "GET",
            `columns?${params.toString()}`,
          );
          output(result);
        },
      );
    })

    // CHAT commands
    .command("chat", "Task chat operations", (yargs) => {
      return yargs
        .demandCommand(1)
        .command(
          "get <taskId>",
          "Get task chat messages",
          {
            limit: { type: "number", describe: "Limit results", default: 50 },
          },
          async (argv) => {
            const task = await makeYougileRequest<{ chatId?: string }>(
              "GET",
              `tasks/${argv.taskId}`,
            );
            if (!task.chatId) {
              console.error("Task has no chat");
              return;
            }
            const result = await makeYougileRequest(
              "GET",
              `chats/${task.chatId}/messages?limit=${argv.limit}`,
            );
            output(result);
          },
        )
        .command(
          "send <taskId> <text>",
          "Send message to task chat",
          {},
          async (argv) => {
            const task = await makeYougileRequest<{ chatId?: string }>(
              "GET",
              `tasks/${argv.taskId}`,
            );
            if (!task.chatId) {
              console.error("Task has no chat");
              return;
            }
            const result = await makeYougileRequest(
              "POST",
              `chats/${task.chatId}/messages`,
              { text: argv.text },
            );
            output(result);
          },
        );
    })

    .parse();
}

main().catch((err: Error) => {
  console.error("Error:", err.message);
  process.exit(1);
});
