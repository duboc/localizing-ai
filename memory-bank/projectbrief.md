# Project Brief: App Localization Audit Tool

## Core Goal

Develop a comprehensive app localization audit system consisting of:
1.  A **Vertex AI API** (using FastAPI) located in `src/api/` that acts as a proxy to Google Cloud Vertex AI (specifically targeting Gemini models) for analyzing app listing data.
2.  A **Scraper API** (using FastAPI) located in `src/scraper/` that extracts comprehensive data from Google Play app listings.
3.  A **Frontend application** (using Next.js) located in `src/frontend/` that provides:
    - Single app listing analysis
    - **Side-by-Side Comparison** between source and target app listings
    - Comprehensive localization quality reports

## Primary Features

### Single App Analysis
- Analyze individual Google Play app listings for localization quality
- Comprehensive evaluation across content, language, and visual elements
- Actionable recommendations for improvement

### Side-by-Side Comparison (New Feature)
- Compare source app listing with its localized version
- Dual URL input for source and target markets
- Translation completeness and quality assessment
- Cultural adaptation evaluation
- Visual localization comparison
- Prioritized recommendations based on comparison findings

## Current Focus

The system is now evolving to support **Side-by-Side Comparison** functionality, enabling users to:
1. Input source and target app URLs
2. Preview both listings side-by-side
3. Receive detailed comparison analysis
4. Get specific recommendations for localization improvements

## Key Components

### Project Structure
*   Code organized within a `src/` directory, containing `api/`, `scraper/`, and `frontend/` subdirectories
*   The `memory-bank/` resides at the project root
*   Prompt templates in `src/prompts/` for structured AI analysis

### Backend APIs
*   **Vertex AI API (`src/api/main.py`)**: Handles analysis requests using Google Cloud Vertex AI
*   **Scraper API (`src/scraper/main.py`)**: Extracts app listing data from Google Play Store
*   **Vertex AI Interaction Logic (`src/api/vertex_libs.py`)**: Library for Vertex AI communication

### API Endpoints
*   **Single Analysis**: `/analyze-app-listing` - Analyzes individual app listings
*   **Comparison Analysis**: `/analyze-localization` - Compares source and target listings
*   **Scraping**: `/scrape` - Extracts app data, `/detect-language-country` - Language detection

### Frontend Application
*   **Next.js with TypeScript**: Modern React-based frontend
*   **Material UI**: Google-like design system
*   **Comparison Interface**: Side-by-side preview and analysis
*   **Results Display**: Tabbed interface for different analysis categories

## Implementation Phases

### Phase 1: Frontend Updates (In Progress)
- Enhanced URL input form for dual app comparison
- Dual preview page showing source and target side-by-side
- Comparison results page with color-coded differences

### Phase 2: Backend Enhancements (Planned)
- Scraper API updates for parallel scraping
- Vertex AI API updates for comparison analysis
- Integration with existing `localization_comparison.md` prompt template

### Phase 3: Analysis Features (Planned)
- Translation completeness scoring
- Cultural adaptation assessment
- Visual localization evaluation
- SEO/ASO optimization comparison

## Future Goals

*   Export functionality for comparison reports (PDF, CSV)
*   Advanced caching for improved performance
*   Historical comparison tracking
*   Integration with app store optimization tools
