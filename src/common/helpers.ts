/**
 * Helper functions to reduce code duplication across tools
 */

import type { QueryParams } from "../types/index.js";

/**
 * Build query parameters string from an object
 * @param params - Object containing query parameters
 * @returns URL-encoded query string (without leading '?')
 */
export function buildQueryString(params: QueryParams): string {
  const queryParams = new URLSearchParams();
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, value.toString());
    }
  }
  
  return queryParams.toString();
}
