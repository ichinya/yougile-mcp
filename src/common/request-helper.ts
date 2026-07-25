import axios, { AxiosRequestConfig } from "axios";
import { logRequest, logResponse, logError } from "./logger.js";

/**
 * Make an authenticated request to the Yougile API
 * @param method - HTTP method (GET, POST, PUT, DELETE)
 * @param path - API endpoint path (e.g., "users", "tasks/123")
 * @param body - Request body for POST/PUT requests
 * @returns Typed response data from the API
 * @throws Error if the request fails
 */
export async function makeYougileRequest<T>(method: string, path: string, body: any = null): Promise<T> {
  const hostUrl = process.env.YOUGILE_API_HOST_URL || "https://yougile.com/api-v2/";
  const host = hostUrl.endsWith("/") ? hostUrl : `${hostUrl}`;
  const url = `${host}${path}`;
  const headers: Record<string, string> = {
    "Authorization": `Bearer ${process.env.YOUGILE_API_KEY || ""}`,
  };

  // Add Content-Type for non-GET requests
  if (method.toUpperCase() !== 'GET') {
    headers["Content-Type"] = "application/json";
  }

  // Log the request
  logRequest(method, url, headers, body);

  try {
    const config: AxiosRequestConfig = {
      url,
      method,
      headers,
    };

    // Only include body for non-GET requests
    if (method.toUpperCase() !== 'GET' && body !== null) {
      config.data = body;
    }

    const response = await axios(config);
    
    // Log the response
    logResponse(url, response.status, response.data);
    
    return response.data;
  } catch (error) {
    // Log the error
    logError(url, error);
    
    if (axios.isAxiosError(error)) {
      throw new Error(`Request failed: ${error.message}`);
    }
    throw error;
  }
}