"""Helper function to parse AI responses correctly"""
import json
import logging

logger = logging.getLogger(__name__)

def parse_ai_response(raw_response):
    """
    Parse AI response which may be wrapped in a 'response' field as a string
    
    Args:
        raw_response: The raw response from the AI
        
    Returns:
        dict: The parsed JSON response
    """
    # If it's already a dict with the expected structure, return it
    if isinstance(raw_response, dict):
        # Check if it has a 'response' wrapper
        if 'response' in raw_response and len(raw_response) == 1:
            response_value = raw_response['response']
            
            # If the response value is a string, try to parse it as JSON
            if isinstance(response_value, str):
                try:
                    # Try to parse as JSON
                    parsed = json.loads(response_value)
                    logger.debug(f"Successfully parsed JSON from response string")
                    return parsed
                except json.JSONDecodeError:
                    # If it's not valid JSON, log and return empty dict
                    logger.warning(f"Response string is not valid JSON: {response_value[:100]}...")
                    return {}
            else:
                # If it's already a dict, return it
                return response_value
        else:
            # No 'response' wrapper, return as is
            return raw_response
    
    # If it's not a dict at all, return empty dict
    logger.error(f"Unexpected response type: {type(raw_response)}")
    return {}


# Example usage:
if __name__ == "__main__":
    # Test case 1: Wrapped JSON string (what we're seeing)
    test1 = {
        "response": '{"translation_completeness":{"score":70,"details":"The title remains untranslated"}}'
    }
    result1 = parse_ai_response(test1)
    print("Test 1:", result1)
    
    # Test case 2: Wrapped non-JSON string
    test2 = {
        "response": "The translation analysis follows:"
    }
    result2 = parse_ai_response(test2)
    print("Test 2:", result2)
    
    # Test case 3: Direct dict (ideal case)
    test3 = {
        "translation_completeness": {
            "score": 70,
            "details": "Direct response"
        }
    }
    result3 = parse_ai_response(test3)
    print("Test 3:", result3)
