# Fix for Comparison Analysis Details

## The Problem
The comparison analysis is showing scores but:
1. Details say "Not analyzed"
2. Recommendations are empty
3. The AI isn't returning the expected JSON structure

## Root Causes
1. The prompts are too complex for consistent JSON generation
2. The AI sometimes returns partial structures
3. Error handling defaults to "Not analyzed" without proper details

## Solution Steps

### 1. Simplify the Prompt Templates
Each prompt should:
- Have a clear example of the expected JSON
- Be more directive about format
- Include fallback examples

### 2. Add Response Validation
- Check if required fields exist
- Provide meaningful defaults
- Log what's actually returned

### 3. Update the API to Handle Edge Cases
- Better error messages
- More detailed logging
- Graceful degradation

## Implementation Instructions

### Step 1: Test Current State
```bash
cd src/api
# Run the debug script to see what's being returned
python debug_comparison.py
```

### Step 2: Update Logging Level
In main.py, change line 17:
```python
logging.basicConfig(level=logging.DEBUG)
```

### Step 3: Run the API with Debug Mode
```bash
python main.py
```

### Step 4: Test via UI
1. Go to the comparison page
2. Enter two app URLs (same app, different languages)
3. Watch the console logs to see what the AI returns

### Step 5: Fix Based on Logs
The logs will show:
- "Translation response keys: [...]"
- The actual JSON structure returned
- Where the parsing fails

## Quick Fix Options

### Option 1: Use Simplified Prompts
Replace the complex prompts with simpler versions that are more likely to generate proper JSON.

### Option 2: Add Retry Logic
If the AI doesn't return the expected structure, retry with a simpler prompt.

### Option 3: Parse Flexible Responses
Instead of expecting exact structure, parse what we get and fill in defaults.

## Example of What Should Work

When the API is working correctly, you should see:
- Detailed explanations for each score
- Specific examples quoted from the text
- Actionable recommendations with priorities
- Clear reasoning for the overall score

The key is ensuring the AI consistently returns the expected JSON structure.
