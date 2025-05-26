"""Debug script to test the comparison API and see what's being returned"""
import asyncio
import json
from main import gemini_client, load_and_fill_prompt, AppListingAnalysisRequest
from google.genai import types

async def test_single_analysis():
    """Test a single analysis call to see the response structure"""
    
    # Create mock source and target data
    source = AppListingAnalysisRequest(
        app_id="com.example.app",
        url="https://play.google.com/store/apps/details?id=com.example.app",
        language="en",
        country="US",
        title="Example App",
        developer="Example Developer",
        icon_url="https://example.com/icon.png",
        short_description="This is a great app for doing things",
        long_description="This app helps you do many things. It has features like X, Y, and Z. Download now!"
    )
    
    target = AppListingAnalysisRequest(
        app_id="com.example.app",
        url="https://play.google.com/store/apps/details?id=com.example.app",
        language="pt",
        country="BR",
        title="App Exemplo",
        developer="Example Developer",
        icon_url="https://example.com/icon.png",
        short_description="Este é um ótimo aplicativo para fazer coisas",
        long_description="Este aplicativo ajuda você a fazer muitas coisas. Tem recursos como X, Y e Z. Baixe agora!"
    )
    
    # Test translation analysis
    print("Testing Translation Analysis...")
    try:
        # Load the same way as in main.py
        with open("src/prompts/prompt_templates/comparison_translation_analysis.md", "r") as f:
            prompt_template = f.read()
        
        # Fill prompt (simplified version)
        prompt = prompt_template.replace("{{source_language}}", source.language)
        prompt = prompt.replace("{{source_country}}", source.country)
        prompt = prompt.replace("{{source_title}}", source.title)
        prompt = prompt.replace("{{source_short_description}}", source.short_description or "")
        prompt = prompt.replace("{{source_long_description}}", source.long_description or "")
        prompt = prompt.replace("{{source_developer}}", source.developer)
        prompt = prompt.replace("{{source_screenshots_count}}", "0")
        
        prompt = prompt.replace("{{target_language}}", target.language)
        prompt = prompt.replace("{{target_country}}", target.country)
        prompt = prompt.replace("{{target_title}}", target.title)
        prompt = prompt.replace("{{target_short_description}}", target.short_description or "")
        prompt = prompt.replace("{{target_long_description}}", target.long_description or "")
        prompt = prompt.replace("{{target_developer}}", target.developer)
        prompt = prompt.replace("{{target_screenshots_count}}", "0")
        
        print("\nPrompt Preview (first 500 chars):")
        print(prompt[:500])
        print("...")
        
        # Make the API call
        response = await gemini_client.generate_content_async(
            contents=[types.Content(role="user", parts=[types.Part(text=prompt)])],
            model="gemini-2.5-flash-preview-05-20",
            return_json=True
        )
        
        print("\nRaw Response:")
        print(json.dumps(response, indent=2))
        
        # Check structure
        if 'translation_completeness' in response:
            print("\n✓ translation_completeness found")
            print(f"  - score: {response['translation_completeness'].get('score', 'MISSING')}")
            print(f"  - details: {response['translation_completeness'].get('details', 'MISSING')}")
        else:
            print("\n✗ translation_completeness NOT FOUND")
            
        if 'translation_quality' in response:
            print("\n✓ translation_quality found")
            print(f"  - score: {response['translation_quality'].get('score', 'MISSING')}")
            print(f"  - details: {response['translation_quality'].get('details', 'MISSING')}")
        else:
            print("\n✗ translation_quality NOT FOUND")
            
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_single_analysis())
