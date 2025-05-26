# Translation Analysis Prompt

Analyze the translation between these app listings and return a JSON response.

## Source App ({{source_language}}-{{source_country}})
- Title: {{source_title}}
- Short Description: {{source_short_description}}
- Long Description: {{source_long_description}}

## Target App ({{target_language}}-{{target_country}})
- Title: {{target_title}}
- Short Description: {{target_short_description}}
- Long Description: {{target_long_description}}

## Task
Compare the source and target listings. Return ONLY valid JSON matching this exact structure:

```json
{
  "translation_completeness": {
    "score": 85,
    "details": "The app title remains in English (Kingdom Rush Tower Defense TD), which represents 30% of visible text. The short description is fully translated (100%). The long description is fully translated (100%). Overall completeness: 70% of content is properly localized.",
    "missing_elements": [
      "App title 'Kingdom Rush Tower Defense TD' - not translated to Portuguese",
      "Brand name in title could be localized as 'Reino Rush Torre de Defesa TD'"
    ],
    "evaluation_criteria": "Evaluated: app title (30% weight), short description (30% weight), long description (40% weight)"
  },
  "translation_quality": {
    "score": 90,
    "details": "The Portuguese translation shows excellent quality with natural phrasing. 'Jogo épico de defesa de torre' is a fluent translation of 'Epic tower defense game'. The tone and marketing appeal are well-preserved.",
    "issues": [
      {
        "element": "App Title",
        "issue": "Title 'Kingdom Rush Tower Defense TD' remains in English, missing localization opportunity",
        "suggestion": "Consider 'Reino Rush - Defesa de Torres TD' to maintain brand recognition while localizing"
      }
    ],
    "strengths": [
      "Short description uses natural Portuguese: 'Jogo épico' is idiomatic",
      "Long description maintains marketing tone effectively"
    ],
    "evaluation_criteria": "Assessed: linguistic accuracy, natural flow, marketing effectiveness, cultural appropriateness"
  }
}
```

Important: 
- Provide specific scores (0-100)
- Include detailed explanations with examples
- Quote actual text from the listings
- Focus on actionable feedback
