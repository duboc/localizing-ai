# Tech Context

*This document details the technologies, setup, constraints, and dependencies.*

## Technologies Used

### Vertex AI API

-   **Language**: Python 3.x
-   **Framework**: FastAPI
-   **Web Server**: Uvicorn (standard for FastAPI development)
-   **AI Service**: Google Cloud Vertex AI (specifically Gemini models)
-   **Vertex AI SDK**: `google-cloud-aiplatform` Python library
-   **Data Handling**: Pydantic (via FastAPI) for request/response modeling and validation
-   **JSON Schema**: Structured JSON schema for consistent analysis results
-   **Prompt Templates**: Markdown templates for comprehensive app listing analysis

### Scraper API

-   **Language**: Python 3.x
-   **Framework**: FastAPI
-   **Web Server**: Uvicorn
-   **Web Scraping**: Playwright (headless browser automation)
-   **HTML Parsing**: BeautifulSoup4 with lxml parser
-   **HTTP Client**: httpx, aiohttp for asynchronous requests
-   **Data Handling**: Pydantic for request/response modeling and validation
-   **Regular Expressions**: For extracting specific data patterns from HTML content
-   **Language/Country Detection**: Logic for detecting language and country from URLs

### Frontend

-   **Language**: TypeScript
-   **Framework**: Next.js (React-based framework)
-   **UI Library**: Material UI (MUI) for Google-like design
-   **Styling**: Emotion (CSS-in-JS library used by MUI)
-   **HTTP Client**: Axios for API communication
-   **State Management**: React hooks (useState, useEffect)
-   **Routing**: Next.js App Router

## Development Setup

### Vertex AI API

-   **Python Environment**: Recommended to use a virtual environment (e.g., `venv`, `conda`) to manage dependencies.
-   **Installation**: Dependencies managed via `pip` and `src/api/requirements.txt`.
-   **Running the API**: `uvicorn src.api.main:app --reload` (typical command during development).
-   **Cloud Authentication**: Needs Google Cloud authentication set up in the development environment (e.g., `gcloud auth application-default login`).

### Scraper API

-   **Python Environment**: Recommended to use a virtual environment.
-   **Installation**: Dependencies managed via `pip` and `src/scraper/requirements.txt`.
-   **Playwright Setup**: After installing dependencies, run `playwright install chromium`.
-   **Running the API**: `uvicorn src.scraper.main:app --reload --port 8001`.

### Frontend

-   **Node.js Environment**: Node.js and npm for package management.
-   **Installation**: Dependencies managed via npm and `package.json`.
-   **Running the Frontend**: `npm run dev` in the `src/frontend` directory.
-   **Environment Variables**: Configured in `.env.local` file.

## Technical Constraints

-   Relies on Google Cloud Platform and Vertex AI availability and quotas.
-   Network latency between the API server and Vertex AI.
-   Payload size limits for HTTP requests and Vertex AI inputs.
-   Cross-Origin Resource Sharing (CORS) considerations for API communication.
-   Google Play Store structure may change over time, requiring updates to the scraping logic.
-   Rate limiting by Google Play Store may affect scraping performance.

## Deployment

### Vertex AI API

-   **Containerization**: Docker (Dockerfile provided at `src/api/Dockerfile`)
-   **Target Platform**: Primarily Google Cloud Run, but the Docker image could be used elsewhere.

### Scraper API

-   **Containerization**: Docker (Dockerfile provided at `src/scraper/Dockerfile`)
-   **Target Platform**: Google Cloud Run or other container hosting services.
-   **Considerations**: Needs headless browser support for Playwright.

### Frontend

-   **Static Site Generation**: Next.js supports static site generation and server-side rendering.
-   **Deployment Options**: Vercel (optimal for Next.js), Netlify, or other static hosting services.

## Dependencies

### Vertex AI API

-   **Python Runtime**: Python 3.11 (as specified in Dockerfile)
-   **Python Packages**: `fastapi`, `uvicorn[standard]`, `google-cloud-aiplatform` (see `src/api/requirements.txt` for full list).
-   **System Packages**: Potentially others if needed for specific Python libraries (managed within Dockerfile).

### Scraper API

-   **Python Runtime**: Python 3.11 (as specified in Dockerfile)
-   **Python Packages**: `fastapi`, `uvicorn`, `playwright`, `beautifulsoup4`, `lxml`, `httpx`, `aiohttp` (see `src/scraper/requirements.txt` for full list).
-   **System Packages**: Additional system dependencies for Playwright (managed within Dockerfile).

### Frontend

-   **Node.js**: v18+ recommended
-   **npm Packages**: 
    -   `next`: Next.js framework
    -   `react`, `react-dom`: React library
    -   `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`: Material UI and its dependencies
    -   `axios`: HTTP client for API requests
    -   TypeScript and related type definitions

## Tool Usage Patterns

-   FastAPI's automatic Swagger UI (`/docs`) and ReDoc (`/redoc`) for API testing and documentation during development.
-   Next.js development server with hot reloading for frontend development.
-   Environment variables for configuration in different environments.
-   TypeScript for type safety and better developer experience.
