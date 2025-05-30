# System Patterns

*This document describes the high-level architecture, technical decisions, and patterns.*

## Architecture Overview

The App Localization Audit Tool consists of three main components supporting both single app analysis and side-by-side comparison:

1. **Frontend (Next.js)**: User interface for submitting Google Play app URLs and viewing analysis results
2. **Scraper API (FastAPI)**: Service for extracting data from Google Play app listings
3. **Vertex AI API (FastAPI)**: Service for analyzing app listing data using Google Cloud Vertex AI (Gemini)

## System Architecture Diagrams

### Single App Analysis Architecture

```mermaid
graph TD
    User[User] --> Frontend[Next.js Frontend]
    
    %% Step 1: User submits URL
    Frontend -- 1. Submit Google Play URL --> ScraperAPI[Scraper API]
    
    %% Step 2: Scraper detects language/country and returns to frontend
    ScraperAPI -- 2. Detect language/country --> Frontend
    
    %% Step 3: User confirms language/country
    Frontend -- 3. User confirms language/country --> Frontend
    
    %% Step 4: Frontend requests full scraping
    Frontend -- 4. Request full scraping --> ScraperAPI
    
    %% Step 5: Scraper returns app data
    ScraperAPI -- 5. Return app data --> Frontend
    
    %% Step 6: Frontend stores data locally and displays to user
    Frontend -- 6. Store data locally --> Frontend
    
    %% Step 7: Frontend sends data to Vertex API for analysis
    Frontend -- 7. Send data for analysis --> VertexAPI[Vertex AI API]
    
    %% Step 8: Vertex API processes with vertex_libs.py
    VertexAPI -- Process --> VertexLib[vertex_libs.py]
    VertexLib -- SDK --> VertexAI[Google Cloud Vertex AI]
    VertexAI -- Response --> VertexLib
    VertexLib -- Return --> VertexAPI
    
    %% Step 9: Vertex API returns analysis to frontend
    VertexAPI -- 8. Return analysis --> Frontend
    
    %% Step 10: Frontend displays report to user
    Frontend -- 9. Display report --> User
    
    %% Component details
    subgraph "src/frontend"
        Frontend
    end
    
    subgraph "src/scraper"
        ScraperAPI
    end
    
    subgraph "src/api"
        VertexAPI
        VertexLib
    end
```

### Side-by-Side Comparison Architecture (New)

```mermaid
graph TD
    User[User] --> Frontend[Next.js Frontend]
    
    %% Step 1: User submits dual URLs
    Frontend -- 1. Submit Source & Target URLs --> Frontend
    
    %% Step 2: Parallel language/country detection
    Frontend -- 2a. Detect Source --> ScraperAPI[Scraper API]
    Frontend -- 2b. Detect Target --> ScraperAPI
    ScraperAPI -- 3a. Source Language/Country --> Frontend
    ScraperAPI -- 3b. Target Language/Country --> Frontend
    
    %% Step 3: User confirms settings
    Frontend -- 4. User confirms both settings --> Frontend
    
    %% Step 4: Parallel scraping
    Frontend -- 5a. Scrape Source --> ScraperAPI
    Frontend -- 5b. Scrape Target --> ScraperAPI
    ScraperAPI -- 6a. Source App Data --> Frontend
    ScraperAPI -- 6b. Target App Data --> Frontend
    
    %% Step 5: Comparison analysis
    Frontend -- 7. Send both datasets for comparison --> VertexAPI[Vertex AI API]
    VertexAPI -- 8. Load comparison prompts --> ComparisonPrompts[localization_comparison.md]
    VertexAPI -- 9. Process comparison --> VertexLib[vertex_libs.py]
    VertexLib -- SDK --> VertexAI[Google Cloud Vertex AI]
    VertexAI -- Response --> VertexLib
    VertexLib -- Return --> VertexAPI
    
    %% Step 6: Display comparison results
    VertexAPI -- 10. Return comparison analysis --> Frontend
    Frontend -- 11. Display side-by-side report --> User
    
    %% Component details
    subgraph "src/frontend"
        Frontend
        ComparisonForm[Comparison Form]
        DualPreview[Dual Preview]
        ComparisonResults[Comparison Results]
    end
    
    subgraph "src/scraper"
        ScraperAPI
        ParallelScraper[Parallel Scraping]
    end
    
    subgraph "src/api"
        VertexAPI
        VertexLib
    end
    
    subgraph "src/prompts"
        ComparisonPrompts
    end
```

### Sequence Diagrams

#### Single App Analysis Sequence

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant ScraperAPI
    participant VertexAPI
    participant VertexAI

    User->>Frontend: Enter Google Play URL
    Frontend->>ScraperAPI: POST /detect-language-country
    ScraperAPI-->>Frontend: Return detected language/country
    Frontend->>User: Display confirmation dialog
    User->>Frontend: Confirm or adjust language/country
    
    Frontend->>ScraperAPI: POST /scrape with URL, language, country
    ScraperAPI->>ScraperAPI: Extract app listing data
    ScraperAPI-->>Frontend: Return app listing data
    Frontend->>Frontend: Store data locally
    
    Frontend->>VertexAPI: POST /analyze-app-listing with app data
    VertexAPI->>VertexAPI: Load prompt templates and examples
    VertexAPI->>VertexAI: Send prompt with app data
    VertexAI-->>VertexAPI: Return analysis
    VertexAPI-->>Frontend: Return structured analysis results
    
    Frontend->>User: Display analysis report
```

#### Side-by-Side Comparison Sequence (New)

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant ScraperAPI
    participant VertexAPI
    participant VertexAI

    User->>Frontend: Enter Source URL (e.g., en-US)
    User->>Frontend: Enter Target URL (e.g., es-MX)
    
    par Parallel Language Detection
        Frontend->>ScraperAPI: POST /detect-language-country (source)
        ScraperAPI-->>Frontend: Return source language/country
    and
        Frontend->>ScraperAPI: POST /detect-language-country (target)
        ScraperAPI-->>Frontend: Return target language/country
    end
    
    Frontend->>User: Display dual confirmation dialog
    User->>Frontend: Confirm both language/country settings
    
    par Parallel Scraping
        Frontend->>ScraperAPI: POST /scrape (source URL, lang, country)
        ScraperAPI-->>Frontend: Return source app data
    and
        Frontend->>ScraperAPI: POST /scrape (target URL, lang, country)
        ScraperAPI-->>Frontend: Return target app data
    end
    
    Frontend->>Frontend: Store both datasets locally
    Frontend->>Frontend: Display dual preview
    User->>Frontend: Confirm & Analyze
    
    Frontend->>VertexAPI: POST /analyze-localization with both datasets
    VertexAPI->>VertexAPI: Load localization_comparison.md template
    VertexAPI->>VertexAI: Send comparison prompt with both datasets
    VertexAI-->>VertexAPI: Return comparison analysis
    VertexAPI-->>Frontend: Return structured comparison results
    
    Frontend->>User: Display side-by-side comparison report
```

### Component Interaction Diagrams

#### Enhanced Frontend Components (Updated)

```mermaid
graph TD
    subgraph "User Interface"
        A[Home Page] --> B[Single URL Form]
        A --> C[Comparison URL Form - NEW]
        A --> D[Language/Country Dialog]
        E[Results Page] --> F[Tabbed Interface]
        G[Comparison Results - NEW] --> H[Side-by-Side View]
        F --> I[Content Quality Tab]
        F --> J[Language Quality Tab]
        F --> K[Visual Elements Tab]
        H --> L[Translation Completeness]
        H --> M[Cultural Adaptation]
        H --> N[Visual Comparison]
    end
    
    subgraph "Frontend Services"
        O[API Service] --> P[detectLanguageCountry]
        O --> Q[scrapeAppListing]
        O --> R[analyzeAppUrl]
        O --> S[scrapeComparison - NEW]
        O --> T[analyzeLocalization - NEW]
    end
    
    subgraph "Backend APIs"
        U[Scraper API] --> V[/detect-language-country]
        U --> W[/scrape]
        U --> X[/scrape-comparison - NEW]
        Y[Vertex AI API] --> Z[/analyze-app-listing]
        Y --> AA[/analyze-localization - NEW]
        Z --> AB[Single Analysis Prompts]
        AA --> AC[Comparison Prompts]
    end
    
    B -- URL --> P
    C -- Dual URLs --> S
    D -- Confirmed Settings --> Q
    Q -- App Data --> R
    S -- Both Datasets --> T
    P -- API Call --> V
    Q -- API Call --> W
    S -- API Call --> X
    R -- API Call --> Z
    T -- API Call --> AA
    E -- Display Results --> F
    G -- Display Comparison --> H
```

### Data Flow Diagrams

#### Single App Data Flow

```mermaid
graph LR
    A[Google Play URL] --> B[Language/Country Detection]
    B --> C[User Confirmation]
    C --> D[App Listing Scraping]
    D --> E[App Listing Data]
    E --> F[Local Storage]
    E --> G[Vertex AI Analysis]
    G --> H[Structured Analysis Results]
    H --> I[Tabbed Report Display]
    
    subgraph "Frontend"
        A
        C
        F
        I
    end
    
    subgraph "Scraper API"
        B
        D
        E
    end
    
    subgraph "Vertex AI API"
        G
        H
    end
```

#### Side-by-Side Comparison Data Flow (New)

```mermaid
graph LR
    A[Source URL] --> B[Source Detection]
    C[Target URL] --> D[Target Detection]
    B --> E[Dual User Confirmation]
    D --> E
    E --> F[Parallel Scraping]
    F --> G[Source App Data]
    F --> H[Target App Data]
    G --> I[Local Storage]
    H --> I
    G --> J[Comparison Analysis]
    H --> J
    J --> K[Comparison Results]
    K --> L[Side-by-Side Display]
    
    subgraph "Frontend"
        A
        C
        E
        I
        L
    end
    
    subgraph "Scraper API"
        B
        D
        F
        G
        H
    end
    
    subgraph "Vertex AI API"
        J
        K
    end
```

## User Flows

### Single App Analysis Flow (Existing)

1. **URL Submission**:
   - User opens the frontend application
   - User pastes a Google Play app listing URL in the form
   - Frontend validates the URL format (must be a valid Google Play Store URL)
   - Frontend sends the URL to the Scraper API's `/detect-language-country` endpoint

2. **Language/Country Detection and Confirmation**:
   - Scraper API extracts language and country codes from the URL parameters
   - If not found in URL, defaults to 'en' and 'US'
   - Frontend displays a confirmation dialog with the detected language and country
   - User can confirm or adjust the language and country settings from dropdown menus
   - Upon confirmation, the frontend navigates to the results page with URL, language, and country parameters

3. **App Listing Scraping**:
   - Results page loads and calls the `analyzeAppUrl` function in the API service
   - This function first calls the Scraper API's `/scrape` endpoint with the URL, language, and country
   - Scraper API uses Playwright to load the Google Play page and extract data
   - Comprehensive data extraction includes:
     - Basic app details (title, developer, icon, rating, reviews)
     - Descriptions (short and long)
     - Visual elements (screenshots, feature graphic)
     - Ratings distribution
     - App metadata (size, version, installs, content rating)
     - Developer information (email, website)
     - Privacy policy URL
     - In-app purchases details
     - App permissions
     - Supported devices and OS requirements
     - Update history
     - User reviews and developer responses
     - Similar apps
   - Data is returned to the frontend and stored locally

4. **Analysis with Vertex AI**:
   - Frontend sends the scraped data to the Vertex AI API's `/analyze-app-listing` endpoint
   - Vertex AI API loads prompt templates from `src/prompts/prompt_templates/`
   - API also loads examples of good practices and common issues for context
   - API constructs a comprehensive prompt with the app listing data
   - Prompt is sent to Google Cloud Vertex AI (Gemini) with a structured JSON schema
   - Analysis is performed in the language specified during scraping
   - Results are returned to the frontend in a structured format with:
     - Overall score
     - Executive summary
     - Strengths and areas for improvement
     - Detailed assessments for content quality, language quality, and visual elements
     - Prioritized recommendations

5. **Report Display**:
   - Frontend displays the analysis results in a tabbed interface
   - Results are categorized into Content Quality, Language Quality, and Visual Elements
   - Each category shows detailed assessments with status, evidence, and explanations
   - Status is visually indicated (Pass, Needs Improvement, Fail)
   - Overall score is prominently displayed

### Side-by-Side Comparison Flow (New)

1. **Dual URL Submission**:
   - User navigates to the comparison section
   - User enters source app URL (e.g., English-US version)
   - User selects source language and country
   - User enters target app URL (e.g., Spanish-Mexico version)
   - User selects target language and country
   - Frontend validates both URLs

2. **Parallel Language/Country Detection**:
   - Frontend sends both URLs to `/detect-language-country` endpoint simultaneously
   - System detects language and country for both apps
   - Frontend displays dual confirmation dialog showing detected settings
   - User can adjust language/country for either app independently

3. **Dual Preview**:
   - Frontend calls `/scrape-comparison` endpoint with both URLs
   - Parallel scraping extracts data from both app listings
   - System displays side-by-side preview of both apps
   - User can review key elements before proceeding with analysis

4. **Comparison Analysis**:
   - User confirms and triggers analysis
   - Frontend sends both datasets to `/analyze-localization` endpoint
   - Vertex AI API loads `localization_comparison.md` prompt template
   - System performs comprehensive comparison analysis:
     - Translation completeness assessment
     - Translation quality evaluation
     - Cultural adaptation analysis
     - Technical localization review
     - Visual localization comparison
     - SEO/ASO optimization comparison

5. **Comparison Report Display**:
   - Frontend displays side-by-side comparison results
   - Color-coded differences highlight areas needing attention
   - Scoring system shows overall localization quality
   - Prioritized recommendations focus on highest-impact improvements
   - Export options available for sharing findings

## Key Technical Decisions

### Existing Decisions
-   **Microservices Architecture**: The application is divided into three separate services (frontend, scraper API, Vertex AI API) for better scalability and maintenance.
-   **Language/Country Detection**: The scraper API detects the language and country from the URL to ensure analysis is performed in the correct context.
-   **User Confirmation Step**: Users can confirm or adjust the detected language and country before proceeding with the analysis.
-   **Local Data Storage**: The frontend stores scraped data locally to reduce API calls and improve performance.
-   **Structured Prompt Templates**: Markdown-based prompt templates with placeholders for app data ensure consistent analysis.
-   **Example-Based Context**: Including examples of good practices and common issues improves the quality of AI analysis.
-   **JSON Schema Response**: Using a structured JSON schema for Vertex AI responses ensures consistent, parseable results.
-   **Fallback Mechanisms**: Mock data is used when APIs are unavailable to ensure the application remains functional.
-   **Material UI**: Google-like design for a familiar and intuitive user experience.
-   **Tabbed Interface**: Categorized results make it easier for users to understand different aspects of localization quality.

### New Decisions for Comparison Feature
-   **Parallel Processing**: Simultaneous scraping and processing of source and target apps for efficiency
-   **Dedicated Comparison Endpoints**: Separate API endpoints optimized for comparison workflows
-   **Reusable Prompt Templates**: Leveraging existing `localization_comparison.md` template for consistency
-   **Side-by-Side UI Pattern**: Split-screen interface for intuitive comparison visualization
-   **Independent Language Settings**: Allow different language/country settings for source and target
-   **Comparison-Specific Scoring**: Dedicated metrics for translation completeness and cultural adaptation
-   **Smart Element Alignment**: Automatically match corresponding elements between source and target

## Design Patterns

### Existing Patterns
-   **Microservices Architecture**: The application is divided into separate services with specific responsibilities.
-   **Proxy Pattern**: The FastAPI applications act as proxies to external services (Google Play Store, Vertex AI).
-   **Service Layer**: API services encapsulate the logic for interacting with external services.
-   **Repository Pattern**: Data storage and retrieval logic is separated from business logic.
-   **Dependency Injection**: FastAPI's built-in dependency injection for managing resources.
-   **Strategy Pattern**: Different prompt templates can be used for different types of analysis.
-   **Template Method Pattern**: The analysis process follows a consistent template with customizable parts.
-   **Adapter Pattern**: Converting between different data formats (e.g., API responses to UI-friendly structures).
-   **Observer Pattern**: Components react to state changes (e.g., loading states, error states).
-   **Facade Pattern**: The API service provides a simplified interface to the complex backend services.

### New Patterns for Comparison Feature
-   **Parallel Processing Pattern**: Simultaneous execution of similar operations for efficiency
-   **Comparison Strategy Pattern**: Different comparison algorithms for different content types
-   **Dual State Management**: Managing state for two independent but related datasets
-   **Alignment Algorithm Pattern**: Smart matching of corresponding elements between datasets

## Critical Implementation Paths

### Existing Paths
-   **Language/Country Detection**: Accurately detecting and confirming the language and country from the URL.
-   **Scraping Reliability**: Ensuring the scraper can reliably extract data from Google Play listings despite potential structure changes.
-   **Comprehensive Data Extraction**: Extracting detailed information from Google Play listings including ratings distribution, developer information, app permissions, etc.
-   **Prompt Engineering**: Creating effective prompt templates for Vertex AI to produce useful analysis.
-   **Structured Analysis Results**: Ensuring the analysis results are structured in a way that is easy to understand and actionable.
-   **Error Handling**: Robust error handling across all services to provide a smooth user experience.
-   **Performance Optimization**: Optimizing API calls and data storage to ensure responsive performance.
-   **Fallback Mechanisms**: Implementing fallback to mock data when APIs are unavailable to ensure the application remains functional.

### New Critical Paths for Comparison Feature
-   **Parallel Scraping Reliability**: Ensuring both source and target apps can be scraped simultaneously without conflicts
-   **Data Synchronization**: Maintaining consistency between parallel operations and data storage
-   **Comparison Algorithm Accuracy**: Correctly identifying and aligning corresponding elements between source and target
-   **Performance Under Load**: Handling the increased computational load of comparison analysis
-   **UI Responsiveness**: Maintaining smooth user experience during longer comparison operations
-   **Error Recovery**: Graceful handling when one of the parallel operations fails
-   **Memory Management**: Efficiently handling larger datasets from dual app listings
