"""Test endpoint to debug the comparison API responses"""
from fastapi import APIRouter
from main import gemini_client, AppListingAnalysisRequest
from google.genai import types
import json
import logging

# Set up debug logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/test-translation-analysis")
async def test_translation_analysis():
    """Test endpoint to see what the AI actually returns"""
    
    # Simple test prompt
    test_prompt = """
You are an expert translator. Compare these two app listings and provide a JSON analysis.

Source (en-US):
Title: Kingdom Rush Tower Defense TD
Short Description: Epic tower defense game with strategic gameplay

Target (pt-BR):  
Title: Kingdom Rush Tower Defense TD
Short Description: Jogo épico de defesa de torre com jogabilidade estratégica

Analyze the translation and return ONLY a JSON object with this structure:
{
  "translation_completeness": {
    "score": 85,
    "details": "Most content is translated, but the title remains in English",
    "missing_elements": ["App title not localized"],
    "evaluation_criteria": "Evaluated title, short description, and other text elements"
  },
  "translation_quality": {
    "score": 90,
    "details": "Translation is accurate and natural",
    "issues": [
      {
        "element": "Title",
        "issue": "Title not translated to Portuguese",
        "suggestion": "Consider localizing to 'Kingdom Rush Torre de Defesa TD'"
      }
    ],
    "strengths": ["Natural Portuguese phrasing", "Accurate translation"],
    "evaluation_criteria": "Assessed accuracy, fluency, and marketing appeal"
  }
}
"""

    try:
        response = await gemini_client.generate_content_async(
            contents=[types.Content(role="user", parts=[types.Part(text=test_prompt)])],
            model="gemini-2.5-flash-preview-05-20",
            return_json=True
        )
        
        logger.info("Test response received")
        logger.debug(f"Raw response: {json.dumps(response, indent=2)}")
        
        return {
            "success": True,
            "response": response,
            "has_translation_completeness": "translation_completeness" in response,
            "has_translation_quality": "translation_quality" in response
        }
        
    except Exception as e:
        logger.error(f"Test failed: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e)
        }

# Add this router to main.py by importing it
