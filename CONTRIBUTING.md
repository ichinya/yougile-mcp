# Contributing to Yougile MCP Server

Thank you for your interest in contributing to the Yougile MCP Server!

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```

## Development Workflow

### Running in Development Mode

For auto-rebuild during development:
```bash
npm run dev
```

### Building

To build the TypeScript code:
```bash
npm run build
```

### Testing

Run the test suite:
```bash
npm test
```

### Code Style

This project uses ESLint and Prettier for code formatting:
```bash
npm run lint
```

## Project Structure

```
yougile-mcp/
├── src/
│   ├── common/           # Shared utilities (logger, request helper, helpers)
│   ├── tools/            # MCP tool implementations
│   ├── types/           # TypeScript type definitions
│   ├── cli.ts           # Command-line interface
│   ├── server.ts        # MCP server setup
│   └── index.ts         # Entry point
├── docs/                # API documentation
├── package.json
└── tsconfig.json
```

## Adding New Tools

1. Create a new file in `src/tools/` (e.g., `new-feature.ts`)
2. Export a `register*Tools` function that takes an `McpServer` instance
3. Import and register the tool in `src/tools/index.ts`
4. Add type definitions to `src/types/index.ts` if needed
5. Add JSDoc comments to all exported functions
6. Test the tool implementation

## Type Safety

- Use the shared types from `src/types/index.ts`
- Avoid `any` types - use proper TypeScript interfaces
- Add return types to all functions
- Use `Partial<T>` for optional update operations

## Code Duplication

- Use the `buildQueryString` helper from `src/common/helpers.ts` for query parameters
- Keep similar logic in shared utility functions
- Follow existing patterns in tool implementations

## Submitting Changes

1. Create a new branch for your feature
2. Make your changes following the guidelines above
3. Ensure the build passes: `npm run build`
4. Run linting: `npm run lint`
5. Submit a pull request with a clear description of your changes

## Questions?

Feel free to open an issue for any questions or suggestions.
