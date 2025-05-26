"""Simple test to see what the API is returning"""
import requests
import json

# Test the comparison endpoint
def test_comparison():
    url = "http://localhost:8000/analyze-comparison"
    
    payload = {
        "source": {
            "app_id": "com.ironhidegames.android.kingdomrush",
            "url": "https://play.google.com/store/apps/details?id=com.ironhidegames.android.kingdomrush&hl=en&gl=US",
            "language": "en",
            "country": "US",
            "title": "Kingdom Rush Tower Defense TD",
            "developer": "Ironhide Games",
            "icon_url": "https://example.com/icon.png",
            "short_description": "Epic tower defense game",
            "long_description": "Build towers and defend your kingdom"
        },
        "target": {
            "app_id": "com.ironhidegames.android.kingdomrush",
            "url": "https://play.google.com/store/apps/details?id=com.ironhidegames.android.kingdomrush&hl=pt&gl=BR",
            "language": "pt",
            "country": "BR",
            "title": "Kingdom Rush Tower Defense TD",
            "developer": "Ironhide Games",
            "icon_url": "https://example.com/icon.png",
            "short_description": "Jogo épico de defesa de torre",
            "long_description": "Construa torres e defenda seu reino"
        }
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            result = data.get('result', {})
            
            # Check translation analysis
            trans_comp = result.get('translation_completeness', {})
            trans_qual = result.get('translation_quality', {})
            
            print("\n=== Translation Completeness ===")
            print(f"Score: {trans_comp.get('score', 'MISSING')}")
            print(f"Details: {trans_comp.get('details', 'MISSING')}")
            
            print("\n=== Translation Quality ===")
            print(f"Score: {trans_qual.get('score', 'MISSING')}")
            print(f"Details: {trans_qual.get('details', 'MISSING')}")
            
            print("\n=== Recommendations ===")
            recs = result.get('prioritized_recommendations', [])
            print(f"Found {len(recs)} recommendations")
            for rec in recs[:3]:
                print(f"- {rec}")
                
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Test failed: {e}")

if __name__ == "__main__":
    test_comparison()
