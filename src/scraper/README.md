# Google Play Scraper API

This is a FastAPI-based API for scraping Google Play app listings. It extracts detailed information about apps from their Google Play Store listings.

## Features

- Scrapes app details from Google Play Store listings
- Extracts comprehensive app information including:
  - Basic details (title, developer, icon, rating, reviews)
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
- Supports language and country detection from URLs
- Uses Playwright for reliable scraping of dynamic content
- Provides a simple REST API for integration with other services

## Requirements

- Python 3.8+
- FastAPI
- Playwright
- BeautifulSoup4
- Other dependencies listed in `requirements.txt`

## Installation

### Local Development

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Install Playwright browsers:
   ```bash
   playwright install chromium
   ```

4. Run the API:
   ```bash
   uvicorn main:app --reload --port 8001
   ```

### Docker

1. Build the Docker image:
   ```bash
   docker build -t google-play-scraper .
   ```

2. Run the container:
   ```bash
   docker run -p 8001:8001 google-play-scraper
   ```

## API Endpoints

### Health Check

```
GET /health
```

Returns the health status of the API.

### Detect Language and Country

```
POST /detect-language-country
```

Request body:
```json
{
  "url": "https://play.google.com/store/apps/details?id=com.example.app"
}
```

Response:
```json
{
  "language": "en",
  "country": "US",
  "url": "https://play.google.com/store/apps/details?id=com.example.app&hl=en-US&gl=US",
  "detected_from_url": true
}
```

### Scrape App Listing

```
POST /scrape
```

Request body:
```json
{
  "url": "https://play.google.com/store/apps/details?id=com.example.app",
  "language": "en",
  "country": "US"
}
```

Response (simplified example):
```json
{
  "app_id": "com.example.app",
  "url": "https://play.google.com/store/apps/details?id=com.example.app",
  "language": "en",
  "country": "US",
  "title": "Example App",
  "developer": "Example Developer",
  "icon_url": "https://play-lh.googleusercontent.com/...",
  "rating": 4.5,
  "reviews_count": 10000,
  "ratings_distribution": {
    "5": 7500,
    "4": 1500,
    "3": 500,
    "2": 300,
    "1": 200
  },
  "short_description": "This is a short description",
  "long_description": "This is a longer description...",
  "screenshots": [
    {
      "url": "https://play-lh.googleusercontent.com/...",
      "alt_text": "Screenshot 1"
    }
  ],
  "feature_graphic": "https://play-lh.googleusercontent.com/...",
  "last_updated": "March 1, 2023",
  "size": "15 MB",
  "installs": "1,000,000+",
  "version": "1.0.0",
  "content_rating": "Everyone",
  "contains_ads": true,
  "in_app_purchases": true,
  "in_app_purchase_details": ["$0.99 - $9.99 per item"],
  "developer_email": "developer@example.com",
  "developer_website": "https://example.com",
  "privacy_policy_url": "https://example.com/privacy",
  "app_permissions": ["Camera", "Location", "Storage"],
  "supported_devices": ["Phone", "Tablet"],
  "min_os_version": "5.0",
  "update_history": [
    {
      "date": "March 1, 2023",
      "description": "Bug fixes and performance improvements"
    }
  ],
  "user_reviews": [
    {
      "author": "John Doe",
      "rating": 5.0,
      "date": "March 1, 2023",
      "text": "Great app!"
    }
  ],
  "developer_responses": [
    {
      "date": "March 2, 2023",
      "text": "Thank you for your feedback!"
    }
  ],
  "similar_apps": [
    {
      "name": "Similar App",
      "url": "https://play.google.com/store/apps/details?id=com.similar.app"
    }
  ]
}
```

## Integration with Frontend

This API is designed to be used with the App Localization Audit Tool frontend. The integration flow is as follows:

1. The frontend sends a Google Play app URL to the `/detect-language-country` endpoint
2. The API detects the language and country from the URL and returns them to the frontend
3. The frontend displays a confirmation dialog to the user, allowing them to adjust the language and country if needed
4. The frontend sends the URL, language, and country to the `/scrape` endpoint
5. The API scrapes the app listing in the specified language and country and returns the data to the frontend
6. The frontend uses the data for analysis and displays the results to the user

## Error Handling

The API returns appropriate HTTP status codes and error messages for different types of errors:

- 400 Bad Request: Invalid URL or other client errors
- 500 Internal Server Error: Server-side errors during scraping

## Notes

- Google Play Store's structure may change over time, which could break the scraping logic. Regular maintenance may be required.
- Respect Google's terms of service and rate limits when using this API.
- For production use, consider implementing rate limiting and caching.
