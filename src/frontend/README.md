# App Localization Audit Tool - Frontend

This is the frontend application for the App Localization Audit Tool, built with Next.js and Material UI.

## Overview

The App Localization Audit Tool helps developers improve their Google Play app listings for global markets by analyzing localization quality. The frontend provides a user-friendly interface for submitting Google Play app URLs and viewing detailed localization audit results.

## Features

- Google-like Material Design UI
- URL input form for Google Play app listings
- Language and country detection and confirmation
- Detailed audit results with categorized findings
- Tabbed interface for different aspects of localization quality

## Technologies Used

- **Next.js**: React framework for building the UI
- **TypeScript**: For type safety and better developer experience
- **Material UI**: Component library with Google-like design
- **Axios**: HTTP client for API communication

## Project Structure

```
src/frontend/
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── page.tsx     # Home page with URL input form and language/country confirmation
│   │   └── results/     # Results page for displaying audit results
│   ├── components/      # Reusable React components
│   │   ├── forms/       # Form components
│   │   └── layout/      # Layout components (Header, Footer, etc.)
│   ├── services/        # API services
│   │   └── api.ts       # Service for communicating with backend APIs
│   └── theme/           # Material UI theme configuration
└── .env.local           # Environment variables
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd src/frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Configuration

Create a `.env.local` file in the `src/frontend` directory with the following variables:

```
NEXT_PUBLIC_VERTEX_API_URL=http://localhost:8000
NEXT_PUBLIC_SCRAPER_API_URL=http://localhost:8001
NEXT_PUBLIC_APP_NAME=App Localization Audit Tool
```

### Running the Development Server

```bash
# Navigate to the frontend directory
cd src/frontend

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building and Running for Production

```bash
# Build the application
npm run build

# Start the production server
npm start
```

Note: If you encounter ESLint errors during the build process, you can either:
1. Fix the errors in the code
2. Add ESLint disable comments for specific rules
3. Run the development server instead with `npm run dev`

## User Flow

1. **URL Submission**:
   - User opens the application
   - User enters a Google Play app listing URL
   - Frontend sends the URL to the Scraper API for language and country detection

2. **Language/Country Confirmation**:
   - Scraper API detects the language and country from the URL
   - Frontend displays a confirmation dialog with the detected language and country
   - User can confirm or adjust the language and country settings

3. **App Listing Scraping**:
   - Frontend sends the URL, language, and country to the Scraper API
   - Scraper API extracts app information in the specified language and country
   - Frontend receives the app listing data

4. **Analysis**:
   - Frontend sends the app listing data to the Vertex AI API for analysis
   - Vertex AI API analyzes the data using the prompt templates
   - Frontend receives the analysis results

5. **Results Display**:
   - Frontend displays the analysis results in a tabbed interface
   - Results are categorized by Content Quality, Language Quality, and Visual Elements

## Development

### Adding New Components

1. Create a new component in the appropriate directory under `src/components/`
2. Import and use the component in your pages or other components

### API Integration

The application uses a service layer for API communication. The API service is defined in `src/services/api.ts`. It provides functions for:

- Detecting language and country from a Google Play app listing URL
- Scraping a Google Play app listing with specified language and country
- Analyzing a Google Play app listing URL

Currently, it uses mock data for the analysis part, but it can be easily switched to use the real Vertex AI API when it's ready.

### Styling

The application uses Material UI for styling. The theme is defined in `src/theme/theme.ts`. You can customize the theme to match your design requirements.

## Next Steps

- Implement the backend API for scraping Google Play app listings
- Integrate with Vertex AI for analyzing app listing data
- Add export functionality for audit reports
- Implement user authentication and history tracking
