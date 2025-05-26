# Project Brief: Vertex AI Interaction API and Frontend

## Core Goal

Develop a system consisting of:
1.  A backend API (using FastAPI) located in `src/api/` that acts as a proxy to Google Cloud Vertex AI (specifically targeting Gemini models). This API will receive various payload types (text, images) via HTTP requests and utilize the `src/api/vertex_libs.py` library to interact with the Vertex AI service.
2.  A frontend application (planned using React) located in `src/frontend/` that will eventually interact with the backend API.

## Initial Focus

The primary focus for now is building the FastAPI endpoint within the `src/api/` directory.

## Key Components

*   **Project Structure**: Code organized within a `src/` directory, containing `api/` and `frontend/` subdirectories. The `memory-bank/` resides at the project root.
*   **FastAPI Application (`src/api/main.py`)**: The core web server handling incoming requests.
*   **Vertex AI Interaction Logic (`src/api/vertex_libs.py`)**: Library for Vertex AI communication.
*   **API Endpoint (`/analyze` in `src/api/main.py`)**: Accepts POST requests with flexible payloads.
*   **Payload Handling**: API receives and interprets data (text, images) for `vertex_libs.py`.
*   **Response Handling**: API returns Vertex AI response to the client.

## Future Goals

*   Develop the React frontend application in `src/frontend/`.
*   Expand the API capabilities as needed.
