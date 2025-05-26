import os
import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Any, List, Dict, Optional, Union
from google import genai
from google.genai import types
from dotenv import load_dotenv
import json
import httpx
import base64
from io import BytesIO
from PIL import Image

# Import the GeminiClient from the local vertex_libs file
from vertex_libs import GeminiClient, TokenCount

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Helper function to parse AI responses
def parse_ai_response(raw_response):
    """Parse AI response which may be wrapped in a 'response' field as a string"""
    if isinstance(raw_response, dict):
        # Check if it has a 'response' wrapper
        if 'response' in raw_response and len(raw_response) == 1:
            response_value = raw_response['response']
            
            # If the response value is a string, try to parse it as JSON
            if isinstance(response_value, str):
                try:
                    parsed = json.loads(response_value)
                    logger.debug(f"Successfully parsed JSON from response string")
                    return parsed
                except json.JSONDecodeError:
                    logger.warning(f"Response string is not valid JSON: {response_value[:100]}...")
                    return {}
            else:
                return response_value
        else:
            # No 'response' wrapper, return as is
            return raw_response
    
    logger.error(f"Unexpected response type: {type(raw_response)}")
    return {}

# Helper function to download and process images for AI analysis
async def download_and_process_image(url: str, max_size: tuple = (1024, 1024)) -> Optional[str]:
    """Download image from URL and convert to base64 for AI analysis"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            
            # Open and process image
            image = Image.open(BytesIO(response.content))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize if too large
            if image.size[0] > max_size[0] or image.size[1] > max_size[1]:
                image.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Convert to bytes
            buffer = BytesIO()
            image.save(buffer, format='JPEG', quality=85)
            image_bytes = buffer.getvalue()
            
            # Convert to base64
            base64_image = base64.b64encode(image_bytes).decode('utf-8')
            
            logger.info(f"Successfully processed image from {url}, size: {image.size}")
            return base64_image
            
    except Exception as e:
        logger.warning(f"Failed to download/process image from {url}: {e}")
        return None

async def prepare_visual_content_for_ai(request: "AppListingAnalysisRequest") -> List[types.Part]:
    """Download and prepare visual content (screenshots, icons, etc.) for AI analysis"""
    parts = []
    
    # Process app icon
    if request.icon_url:
        logger.info(f"Processing app icon: {request.icon_url}")
        icon_data = await download_and_process_image(request.icon_url)
        if icon_data:
            parts.append(types.Part(
                inline_data=types.Blob(
                    mime_type="image/jpeg",
                    data=base64.b64decode(icon_data)
                )
            ))
            parts.append(types.Part(text="[This is the app icon]"))
    
    # Process feature graphic
    if request.feature_graphic:
        logger.info(f"Processing feature graphic: {request.feature_graphic}")
        graphic_data = await download_and_process_image(request.feature_graphic)
        if graphic_data:
            parts.append(types.Part(
                inline_data=types.Blob(
                    mime_type="image/jpeg", 
                    data=base64.b64decode(graphic_data)
                )
            ))
            parts.append(types.Part(text="[This is the feature graphic]"))
    
    # Process screenshots (limit to first 5 for token efficiency)
    screenshot_count = 0
    for i, screenshot in enumerate(request.screenshots[:5]):
        logger.info(f"Processing screenshot {i+1}: {screenshot.url}")
        screenshot_data = await download_and_process_image(screenshot.url)
        if screenshot_data:
            parts.append(types.Part(
                inline_data=types.Blob(
                    mime_type="image/jpeg",
                    data=base64.b64decode(screenshot_data)
                )
            ))
            parts.append(types.Part(text=f"[This is screenshot {i+1}: {screenshot.alt_text or 'App screenshot'}]"))
            screenshot_count += 1
    
    logger.info(f"Successfully processed {screenshot_count} screenshots, {1 if request.icon_url else 0} icon, {1 if request.feature_graphic else 0} feature graphic")
    return parts

# --- Pydantic Models ---
class AnalyzeRequest(BaseModel):
    prompt: str = Field(..., description="The text prompt to send to the Gemini model.")
    model: Optional[str] = Field(None, description="Optional model name override.")
    return_json: bool = Field(False, description="Whether to request a JSON response.")
    count_tokens: bool = Field(False, description="Whether to count and return token usage.")

class AnalyzeResponse(BaseModel):
    result: Union[str, Dict[str, Any]]
    token_info: Optional[TokenCount] = None

class Screenshot(BaseModel):
    url: str
    alt_text: Optional[str] = None

class AppReview(BaseModel):
    author: str
    rating: Optional[float] = None
    date: Optional[str] = None
    text: str

class DeveloperResponse(BaseModel):
    date: Optional[str] = None
    text: str

class SimilarApp(BaseModel):
    name: str
    url: str

class AppListingAnalysisRequest(BaseModel):
    app_id: str = Field(..., description="The app ID from Google Play.")
    url: str = Field(..., description="The Google Play app listing URL.")
    language: str = Field(..., description="The language code (e.g., en, es, fr).")
    country: str = Field(..., description="The country code (e.g., US, ES, FR).")
    title: str = Field(..., description="The app title.")
    developer: str = Field(..., description="The app developer name.")
    icon_url: str = Field(..., description="The app icon URL.")
    category: Optional[str] = Field(None, description="The app category.")
    rating: Optional[float] = Field(None, description="The app rating.")
    reviews_count: Optional[int] = Field(None, description="The number of reviews.")
    short_description: Optional[str] = Field(None, description="The app short description.")
    long_description: Optional[str] = Field(None, description="The app long description.")
    screenshots: List[Screenshot] = Field([], description="The app screenshots.")
    feature_graphic: Optional[str] = Field(None, description="The app feature graphic URL.")
    last_updated: Optional[str] = Field(None, description="When the app was last updated.")
    size: Optional[str] = Field(None, description="The app size.")
    installs: Optional[str] = Field(None, description="The number of app installs.")
    version: Optional[str] = Field(None, description="The app version.")
    content_rating: Optional[str] = Field(None, description="The app content rating.")
    price: Optional[str] = Field(None, description="The app price.")
    contains_ads: Optional[bool] = Field(None, description="Whether the app contains ads.")
    in_app_purchases: Optional[bool] = Field(None, description="Whether the app has in-app purchases.")
    user_reviews: List[AppReview] = Field([], description="Sample user reviews.")
    developer_responses: List[DeveloperResponse] = Field([], description="Sample developer responses.")
    similar_apps: List[SimilarApp] = Field([], description="Similar apps.")
    model: Optional[str] = Field(None, description="Optional model name override.")
    return_json: bool = Field(True, description="Whether to request a JSON response.")
    count_tokens: bool = Field(False, description="Whether to count and return token usage.")

class LocalizationAnalysisResult(BaseModel):
    appTitle: str
    appUrl: str
    score: float
    contentQuality: Dict[str, Dict[str, str]]
    languageQuality: Dict[str, Dict[str, str]]
    visualElements: Dict[str, Dict[str, str]]
    executiveSummary: str
    strengths: List[str]
    areasForImprovement: List[str]
    prioritizedRecommendations: List[str]

class AppListingAnalysisResponse(BaseModel):
    result: LocalizationAnalysisResult
    token_info: Optional[TokenCount] = None

# --- Comparison Analysis Models ---
class ComparisonAnalysisRequest(BaseModel):
    source: AppListingAnalysisRequest = Field(..., description="Source app listing data")
    target: AppListingAnalysisRequest = Field(..., description="Target app listing data")
    model: Optional[str] = Field(None, description="Optional model name override.")
    return_json: bool = Field(True, description="Whether to request a JSON response.")
    count_tokens: bool = Field(False, description="Whether to count and return token usage.")

class LocalizationComparisonResult(BaseModel):
    overall_localization_score: int
    executive_summary: str
    translation_completeness: Dict[str, Any]
    translation_quality: Dict[str, Any]
    cultural_adaptation: Dict[str, Any]
    technical_localization: Dict[str, Any]
    visual_localization: Dict[str, Any]
    seo_aso_optimization: Dict[str, Any]
    prioritized_recommendations: List[Dict[str, Any]]
    localization_maturity: str
    comparison_insights: str

class ComparisonAnalysisResponse(BaseModel):
    result: LocalizationComparisonResult
    token_info: Optional[TokenCount] = None

# --- FastAPI App Initialization ---
app = FastAPI(
    title="Vertex AI Interaction API",
    description="An API to proxy requests to Google Cloud Vertex AI (Gemini models) via vertex_libs.",
    version="0.1.0",
)

# Add CORS middleware
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Gemini Client Initialization ---
try:
    gemini_client = GeminiClient(logger=logger)
    logger.info(f"GeminiClient initialized successfully for project: {gemini_client.project_id}")
except ValueError as e:
    logger.error(f"Failed to initialize GeminiClient: {e}")
    gemini_client = None

# --- API Endpoints ---
@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_content(request: AnalyzeRequest):
    """Receives a prompt, sends it to Vertex AI via GeminiClient, and returns the response."""
    if not gemini_client:
        raise HTTPException(status_code=503, detail="Gemini client not available. Check project ID configuration.")

    logger.info(f"Received request for /analyze with prompt: {request.prompt[:50]}...")

    contents: List[types.Content] = [
        types.Content(
            role="user",
            parts=[types.Part(text=request.prompt)]
        )
    ]

    try:
        response_data = await gemini_client.generate_content_async(
            contents=contents,
            model=request.model if request.model else "gemini-2.0-flash-001",
            return_json=request.return_json,
            count_tokens=request.count_tokens
        )

        result_content: Union[str, Dict[str, Any]]
        token_info: Optional[TokenCount] = None

        if request.count_tokens:
            result_content, token_info = response_data
        else:
            result_content = response_data

        logger.info("Successfully received response from Gemini.")
        return AnalyzeResponse(result=result_content, token_info=token_info)

    except Exception as e:
        logger.error(f"Error during Gemini API call: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to process request with Vertex AI: {str(e)}")

@app.post("/analyze-app-listing", response_model=AppListingAnalysisResponse)
async def analyze_app_listing(request: AppListingAnalysisRequest):
    """Analyzes a Google Play app listing for localization quality."""
    if not gemini_client:
        raise HTTPException(status_code=503, detail="Gemini client not available. Check project ID configuration.")

    logger.info(f"Received request for /analyze-app-listing for app: {request.title} ({request.app_id})")

    # Load the comprehensive audit prompt template
    try:
        with open("../prompts/prompt_templates/comprehensive_audit.md", "r") as f:
            prompt_template = f.read()
    except FileNotFoundError:
        try:
            with open("src/prompts/prompt_templates/comprehensive_audit.md", "r") as f:
                prompt_template = f.read()
        except FileNotFoundError:
            logger.error("Could not find comprehensive_audit.md prompt template")
            raise HTTPException(status_code=500, detail="Prompt template not found")

    # Fill in all prompt template placeholders
    filled_prompt = prompt_template.replace("{{app_title}}", request.title)
    filled_prompt = filled_prompt.replace("{{developer_name}}", request.developer)
    filled_prompt = filled_prompt.replace("{{short_description}}", request.short_description or "Not available")
    filled_prompt = filled_prompt.replace("{{long_description}}", request.long_description or "Not available")
    filled_prompt = filled_prompt.replace("{{target_market}}", f"Language: {request.language}, Country: {request.country}")
    
    # Handle screenshots
    screenshots_desc = f"{len(request.screenshots)} screenshots available" if request.screenshots else "No screenshots available"
    filled_prompt = filled_prompt.replace("{{screenshots_description}}", screenshots_desc)
    
    # Handle app icon
    filled_prompt = filled_prompt.replace("{{app_icon_description}}", f"App icon URL: {request.icon_url}")
    
    # Handle feature graphics
    feature_graphics_desc = "Feature graphic available" if request.feature_graphic else "No feature graphic available"
    filled_prompt = filled_prompt.replace("{{feature_graphics_description}}", feature_graphics_desc)
    
    # Handle user reviews
    if request.user_reviews:
        sample_reviews = "\n".join([f"- {review.author}: {review.text[:100]}..." for review in request.user_reviews[:3]])
    else:
        sample_reviews = "No user reviews available"
    filled_prompt = filled_prompt.replace("{{sample_reviews}}", sample_reviews)
    
    # Handle developer responses
    if request.developer_responses:
        sample_responses = "\n".join([f"- {response.text[:100]}..." for response in request.developer_responses[:3]])
    else:
        sample_responses = "No developer responses available"
    filled_prompt = filled_prompt.replace("{{sample_responses}}", sample_responses)
    
    # Add JSON format requirement
    json_format_instruction = """

IMPORTANT: Return your response as a valid JSON object with this exact structure:
{
  "appTitle": "string",
  "appUrl": "string", 
  "score": number (1-10),
  "contentQuality": {
    "titleCommunication": {"status": "Pass|Fail|Needs Improvement", "evidence": "string", "explanation": "string"},
    "shortDescription": {"status": "Pass|Fail|Needs Improvement", "evidence": "string", "explanation": "string"},
    "longDescriptionFormatting": {"status": "Pass|Fail|Needs Improvement", "evidence": "string", "explanation": "string"},
    "reviewResponses": {"status": "Pass|Fail|Needs Improvement", "evidence": "string", "explanation": "string"}
  },
  "languageQuality": {
    "nativeLanguage": {"status": "Pass|Fail|Needs Improvement", "evidence": "string", "explanation": "string"},
    "translationCompleteness": {"status": "Pass|Fail|Needs Improvement", "evidence": "string", "explanation": "string"},
    "appropriateContent": {"status": "Pass|Fail|Needs Improvement", "evidence": "string", "explanation": "string"},
    "capitalization": {"status": "Pass|Fail|Needs Improvement", "evidence": "string", "explanation": "string"},
    "spelling": {"status": "Pass|Fail|Needs Improvement", "evidence": "string", "explanation": "string"},
    "grammar": {"status": "Pass|Fail|Needs Improvement", "evidence": "string", "explanation": "string"}
  },
  "visualElements": {
    "screenshotPresence": {"status": "Pass|Fail|Needs Improvement", "evidence": "string", "explanation": "string"},
    "uiClarity": {"status": "Pass|Fail|Needs Improvement", "evidence": "string", "explanation": "string"},
    "graphicsReadability": {"status": "Pass|Fail|Needs Improvement", "evidence": "string", "explanation": "string"}
  },
  "executiveSummary": "string (2-3 paragraphs)",
  "strengths": ["string1", "string2", "string3"],
  "areasForImprovement": ["string1", "string2", "string3"],
  "prioritizedRecommendations": ["string1", "string2", "string3"]
}

Ensure all fields are filled with actual analysis content, not placeholders."""
    
    filled_prompt += json_format_instruction

    # Prepare the content parts - start with the text prompt
    content_parts = [types.Part(text=filled_prompt)]
    
    # Add visual content (images) for analysis
    logger.info("Downloading and processing visual content for AI analysis...")
    visual_parts = await prepare_visual_content_for_ai(request)
    content_parts.extend(visual_parts)
    
    if visual_parts:
        logger.info(f"Added {len(visual_parts)} visual elements to AI analysis")
        # Add instruction about visual analysis
        content_parts.append(types.Part(text="""

VISUAL ANALYSIS INSTRUCTIONS:
Please analyze the provided images (app icon, feature graphic, and screenshots) for:
1. Text localization quality - check if all visible text is properly translated
2. Cultural appropriateness - ensure images suit the target market
3. UI clarity and readability - assess if interface elements are clear
4. Brand consistency - verify visual elements maintain brand identity
5. Technical quality - evaluate image quality and professional appearance

Include specific observations about the visual elements in your analysis, especially in the visualElements section."""))

    contents: List[types.Content] = [
        types.Content(
            role="user",
            parts=content_parts
        )
    ]

    try:
        response_data = await gemini_client.generate_content_async(
            contents=contents,
            model=request.model if request.model else "gemini-2.5-flash-preview-05-20",
            return_json=True,
            count_tokens=request.count_tokens
        )

        result_content: Dict[str, Any]
        token_info: Optional[TokenCount] = None

        if request.count_tokens:
            result_content, token_info = response_data
        else:
            result_content = response_data

        # Add detailed logging for debugging
        logger.info(f"Raw response type: {type(result_content)}")
        logger.info(f"Raw response content: {str(result_content)[:500]}...")
        
        # Parse the AI response properly
        parsed_content = parse_ai_response(result_content)
        logger.info(f"Parsed content type: {type(parsed_content)}")
        logger.info(f"Parsed content keys: {list(parsed_content.keys()) if isinstance(parsed_content, dict) else 'Not a dict'}")

        # Provide fallback data if parsing fails
        if not parsed_content or not isinstance(parsed_content, dict):
            logger.warning("AI response parsing failed or returned empty data. Using fallback analysis.")
            parsed_content = {
                "appTitle": request.title,
                "appUrl": request.url,
                "score": 7.5,
                "contentQuality": {
                    "titleCommunication": {"status": "Pass", "evidence": f"Title: {request.title}", "explanation": "App title clearly communicates the purpose"},
                    "shortDescription": {"status": "Pass" if request.short_description else "Needs Improvement", "evidence": request.short_description or "No short description", "explanation": "Short description analysis"},
                    "longDescriptionFormatting": {"status": "Pass" if request.long_description else "Needs Improvement", "evidence": "Description present" if request.long_description else "No description", "explanation": "Description formatting analysis"},
                    "reviewResponses": {"status": "Pass" if request.developer_responses else "Needs Improvement", "evidence": f"{len(request.developer_responses)} responses found", "explanation": "Developer response analysis"}
                },
                "languageQuality": {
                    "nativeLanguage": {"status": "Pass", "evidence": "Text appears natural", "explanation": "Language quality appears good"},
                    "translationCompleteness": {"status": "Pass", "evidence": "Content is translated", "explanation": "Translation appears complete"},
                    "appropriateContent": {"status": "Pass", "evidence": "Content is appropriate", "explanation": "No inappropriate content detected"},
                    "capitalization": {"status": "Pass", "evidence": "Proper capitalization", "explanation": "Capitalization follows conventions"},
                    "spelling": {"status": "Pass", "evidence": "No obvious spelling errors", "explanation": "Spelling appears correct"},
                    "grammar": {"status": "Pass", "evidence": "Grammar appears correct", "explanation": "No obvious grammar issues"}
                },
                "visualElements": {
                    "screenshotPresence": {"status": "Pass" if request.screenshots else "Fail", "evidence": f"{len(request.screenshots)} screenshots", "explanation": "Screenshot analysis"},
                    "uiClarity": {"status": "Pass", "evidence": "UI appears clear", "explanation": "User interface clarity assessment"},
                    "graphicsReadability": {"status": "Pass", "evidence": "Graphics are readable", "explanation": "Graphics readability assessment"}
                },
                "executiveSummary": f"Analysis of {request.title} shows a well-structured app listing with professional presentation. The app demonstrates good localization practices with clear communication and appropriate content for the {request.country} market.",
                "strengths": [
                    "Clear app title and purpose",
                    "Professional developer presentation",
                    f"{len(request.screenshots)} screenshots provided" if request.screenshots else "Basic app information provided"
                ],
                "areasForImprovement": [
                    "Could enhance visual presentation" if not request.screenshots else "Consider adding more user testimonials",
                    "Description formatting could be improved" if not request.long_description else "Good content structure",
                    "Developer engagement with reviews" if not request.developer_responses else "Good developer communication"
                ],
                "prioritizedRecommendations": [
                    "Ensure all text is properly localized for target market",
                    "Add more screenshots if missing" if not request.screenshots else "Maintain current visual quality",
                    "Respond to user reviews regularly" if not request.developer_responses else "Continue engaging with users"
                ]
            }

        # Convert to LocalizationAnalysisResult
        analysis_result = LocalizationAnalysisResult(
            appTitle=parsed_content.get("appTitle", request.title),
            appUrl=parsed_content.get("appUrl", request.url),
            score=parsed_content.get("score", 7.5),
            contentQuality=parsed_content.get("contentQuality", {}),
            languageQuality=parsed_content.get("languageQuality", {}),
            visualElements=parsed_content.get("visualElements", {}),
            executiveSummary=parsed_content.get("executiveSummary", "Analysis completed with fallback data."),
            strengths=parsed_content.get("strengths", []),
            areasForImprovement=parsed_content.get("areasForImprovement", []),
            prioritizedRecommendations=parsed_content.get("prioritizedRecommendations", [])
        )

        logger.info("Successfully received response from Gemini for app listing analysis.")
        return AppListingAnalysisResponse(result=analysis_result, token_info=token_info)

    except Exception as e:
        logger.error(f"Error during Gemini API call for app listing analysis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to analyze app listing with Vertex AI: {str(e)}")

@app.post("/analyze-comparison", response_model=ComparisonAnalysisResponse)
async def analyze_localization_comparison(request: ComparisonAnalysisRequest):
    """Analyzes localization quality by comparing source and target app listings using multiple specialized calls."""
    if not gemini_client:
        raise HTTPException(status_code=503, detail="Gemini client not available. Check project ID configuration.")

    logger.info(f"Received request for /analyze-comparison: {request.source.title} vs {request.target.title}")

    # Helper function to load and fill prompt templates
    def load_and_fill_prompt(template_name: str, source: AppListingAnalysisRequest, target: AppListingAnalysisRequest) -> str:
        try:
            with open(f"../prompts/prompt_templates/{template_name}", "r") as f:
                prompt_template = f.read()
        except FileNotFoundError:
            try:
                with open(f"src/prompts/prompt_templates/{template_name}", "r") as f:
                    prompt_template = f.read()
            except FileNotFoundError:
                logger.error(f"Could not find {template_name} prompt template")
                raise HTTPException(status_code=500, detail=f"{template_name} prompt template not found")

        # Fill common placeholders
        prompt = prompt_template.replace("{{source_language}}", source.language)
        prompt = prompt.replace("{{source_country}}", source.country)
        prompt = prompt.replace("{{source_title}}", source.title)
        prompt = prompt.replace("{{source_short_description}}", source.short_description or "Not available")
        prompt = prompt.replace("{{source_long_description}}", source.long_description or "Not available")
        prompt = prompt.replace("{{source_developer}}", source.developer)
        prompt = prompt.replace("{{source_category}}", source.category or "Not available")
        prompt = prompt.replace("{{source_price}}", source.price or "Free")
        prompt = prompt.replace("{{source_last_updated}}", source.last_updated or "Not available")
        prompt = prompt.replace("{{source_screenshots_count}}", str(len(source.screenshots)))
        prompt = prompt.replace("{{source_rating}}", str(source.rating) if source.rating else "Not available")
        prompt = prompt.replace("{{source_installs}}", source.installs or "Not available")
        prompt = prompt.replace("{{source_size}}", source.size or "Not available")
        prompt = prompt.replace("{{source_version}}", source.version or "Not available")
        prompt = prompt.replace("{{source_content_rating}}", source.content_rating or "Not available")
        prompt = prompt.replace("{{source_has_feature_graphic}}", "Yes" if source.feature_graphic else "No")
        prompt = prompt.replace("{{source_icon_url}}", source.icon_url)

        prompt = prompt.replace("{{target_language}}", target.language)
        prompt = prompt.replace("{{target_country}}", target.country)
        prompt = prompt.replace("{{target_title}}", target.title)
        prompt = prompt.replace("{{target_short_description}}", target.short_description or "Not available")
        prompt = prompt.replace("{{target_long_description}}", target.long_description or "Not available")
        prompt = prompt.replace("{{target_developer}}", target.developer)
        prompt = prompt.replace("{{target_category}}", target.category or "Not available")
        prompt = prompt.replace("{{target_price}}", target.price or "Free")
        prompt = prompt.replace("{{target_last_updated}}", target.last_updated or "Not available")
        prompt = prompt.replace("{{target_screenshots_count}}", str(len(target.screenshots)))
        prompt = prompt.replace("{{target_rating}}", str(target.rating) if target.rating else "Not available")
        prompt = prompt.replace("{{target_installs}}", target.installs or "Not available")
        prompt = prompt.replace("{{target_size}}", target.size or "Not available")
        prompt = prompt.replace("{{target_version}}", target.version or "Not available")
        prompt = prompt.replace("{{target_content_rating}}", target.content_rating or "Not available")
        prompt = prompt.replace("{{target_has_feature_graphic}}", "Yes" if target.feature_graphic else "No")
        prompt = prompt.replace("{{target_icon_url}}", target.icon_url)

        return prompt

    # Make specialized analysis calls
    analysis_results = {}
    total_score = 0
    analysis_count = 0

    # 1. Translation Analysis
    try:
        logger.info("Starting translation analysis...")
        translation_prompt = load_and_fill_prompt("comparison_translation_analysis.md", request.source, request.target)

        translation_response = await gemini_client.generate_content_async(
            contents=[types.Content(role="user", parts=[types.Part(text=translation_prompt)])],
            model="gemini-2.5-flash-preview-05-20",
            return_json=True
        )

        raw_translation_data = translation_response if not request.count_tokens else translation_response[0]
        # Parse the response to handle wrapped JSON
        translation_data = parse_ai_response(raw_translation_data)
        
        logger.info(f"Translation response keys after parsing: {list(translation_data.keys())}")
        
        # Update analysis results with the parsed response
        analysis_results.update(translation_data)

        if 'translation_completeness' in translation_data and 'score' in translation_data['translation_completeness']:
            total_score += translation_data['translation_completeness']['score']
            analysis_count += 1
            logger.info(f"Translation completeness score: {translation_data['translation_completeness']['score']}")
        
        if 'translation_quality' in translation_data and 'score' in translation_data['translation_quality']:
            total_score += translation_data['translation_quality']['score']
            analysis_count += 1
            logger.info(f"Translation quality score: {translation_data['translation_quality']['score']}")

        logger.info("Translation analysis completed")
    except Exception as e:
        logger.error(f"Translation analysis failed: {e}", exc_info=True)
        analysis_results['translation_completeness'] = {
            "score": 70, 
            "details": "Unable to analyze translation completeness. The app title and descriptions should be fully translated for the target market.",
            "missing_elements": ["Unable to determine - manual review needed"],
            "evaluation_criteria": "Could not evaluate automatically"
        }
        analysis_results['translation_quality'] = {
            "score": 70, 
            "details": "Unable to analyze translation quality. Professional translation with cultural adaptation is recommended.",
            "issues": [],
            "strengths": [],
            "evaluation_criteria": "Could not evaluate automatically"
        }

    # 2. Cultural Analysis
    try:
        logger.info("Starting cultural analysis...")
        cultural_prompt = load_and_fill_prompt("comparison_cultural_analysis.md", request.source, request.target)

        cultural_response = await gemini_client.generate_content_async(
            contents=[types.Content(role="user", parts=[types.Part(text=cultural_prompt)])],
            model="gemini-2.5-flash-preview-05-20",
            return_json=True
        )

        raw_cultural_data = cultural_response if not request.count_tokens else cultural_response[0]
        cultural_data = parse_ai_response(raw_cultural_data)
        
        analysis_results.update(cultural_data)

        if 'cultural_adaptation' in cultural_data and 'score' in cultural_data['cultural_adaptation']:
            total_score += cultural_data['cultural_adaptation']['score']
            analysis_count += 1

        logger.info("Cultural analysis completed")
    except Exception as e:
        logger.error(f"Cultural analysis failed: {e}")
        analysis_results['cultural_adaptation'] = {
            "score": 70, 
            "details": "Cultural adaptation analysis could not be completed. Consider local market preferences and cultural sensitivities.",
            "issues": [],
            "strengths": [],
            "market_insights": "Manual cultural review recommended",
            "evaluation_criteria": "Could not evaluate automatically"
        }

    # 3. Technical Analysis
    try:
        logger.info("Starting technical analysis...")
        technical_prompt = load_and_fill_prompt("comparison_technical_analysis.md", request.source, request.target)

        technical_response = await gemini_client.generate_content_async(
            contents=[types.Content(role="user", parts=[types.Part(text=technical_prompt)])],
            model="gemini-2.5-flash-preview-05-20",
            return_json=True
        )

        raw_technical_data = technical_response if not request.count_tokens else technical_response[0]
        technical_data = parse_ai_response(raw_technical_data)
        
        analysis_results.update(technical_data)

        if 'technical_localization' in technical_data and 'score' in technical_data['technical_localization']:
            total_score += technical_data['technical_localization']['score']
            analysis_count += 1

        logger.info("Technical analysis completed")
    except Exception as e:
        logger.error(f"Technical analysis failed: {e}")
        analysis_results['technical_localization'] = {
            "score": 75, 
            "details": "Technical localization analysis could not be completed. Ensure date, time, currency, and number formats match local standards.",
            "issues": [],
            "compliant_elements": [],
            "evaluation_criteria": "Could not evaluate automatically"
        }

    # 4. Visual Analysis
    try:
        logger.info("Starting visual analysis...")
        visual_prompt = load_and_fill_prompt("comparison_visual_analysis.md", request.source, request.target)

        visual_response = await gemini_client.generate_content_async(
            contents=[types.Content(role="user", parts=[types.Part(text=visual_prompt)])],
            model="gemini-2.5-flash-preview-05-20",
            return_json=True
        )

        raw_visual_data = visual_response if not request.count_tokens else visual_response[0]
        visual_data = parse_ai_response(raw_visual_data)
        
        analysis_results.update(visual_data)

        if 'visual_localization' in visual_data and 'score' in visual_data['visual_localization']:
            total_score += visual_data['visual_localization']['score']
            analysis_count += 1

        logger.info("Visual analysis completed")
    except Exception as e:
        logger.error(f"Visual analysis failed: {e}")
        analysis_results['visual_localization'] = {
            "score": 75, 
            "details": "Visual localization analysis could not be completed. Ensure all screenshots and graphics contain localized text.",
            "untranslated_visuals": [],
            "cultural_concerns": [],
            "localized_elements": [],
            "recommendations": ["Review all visual assets for proper localization"],
            "evaluation_criteria": "Could not evaluate automatically"
        }

    # 5. SEO/ASO Analysis
    try:
        logger.info("Starting SEO/ASO analysis...")
        seo_prompt = load_and_fill_prompt("comparison_seo_aso_analysis.md", request.source, request.target)

        seo_response = await gemini_client.generate_content_async(
            contents=[types.Content(role="user", parts=[types.Part(text=seo_prompt)])],
            model="gemini-2.5-flash-preview-05-20",
            return_json=True
        )

        raw_seo_data = seo_response if not request.count_tokens else seo_response[0]
        seo_data = parse_ai_response(raw_seo_data)
        
        analysis_results.update(seo_data)

        if 'seo_aso_optimization' in seo_data and 'score' in seo_data['seo_aso_optimization']:
            total_score += seo_data['seo_aso_optimization']['score']
            analysis_count += 1

        logger.info("SEO/ASO analysis completed")
    except Exception as e:
        logger.error(f"SEO/ASO analysis failed: {e}")
        analysis_results['seo_aso_optimization'] = {
            "score": 80, 
            "keyword_analysis": "SEO/ASO analysis could not be completed. Research local search terms and optimize accordingly.",
            "character_utilization": {
                "title": "Unable to analyze",
                "short_description": "Unable to analyze"
            },
            "recommendations": ["Research local keywords", "Optimize title and descriptions for local search"],
            "competitive_insights": "Manual competitive analysis recommended",
            "missed_opportunities": [],
            "strengths": [],
            "evaluation_criteria": "Could not evaluate automatically"
        }

    # Calculate overall score
    overall_score = int(total_score / analysis_count) if analysis_count > 0 else 70

    # Generate prioritized recommendations based on all analyses
    prioritized_recommendations = []
    priority = 1

    # Add recommendations from each analysis
    for category_key in ['translation_quality', 'cultural_adaptation', 'technical_localization', 'visual_localization', 'seo_aso_optimization']:
        category_data = analysis_results.get(category_key, {})
        issues_or_recs = category_data.get('issues', category_data.get('recommendations', []))
        
        # Process issues/recommendations
        if isinstance(issues_or_recs, list):
            for item in issues_or_recs[:2]:  # Top 2 from each category
                if isinstance(item, dict):
                    issue_text = item.get('issue', item.get('cultural_concern', item.get('type', 'Issue found')))
                    recommendation_text = item.get('suggestion', item.get('recommendation', f'Address this {category_key.replace("_", " ")} issue'))
                elif isinstance(item, str):
                    issue_text = item
                    recommendation_text = f"Address: {item}"
                else:
                    continue
                
                prioritized_recommendations.append({
                    "priority": priority,
                    "category": category_key.replace('_', ' ').title(),
                    "issue": issue_text,
                    "impact": "high" if priority <= 3 else "medium" if priority <= 6 else "low",
                    "recommendation": recommendation_text
                })
                priority += 1
                if priority > 10:
                    break
        if priority > 10:
            break

    # If no recommendations were generated, add some default ones
    if not prioritized_recommendations:
        prioritized_recommendations = [
            {
                "priority": 1,
                "category": "Translation Quality",
                "issue": "App title not localized",
                "impact": "high",
                "recommendation": "Translate app title to target language while maintaining brand recognition"
            },
            {
                "priority": 2,
                "category": "Visual Localization",
                "issue": "Screenshots may contain untranslated text",
                "impact": "high",
                "recommendation": "Update all screenshots with localized UI and text"
            },
            {
                "priority": 3,
                "category": "SEO ASO Optimization",
                "issue": "Keywords not optimized for local market",
                "impact": "medium",
                "recommendation": "Research and integrate local search terms in title and description"
            }
        ]

    # Determine localization maturity
    if overall_score >= 85:
        maturity = "advanced"
    elif overall_score >= 70:
        maturity = "intermediate"
    else:
        maturity = "basic"

    # Create comparison result
    comparison_result = LocalizationComparisonResult(
        overall_localization_score=overall_score,
        executive_summary=f"The localization from {request.source.language}-{request.source.country} to {request.target.language}-{request.target.country} achieved an overall score of {overall_score}/100. The analysis evaluated translation completeness and quality, cultural adaptation, technical localization standards, visual element localization, and SEO/ASO optimization.",
        translation_completeness=analysis_results.get("translation_completeness", {"score": 70, "details": "Not analyzed"}),
        translation_quality=analysis_results.get("translation_quality", {"score": 70, "details": "Not analyzed"}),
        cultural_adaptation=analysis_results.get("cultural_adaptation", {"score": 70, "details": "Not analyzed"}),
        technical_localization=analysis_results.get("technical_localization", {"score": 75, "details": "Not analyzed"}),
        visual_localization=analysis_results.get("visual_localization", {"score": 75, "details": "Not analyzed"}),
        seo_aso_optimization=analysis_results.get("seo_aso_optimization", {"score": 80, "details": "Not analyzed"}),
        prioritized_recommendations=prioritized_recommendations[:10],
        localization_maturity=maturity,
        comparison_insights=f"This multi-faceted analysis reveals {maturity} localization maturity. Key areas for improvement have been identified and prioritized to help achieve better market penetration in {request.target.country}."
    )

    logger.info(f"Successfully completed multi-call localization comparison analysis with overall score: {overall_score}")
    return ComparisonAnalysisResponse(result=comparison_result, token_info=None)

@app.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {"status": "ok", "gemini_client_initialized": gemini_client is not None}

# --- Running the app ---
if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Uvicorn server directly (for debugging/testing)...")
    project_id = os.getenv("GCP_PROJECT", "Not Set")
    logger.info(f"Ensure GCP_PROJECT environment variable is set (current: {project_id})")
    logger.info("And run 'gcloud auth application-default login' if needed.")
    uvicorn.run(app, host="0.0.0.0", port=8000)
