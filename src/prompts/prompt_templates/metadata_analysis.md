# Metadata Analysis Prompt Template

You are an expert in app localization and culturalization. Analyze the following metadata from a Google Play app listing for localization quality and market appropriateness.

## App Information
- **App Title**: {{app_title}}
- **Developer Name**: {{developer_name}}
- **App Category**: {{app_category}}
- **Target Market**: {{target_market}}
- **Last Updated**: {{last_updated}}
- **Size**: {{size}}
- **Installs**: {{installs}}
- **Version**: {{version}}
- **Content Rating**: {{content_rating}}
- **Price**: {{price}}
- **Contains Ads**: {{contains_ads}}
- **In-App Purchases**: {{in_app_purchases}}
- **In-App Purchase Details**: {{in_app_purchase_details}}

## Analysis Instructions
For each of the following criteria, provide an assessment (Pass/Fail/Needs Improvement) and a detailed explanation:

### Metadata Analysis
1. **Update Frequency**: Is the app updated regularly enough for the target market?
2. **App Size**: Is the app size appropriate for the target market's typical internet connectivity and device storage?
3. **Install Count**: How does the install count compare to similar apps in the target market?
4. **Version Naming**: Is the version naming convention clear and appropriate for the target market?
5. **Content Rating**: Is the content rating appropriate for the target culture and aligned with local expectations?
6. **Pricing Strategy**: Is the pricing appropriate for the target market's economic conditions?
7. **Monetization Transparency**: Are ads and in-app purchases clearly disclosed and appropriate for the target market?
8. **In-App Purchase Localization**: Are in-app purchase items properly localized in terms of naming and pricing?

## Response Format
For each criterion, provide:
1. **Assessment**: Pass/Fail/Needs Improvement
2. **Evidence**: Cite specific metadata that supports your assessment
3. **Explanation**: Why this does or doesn't meet localization standards
4. **Recommendation**: If not passing, provide specific, actionable suggestions for improvement

## Summary Section
Conclude with:
1. **Key Insights**: 2-3 most important insights from the metadata analysis
2. **Prioritized Recommendations**: 3-5 specific actions the developer should take to improve metadata localization
3. **Market-Specific Considerations**: Any special considerations for metadata in the target market

## Example Response
```
### 1. Update Frequency
**Assessment**: Needs Improvement
**Evidence**: Last updated 8 months ago
**Explanation**: In this competitive app category, users in the target market expect more regular updates. Competitors update every 1-2 months.
**Recommendation**: Establish a more frequent update schedule, even if updates are minor, to show active development.

### 2. App Size
**Assessment**: Fail
**Evidence**: App size is 150MB
**Explanation**: This is significantly larger than similar apps in the category (typically 30-50MB) and may be problematic in the target market where mobile data is expensive and limited.
**Recommendation**: Optimize the app size by compressing assets, implementing on-demand resources, or offering a "lite" version for the target market.
