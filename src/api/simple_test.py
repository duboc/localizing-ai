"""Simple test to debug AI responses"""
import asyncio
import json
from vertex_libs import GeminiClient
from google.genai import types
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

async def test_simple_json():
    """Test if the AI can return simple JSON consistently"""
    
    gemini_client = GeminiClient(logger=logger)
    
    # Very simple test prompt
    test_prompt = """
Compare these two app titles and return JSON:

Source: "Kingdom Rush Tower Defense TD" (English)
Target: "Kingdom Rush Tower Defense TD" (Portuguese)

Return this exact JSON structure:
{
  "translation_completeness": {
    "score": 70,
    "details": "The title 'Kingdom Rush Tower Defense TD' remains untranslated in Portuguese version.",
    "missing_elements": ["App title not translated"],
    "evaluation_criteria": "Checked if title was translated"
  }
}
"""

    try:
        response = await gemini_client.generate_content_async(
            contents=[types.Content(role="user", parts=[types.Part(text=test_prompt)])],
            model="gemini-2.5-flash-preview-05-20",
            return_json=True
        )
        
        print("=== SIMPLE TEST RESPONSE ===")
        print(json.dumps(response, indent=2))
        print("\n=== RESPONSE TYPE ===")
        print(f"Type: {type(response)}")
        print(f"Is dict: {isinstance(response, dict)}")
        
        if isinstance(response, dict):
            print(f"\nKeys: {list(response.keys())}")
            if 'translation_completeness' in response:
                print("✓ Found translation_completeness")
                tc = response['translation_completeness']
                print(f"  - score: {tc.get('score', 'MISSING')}")
                print(f"  - details: {tc.get('details', 'MISSING')}")
            else:
                print("✗ translation_completeness NOT FOUND")
                
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

async def test_actual_prompt():
    """Test with the actual prompt template"""
    
    gemini_client = GeminiClient(logger=logger)
    
    # Load actual prompt
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
    
    print("\n=== TESTING ACTUAL PROMPT ===")
    print("Prompt length:", len(prompt))
    print("First 200 chars:", prompt[:200])
    
    try:
        response = await gemini_client.generate_content_async(
            contents=[types.Content(role="user", parts=[types.Part(text=prompt)])],
            model="gemini-2.5-flash-preview-05-20",
            return_json=True
        )
        
        print("\n=== ACTUAL PROMPT RESPONSE ===")
        print(f"Response type: {type(response)}")
        
        if isinstance(response, dict):
            print(f"Keys: {list(response.keys())}")
            print("\nFull response:")
            print(json.dumps(response, indent=2)[:1000] + "...")
        else:
            print(f"Unexpected response type: {response}")
            
    except Exception as e:
        print(f"Error with actual prompt: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("Testing AI JSON responses...")
    asyncio.run(test_simple_json())
    print("\n" + "="*50 + "\n")
    asyncio.run(test_actual_prompt())
