/**
 * Shared TypeScript type definitions for Yougile API responses
 */

export interface CustomStatus {
  emoji?: string;
  text?: string;
}

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  messengerOnly?: boolean;
  customStatus?: CustomStatus;
  hasFakeEmail?: boolean;
}

/** Request-only field accepted by create endpoints to make retries safe */
export interface IdempotentCreate {
  idempotencyKey?: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  color?: string;
  departments?: Record<string, { manager?: string; member?: string } | "-">;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  assigned?: string[];
  completed?: boolean;
  archived?: boolean;
  stickers?: Record<string, string>;
  chatId?: string;
  extensionData?: Record<string, unknown>;
  properties?: Record<string, unknown>;
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  projectId: string;
}

export interface Column {
  id: string;
  title: string;
  description?: string;
  boardId: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  textHtml?: string;
  label?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface ApiResponse<T> {
  content?: T[];
  data?: T;
}

export interface FileUploadResponse {
  url?: string;
  fileUrl?: string;
}

export interface QueryParams {
  limit?: number;
  offset?: number;
  [key: string]: string | number | undefined;
}
