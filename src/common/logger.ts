import { createWriteStream, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

// Debug logging is disabled by default
// Enable with YOUGILE_DEBUG=1 environment variable
const DEBUG_ENABLED = process.env.YOUGILE_DEBUG === '1';

const LOG_FILE_PATH = join(process.cwd(), 'yougile-mcp-debug.log');

let logStream: ReturnType<typeof createWriteStream> | null = null;

// Initialize log file with header only if debug is enabled
if (DEBUG_ENABLED) {
    if (!existsSync(LOG_FILE_PATH)) {
        writeFileSync(LOG_FILE_PATH, `# Yougile MCP Server Debug Log\n`);
        writeFileSync(LOG_FILE_PATH, `# Log started at: ${new Date().toISOString()}\n\n`);
    }
    logStream = createWriteStream(LOG_FILE_PATH, { flags: 'a' });
}

/**
 * Log an HTTP request to the debug log file
 * @param method - HTTP method (GET, POST, PUT, DELETE)
 * @param url - Full request URL
 * @param headers - Request headers
 * @param body - Optional request body
 */
export function logRequest(method: string, url: string, headers: Record<string, string>, body: any = null) {
  if (!DEBUG_ENABLED || !logStream) return;
  
  const timestamp = new Date().toISOString();
  const logEntry = `\n[${timestamp}] REQUEST\n`;
  logStream.write(logEntry);
  logStream.write(`Method: ${method}\n`);
  logStream.write(`URL: ${url}\n`);
  
  // Don't log sensitive headers like Authorization
  const safeHeaders = { ...headers };
  if (safeHeaders['Authorization']) {
    safeHeaders['Authorization'] = '[REDACTED - Authorization header hidden]';
  }
  logStream.write(`Headers: ${JSON.stringify(safeHeaders, null, 2)}\n`);
  
  if (body) {
    logStream.write(`Body: ${JSON.stringify(body, null, 2)}\n`);
  }
  logStream.write('---\n');
}

/**
 * Log an HTTP response to the debug log file
 * @param url - Request URL
 * @param status - HTTP status code
 * @param response - Response data
 */
export function logResponse(url: string, status: number, response: any) {
  if (!DEBUG_ENABLED || !logStream) return;
  
  const timestamp = new Date().toISOString();
  const logEntry = `\n[${timestamp}] RESPONSE\n`;
  logStream.write(logEntry);
  logStream.write(`URL: ${url}\n`);
  logStream.write(`Status: ${status}\n`);
  
  if (response) {
    logStream.write(`Response: ${JSON.stringify(response, null, 2)}\n`);
  }
  logStream.write('---\n');
}

/**
 * Log an error to the debug log file
 * @param url - Request URL that failed
 * @param error - Error object or message
 */
export function logError(url: string, error: any) {
  if (!DEBUG_ENABLED || !logStream) return;
  
  const timestamp = new Date().toISOString();
  const logEntry = `\n[${timestamp}] ERROR\n`;
  logStream.write(logEntry);
  logStream.write(`URL: ${url}\n`);
  logStream.write(`Error: ${error instanceof Error ? error.message : JSON.stringify(error)}\n`);
  
  if (error instanceof Error && error.stack) {
    logStream.write(`Stack: ${error.stack}\n`);
  }
  logStream.write('---\n');
}