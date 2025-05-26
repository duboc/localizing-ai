# Localization Audit Prompts

This directory contains the prompts and criteria used for analyzing Google Play app listings for localization quality. These prompts are designed to be used with Google's Vertex AI (Gemini models) to provide comprehensive localization audits.

## Directory Structure

```
src/prompts/
├── localization_criteria.md       # Main criteria list for localization audits
├── prompt_templates/              # Templates for different types of analysis
│   ├── text_analysis.md           # Template for analyzing text elements
│   ├── visual_analysis.md         # Template for analyzing visual elements
│   └── comprehensive_audit.md     # Template for full app listing audit
└── examples/                      # Example files for reference
    ├── good_examples.md           # Examples of well-localized elements
    └── common_issues.md           # Examples of common localization problems
```

## Localization Criteria

The `localization_criteria.md` file contains the complete list of criteria used for evaluating app listings. These criteria are organized into categories:

1. **Content Quality**: Evaluates app titles, descriptions, and review responses
2. **Visual Elements**: Assesses screenshots, UI clarity, and graphics readability
3. **Language Quality**: Checks for language issues like non-native text, grammar, and spelling
4. **Localization Specifics**: Examines date/time formatting and other locale-specific elements

## Prompt Templates

### Text Analysis (`prompt_templates/text_analysis.md`)

This template is designed for analyzing the textual elements of an app listing, including:
- App title
- Short description
- Long description
- Review responses

It evaluates aspects like clarity, value proposition, formatting, grammar, and spelling.

### Visual Analysis (`prompt_templates/visual_analysis.md`)

This template focuses on the visual elements of an app listing, including:
- Screenshots
- App icon
- Feature graphics

It evaluates aspects like screenshot presence, UI clarity, graphics readability, and cultural appropriateness.

### Comprehensive Audit (`prompt_templates/comprehensive_audit.md`)

This template combines both text and visual analysis for a complete evaluation of an app listing. It includes:
- Executive summary
- Strengths and areas for improvement
- Detailed assessment of each criterion
- Prioritized recommendations
- Overall localization score

## Examples

### Good Examples (`examples/good_examples.md`)

This file provides examples of well-localized app elements that can serve as references for best practices, including:
- Clear app titles
- Strong value propositions
- Well-formatted descriptions
- Helpful review responses
- Culturally appropriate visuals

### Common Issues (`examples/common_issues.md`)

This file highlights frequent localization problems found in app listings, serving as examples of what to avoid, including:
- Unclear app titles
- Weak value propositions
- Poor formatting
- Machine translation artifacts
- Non-localized dates and numbers

## Usage

These prompts are designed to be used with the Vertex AI API through the backend service. The backend will:

1. Scrape the Google Play app listing data
2. Format the data according to the appropriate prompt template
3. Send the formatted prompt to Vertex AI (Gemini)
4. Process and structure the response for display in the frontend

The prompts use a structured format to ensure consistent and comprehensive analysis results.
