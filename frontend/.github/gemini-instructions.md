# Gemini Instructions

This document provides instructions for the Gemini AI assistant to follow when working on this project.

## Code Style

*   **Formatting:** This project uses Prettier for code formatting. Before committing any changes, run `npx prettier --write .` to ensure the code is formatted correctly.
*   **TypeScript:** The project is written in TypeScript. Adhere to the types defined in the `types` directory and any inline types. Follow existing coding style and conventions.
*   **Class Names:** Use the `cx` utility from `src/utils/cx.ts` for conditional class names.

## Component Structure

*   Components are organized into the following directories:
    *   `src/components/application`
    *   `src/components/base`
    *   `src/components/foundations`
    *   `src/components/marketing`
    *   `src/components/shared-assets`
*   When creating a new component, place it in the most appropriate directory based on its function.
*   Follow the structure and patterns of existing components.

## API Interaction

*   The project uses a generated API client.
*   If you make changes to the backend API, you need to regenerate the client by running the `scripts/generate-client.sh` script.

## Testing

*   The project uses Playwright for end-to-end testing.
*   Tests are run in a containerized environment using Docker.
*   To run tests, use the `scripts/test.sh` or `scripts/test-local.sh` scripts.

## Committing

*   Follow the commit message format used in the project's history.
*   The `sync-components.yml` workflow uses a specific format for commits and PRs related to component synchronization. When performing a sync, adhere to this format.

## General

*   **Responsive Design:** Use the `use-breakpoint` hook from `src/hooks/use-breakpoint.ts` for creating responsive components.
*   **File Paths:** Always use absolute paths when referring to files in tool calls. The project root is `C:\Users\HP\Projects\full-stack-fastapi-template\frontend`.
