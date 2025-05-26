"""Test specific analyses to debug Translation and Visual responses"""
import asyncio
import json
from vertex_libs import GeminiClient
from google.genai import types
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

async def test_translation_response():
    """Test what the AI returns for translation analysis"""
    
    gemini_client = GeminiClient(logger=logger)
    
    # Load the actual translation prompt
    try:
        with open("src/prompts/prompt_templates/comparison_translation_analysis.md", "r") as f:
            prompt_template = f.read()
    except:
        with open("../prompts/prompt_templates/comparison_translation_analysis.md", "r") as f:
            prompt_template = f.read()
    
    # Fill with test data
    prompt = prompt_template.replace("{{source_language}}", "en")
    prompt = prompt.replace("{{source_country}}", "US")
    prompt = prompt.replace("{{source_title}}", "Kingdom Rush Tower Defense TD")
    prompt = prompt.replace("{{source_short_description}}", "Epic tower defense game")
    prompt = prompt.replace("{{source_long_description}}", "Build towers and defend your kingdom")
    prompt = prompt.replace("{{source_screenshots_count}}", "5")
    prompt = prompt.replace("{{source_developer}}", "Ironhide Games")
    
    prompt = prompt.replace("{{target_language}}", "pt")
    prompt = prompt.replace("{{target_country}}", "BR")
    prompt = prompt.replace("{{target_title}}", "Kingdom Rush Tower Defense TD")
    prompt = prompt.replace("{{target_short_description}}", "Jogo épico de defesa de torre")
    prompt = prompt.replace("{{target_long_description}}", "Construa torres e defenda seu reino")
    prompt = prompt.replace("{{target_screenshots_count}}", "5")
    prompt = prompt.replace("{{target_developer}}", "Ironhide Games")
    
    print("\n=== TESTING TRANSLATION ANALYSIS ===")
    
    try:
        response = await gemini_client.generate_content_async(
            contents=[types.Content(role="user", parts=[types.Part(text=prompt)])],
            model="gemini-2.5-flash-preview-05-20",
            return_json=True
        )
        
        print(f"\nRaw response type: {type(response)}")
        print(f"Raw response keys: {list(response.keys()) if isinstance(response, dict) else 'Not a dict'}")
        print(f"\nRaw response (first 500 chars):")
        print(str(response)[:500])
        
        # Try parsing if it's wrapped
        if isinstance(response, dict) and 'response' in response:
            response_value = response['response']
            if isinstance(response_value, str):
                try:
                    parsed = json.loads(response_value)
                    print(f"\n✓ Successfully parsed wrapped JSON")
                    print(f"Parsed keys: {list(parsed.keys())}")
                    
                    if 'translation_completeness' in parsed:
                        print(f"\n✓ Found translation_completeness")
                        print(f"  Score: {parsed['translation_completeness'].get('score', 'MISSING')}")
                        print(f"  Details: {parsed['translation_completeness'].get('details', 'MISSING')[:100]}...")
                    else:
                        print("\n✗ translation_completeness NOT FOUND in parsed response")
                        
                except json.JSONDecodeError as e:
                    print(f"\n✗ Failed to parse JSON: {e}")
                    print(f"Response value: {response_value[:200]}...")
        
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()

async def test_visual_response():
    """Test what the AI returns for visual analysis"""
    
    gemini_client = GeminiClient(logger=logger)
    
    # Load the actual visual prompt
    try:
        with open("src/prompts/prompt_templates/comparison_visual_analysis.md", "r") as f:
            prompt_template = f.read()
    except:
        with open("../prompts/prompt_templates/comparison_visual_analysis.md", "r") as f:
            prompt_template = f.read()
    
    # Fill with test data (same as above but for visual analysis)
    prompt = prompt_template.replace("{{source_language}}", "en")
    prompt = prompt.replace("{{source_country}}", "US")
    prompt = prompt.replace("{{source_title}}", "Kingdom Rush Tower Defense TD")
    prompt = prompt.replace("{{source_has_feature_graphic}}", "Yes")
    prompt = prompt.replace("{{source_screenshots_count}}", "5")
    prompt = prompt.replace("{{source_icon_url}}", "https://example.com/icon.png")
    
    prompt = prompt.replace("{{target_language}}", "pt")
    prompt = prompt.replace("{{target_country}}", "BR")
    prompt = prompt.replace("{{target_title}}", "Kingdom Rush Tower Defense TD")
    prompt = prompt.replace("{{target_has_feature_graphic}}", "Yes")
    prompt = prompt.replace("{{target_screenshots_count}}", "5")
    prompt = prompt.replace("{{target_icon_url}}", "https://example.com/icon.png")
    
    print("\n\n=== TESTING VISUAL ANALYSIS ===")
    
    try:
        response = await gemini_client.generate_content_async(
            contents=[types.Content(role="user", parts=[types.Part(text=prompt)])],
            model="gemini-2.5-flash-preview-05-20",
            return_json=True
        )
        
        print(f"\nRaw response type: {type(response)}")
        print(f"Raw response keys: {list(response.keys()) if isinstance(response, dict) else 'Not a dict'}")
        print(f"\nRaw response (first 500 chars):")
        print(str(response)[:500])
        
        # Try parsing if it's wrapped
        if isinstance(response, dict) and 'response' in response:
            response_value = response['response']
            if isinstance(response_value, str):
                try:
                    parsed = json.loads(response_value)
                    print(f"\n✓ Successfully parsed wrapped JSON")
                    print(f"Parsed keys: {list(parsed.keys())}")
                    
                    if 'visual_localization' in parsed:
                        print(f"\n✓ Found visual_localization")
                        print(f"  Score: {parsed['visual_localization'].get('score', 'MISSING')}")
                        print(f"  Details: {parsed['visual_localization'].get('details', 'MISSING')[:100]}...")
                    else:
                        print("\n✗ visual_localization NOT FOUND in parsed response")
                        
                except json.JSONDecodeError as e:
                    print(f"\n✗ Failed to parse JSON: {e}")
                    print(f"Response value: {response_value[:200]}...")
        
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("Testing Translation and Visual analyses specifically...")
    asyncio.run(test_translation_response())
    asyncio.run(test_visual_response())
