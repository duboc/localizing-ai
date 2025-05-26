# Reviews Analysis Prompt Template

You are an expert in app localization and culturalization. Analyze the following user reviews and developer responses from a Google Play app listing for localization quality and user sentiment.

## App Information
- **App Title**: {{app_title}}
- **Developer Name**: {{developer_name}}
- **Target Market**: {{target_market}}
- **User Reviews**: {{sample_reviews}}
- **Developer Responses**: {{sample_responses}}

## Analysis Instructions
For each of the following criteria, provide an assessment (Pass/Fail/Needs Improvement) and a detailed explanation:

### Reviews Analysis
1. **User Sentiment**: What is the overall sentiment of user reviews? Are there patterns in positive or negative feedback?
2. **Localization Issues**: Do users mention any localization-related issues (language problems, cultural mismatches, etc.)?
3. **Feature Requests**: Are there common feature requests that might indicate missing localized functionality?
4. **Market Fit**: Do the reviews suggest the app meets the needs and expectations of users in the target market?

### Developer Response Analysis
5. **Response Rate**: Does the developer respond to a reasonable percentage of reviews?
6. **Response Quality**: Are the developer responses helpful, personalized, and addressing the specific issues raised?
7. **Language Quality**: Are developer responses well-written in the target language without grammar or spelling errors?
8. **Cultural Appropriateness**: Are developer responses culturally appropriate and sensitive to the target market?

## Response Format
For each criterion, provide:
1. **Assessment**: Pass/Fail/Needs Improvement
2. **Evidence**: Quote specific reviews or responses that support your assessment
3. **Explanation**: Why this does or doesn't meet localization standards
4. **Recommendation**: If not passing, provide specific, actionable suggestions for improvement

## Summary Section
Conclude with:
1. **Key Insights**: 2-3 most important insights from the reviews analysis
2. **Prioritized Recommendations**: 3-5 specific actions the developer should take to improve based on review analysis
3. **Review Response Template**: Provide a template the developer could use to respond to negative reviews about localization issues

## Example Response
```
### 1. User Sentiment
**Assessment**: Needs Improvement
**Evidence**: 
- "Great app but all the instructions are in broken English" - User A
- "Love the functionality but can't understand half the menu items" - User B
- "Amazing features but the translation is terrible" - User C
**Explanation**: While users appreciate the app's functionality, there's a consistent pattern of complaints about language quality.
**Recommendation**: Prioritize professional translation of all user-facing text, especially menu items and instructions.

### 2. Localization Issues
**Assessment**: Fail
**Evidence**: 
- "Dates are shown in MM/DD format but we use DD/MM in our country" - User D
- "Prices shown in USD even though I'm in Europe" - User E
**Explanation**: The app is not properly adapting to regional formatting conventions, causing confusion.
**Recommendation**: Implement proper localization for date formats, currencies, and measurements based on the user's region.
