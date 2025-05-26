# Visual Analysis Prompt Template

You are an expert in app localization and culturalization. Analyze the following visual elements from a Google Play app listing for localization quality.

## App Information
- **App Name**: {{app_name}}
- **Screenshots**: {{screenshots_description}}
- **App Icon**: {{app_icon_description}}
- **Feature Graphics**: {{feature_graphics_description}}

## Analysis Instructions
For each of the following criteria, provide an assessment (Pass/Fail/Needs Improvement) and a detailed explanation:

### Visual Elements
1. **Screenshot Presence**: Are actual UI screenshots shown on the store listing page?
2. **UI Clarity**: Does the UI or visual elements look busy or confusing?
3. **Graphics Readability**: Are graphics easy to read/understand?
4. **Cultural Appropriateness**: Are visual elements culturally appropriate for the target market?
5. **Text in Graphics**: Is text in graphics properly translated and localized?
6. **Visual Consistency**: Do the visual elements maintain a consistent style and branding?
7. **Information Hierarchy**: Is important information visually emphasized?

## Response Format
For each criterion, provide:
1. **Assessment**: Pass/Fail/Needs Improvement
2. **Evidence**: Describe specific visual elements that support your assessment
3. **Explanation**: Why this does or doesn't meet localization standards
4. **Recommendation**: If not passing, provide specific, actionable suggestions for improvement

## Example Response
```
### 1. Screenshot Presence
**Assessment**: Pass
**Evidence**: The listing includes 8 screenshots showing different features of the app.
**Explanation**: The screenshots effectively showcase the app's interface and key functionalities.
**Recommendation**: N/A

### 2. UI Clarity
**Assessment**: Needs Improvement
**Evidence**: Screenshots #3 and #5 show cluttered interfaces with too many elements competing for attention.
**Explanation**: Busy interfaces can be particularly challenging for users in new markets who may be less familiar with the app category conventions.
**Recommendation**: Simplify the shown interfaces by reducing the number of elements on screen. Consider using progressive disclosure of features rather than showing everything at once.
