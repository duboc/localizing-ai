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
-   **Comparison Analysis**: Enhanced support for side-by-side localization comparison using `localization_comparison.md` template

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
-   **Parallel Processing**: Support for simultaneous scraping of source and target app listings
-   **Concurrency**: asyncio for efficient parallel operations

### Frontend

-   **Language**: TypeScript
-   **Framework**: Next.js (React-based framework)
-   **UI Library**: Material UI (MUI) for Google-like design
-   **Styling**: Emotion (CSS-in-JS library used by MUI)
-   **HTTP Client**: Axios for API communication
-   **State Management**: React hooks (useState, useEffect)
-   **Routing**: Next.js App Router
-   **Comparison UI**: Side-by-side layout components for dual app display
-   **Diff Visualization**: Color-coded difference highlighting for comparison results

## Development Setup

### Vertex AI API

-   **Python Environment**: Recommended to use a virtual environment (e.g., `venv`, `conda`) to manage dependencies.
-   **Installation**: Dependencies managed via `pip` and `src/api/requirements.txt`.
-   **Running the API**: `uvicorn src.api.main:app --reload` (typical command during development).
-   **Cloud Authentication**: Needs Google Cloud authentication set up in the development environment (e.g., `gcloud auth application-default login`).
-   **Comparison Testing**: Use `/docs` endpoint to test new comparison analysis endpoints.

### Scraper API

-   **Python Environment**: Recommended to use a virtual environment.
-   **Installation**: Dependencies managed via `pip` and `src/scraper/requirements.txt`.
-   **Playwright Setup**: After installing dependencies, run `playwright install chromium`.
-   **Running the API**: `uvicorn src.scraper.main:app --reload --port 8001`.
-   **Parallel Testing**: Test concurrent scraping operations for comparison feature.

### Frontend

-   **Node.js Environment**: Node.js and npm for package management.
-   **Installation**: Dependencies managed via npm and `package.json`.
-   **Running the Frontend**: `npm run dev` in the `src/frontend` directory.
-   **Environment Variables**: Configured in `.env.local` file.
-   **Component Development**: Use Storybook or similar for isolated component development (recommended for comparison components).

## Technical Constraints

### Existing Constraints
-   Relies on Google Cloud Platform and Vertex AI availability and quotas.
-   Network latency between the API server and Vertex AI.
-   Payload size limits for HTTP requests and Vertex AI inputs.
-   Cross-Origin Resource Sharing (CORS) considerations for API communication.
-   Google Play Store structure may change over time, requiring updates to the scraping logic.
-   Rate limiting by Google Play Store may affect scraping performance.

### New Constraints for Comparison Feature
-   **Parallel Processing Limits**: Browser concurrency limits may affect simultaneous scraping
-   **Memory Usage**: Handling dual datasets increases memory requirements
-   **Processing Time**: Comparison analysis takes longer than single app analysis
-   **API Rate Limits**: Doubled API calls for parallel operations may hit rate limits faster
-   **Data Synchronization**: Ensuring consistency between parallel scraping operations
-   **Error Handling Complexity**: Managing partial failures in dual operations

## Deployment

### Vertex AI API

-   **Containerization**: Docker (Dockerfile provided at `src/api/Dockerfile`)
-   **Target Platform**: Primarily Google Cloud Run, but the Docker image could be used elsewhere.
-   **Scaling Considerations**: May need increased CPU/memory for comparison analysis workloads.

### Scraper API

-   **Containerization**: Docker (Dockerfile provided at `src/scraper/Dockerfile`)
-   **Target Platform**: Google Cloud Run or other container hosting services.
-   **Considerations**: Needs headless browser support for Playwright.
-   **Scaling for Parallel Operations**: May require additional resources for concurrent scraping.

### Frontend

-   **Static Site Generation**: Next.js supports static site generation and server-side rendering.
-   **Deployment Options**: Vercel (optimal for Next.js), Netlify, or other static hosting services.
-   **Performance Optimization**: Consider code splitting for comparison feature components.

## Dependencies

### Vertex AI API

-   **Python Runtime**: Python 3.11 (as specified in Dockerfile)
-   **Python Packages**: `fastapi`, `uvicorn[standard]`, `google-cloud-aiplatform` (see `src/api/requirements.txt` for full list).
-   **System Packages**: Potentially others if needed for specific Python libraries (managed within Dockerfile).
-   **New Dependencies for Comparison**: No additional dependencies required - leverages existing infrastructure.

### Scraper API

-   **Python Runtime**: Python 3.11 (as specified in Dockerfile)
-   **Python Packages**: `fastapi`, `uvicorn`, `playwright`, `beautifulsoup4`, `lxml`, `httpx`, `aiohttp` (see `src/scraper/requirements.txt` for full list).
-   **System Packages**: Additional system dependencies for Playwright (managed within Dockerfile).
-   **Concurrency Libraries**: Built-in `asyncio` for parallel processing support.

### Frontend

-   **Node.js**: v18+ recommended
-   **npm Packages**: 
    -   `next`: Next.js framework
    -   `react`, `react-dom`: React library
    -   `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`: Material UI and its dependencies
    -   `axios`: HTTP client for API requests
    -   TypeScript and related type definitions
-   **Additional Packages for Comparison**: 
    -   Consider adding libraries for advanced diff visualization if needed
    -   Potential performance optimization libraries for handling larger datasets

## API Endpoints

### Existing Endpoints

#### Scraper API
-   `POST /detect-language-country` - Detect language and country from app URL
-   `POST /scrape` - Extract comprehensive app listing data
-   `GET /health` - Health check endpoint

#### Vertex AI API
-   `POST /analyze-app-listing` - Analyze single app listing
-   `GET /health` - Health check endpoint

### New Endpoints for Comparison Feature

#### Scraper API (Planned)
-   `POST /scrape-comparison` - Parallel scraping of source and target apps
-   `POST /detect-comparison-languages` - Detect languages for both apps simultaneously

#### Vertex AI API (Planned)
-   `POST /analyze-localization` - Compare source and target app listings
-   `POST /analyze-localization-batch` - Batch comparison for multiple app pairs

## Tool Usage Patterns

### Development Tools
-   FastAPI's automatic Swagger UI (`/docs`) and ReDoc (`/redoc`) for API testing and documentation during development.
-   Next.js development server with hot reloading for frontend development.
-   Environment variables for configuration in different environments.
-   TypeScript for type safety and better developer experience.

### Testing Patterns for Comparison Feature
-   **Unit Testing**: Test individual comparison functions with mock data
-   **Integration Testing**: Test full comparison flow with real app URLs
-   **Performance Testing**: Measure parallel processing performance vs sequential
-   **Error Handling Testing**: Test partial failure scenarios in dual operations
-   **UI Testing**: Test side-by-side interface with various screen sizes

## Performance Considerations

### Existing Performance Patterns
-   Local storage for scraped data to reduce API calls
-   Structured prompt templates for consistent AI analysis
-   Material UI components for optimized rendering

### New Performance Considerations for Comparison
-   **Parallel Processing**: Simultaneous API calls reduce total processing time
-   **Memory Management**: Efficient handling of dual datasets
-   **Caching Strategy**: Cache results for both source and target apps independently
-   **Progressive Loading**: Load and display results as they become available
-   **Error Recovery**: Graceful degradation when one operation fails
-   **UI Optimization**: Virtual scrolling for large comparison results

## Security Considerations

### API Security
-   Environment variables for sensitive configuration
-   CORS configuration for frontend-backend communication
-   Input validation using Pydantic models

### Comparison Feature Security
-   **Parallel Request Validation**: Ensure both URLs are validated independently
-   **Rate Limiting**: Implement per-user limits for comparison operations
-   **Data Isolation**: Ensure comparison results don't leak between users
-   **Error Information**: Avoid exposing sensitive system information in error messages

## Monitoring and Observability

### Recommended Additions for Comparison Feature
-   **Performance Metrics**: Track comparison operation duration
-   **Success/Failure Rates**: Monitor parallel operation reliability
-   **Resource Usage**: Monitor memory and CPU usage during dual operations
-   **User Experience Metrics**: Track user engagement with comparison feature
-   **Error Analysis**: Categorize and track comparison-specific errors
