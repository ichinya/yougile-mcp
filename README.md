# Yougile MCP Server

The Yougile MCP Server brings the power of Model Context Protocol (MCP) to Yougile, allowing AI agents and developer
tools to interact programmatically with your Yougile workspace.

## Features

- **Type-Safe**: Built with TypeScript for enhanced reliability and maintainability
- **Well-Documented**: Comprehensive JSDoc comments for all exported functions
- **Refactored**: Shared helper functions reduce code duplication
- **Modern Dependencies**: Updated to latest stable versions (Yargs v18, Zod v4, ESLint v10)

## What can you do with it?

This server unlocks all sorts of useful capabilities for anyone working with Yougile:

- Manage projects (get, create, update)
- Manage tasks (get, create, update, assign)
- Manage users (invite, get details, update)
- Manage boards and columns
- Update task statuses and move tasks between columns
- Build smart apps that interact naturally with Yougile

## Prerequisites

- Node.js 20.19 or higher
- A Yougile account with appropriate permissions
- An API key for your Yougile company

## Getting Your Yougile API Key

### Method 1: Using Yougile Configurator (Recommended)

The easiest way to get your API key is through the built-in Yougile configurator.

**How to open the configurator:**
- Press `Ctrl + ~` in the Yougile app, **or**
- Go to the Projects page → click the gear icon ⚙️ next to your company name → select "Configure" (Настроить)

Once in the configurator:
1. Navigate to API settings
2. Generate or copy your API key

### Method 2: Using cURL

You can get your API key programmatically using the following cURL command:

```bash
curl -X POST "https://yougile.com/api-v2/auth/keys" \
  -H "Content-Type: application/json" \
  -d '{
    "login": "your_email@example.com",
    "password": "your_password",
    "companyId": "your_company_id"
  }'
```

Note: This creates a new API key. Make sure to save the returned API key securely.

### Method 3: Get existing API keys

To retrieve your existing API keys:

```bash
curl -X POST "https://yougile.com/api-v2/auth/keys/get" \
  -H "Content-Type: application/json" \
  -d '{
    "login": "your_email@example.com",
    "password": "your_password"
  }'
```

### Getting Company ID

You'll need your Company ID for some API operations. Here are the ways to get it:

**Keyboard Shortcut (Recommended)**
- Press `Ctrl + Alt + Q` (Windows/Linux) or `Ctrl + Option + Q` (Mac) in Yougile
- The Company ID will appear on screen and automatically copy to your clipboard

**Via API**
- Use the `/api-v2/auth/companies` endpoint with your login credentials to list all your companies

## Installation

1. Clone or download this repository
2. Install dependencies:

```bash
npm install
```

3. Build the server:

```bash
npm run build
```

## Configuration

### MCP Configuration

The server is configured through the global MCP configuration file. Update the configuration with your API key:

```json
{
  "mcpServers": {
    "yougile-mcp": {
      "command": "node",
      "args": [
        "D:\\Projects\\yougile-mcp\\yougile.cjs"
      ],
      "env": {
        "YOUGILE_API_KEY": "your_actual_api_key_here"
      },
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

For Claude Desktop or other MCP-compatible tools, you can add Yougile by updating your global MCP configuration file (
typically located at `C:\Users\{username}\.kilocode\globalStorage\kilo code.kilo-code\settings\mcp_settings.json`):

```json
{
  "mcpServers": {
    "yougile-mcp": {
      "command": "node",
      "args": [
        "D:\\Projects\\yougile-mcp\\yougile.cjs"
      ],
      "env": {
        "YOUGILE_API_KEY": "your_actual_api_key_here"
      }
    }
  }
}
```

Alternatively, if you prefer to manage your API key through system environment variables:

```json
{
  "mcpServers": {
    "yougile-mcp": {
      "command": "node",
      "args": [
        "D:\\Projects\\yougile-mcp\\yougile.cjs"
      ],
      "env": {
        "YOUGILE_API_KEY": "${env.YOUGILE_API_KEY}"
      }
    }
  }
}
```

### Troubleshooting

If you experience "MCP error -32000: Connection closed" when working with different projects:

1. Make sure the server file extension is `.cjs` (CommonJS) rather than `.js` (ES modules) to properly support
   `__dirname`
2. Ensure that the path in your MCP configuration points to `yougile.cjs` and not `yougile.js`
3. If the problem persists, check that your global MCP configuration is properly set up
4. Restart your MCP client (Claude Desktop, KiloCode, etc.) after making configuration changes

### Environment Variables

- `YOUGILE_API_KEY` - Your Yougile API token (required)
- `YOUGILE_API_HOST_URL` (optional) - The host URL of the Yougile API Server. Defaults to https://yougile.com/api-v2/
- `YOUGILE_USER_ID` (optional) - Default user ID for `yougile tasks my`
- `YOUGILE_USER_EMAIL` (optional) - Default user email for `yougile tasks my`
- `YOUGILE_DEBUG` (optional) - Set to `1` to enable debug logging. Logs are written to `yougile-mcp-debug.log` in the current working directory. Disabled by default.

## Available Tools

### Users

- `get_users` - Get all users in the company
- `get_user` - Get a specific user by ID
- `create_user` - Invite a user to the company
- `update_user` - Update an existing user
- `delete_user` - Remove a user from the company

### Projects

- `get_projects` - Get all projects for the current user
- `get_project` - Get a specific project by ID
- `create_project` - Create a new project
- `update_project` - Update an existing project

### Tasks

- `get_tasks` - Get tasks list with filters (columnId, assignedTo, title). **Note: projectId filter is NOT supported by YouGile API!**
- `get_user_tasks` - Get ALL tasks assigned to a user (recommended for complete task list)
- `get_task` - Get a specific task by ID (supports both UUID and task code like "SAI-515")
- `create_task` - Create a new task
- `update_task` - Update an existing task (supports completed, archived flags)

### Boards

- `get_boards` - Get all boards in the company
- `get_board` - Get a specific board by ID
- `create_board` - Create a new board
- `update_board` - Update an existing board

### Columns

- `get_columns` - Get all columns in a board
- `get_column` - Get a specific column by ID
- `create_column` - Create a new column
- `update_column` - Update an existing column

### Task Chat/Comments

- `get_task_chat` - Get chat messages/comments for a specific task
- `send_task_message` - Send a message/comment to a specific task's chat
- `get_task_messages` - Get messages/comments for a specific task (alternative method)

## Usage

### Claude Desktop

You can add Yougile to Claude Desktop by updating your MCP configuration file:

```json
{
  "mcpServers": {
    "yougile-mcp": {
      "command": "node",
      "args": [
        "path/to/yougile.js"
      ],
      "env": {
        "YOUGILE_API_KEY": "${env.YOUGILE_API_KEY}"
      }
    }
  }
}
```

### Command Line

To run the server directly:

```bash
npm run serve
```

## CLI Usage

YouGile CLI allows you to interact with YouGile from the command line.

### Installation

```bash
# Clone and install
git clone <repo-url>
cd yougile-mcp
npm install
npm run build
npm link

# Or run directly
YOUGILE_API_KEY=your_key node build/cli.js --help
```

### Setup

Create a `.env` file in the project root:

```
YOUGILE_API_KEY=your_api_key_here
YOUGILE_USER_ID=your_user_id_here
# or
YOUGILE_USER_EMAIL=your_email@example.com
```

Or set the environment variable:

```bash
export YOUGILE_API_KEY=your_api_key_here
```

### Available Commands

```bash
# Projects
yougile projects list                    # List all projects
yougile projects get <id>                # Get project by ID
yougile projects create --title "..."    # Create a new project

# Tasks
yougile tasks list                       # List tasks
yougile tasks list --assignedTo <userId> # Filter by user
yougile tasks list --columnId <id>       # Filter by column
yougile tasks list --title "..."         # Filter by title
yougile tasks my --userId <userId>      # List active tasks for a specific user
yougile tasks my --email "..."          # Resolve user by email, then list tasks
yougile tasks get <id>                   # Get task by ID or code (e.g., SAI-515)
yougile tasks create --title "..." --columnId <id>
yougile tasks update <id> --title "..." --completed
yougile tasks complete <id>              # Mark task as completed

# Users
yougile users list                       # List all users
yougile users list --email "..."         # Filter by email

# Boards
yougile boards list                      # List all boards
yougile boards list --projectId <id>     # Filter by project
yougile boards get <id>                  # Get board by ID

# Columns
yougile columns list <boardId>           # List columns in a board

# Chat
yougile chat get <taskId>                # Get task chat messages
yougile chat send <taskId> "message"     # Send message to task chat
```

### Examples

```bash
# List all projects
yougile projects list

# Get a specific task by code
yougile tasks get SAI-515

# Create a new task
yougile tasks create --title "New feature" --columnId "abc-123" --description "Task description"

# Update task title and mark as completed
yougile tasks update SAI-515 --title "Updated title" --completed true

# List tasks assigned to a configured user
yougile tasks my --email "user@example.com"

# Send a message to task chat
yougile chat send SAI-515 "Comment from CLI"
```

## Development

To build the TypeScript code:

```bash
npm run build
```

To run in development mode with auto-rebuild:

```bash
npm run dev
```

## API Coverage

This MCP server implements **~30%** of the YouGile API v2.0 endpoints.

### ⚠️ Important API Notes

1. **`projectId` filter is NOT supported** by YouGile API for `get_tasks`! Use `columnId` or `assignedTo` instead.
2. **`assignedTo` filter works correctly** for all projects when querying tasks.
3. **Task codes like "SAI-515" work** in `get_task` - the API accepts both UUID and task codes.
4. Use `get_user_tasks` for a complete list of user's tasks across all projects.

### ✅ Implemented (22 tools)

#### Users (5 methods)
- `get_users` - Get all users
- `get_user` - Get user by ID
- `create_user` - Invite user to company
- `update_user` - Update user
- `delete_user` - Remove user from company

#### Projects (4 methods)
- `get_projects` - Get all projects
- `get_project` - Get project by ID
- `create_project` - Create project
- `update_project` - Update project

#### Tasks (6 methods)
- `get_tasks` - Get tasks with filters (columnId, assignedTo, title). **Note: projectId NOT supported!**
- `get_user_tasks` - Get ALL tasks assigned to a user (recommended for complete list)
- `get_task` - Get task by ID (supports UUID and task codes like "SAI-515")
- `create_task` - Create task
- `update_task` - Update task (supports completed, archived flags)

#### Boards (4 methods)
- `GET /api-v2/boards` - Get all boards
- `GET /api-v2/boards/{id}` - Get board by ID
- `POST /api-v2/boards` - Create board
- `PUT /api-v2/boards/{id}` - Update board

#### Columns (4 methods)
- `GET /api-v2/columns` - Get all columns
- `GET /api-v2/columns/{id}` - Get column by ID
- `POST /api-v2/columns` - Create column
- `PUT /api-v2/columns/{id}` - Update column

#### Task Chat (3 methods)
- `GET /api-v2/chats/{chatId}/messages` - Get task chat messages
- `POST /api-v2/chats/{chatId}/messages` - Send message to task chat
- `GET /api-v2/chats/{chatId}/messages` - Get task messages (alternative)

### ❌ Not Implemented (45+ endpoints)

#### Auth
- Companies list, API keys management (create, list, delete)

#### Companies
- Get company details, update company

#### Departments
- Full CRUD operations for departments

#### Project Roles
- Full CRUD operations for project roles

#### Stickers
- String stickers (with states) - full CRUD
- Sprint stickers - full CRUD
- Sticker states management

#### Group Chats
- Full CRUD operations for group chats

#### Webhooks
- Create, list, update webhooks

#### Files
- File upload functionality

#### CRM
- Contact persons management
- External ID lookup

#### Additional
- Task chat subscribers management
- Delete operations for tasks, boards, columns

## API Documentation

For more details about the Yougile API endpoints, see the OpenAPI specification at `docs/open-api-v2.json`.

## License

This project is licensed under the MIT License.
