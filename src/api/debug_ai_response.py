import asyncio
import logging
from vertex_libs import GeminiClient
from google.genai import types

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_ai_response():
    """Test what the AI is actually returning for a simple analysis"""
    try:
        gemini_client = GeminiClient(logger=logger)
        
        # Simple test prompt
        test_prompt = """
Analyze this Google Play app listing for localization quality:

App Title: Google Translate
Developer: Google LLC
Short Description: The world's #1 translation app
Long Description: Break down language barriers with Google Translate. Translate text, speech, images, documents, websites, and more across your devices.
Target Market: Language: en, Country: US

IMPORTANT: Return your response as a valid JSON object with this exact structure:
{
  "appTitle": "Google Translate",
  "appUrl": "https://play.google.com/store/apps/details?id=com.google.android.apps.translate", 
  "score": 8,
  "contentQuality": {
    "titleCommunication": {"status": "Pass", "evidence": "Title clearly states app purpose", "explanation": "The title immediately communicates this is a translation app"},
    "shortDescription": {"status": "Pass", "evidence": "Claims to be world's #1", "explanation": "Strong value proposition"},
    "longDescriptionFormatting": {"status": "Pass", "evidence": "Clear and concise", "explanation": "Well written description"},
    "reviewResponses": {"status": "Pass", "evidence": "Google actively responds", "explanation": "Developer engagement visible"}
  },
  "languageQuality": {
    "nativeLanguage": {"status": "Pass", "evidence": "Natural English", "explanation": "Text reads naturally"},
    "translationCompleteness": {"status": "Pass", "evidence": "All text in English", "explanation": "Complete translation"},
    "appropriateContent": {"status": "Pass", "evidence": "Professional content", "explanation": "Appropriate for all audiences"},
    "capitalization": {"status": "Pass", "evidence": "Proper capitalization", "explanation": "Follows English conventions"},
    "spelling": {"status": "Pass", "evidence": "No spelling errors", "explanation": "Professionally written"},
    "grammar": {"status": "Pass", "evidence": "Correct grammar", "explanation": "Professional language quality"}
  },
  "visualElements": {
    "screenshotPresence": {"status": "Pass", "evidence": "Multiple screenshots", "explanation": "App shows various features"},
    "uiClarity": {"status": "Pass", "evidence": "Clean interface", "explanation": "UI is intuitive"},
    "graphicsReadability": {"status": "Pass", "evidence": "Clear text", "explanation": "Easy to read"}
  },
  "executiveSummary": "Google Translate demonstrates excellent localization quality with clear communication, professional language, and comprehensive visual presentation. The app listing effectively communicates its value proposition and functionality to English-speaking users.",
  "strengths": ["Clear app purpose", "Professional presentation", "Comprehensive feature showcase"],
  "areasForImprovement": ["Could include more user testimonials", "Screenshots could show more languages"],
  "prioritizedRecommendations": ["Add user testimonials", "Show more language examples", "Include accessibility features"]
}

Ensure all fields are filled with actual analysis content, not placeholders.
"""

        contents = [
            types.Content(
                role="user",
                parts=[types.Part(text=test_prompt)]
            )
        ]

        print("Sending request to AI...")
        response_data = await gemini_client.generate_content_async(
            contents=contents,
            model="gemini-2.5-flash-preview-05-20",
            return_json=True,
            count_tokens=False
        )

        print("Raw AI Response:")
        print(f"Type: {type(response_data)}")
        print(f"Content: {response_data}")
        
        # Test the parsing function
        if isinstance(response_data, dict):
            print("\nParsing response...")
            if 'response' in response_data and len(response_data) == 1:
                response_value = response_data['response']
                print(f"Found 'response' wrapper, content type: {type(response_value)}")
                
                if isinstance(response_value, str):
                    print(f"Response is string, length: {len(response_value)}")
                    print(f"First 200 chars: {response_value[:200]}")
                    try:
                        import json
                        parsed = json.loads(response_value)
                        print("Successfully parsed JSON!")
                        print(f"Keys: {list(parsed.keys())}")
                        return parsed
                    except json.JSONDecodeError as e:
                        print(f"JSON parse error: {e}")
                        return {}
                else:
                    print("Response value is not a string")
                    return response_value
            else:
                print("No 'response' wrapper found")
                return response_data
        else:
            print("Response is not a dict")
            return {}

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    result = asyncio.run(test_ai_response())
    print(f"\nFinal result: {result}")
