# Product Context

*This document outlines the "why" behind the project.*

## Problem Solved

### Original Problem
-   Need a simple, standardized way to analyze Google Play app listings for localization quality using AI
-   Avoid direct Vertex AI SDK integration in client applications
-   Provide comprehensive evaluation of app listing localization across multiple dimensions

### New Problem: Localization Comparison Gap
-   **Translation Quality Assessment**: Difficult to compare source and localized versions of apps to identify localization gaps
-   **Completeness Verification**: Hard to ensure all elements have been properly translated and culturally adapted
-   **Cultural Adaptation Evaluation**: Need to assess how well content has been adapted for target markets beyond just translation
-   **Visual Localization Gaps**: Screenshots and visual elements often contain untranslated text that's overlooked
-   **Efficiency in Auditing**: Manual comparison between source and target listings is time-consuming and error-prone

## How it Should Work

### Single App Analysis Flow
-   User submits a Google Play app URL
-   System detects language/country and confirms with user
-   Scraper extracts comprehensive app listing data
-   Vertex AI analyzes the data using specialized prompts
-   User receives detailed localization quality report

### Side-by-Side Comparison Flow (New)
-   User enters source app URL (e.g., English-US version)
-   User enters target app URL (e.g., Spanish-MX version)
-   System confirms language/country for both
-   Parallel scraping of both listings
-   Vertex AI performs comparative analysis using localization comparison prompts
-   User receives side-by-side comparison report with:
     - Translation completeness assessment
     - Translation quality evaluation
     - Cultural adaptation analysis
     - Visual localization comparison
     - Prioritized recommendations

## User Experience Goals

### For Single App Analysis
-   **API Users (Developers)**: Simple, well-documented endpoints, easy integration, clear error messages
-   **End Users**: Seamless interaction with AI capabilities, fast responses, actionable insights

### For Side-by-Side Comparison (New)
-   **Localization Teams**: 
     - Quick identification of missing or poor translations
     - Clear visualization of differences between source and target
     - Specific, actionable recommendations for improvement
     - Scoring system to track localization quality improvements
   
-   **App Developers**:
     - Easy comparison workflow without technical complexity
     - Comprehensive coverage of all localization aspects
     - Export capabilities for sharing findings with teams
   
-   **QA Teams**:
     - Systematic evaluation process for localization sign-off
     - Detailed evidence for each finding
     - Priority-based recommendations for efficient bug fixing

### Key User Benefits
1. **Speed**: Automated comparison vs. manual review saves hours of work
2. **Comprehensiveness**: Covers aspects that might be missed in manual review
3. **Consistency**: Standardized evaluation criteria across all comparisons
4. **Actionability**: Specific recommendations rather than generic feedback
5. **Evidence-Based**: Clear examples and evidence for each finding
6. **Prioritization**: Focus on high-impact issues first

## Success Metrics

### For Comparison Feature
-   **Translation Completeness Score**: 0-100% coverage of all elements
-   **Translation Quality Score**: Accuracy and naturalness assessment
-   **Cultural Adaptation Score**: Appropriateness for target market
-   **Visual Localization Score**: Screenshot and imagery evaluation
-   **Overall Localization Maturity**: Basic/Intermediate/Advanced classification

### User Success Indicators
-   Reduced time from localization completion to market launch
-   Improved app store ratings in localized markets
-   Higher conversion rates for localized app listings
-   Reduced post-launch localization bug reports
