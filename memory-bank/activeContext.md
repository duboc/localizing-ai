# Active Context

*This document tracks the current focus, recent changes, and immediate next steps.*

## Current Focus

-   Improving documentation and diagrams to better reflect the product flow.
-   Ensuring all components work together seamlessly in the defined flow.
-   Preparing for future enhancements to error handling and caching.

## Recent Changes

-   Created `src/prompts/` directory with localization criteria and prompt templates.
-   Set up Next.js project in `src/frontend/` with TypeScript and Material UI.
-   Implemented Google-like theme with Material UI components.
-   Created layout components (Header, Footer, Layout).
-   Implemented URL input form for Google Play app listings.
-   Created results page with tabbed interface for displaying audit results.
-   Set up API service with mock data for development.
-   Implemented navigation between home and results pages.
-   Created a new scraper API in `src/scraper/` using FastAPI and Playwright.
-   Implemented scraping logic to extract app information from Google Play listings.
-   Added language and country detection to the scraper API.
-   Updated the frontend to confirm language and country with the user.
-   Implemented the complete flow from URL submission to analysis results.
-   Fixed TypeScript and ESLint issues in the frontend code.
-   Integrated Vertex AI for analyzing app listing data using the prompt templates.
-   Enhanced the scraper API to extract more detailed information including:
     - Ratings distribution
     - In-app purchase details
     - Developer contact information
     - Privacy policy URL
     - App permissions
     - Supported devices and OS requirements
     - Update history
-   Updated the frontend API service to handle the enhanced data.
-   **Improved system documentation with detailed flow diagrams**:
     - Added sequence diagram showing the exact flow of operations
     - Added component interaction diagram showing how different parts work together
     - Added data flow diagram showing how information moves through the system
     - Updated the user flow documentation with more detailed steps
-   **Updated the main README.md** with comprehensive project information:
     - Added project overview and features
     - Included system flow diagram
     - Added project structure documentation
     - Provided detailed setup and installation instructions

## Next Steps

1.  Implement error handling and rate limiting in the scraper API:
    - Add retry mechanisms for transient failures
    - Implement proper error messages for different failure scenarios
    - Add rate limiting to avoid overloading the Google Play Store
2.  Add caching mechanism to avoid repeated scraping of the same app:
    - Implement a simple caching system based on app ID, language, and country
    - Set appropriate cache expiration times
    - Add cache invalidation mechanism
3.  Enhance the user interface with more visual feedback:
    - Add progress indicators during the scraping and analysis phases
    - Improve the language/country confirmation dialog with more information
    - Add visual indicators for the analysis results
4.  Implement export functionality for audit reports:
    - Add PDF export option
    - Add CSV export for tabular data
    - Add email sharing functionality
5.  Add more detailed recommendations based on audit results:
    - Provide specific examples of good practices
    - Include before/after examples for improvements
    - Add links to relevant resources

## Active Decisions & Considerations

-   Using Next.js with Material UI for the frontend to create a Google-like experience.
-   Using FastAPI and Playwright for the scraper API to handle dynamic content on Google Play.
-   Organizing localization criteria into categories (Content Quality, Language Quality, Visual Elements, Localization Specifics).
-   Using a tabbed interface for displaying different aspects of the audit results.
-   Implementing a service layer for API communication to make it easier to switch between mock data and real API.
-   Using environment variables for configuration to support different environments.
-   Separating the scraper API from the Vertex AI API to allow for independent scaling and maintenance.

## Learnings & Insights

-   Material UI provides a comprehensive set of components for creating a Google-like interface.
-   Next.js App Router provides a good structure for organizing pages and components.
-   Separating the API service from the components makes it easier to switch between mock data and real API.
-   Using TypeScript interfaces for API responses helps ensure type safety and better code completion.
-   Playwright is a powerful tool for scraping dynamic content from websites.
-   Structuring the project with separate services (frontend, scraper API, Vertex AI API) allows for better scalability and maintenance.
