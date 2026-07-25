# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Type-safe TypeScript interfaces in `src/types/index.ts` for all API responses
- `buildQueryString` helper function to reduce code duplication across tools
- JSDoc comments to all exported functions for better documentation
- CONTRIBUTING.md with development guidelines
- Enhanced type safety with proper return types on all functions
- Shared type definitions for User, Project, Task, Board, Column, ChatMessage, ApiResponse, FileUploadResponse, and QueryParams

### Changed
- Updated Yargs from v17 to v18
- Updated Zod from v3 to v4
- Updated ESLint from v9 to v10
- Updated @types/node to v26
- Refactored query parameter building to use shared helper function
- Replaced `any` types with proper TypeScript interfaces across all tool files
- Removed unused imports (fs, path) from files where they weren't needed

### Fixed
- File upload response type handling to ensure string return type
- TypeScript compilation issues with MCP SDK response types

## [1.1.0] - Previous Release

### Added
- Initial MCP server implementation
- CLI tool for Yougile API interaction
- Support for users, projects, tasks, boards, columns, and task chat
- File upload functionality
- Debug logging support
