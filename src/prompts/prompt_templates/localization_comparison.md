# Localization Comparison Analysis Prompt Template

You are an expert in app localization and internationalization. Analyze the following source and target app listings to evaluate the quality of the localization and identify areas for improvement.

## Source App Listing ({{source_language}}-{{source_country}})
- **App Title**: {{source_title}}
- **Developer Name**: {{source_developer}}
- **Short Description**: {{source_short_description}}
- **Long Description**: {{source_long_description}}
- **Screenshots**: {{source_screenshots_description}}
- **App Icon**: {{source_app_icon_description}}
- **Feature Graphics**: {{source_feature_graphics_description}}
- **Rating**: {{source_rating}}
- **Reviews Count**: {{source_reviews_count}}
- **Category**: {{source_category}}
- **Last Updated**: {{source_last_updated}}

## Target App Listing ({{target_language}}-{{target_country}})
- **App Title**: {{target_title}}
- **Developer Name**: {{target_developer}}
- **Short Description**: {{target_short_description}}
- **Long Description**: {{target_long_description}}
- **Screenshots**: {{target_screenshots_description}}
- **App Icon**: {{target_app_icon_description}}
- **Feature Graphics**: {{target_feature_graphics_description}}
- **Rating**: {{target_rating}}
- **Reviews Count**: {{target_reviews_count}}
- **Category**: {{target_category}}
- **Last Updated**: {{target_last_updated}}

## Analysis Instructions

Compare the source and target listings, focusing on the following aspects:

### 1. Translation Completeness
- Identify any missing translations or untranslated elements
- Check if all text elements have been localized
- Verify that all visual elements with text have been translated

### 2. Translation Quality
- Assess the accuracy and naturalness of the translation
- Identify any literal translations that don't work in the target language
- Check for consistency in terminology throughout the listing
- Evaluate if the tone and style are appropriate for the target market

### 3. Cultural Adaptation
- Evaluate how well the content has been adapted for the target culture
- Identify cultural references that may not resonate with the target audience
- Check if visual elements are culturally appropriate
- Assess if the marketing message aligns with local preferences

### 4. Technical Localization
- Verify proper formatting of dates, numbers, and currencies
- Check if units of measurement are appropriate for the target market
- Ensure character encoding is correct for the target language
- Verify proper text direction (LTR/RTL) if applicable

### 5. Visual Localization
- Compare screenshots between source and target
- Check if UI elements in screenshots are translated
- Verify that visual elements don't contain untranslated text
- Assess if imagery is culturally appropriate

### 6. SEO and ASO Optimization
- Compare keyword usage between source and target
- Evaluate if the target title and description are optimized for local search
- Check if character limits are properly utilized in the target language

## Response Format

Provide your analysis in the following JSON structure:

```json
{
  "overall_localization_score": 0-100,
  "executive_summary": "Brief overview of the localization quality",
  "translation_completeness": {
    "score": 0-100,
    "missing_elements": ["list of untranslated elements"],
    "details": "Detailed assessment"
  },
  "translation_quality": {
    "score": 0-100,
    "issues": [
      {
        "element": "specific element",
        "issue": "description of the issue",
        "suggestion": "recommended improvement"
      }
    ],
    "strengths": ["list of well-translated elements"],
    "details": "Detailed assessment"
  },
  "cultural_adaptation": {
    "score": 0-100,
    "issues": [
      {
        "element": "specific element",
        "cultural_concern": "description of the concern",
        "recommendation": "suggested adaptation"
      }
    ],
    "strengths": ["list of well-adapted elements"],
    "details": "Detailed assessment"
  },
  "technical_localization": {
    "score": 0-100,
    "issues": [
      {
        "type": "date/number/currency/etc",
        "found": "what was found",
        "expected": "what should be used"
      }
    ],
    "details": "Detailed assessment"
  },
  "visual_localization": {
    "score": 0-100,
    "untranslated_visuals": ["list of visuals with untranslated text"],
    "cultural_concerns": ["list of visual cultural issues"],
    "details": "Detailed assessment"
  },
  "seo_aso_optimization": {
    "score": 0-100,
    "keyword_analysis": "Comparison of keyword usage",
    "character_utilization": {
      "title": "X/Y characters used",
      "short_description": "X/Y characters used"
    },
    "recommendations": ["list of SEO/ASO improvements"]
  },
  "prioritized_recommendations": [
    {
      "priority": 1,
      "category": "category name",
      "issue": "specific issue",
      "impact": "high/medium/low",
      "recommendation": "detailed recommendation"
    }
  ],
  "localization_maturity": "basic/intermediate/advanced",
  "comparison_insights": "Key insights from comparing source and target"
}
```

## Important Considerations
- Be specific in identifying issues and providing recommendations
- Consider the target market's cultural context and expectations
- Prioritize recommendations based on their impact on user experience and conversion
- Acknowledge when certain adaptations are intentional marketing decisions
- Consider both linguistic and cultural aspects of localization
- Provide actionable feedback that can be implemented
