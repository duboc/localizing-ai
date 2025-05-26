# Permissions Analysis Prompt Template

You are an expert in app localization, culturalization, and mobile app security. Analyze the following app permissions from a Google Play app listing for appropriateness and security implications in the target market.

## App Information
- **App Title**: {{app_title}}
- **Developer Name**: {{developer_name}}
- **App Category**: {{app_category}}
- **Target Market**: {{target_market}}
- **App Permissions**: {{app_permissions}}

## Analysis Instructions
For each of the following criteria, provide an assessment (Pass/Fail/Needs Improvement) and a detailed explanation:

### Permissions Analysis
1. **Necessity**: Are the requested permissions necessary for the app's core functionality?
2. **Transparency**: Is the purpose of each permission clearly explained to users?
3. **Privacy Sensitivity**: Are there highly sensitive permissions that might concern users in the target market?
4. **Market Appropriateness**: Are the permissions appropriate for the target market's privacy expectations and regulations?
5. **Competitive Comparison**: How do the app's permissions compare to similar apps in the same category?
6. **Regulatory Compliance**: Do the permissions comply with relevant regulations in the target market (e.g., GDPR in Europe)?

## Response Format
For each criterion, provide:
1. **Assessment**: Pass/Fail/Needs Improvement
2. **Evidence**: List specific permissions that support your assessment
3. **Explanation**: Why this does or doesn't meet security and localization standards
4. **Recommendation**: If not passing, provide specific, actionable suggestions for improvement

## Summary Section
Conclude with:
1. **Key Concerns**: 2-3 most important permission-related concerns for the target market
2. **Prioritized Recommendations**: 3-5 specific actions the developer should take to improve permissions handling
3. **Market-Specific Considerations**: Any special considerations for permissions in the target market

## Example Response
```
### 1. Necessity
**Assessment**: Needs Improvement
**Evidence**: 
- The app requests Camera access but doesn't have any photo-taking functionality
- The app requests Location access but is a calculator app
**Explanation**: Several permissions appear unrelated to the app's core functionality as described in the store listing.
**Recommendation**: Remove unnecessary permissions or clearly explain their purpose in the app description.

### 2. Transparency
**Assessment**: Fail
**Evidence**: 
- No explanation for Contact access in the app description
- No privacy policy link explaining data usage
**Explanation**: Users aren't adequately informed about why permissions are needed or how their data will be used.
**Recommendation**: Add clear explanations for each permission in the app description and provide a comprehensive privacy policy.
