import os
import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Any, List, Dict, Optional
import google.generativeai as genai # As per plan
# from google.generativeai import types # Removed based on inspection
from dotenv import load_dotenv

# Import the GeminiClient from the local vertex_libs file
from .vertex_libs import GeminiClient, TokenCount # Relative import confirmed

# Load environment variables from a .env file if it exists
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Pydantic Models ---
class AnalyzeRequest(BaseModel):
    """Request model for the /analyze endpoint."""
    prompt: str = Field(..., description="The text prompt to send to the Gemini model.")
    # Add other potential fields later, like model name, generation config overrides, etc.
    model: str | None = Field(None, description="Optional model name override.")
    return_json: bool = Field(False, description="Whether to request a JSON response.")
    count_tokens: bool = Field(False, description="Whether to count and return token usage.")

class AnalyzeResponse(BaseModel):
    """Response model for the /analyze endpoint."""
    result: str | Dict[str, Any] 
    token_info: TokenCount | None = None

class Screenshot(BaseModel):
    """Model for app screenshot."""
    url: str
    alt_text: Optional[str] = None

class AppReview(BaseModel):
    """Model for app user review."""
    author: str
    rating: Optional[float] = None
    date: Optional[str] = None
    text: str

class DeveloperResponse(BaseModel):
    """Model for developer response to a review."""
    date: Optional[str] = None
    text: str

class SimilarApp(BaseModel):
    """Model for similar app reference."""
    name: str
    url: str

# --- Specialized Analysis Models ---
class TextAnalysisResult(BaseModel):
    """Model for text analysis result."""
    appTitleCommunication: Dict[str, str]
    shortDescriptionValue: Dict[str, str]
    longDescriptionFormatting: Dict[str, str]
    nativeLanguage: Dict[str, str]
    translationCompleteness: Dict[str, str]
    appropriateContent: Dict[str, str]
    capitalization: Dict[str, str]
    spelling: Dict[str, str]
    grammar: Dict[str, str]
    recommendations: List[str]

class VisualAnalysisResult(BaseModel):
    """Model for visual analysis result."""
    screenshotPresence: Dict[str, str]
    uiClarity: Dict[str, str]
    graphicsReadability: Dict[str, str]
    culturalAppropriateness: Dict[str, str]
    textInGraphics: Dict[str, str]
    visualConsistency: Dict[str, str]
    recommendations: List[str]

class ReviewsAnalysisResult(BaseModel):
    """Model for reviews analysis result."""
    userSentiment: Dict[str, str]
    localizationIssues: Dict[str, str]
    featureRequests: Dict[str, str]
    marketFit: Dict[str, str]
    responseRate: Dict[str, str]
    responseQuality: Dict[str, str]
    languageQuality: Dict[str, str]
    culturalAppropriateness: Dict[str, str]
    keyInsights: List[str]
    recommendations: List[str]
    responseTemplate: str

class PermissionsAnalysisResult(BaseModel):
    """Model for permissions analysis result."""
    necessity: Dict[str, str]
    transparency: Dict[str, str]
    privacySensitivity: Dict[str, str]
    marketAppropriateness: Dict[str, str]
    competitiveComparison: Dict[str, str]
    regulatoryCompliance: Dict[str, str]
    keyConcerns: List[str]
    recommendations: List[str]
    marketSpecificConsiderations: str

class MetadataAnalysisResult(BaseModel):
    """Model for metadata analysis result."""
    updateFrequency: Dict[str, str]
    appSize: Dict[str, str]
    installCount: Dict[str, str]
    versionNaming: Dict[str, str]
    contentRating: Dict[str, str]
    pricingStrategy: Dict[str, str]
    monetizationTransparency: Dict[str, str]
    inAppPurchaseLocalization: Dict[str, str]
    keyInsights: List[str]
    recommendations: List[str]
    marketSpecificConsiderations: str

class AppListingAnalysisRequest(BaseModel):
    """Request model for the /analyze-app-listing endpoint."""
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
    """Model for localization analysis result."""
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
    """Response model for the /analyze-app-listing endpoint."""
    result: LocalizationAnalysisResult
    token_info: Optional[TokenCount] = None

# --- FastAPI App Initialization ---
app = FastAPI(
    title="Vertex AI Interaction API",
    description="An API to proxy requests to Google Cloud Vertex AI (Gemini models) via vertex_libs.",
    version="0.1.0",
)

# Add CORS middleware to handle preflight requests
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
    # project_id will be fetched from GCP_PROJECT env var by the client
    gemini_client = GeminiClient(logger=logger)
    logger.info(f"GeminiClient initialized successfully for project: {gemini_client.project_id}")
except ValueError as e:
    logger.error(f"Failed to initialize GeminiClient: {e}")
    # Allow app to start but endpoints will fail if client is needed.
    # Consider raising a startup error if client is absolutely essential.
    gemini_client = None 

# --- API Endpoints ---
@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_content(request: AnalyzeRequest):
    """
    Receives a prompt, sends it to Vertex AI via GeminiClient, and returns the response.
    """
    if not gemini_client:
        raise HTTPException(status_code=503, detail="Gemini client not available. Check project ID configuration.")

    logger.info(f"Received request for /analyze with prompt: {request.prompt[:50]}...")

    # Convert the request prompt into the format expected by GeminiClient
    contents: List[genai.protos.Content] = [
        genai.protos.Content(
            role="user",
            parts=[genai.protos.Part(text=request.prompt)]
        )
    ]

    try:
        # Call the GeminiClient's async method
        # Pass through optional parameters from the request
        response_data = await gemini_client.generate_content_async(
            contents=contents,
            model=request.model if request.model else "gemini-2.0-flash-001", # Default model if not specified
            return_json=request.return_json,
            count_tokens=request.count_tokens
            # Add generation_config later if needed
        )

        result_content: str | Dict[str, Any]
        token_info: TokenCount | None = None

        if request.count_tokens:
            result_content, token_info = response_data # Unpack tuple
        else:
            result_content = response_data

        logger.info("Successfully received response from Gemini.")
        return AnalyzeResponse(result=result_content, token_info=token_info)

    except Exception as e:
        logger.error(f"Error during Gemini API call: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to process request with Vertex AI: {str(e)}")

@app.post("/analyze-app-listing", response_model=AppListingAnalysisResponse)
async def analyze_app_listing(request: AppListingAnalysisRequest):
    """
    Analyzes a Google Play app listing for localization quality.
    
    Takes the app listing data and uses Vertex AI to analyze it for localization issues.
    Returns a structured analysis of the app's localization quality.
    """
    if not gemini_client:
        raise HTTPException(status_code=503, detail="Gemini client not available. Check project ID configuration.")

    logger.info(f"Received request for /analyze-app-listing for app: {request.title} ({request.app_id})")
    
    # Load the comprehensive audit prompt template
    try:
        with open("../prompts/prompt_templates/comprehensive_audit.md", "r") as f:
            prompt_template = f.read()
    except FileNotFoundError:
        # Try alternative path
        try:
            with open("src/prompts/prompt_templates/comprehensive_audit.md", "r") as f:
                prompt_template = f.read()
        except FileNotFoundError:
            logger.error("Could not find comprehensive_audit.md prompt template")
            raise HTTPException(status_code=500, detail="Prompt template not found")
    
    # Load examples of good localization practices
    try:
        with open("../prompts/examples/good_examples.md", "r") as f:
            good_examples = f.read()
    except FileNotFoundError:
        # Try alternative path
        try:
            with open("src/prompts/examples/good_examples.md", "r") as f:
                good_examples = f.read()
        except FileNotFoundError:
            logger.error("Could not find good_examples.md")
            good_examples = "Examples not available."
    
    # Load examples of common localization issues
    try:
        with open("../prompts/examples/common_issues.md", "r") as f:
            common_issues = f.read()
    except FileNotFoundError:
        # Try alternative path
        try:
            with open("src/prompts/examples/common_issues.md", "r") as f:
                common_issues = f.read()
        except FileNotFoundError:
            logger.error("Could not find common_issues.md")
            common_issues = "Examples not available."
    
    # Prepare screenshots description
    screenshots_description = "No screenshots available."
    if request.screenshots and len(request.screenshots) > 0:
        screenshots_description = f"{len(request.screenshots)} screenshots showing: " + ", ".join(
            [s.alt_text or "No description" for s in request.screenshots]
        )
    
    # Prepare sample reviews
    sample_reviews = "No user reviews available."
    if request.user_reviews and len(request.user_reviews) > 0:
        sample_reviews = "\n\n".join([
            f"Rating: {review.rating or 'Not specified'}\nDate: {review.date or 'Not specified'}\nAuthor: {review.author}\nText: {review.text}"
            for review in request.user_reviews
        ])
    
    # Prepare sample developer responses
    sample_responses = "No developer responses available."
    if request.developer_responses and len(request.developer_responses) > 0:
        sample_responses = "\n\n".join([
            f"Date: {response.date or 'Not specified'}\nText: {response.text}"
            for response in request.developer_responses
        ])
    
    # Fill the prompt template with app listing data
    filled_prompt = prompt_template.replace("{{app_title}}", request.title)
    filled_prompt = filled_prompt.replace("{{developer_name}}", request.developer)
    filled_prompt = filled_prompt.replace("{{short_description}}", request.short_description or "Not available")
    filled_prompt = filled_prompt.replace("{{long_description}}", request.long_description or "Not available")
    filled_prompt = filled_prompt.replace("{{screenshots_description}}", screenshots_description)
    filled_prompt = filled_prompt.replace("{{app_icon_description}}", f"Icon URL: {request.icon_url}")
    filled_prompt = filled_prompt.replace("{{feature_graphics_description}}", 
                                         f"Feature graphic URL: {request.feature_graphic}" if request.feature_graphic else "No feature graphic available")
    filled_prompt = filled_prompt.replace("{{sample_reviews}}", sample_reviews)
    filled_prompt = filled_prompt.replace("{{sample_responses}}", sample_responses)
    filled_prompt = filled_prompt.replace("{{target_market}}", f"Language: {request.language}, Country: {request.country}")
    
    # Add examples as context
    context = f"""
# Reference Examples

## Good Localization Practices
{good_examples}

## Common Localization Issues
{common_issues}

Now, analyze the following app listing:

"""
    
    # Combine context and filled prompt
    full_prompt = context + filled_prompt
    
    # Create the content for Vertex AI
    contents: List[genai.protos.Content] = [
        genai.protos.Content(
            role="user",
            parts=[genai.protos.Part(text=full_prompt)]
        )
    ]
    
    # Define JSON schema for structured response
    json_schema = {
        "type": "OBJECT",
        "properties": {
            "appTitle": {"type": "STRING"},
            "appUrl": {"type": "STRING"},
            "score": {"type": "NUMBER"},
            "executiveSummary": {"type": "STRING"},
            "strengths": {"type": "ARRAY", "items": {"type": "STRING"}},
            "areasForImprovement": {"type": "ARRAY", "items": {"type": "STRING"}},
            "prioritizedRecommendations": {"type": "ARRAY", "items": {"type": "STRING"}},
            "contentQuality": {
                "type": "OBJECT",
                "properties": {
                    "titleCommunication": {
                        "type": "OBJECT",
                        "properties": {
                            "status": {"type": "STRING"},
                            "evidence": {"type": "STRING"},
                            "explanation": {"type": "STRING"}
                        }
                    },
                    "shortDescription": {
                        "type": "OBJECT",
                        "properties": {
                            "status": {"type": "STRING"},
                            "evidence": {"type": "STRING"},
                            "explanation": {"type": "STRING"}
                        }
                    },
                    "longDescriptionFormatting": {
                        "type": "OBJECT",
                        "properties": {
                            "status": {"type": "STRING"},
                            "evidence": {"type": "STRING"},
                            "explanation": {"type": "STRING"}
                        }
                    },
                    "reviewResponses": {
                        "type": "OBJECT",
                        "properties": {
                            "status": {"type": "STRING"},
                            "evidence": {"type": "STRING"},
                            "explanation": {"type": "STRING"}
                        }
                    }
                }
            },
            "languageQuality": {
                "type": "OBJECT",
                "properties": {
                    "nativeLanguage": {
                        "type": "OBJECT",
                        "properties": {
                            "status": {"type": "STRING"},
                            "evidence": {"type": "STRING"},
                            "explanation": {"type": "STRING"}
                        }
                    },
                    "translationCompleteness": {
                        "type": "OBJECT",
                        "properties": {
                            "status": {"type": "STRING"},
                            "evidence": {"type": "STRING"},
                            "explanation": {"type": "STRING"}
                        }
                    },
                    "appropriateContent": {
                        "type": "OBJECT",
                        "properties": {
                            "status": {"type": "STRING"},
                            "evidence": {"type": "STRING"},
                            "explanation": {"type": "STRING"}
                        }
                    },
                    "capitalization": {
                        "type": "OBJECT",
                        "properties": {
                            "status": {"type": "STRING"},
                            "evidence": {"type": "STRING"},
                            "explanation": {"type": "STRING"}
                        }
                    },
                    "spelling": {
                        "type": "OBJECT",
                        "properties": {
                            "status": {"type": "STRING"},
                            "evidence": {"type": "STRING"},
                            "explanation": {"type": "STRING"}
                        }
                    },
                    "grammar": {
                        "type": "OBJECT",
                        "properties": {
                            "status": {"type": "STRING"},
                            "evidence": {"type": "STRING"},
                            "explanation": {"type": "STRING"}
                        }
                    }
                }
            },
            "visualElements": {
                "type": "OBJECT",
                "properties": {
                    "screenshotPresence": {
                        "type": "OBJECT",
                        "properties": {
                            "status": {"type": "STRING"},
                            "evidence": {"type": "STRING"},
                            "explanation": {"type": "STRING"}
                        }
                    },
                    "uiClarity": {
                        "type": "OBJECT",
                        "properties": {
                            "status": {"type": "STRING"},
                            "evidence": {"type": "STRING"},
                            "explanation": {"type": "STRING"}
                        }
                    },
                    "graphicsReadability": {
                        "type": "OBJECT",
                        "properties": {
                            "status": {"type": "STRING"},
                            "evidence": {"type": "STRING"},
                            "explanation": {"type": "STRING"}
                        }
                    },
                    "culturalAppropriateness": {
                        "type": "OBJECT",
                        "properties": {
                            "status": {"type": "STRING"},
                            "evidence": {"type": "STRING"},
                            "explanation": {"type": "STRING"}
                        }
                    }
                }
            }
        }
    }
    
    try:
        # Call the GeminiClient's async method
        response_data = await gemini_client.generate_content_async(
            contents=contents,
            model=request.model if request.model else "gemini-2.0-flash-001",  # Use Pro model for complex analysis
            return_json=True,
            json_schema=json_schema,
            count_tokens=request.count_tokens
        )
        
        result_content: Dict[str, Any]
        token_info: TokenCount | None = None
        
        if request.count_tokens:
            result_content, token_info = response_data  # Unpack tuple
        else:
            result_content = response_data
        
        # Convert to LocalizationAnalysisResult
        analysis_result = LocalizationAnalysisResult(
            appTitle=result_content.get("appTitle", request.title),
            appUrl=result_content.get("appUrl", request.url),
            score=result_content.get("score", 5.0),
            contentQuality=result_content.get("contentQuality", {}),
            languageQuality=result_content.get("languageQuality", {}),
            visualElements=result_content.get("visualElements", {}),
            executiveSummary=result_content.get("executiveSummary", "Analysis not available."),
            strengths=result_content.get("strengths", []),
            areasForImprovement=result_content.get("areasForImprovement", []),
            prioritizedRecommendations=result_content.get("prioritizedRecommendations", [])
        )
        
        logger.info("Successfully received response from Gemini for app listing analysis.")
        return AppListingAnalysisResponse(result=analysis_result, token_info=token_info)
        
    except Exception as e:
        logger.error(f"Error during Gemini API call for app listing analysis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to analyze app listing with Vertex AI: {str(e)}")

@app.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {"status": "ok", "gemini_client_initialized": gemini_client is not None}

# --- Running the app (for local development) ---
# You would typically run this using: uvicorn src.api.main:app --reload --port 8000
# The following block is mostly for completeness or direct script execution (less common for FastAPI)
if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Uvicorn server directly (for debugging/testing)...")
    # Fetch project ID for logging, default if not set
    project_id = os.getenv("GCP_PROJECT", "Not Set")
    logger.info(f"Ensure GCP_PROJECT environment variable is set (current: {project_id})")
    logger.info("And run 'gcloud auth application-default login' if needed.")
    uvicorn.run(app, host="0.0.0.0", port=8000)
