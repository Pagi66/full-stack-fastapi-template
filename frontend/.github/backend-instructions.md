# Backend Instructions and Integration Points

This document provides instructions and analysis for the backend of the full-stack application, along with suggestions for end-to-end integration.

## Backend Architecture (Inferred)

Based on the frontend code and project structure, the backend is inferred to be a Python application using the FastAPI framework.

*   **API:** The backend exposes a RESTful API.
*   **API Documentation:** The backend automatically generates an OpenAPI (formerly Swagger) specification, which is used to generate the frontend API client.
*   **Entry Point:** The main application entry point is likely `app/main.py`.

## API Endpoints (Inferred)

The following API endpoints are inferred from the frontend components and pages:

### Authentication

*   **`POST /api/v1/login`**: Authenticates a user and returns a token (likely JWT).
    *   **Integration:** Used by the `login.tsx` page.
*   **`POST /api/v1/signup`**: Creates a new user.
    *   **Integration:** Used by the `signup.tsx` page.
*   **`POST /api/v1/forgot-password`**: Initiates the password reset process.
    *   **Integration:** Used by the `forgot-password` component.

### User

*   **`GET /api/v1/users/me`**: Retrieves the profile of the currently authenticated user.
    *   **Integration:** Used by the `user-dashboard.tsx` page.

### Admin

*   **Endpoints under `/api/v1/admin/`**: A set of protected endpoints for administrative tasks.
    *   **Integration:** Used by the `admin-dashboard.tsx` page.

## End-to-End Integration

To achieve end-to-end integration between the frontend and backend, the following steps are required:

1.  **Run the Backend:** The backend server must be running.
2.  **Generate API Client:** The frontend API client needs to be generated from the backend's OpenAPI specification. This is a critical step to ensure the frontend and backend are in sync.

    To generate the client, run the following script from the `frontend` directory:

    ```bash
    ./scripts/generate-client.sh
    ```

3.  **Implement API Calls:** Use the generated API client in the frontend components to make calls to the backend API.

## Action Required

To confirm the above analysis and get a complete picture of the backend API, please run the `generate-client.sh` script. This will create an `openapi.json` file in the `frontend` directory. Once this file is available, I can provide a more detailed and accurate analysis of the backend and its integration with the frontend.
