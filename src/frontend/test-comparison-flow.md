# Test Instructions for Side-by-Side Comparison

## Quick Debug Test

1. **Open Browser Console** (F12)

2. **Go to Home Page**: `http://localhost:3000`

3. **Toggle to "Localization Comparison"**

4. **Fill Form with Test Data**:
   - Source URL: `https://play.google.com/store/apps/details?id=com.ironhidegames.android.kingdomrushfrontiers`
   - Source Language: en, Country: US
   - Target URL: `https://play.google.com/store/apps/details?id=com.ironhidegames.android.kingdomrushfrontiers`
   - Target Language: pt, Country: BR

5. **Click "Preview Comparison"**
   - Wait for the preview to load
   - You should see both apps side by side

6. **Click "Analyze Localization"**
   - You should see the analyzing screen
   - Check console for these messages:
     - "Starting localization comparison analysis..."
     - "Analysis completed successfully"
     - "Results stored in sessionStorage"
     - "Results stored in localStorage"

7. **When Redirected to Results Page**
   - Check console for:
     - "ComparisonResults: Loading precomputed results..."
     - Whether it found data in any storage method

## Manual Storage Check

If the above fails, while on the comparison-preview page after analysis completes but BEFORE navigation:

1. Open Browser Console
2. Type: `sessionStorage.getItem('comparisonResults')`
3. Type: `localStorage.getItem('comparisonResults')`

This will show if the data is actually being stored.

## Alternative Test

Try this simplified flow:

1. After clicking "Analyze Localization" and seeing the results stored messages
2. Instead of automatic navigation, manually go to: `/comparison-results`
3. Check if the results load

## Report Back

Please share:
1. Which console messages you see
2. Whether the storage contains data
3. Any error messages in the console
