import os
import re
import json
import logging
import asyncio
from typing import Dict, List, Optional, Any, Union
from datetime import datetime

import httpx
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, HttpUrl
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from playwright.async_api import async_playwright
from google_play_scraper import app as gplay_app
from google_play_scraper import reviews_all, reviews, permissions as gplay_permissions, Sort

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Google Play Scraper API",
    description="API for scraping Google Play app listings",
    version="0.1.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class AppListingRequest(BaseModel):
    url: HttpUrl = Field(..., description="Google Play app listing URL")

class LanguageCountryResponse(BaseModel):
    language: str
    country: str
    url: str
    detected_from_url: bool = True

class FullScrapingRequest(BaseModel):
    url: HttpUrl = Field(..., description="Google Play app listing URL")
    language: str = Field(..., description="Language code (e.g., en, es, fr)")
    country: str = Field(..., description="Country code (e.g., US, ES, FR)")

class Screenshot(BaseModel):
    url: str
    alt_text: Optional[str] = None

class AppListing(BaseModel):
    language: str
    country: str
    app_id: str
    url: str
    title: str
    developer: str
    icon_url: str
    category: Optional[str] = None
    rating: Optional[float] = None
    reviews_count: Optional[int] = None
    ratings_distribution: Optional[Dict[str, int]] = None  # E.g., {"5": 1000, "4": 500, ...}
    short_description: Optional[str] = None
    long_description: Optional[str] = None
    screenshots: List[Screenshot] = []
    feature_graphic: Optional[str] = None
    last_updated: Optional[str] = None
    size: Optional[str] = None
    installs: Optional[str] = None
    version: Optional[str] = None
    content_rating: Optional[str] = None
    price: Optional[str] = None
    contains_ads: Optional[bool] = None
    in_app_purchases: Optional[bool] = None
    in_app_purchase_details: Optional[List[str]] = None  # List of in-app purchase items
    developer_email: Optional[str] = None
    developer_website: Optional[str] = None
    privacy_policy_url: Optional[str] = None
    app_permissions: Optional[List[str]] = None  # List of permissions required by the app
    supported_devices: Optional[List[str]] = None  # List of supported devices
    min_os_version: Optional[str] = None  # Minimum OS version required
    update_history: Optional[List[Dict[str, str]]] = None  # List of updates with date and description
    user_reviews: List[Dict[str, Any]] = []
    developer_responses: List[Dict[str, Any]] = []
    similar_apps: List[Dict[str, str]] = []
    html_content: Optional[str] = None  # Raw HTML for further analysis if needed

# Helper functions
def extract_app_id(url: str) -> str:
    """Extract app ID from Google Play URL."""
    match = re.search(r"id=([^&]+)", url)
    if match:
        return match.group(1)
    raise ValueError(f"Could not extract app ID from URL: {url}")

def extract_language_country(url: str) -> tuple[str, str]:
    """Extract language and country from Google Play URL."""
    # Try to extract from URL
    hl_match = re.search(r"[?&]hl=([a-zA-Z\-]+)", url)
    gl_match = re.search(r"[?&]gl=([a-zA-Z\-]+)", url)
    
    language = "en"  # Default language
    country = "US"   # Default country
    
    if hl_match:
        lang_code = hl_match.group(1)
        if "-" in lang_code:
            # Format like "en-US"
            parts = lang_code.split("-")
            language = parts[0].lower()
            if len(parts) > 1:
                country = parts[1].upper()
        else:
            # Format like "en"
            language = lang_code.lower()
    
    if gl_match:
        country = gl_match.group(1).upper()
    
    return language, country

async def detect_language_country(url: str) -> LanguageCountryResponse:
    """Detect language and country from Google Play URL."""
    language, country = extract_language_country(url)
    
    # Construct a URL with the detected language and country
    app_id = extract_app_id(url)
    normalized_url = f"https://play.google.com/store/apps/details?id={app_id}&hl={language}-{country}&gl={country}"
    
    return LanguageCountryResponse(
        language=language,
        country=country,
        url=normalized_url,
        detected_from_url=bool(re.search(r"[?&]hl=|[?&]gl=", url))
    )

async def scrape_with_google_play_scraper(app_id: str, language: str, country: str) -> AppListing:
    """Scrape Google Play app listing using google-play-scraper library."""
    logger.info(f"Scraping app listing with google-play-scraper: {app_id}")
    
    try:
        # Get app details
        app_details = gplay_app(
            app_id,
            lang=language,
            country=country
        )
        
        # Get reviews (limited to 20 for performance)
        app_reviews_result, _ = reviews(
            app_id,
            lang=language,
            country=country,
            count=20,
            sort=Sort.NEWEST  # Using the Sort enum
        )
        app_reviews = app_reviews_result  # The reviews are directly in the result
        
        # Format screenshots
        screenshots = []
        if app_details.get('screenshots'):
            for i, screenshot_url in enumerate(app_details['screenshots']):
                screenshots.append(
                    Screenshot(
                        url=screenshot_url,
                        alt_text=f"Screenshot {i+1}"
                    )
                )
        
        # Format user reviews
        user_reviews = []
        for review in app_reviews:
            user_reviews.append({
                "author": review.get('userName', 'Unknown'),
                "rating": review.get('score'),
                "date": review.get('at'),
                "text": review.get('content', '')
            })
        
        # Format developer responses
        developer_responses = []
        for review in app_reviews:
            if review.get('replyContent') and review.get('replyDate'):
                developer_responses.append({
                    "date": review.get('replyDate'),
                    "text": review.get('replyContent')
                })
        
        # Format ratings distribution
        ratings_distribution = {}
        if app_details.get('histogram'):
            for i, count in enumerate(app_details['histogram'], 1):
                ratings_distribution[str(i)] = count
        
        # Convert timestamp to string if it's an integer
        last_updated = app_details.get('updated')
        if isinstance(last_updated, int):
            from datetime import datetime
            last_updated = datetime.fromtimestamp(last_updated).strftime('%Y-%m-%d')
        
        # Convert price to string if it's a number
        price = app_details.get('price', 'Free')
        if isinstance(price, (int, float)):
            price = f"${price}" if price > 0 else "Free"
        
        # Get app permissions
        try:
            app_permissions_data = gplay_permissions(
                app_id,
                lang=language,
                country=country
            )
            
            # Format permissions into a list
            app_permissions = []
            for category, perms in app_permissions_data.items():
                for perm in perms:
                    app_permissions.append(perm)
        except Exception as e:
            logger.warning(f"Failed to get app permissions: {e}")
            app_permissions = None
        
        # Create AppListing object
        app_listing = AppListing(
            app_id=app_id,
            url=f"https://play.google.com/store/apps/details?id={app_id}",
            language=language,
            country=country,
            title=app_details.get('title', 'Unknown'),
            developer=app_details.get('developer', 'Unknown'),
            icon_url=app_details.get('icon', ''),
            rating=app_details.get('score'),
            reviews_count=app_details.get('reviews'),
            ratings_distribution=ratings_distribution if ratings_distribution else None,
            short_description=app_details.get('summary', ''),
            long_description=app_details.get('description', ''),
            screenshots=screenshots,
            feature_graphic=app_details.get('headerImage', None),
            last_updated=last_updated,
            size=app_details.get('size', None),
            installs=app_details.get('installs', None),
            version=app_details.get('version', None),
            content_rating=app_details.get('contentRating', None),
            price=price,
            contains_ads=app_details.get('adSupported', None),
            in_app_purchases=app_details.get('offersIAP', None),
            in_app_purchase_details=None,  # Not available in the library
            developer_email=app_details.get('developerEmail', None),
            developer_website=app_details.get('developerWebsite', None),
            privacy_policy_url=app_details.get('privacyPolicy', None),
            app_permissions=app_permissions,
            supported_devices=None,  # Not directly available in the library
            min_os_version=app_details.get('androidVersion', None),
            update_history=None,  # Not directly available in the library
            user_reviews=user_reviews,
            developer_responses=developer_responses,
            similar_apps=[],  # Not included in this implementation
            html_content=None  # Not applicable for this method
        )
        
        return app_listing
        
    except Exception as e:
        logger.error(f"Error scraping app listing with google-play-scraper: {e}")
        raise HTTPException(status_code=500, detail=f"Error scraping app listing with google-play-scraper: {str(e)}")

async def scrape_app_listing_with_playwright(url: str, language: str, country: str) -> AppListing:
    """Scrape Google Play app listing using Playwright."""
    logger.info(f"Scraping app listing: {url}")
    
    try:
        app_id = extract_app_id(url)
    except ValueError as e:
        logger.error(f"Invalid URL: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        )
        page = await context.new_page()
        
        try:
            await page.goto(url, wait_until="networkidle")
            
            # Wait for content to load
            await page.wait_for_selector("h1")
            
            # Get the HTML content
            html_content = await page.content()
            
            # Parse with BeautifulSoup
            soup = BeautifulSoup(html_content, "lxml")
            
            # Extract app information
            title = soup.select_one("h1")
            title_text = title.text.strip() if title else "Unknown"
            
            developer_elem = soup.select_one('a[href*="developer"]')
            developer = developer_elem.text.strip() if developer_elem else "Unknown"
            
            icon_elem = soup.select_one('img[src*="play-lh.googleusercontent.com"]')
            icon_url = icon_elem.get("src") if icon_elem else ""
            
            # Extract rating
            rating_elem = soup.select_one('div[role="img"][aria-label*="stars"]')
            rating = None
            if rating_elem:
                rating_text = rating_elem.get("aria-label", "")
                rating_match = re.search(r"([\d.]+) stars", rating_text)
                if rating_match:
                    rating = float(rating_match.group(1))
            
            # Extract reviews count
            reviews_elem = soup.select_one('div[aria-label*="ratings"]')
            reviews_count = None
            if reviews_elem:
                reviews_text = reviews_elem.text.strip()
                reviews_match = re.search(r"([\d,]+)", reviews_text)
                if reviews_match:
                    reviews_count = int(reviews_match.group(1).replace(",", ""))
            
            # Extract descriptions
            short_description = None
            short_desc_elem = soup.select_one('meta[name="description"]')
            if short_desc_elem:
                short_description = short_desc_elem.get("content", "").strip()
            
            long_description = None
            long_desc_elem = soup.select_one('div[data-g-id="description"]')
            if long_desc_elem:
                long_description = long_desc_elem.text.strip()
            
            # Extract screenshots
            screenshots = []
            screenshot_elems = soup.select('img[src*="play-lh.googleusercontent.com"][alt*="screenshot"]')
            for img in screenshot_elems:
                screenshots.append(
                    Screenshot(
                        url=img.get("src", ""),
                        alt_text=img.get("alt", "")
                    )
                )
            
            # Extract feature graphic
            feature_graphic = None
            feature_elem = soup.select_one('img[src*="play-lh.googleusercontent.com"]:not([alt*="screenshot"])')
            if feature_elem and feature_elem != icon_elem:
                feature_graphic = feature_elem.get("src", "")
            
            # Extract ratings distribution
            ratings_distribution = {}
            rating_bars = soup.select('div[class*="rating-bar"]')
            for bar in rating_bars:
                # Try to find the rating value (1-5 stars)
                rating_value = None
                for i in range(1, 6):
                    if f"{i} stars" in bar.text:
                        rating_value = str(i)
                        break
                
                if rating_value:
                    # Try to find the count
                    count_match = re.search(r"([\d,]+)", bar.text)
                    if count_match:
                        count = int(count_match.group(1).replace(",", ""))
                        ratings_distribution[rating_value] = count
            
            # Extract additional information
            additional_info = {}
            info_elems = soup.select('div[class*="details-section"] div[class*="content"]')
            for elem in info_elems:
                text = elem.text.strip()
                if "Updated on" in text:
                    additional_info["last_updated"] = re.search(r"Updated on (.+)", text).group(1)
                elif "Size" in text:
                    additional_info["size"] = re.search(r"Size (.+)", text).group(1)
                elif "Installs" in text:
                    additional_info["installs"] = re.search(r"Installs (.+)", text).group(1)
                elif "Current Version" in text:
                    additional_info["version"] = re.search(r"Current Version (.+)", text).group(1)
                elif "Content Rating" in text:
                    additional_info["content_rating"] = re.search(r"Content Rating (.+)", text).group(1)
                elif "In-app purchases" in text:
                    additional_info["in_app_purchases"] = True
                    # Try to extract in-app purchase details
                    purchase_match = re.search(r"In-app purchases(.+)", text)
                    if purchase_match:
                        purchase_text = purchase_match.group(1).strip()
                        if purchase_text and purchase_text != "Yes":
                            additional_info["in_app_purchase_details"] = [item.strip() for item in purchase_text.split(",")]
                elif "Contains ads" in text:
                    additional_info["contains_ads"] = True
                elif "Offered by" in text:
                    additional_info["developer"] = re.search(r"Offered by (.+)", text).group(1).strip()
                elif "OS" in text or "Android" in text:
                    os_match = re.search(r"Android\s+([\d\.]+)", text)
                    if os_match:
                        additional_info["min_os_version"] = os_match.group(1)
            
            # Extract developer information
            developer_info_section = soup.select_one('div[class*="developer-info"]')
            if developer_info_section:
                # Extract developer email
                email_elem = developer_info_section.select_one('a[href^="mailto:"]')
                if email_elem:
                    developer_email = email_elem.get("href").replace("mailto:", "")
                    additional_info["developer_email"] = developer_email
                
                # Extract developer website
                website_elem = developer_info_section.select_one('a[href^="http"]:not([href*="play.google.com"])')
                if website_elem:
                    developer_website = website_elem.get("href")
                    additional_info["developer_website"] = developer_website
            
            # Extract privacy policy
            privacy_elem = soup.select_one('a[href*="privacy"]')
            if privacy_elem:
                privacy_url = privacy_elem.get("href")
                additional_info["privacy_policy_url"] = privacy_url
            
            # Extract app permissions
            permissions = []
            permission_elems = soup.select('div[class*="permission"]')
            for perm in permission_elems:
                perm_text = perm.text.strip()
                if perm_text:
                    permissions.append(perm_text)
            
            if permissions:
                additional_info["app_permissions"] = permissions
            
            # Extract supported devices
            devices = []
            device_elems = soup.select('div[class*="device-support"]')
            for device in device_elems:
                device_text = device.text.strip()
                if device_text:
                    devices.append(device_text)
            
            if devices:
                additional_info["supported_devices"] = devices
            
            # Extract update history
            update_history = []
            update_elems = soup.select('div[class*="update-history"] div[class*="update-item"]')
            for update in update_elems:
                date_elem = update.select_one('div[class*="date"]')
                desc_elem = update.select_one('div[class*="description"]')
                
                if date_elem and desc_elem:
                    update_history.append({
                        "date": date_elem.text.strip(),
                        "description": desc_elem.text.strip()
                    })
            
            if update_history:
                additional_info["update_history"] = update_history
            
            # Extract user reviews
            user_reviews = []
            review_elems = soup.select('div[data-g-id="reviews"] div[data-g-id="review"]')
            for review in review_elems[:5]:  # Limit to 5 reviews for performance
                rating_elem = review.select_one('div[role="img"][aria-label*="stars"]')
                rating_value = None
                if rating_elem:
                    rating_text = rating_elem.get("aria-label", "")
                    rating_match = re.search(r"([\d.]+) stars", rating_text)
                    if rating_match:
                        rating_value = float(rating_match.group(1))
                
                author_elem = review.select_one('div[class*="author"]')
                author = author_elem.text.strip() if author_elem else "Unknown"
                
                date_elem = review.select_one('div[class*="date"]')
                date = date_elem.text.strip() if date_elem else None
                
                text_elem = review.select_one('div[class*="content"]')
                text = text_elem.text.strip() if text_elem else ""
                
                user_reviews.append({
                    "author": author,
                    "rating": rating_value,
                    "date": date,
                    "text": text
                })
            
            # Extract developer responses
            developer_responses = []
            response_elems = soup.select('div[data-g-id="developer-response"]')
            for response in response_elems[:5]:  # Limit to 5 responses for performance
                date_elem = response.select_one('div[class*="date"]')
                date = date_elem.text.strip() if date_elem else None
                
                text_elem = response.select_one('div[class*="content"]')
                text = text_elem.text.strip() if text_elem else ""
                
                developer_responses.append({
                    "date": date,
                    "text": text
                })
            
            # Extract similar apps
            similar_apps = []
            similar_elems = soup.select('div[data-g-id="similar-apps"] a[href*="details"]')
            for app in similar_elems[:5]:  # Limit to 5 similar apps for performance
                app_name_elem = app.select_one('div[class*="title"]')
                app_name = app_name_elem.text.strip() if app_name_elem else "Unknown"
                app_url = app.get("href", "")
                if app_url and not app_url.startswith("http"):
                    app_url = f"https://play.google.com{app_url}"
                
                similar_apps.append({
                    "name": app_name,
                    "url": app_url
                })
            
            # Create AppListing object
            app_listing = AppListing(
                app_id=app_id,
                url=url,
                language=language,
                country=country,
                title=title_text,
                developer=developer,
                icon_url=icon_url,
                rating=rating,
                reviews_count=reviews_count,
                ratings_distribution=ratings_distribution if ratings_distribution else None,
                short_description=short_description,
                long_description=long_description,
                screenshots=screenshots,
                feature_graphic=feature_graphic,
                last_updated=additional_info.get("last_updated"),
                size=additional_info.get("size"),
                installs=additional_info.get("installs"),
                version=additional_info.get("version"),
                content_rating=additional_info.get("content_rating"),
                contains_ads=additional_info.get("contains_ads"),
                in_app_purchases=additional_info.get("in_app_purchases"),
                in_app_purchase_details=additional_info.get("in_app_purchase_details"),
                developer_email=additional_info.get("developer_email"),
                developer_website=additional_info.get("developer_website"),
                privacy_policy_url=additional_info.get("privacy_policy_url"),
                app_permissions=additional_info.get("app_permissions"),
                supported_devices=additional_info.get("supported_devices"),
                min_os_version=additional_info.get("min_os_version"),
                update_history=additional_info.get("update_history"),
                user_reviews=user_reviews,
                developer_responses=developer_responses,
                similar_apps=similar_apps,
                html_content=html_content
            )
            
            return app_listing
            
        except Exception as e:
            logger.error(f"Error scraping app listing: {e}")
            raise HTTPException(status_code=500, detail=f"Error scraping app listing: {str(e)}")
        finally:
            await browser.close()

# Routes
@app.get("/")
async def root():
    return {"message": "Google Play Scraper API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/detect-language-country", response_model=LanguageCountryResponse)
async def detect_language_country_endpoint(request: AppListingRequest):
    """
    Detect language and country from a Google Play app listing URL.
    
    - **url**: Google Play app listing URL (e.g., https://play.google.com/store/apps/details?id=com.example.app)
    
    Returns the detected language and country, along with a normalized URL.
    """
    try:
        result = await detect_language_country(str(request.url))
        return result
    except Exception as e:
        logger.error(f"Error in detect_language_country endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/scrape", response_model=AppListing)
async def scrape_app_listing(request: FullScrapingRequest):
    """
    Scrape a Google Play app listing with specified language and country.
    
    - **url**: Google Play app listing URL (e.g., https://play.google.com/store/apps/details?id=com.example.app)
    - **language**: Language code (e.g., en, es, fr)
    - **country**: Country code (e.g., US, ES, FR)
    
    Returns the scraped app listing data.
    """
    try:
        # Extract app ID from URL
        app_id = extract_app_id(str(request.url))
        
        # Try to scrape with google-play-scraper first
        try:
            logger.info(f"Attempting to scrape with google-play-scraper: {app_id}")
            app_listing = await scrape_with_google_play_scraper(app_id, request.language, request.country)
            logger.info(f"Successfully scraped with google-play-scraper: {app_id}")
            return app_listing
        except Exception as e:
            # Log the error and fall back to Playwright
            logger.warning(f"Failed to scrape with google-play-scraper: {e}. Falling back to Playwright.")
            
            # Construct URL with language and country parameters
            url = f"https://play.google.com/store/apps/details?id={app_id}&hl={request.language}-{request.country}&gl={request.country}"
            
            # Fall back to Playwright scraping
            app_listing = await scrape_app_listing_with_playwright(url, request.language, request.country)
            return app_listing
    except Exception as e:
        logger.error(f"Error in scrape_app_listing endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Run the app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
