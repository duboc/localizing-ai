# SEO/ASO Optimization Analysis Prompt

You are an App Store Optimization (ASO) expert. Analyze the search optimization and discoverability aspects between the source and target app listings.

## Source App ({{source_language}}-{{source_country}})
- **Title**: {{source_title}}
- **Short Description**: {{source_short_description}}
- **Category**: {{source_category}}
- **Installs**: {{source_installs}}
- **Rating**: {{source_rating}}

## Target App ({{target_language}}-{{target_country}})
- **Title**: {{target_title}}
- **Short Description**: {{target_short_description}}
- **Category**: {{target_category}}
- **Installs**: {{target_installs}}
- **Rating**: {{target_rating}}

## SEO/ASO Analysis Requirements

### Elements to Evaluate:

1. **Keyword Optimization**
   - Keyword relevance in target market
   - Search term localization
   - Competitor keyword analysis
   - Long-tail keyword usage

2. **Character Utilization**
   - Title length optimization (30 chars)
   - Short description usage (80 chars)
   - Keyword density
   - Call-to-action placement

3. **Local Search Behavior**
   - Market-specific search patterns
   - Category appropriateness
   - Seasonal relevance
   - Trending topics integration

4. **Conversion Optimization**
   - Value proposition clarity
   - Feature highlighting
   - Social proof elements
   - Urgency/scarcity messaging

## Response Format

Return ONLY a JSON object with this exact structure:

```json
{
  "seo_aso_optimization": {
    "score": [0-100 based on ASO effectiveness],
    "keyword_analysis": "Detailed analysis of keyword usage, relevance, and optimization comparing source and target markets",
    "character_utilization": {
      "title": "X/30 characters used - analysis of efficiency",
      "short_description": "X/80 characters used - analysis of keyword inclusion"
    },
    "recommendations": [
      "Include local search term '[specific term]' in title",
      "Optimize short description with keywords: [keyword1], [keyword2]",
      "Consider local competitor positioning against [competitor]"
    ],
    "competitive_insights": "Analysis of how the app positions against local competitors",
    "missed_opportunities": [
      "Trending keyword '[keyword]' not utilized",
      "Character limit underutilized in title (only X/30)"
    ],
    "strengths": [
      "Strong use of primary keyword '[keyword]'",
      "Clear value proposition in first 40 characters"
    ],
    "evaluation_criteria": "ASO factors assessed: keyword relevance, character efficiency, local search patterns, competitive positioning, conversion elements"
  }
}
```

## Important Guidelines
- Research actual search behavior in target market
- Consider character count differences between languages
- Analyze competitor strategies in target market
- Identify high-value local keywords
- Balance keyword optimization with readability
- Consider voice search trends
