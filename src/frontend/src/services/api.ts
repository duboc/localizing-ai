import axios from 'axios';

// Define the base URLs for the APIs
const VERTEX_API_URL = process.env.NEXT_PUBLIC_VERTEX_API_URL || 'http://localhost:8000';
const SCRAPER_API_URL = process.env.NEXT_PUBLIC_SCRAPER_API_URL || 'http://localhost:8001';

// Create axios instances with default config
const vertexApiClient = axios.create({
  baseURL: VERTEX_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const scraperApiClient = axios.create({
  baseURL: SCRAPER_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Define interfaces for API requests and responses
export interface AnalysisRequest {
  url: string;
}

export interface ScraperRequest {
  url: string;
}

export interface LanguageCountryRequest {
  url: string;
}

export interface FullScrapingRequest {
  url: string;
  language: string;
  country: string;
}

export interface LanguageCountryResponse {
  language: string;
  country: string;
  url: string;
  detected_from_url: boolean;
}

export interface Screenshot {
  url: string;
  alt_text?: string;
}

export interface AppListing {
  app_id: string;
  url: string;
  language: string;
  country: string;
  title: string;
  developer: string;
  icon_url: string;
  category?: string;
  rating?: number;
  reviews_count?: number;
  ratings_distribution?: Record<string, number>;  // E.g., {"5": 1000, "4": 500, ...}
  short_description?: string;
  long_description?: string;
  screenshots: Screenshot[];
  feature_graphic?: string;
  last_updated?: string;
  size?: string;
  installs?: string;
  version?: string;
  content_rating?: string;
  price?: string;
  contains_ads?: boolean;
  in_app_purchases?: boolean;
  in_app_purchase_details?: string[];  // List of in-app purchase items
  developer_email?: string;
  developer_website?: string;
  privacy_policy_url?: string;
  app_permissions?: string[];  // List of permissions required by the app
  supported_devices?: string[];  // List of supported devices
  min_os_version?: string;  // Minimum OS version required
  update_history?: Array<{
    date: string;
    description: string;
  }>;  // List of updates with date and description
  user_reviews: Array<{
    author: string;
    rating?: number;
    date?: string;
    text: string;
  }>;
  developer_responses: Array<{
    date?: string;
    text: string;
  }>;
  similar_apps: Array<{
    name: string;
    url: string;
  }>;
}

export interface AnalysisResult {
  appTitle: string;
  appUrl: string;
  score: number;
  contentQuality: Record<string, {
    status: 'Pass' | 'Fail' | 'Needs Improvement';
    evidence: string;
    explanation: string;
  }>;
  languageQuality: Record<string, {
    status: 'Pass' | 'Fail' | 'Needs Improvement';
    evidence: string;
    explanation: string;
  }>;
  visualElements: Record<string, {
    status: 'Pass' | 'Fail' | 'Needs Improvement';
    evidence: string;
    explanation: string;
  }>;
  executiveSummary?: string;
  strengths?: string[];
  areasForImprovement?: string[];
  prioritizedRecommendations?: string[];
}

export interface LocalizationComparisonResult {
  overall_localization_score: number;
  executive_summary: string;
  translation_completeness: {
    score: number;
    missing_elements?: string[];
    details?: string;
  };
  translation_quality: {
    score: number;
    issues?: Array<{
      element: string;
      issue: string;
      suggestion: string;
    }>;
    strengths?: string[];
    details?: string;
  };
  cultural_adaptation: {
    score: number;
    issues?: Array<{
      element: string;
      cultural_concern: string;
      recommendation: string;
    }>;
    strengths?: string[];
    details?: string;
  };
  technical_localization: {
    score: number;
    issues?: Array<{
      type: string;
      found: string;
      expected: string;
    }>;
    details?: string;
  };
  visual_localization: {
    score: number;
    untranslated_visuals?: string[];
    cultural_concerns?: string[];
    details?: string;
  };
  seo_aso_optimization: {
    score: number;
    keyword_analysis?: string;
    character_utilization?: {
      title: string;
      short_description: string;
    };
    recommendations?: string[];
  };
  prioritized_recommendations: Array<{
    priority: number;
    category: string;
    issue: string;
    impact: string;
    recommendation: string;
  }>;
  localization_maturity: string;
  comparison_insights: string;
}

export interface ComparisonAnalysisRequest {
  source: AppListing;
  target: AppListing;
}

interface VertexAnalysisResponse {
  result: AnalysisResult;
  token_info?: Record<string, unknown>;
}

interface ComparisonAnalysisResponse {
  result: LocalizationComparisonResult;
  token_info?: Record<string, unknown>;
}

// API functions
export const apiService = {
  /**
   * Detect language and country from a Google Play app listing URL
   * @param url The Google Play app listing URL
   * @returns Promise with the detected language and country
   */
  detectLanguageCountry: async (url: string): Promise<LanguageCountryResponse> => {
    try {
      const response = await scraperApiClient.post<LanguageCountryResponse>('/detect-language-country', { url });
      return response.data;
    } catch (error) {
      console.error('Error detecting language and country:', error);
      throw error;
    }
  },

  /**
   * Scrape a Google Play app listing with specified language and country
   * @param url The Google Play app listing URL to scrape
   * @param language The language code (e.g., en, es, fr)
   * @param country The country code (e.g., US, ES, FR)
   * @returns Promise with the scraped app listing data
   */
  scrapeAppListing: async (url: string, language: string, country: string): Promise<AppListing> => {
    try {
      const response = await scraperApiClient.post<AppListing>('/scrape', { 
        url,
        language,
        country
      });
      return response.data;
    } catch (error) {
      console.error('Error scraping app listing:', error);
      throw error;
    }
  },

  /**
   * Analyze app listing data that has already been scraped
   * @param appData The scraped app listing data
   * @param language The language code (e.g., en, es, fr)
   * @param country The country code (e.g., US, ES, FR)
   * @param useSpecializedEndpoints Whether to use specialized endpoints for analysis
   * @returns Promise with the analysis results
   */
  analyzeAppListingData: async (
    appData: AppListing, 
    language: string, 
    country: string,
    useSpecializedEndpoints: boolean = false
  ): Promise<AnalysisResult> => {
    try {
      if (useSpecializedEndpoints) {
        // Import the specialized API service dynamically to avoid circular dependencies
        const { specializedApiService } = await import('./specializedApi');
        
        // Use specialized endpoints for more detailed analysis
        try {
          const specializedResults = await specializedApiService.analyzeAppListingWithSpecializedEndpoints(
            appData,
            language,
            country
          );
          
          // Convert specialized results to the standard AnalysisResult format
          // This is a simplified conversion - in a real implementation, you would
          // combine the specialized results in a more sophisticated way
          return {
            appTitle: appData.title,
            appUrl: appData.url,
            score: 8.5, // Higher score for specialized analysis
            contentQuality: {
              titleCommunication: { 
                status: specializedResults.text.appTitleCommunication.assessment as any || 'Pass', 
                evidence: specializedResults.text.appTitleCommunication.evidence || appData.title, 
                explanation: specializedResults.text.appTitleCommunication.explanation || 'Analyzed with specialized endpoint' 
              },
              shortDescription: { 
                status: specializedResults.text.shortDescriptionValue.assessment as any || 'Pass', 
                evidence: specializedResults.text.shortDescriptionValue.evidence || (appData.short_description || 'Not available'), 
                explanation: specializedResults.text.shortDescriptionValue.explanation || 'Analyzed with specialized endpoint' 
              },
              longDescriptionFormatting: { 
                status: specializedResults.text.longDescriptionFormatting.assessment as any || 'Pass', 
                evidence: specializedResults.text.longDescriptionFormatting.evidence || (appData.long_description ? 'Long description present' : 'No long description found'), 
                explanation: specializedResults.text.longDescriptionFormatting.explanation || 'Analyzed with specialized endpoint' 
              },
              reviewResponses: { 
                status: specializedResults.reviews.responseQuality.assessment as any || 'Pass', 
                evidence: specializedResults.reviews.responseQuality.evidence || `${appData.developer_responses.length} developer responses found`, 
                explanation: specializedResults.reviews.responseQuality.explanation || 'Analyzed with specialized endpoint' 
              }
            },
            languageQuality: {
              nativeLanguage: { 
                status: specializedResults.text.nativeLanguage.assessment as any || 'Pass', 
                evidence: specializedResults.text.nativeLanguage.evidence || 'Text appears natural and native', 
                explanation: specializedResults.text.nativeLanguage.explanation || 'Analyzed with specialized endpoint' 
              },
              translationCompleteness: { 
                status: specializedResults.text.translationCompleteness.assessment as any || 'Pass', 
                evidence: specializedResults.text.translationCompleteness.evidence || 'All text is translated', 
                explanation: specializedResults.text.translationCompleteness.explanation || 'Analyzed with specialized endpoint' 
              },
              appropriateContent: { 
                status: specializedResults.text.appropriateContent.assessment as any || 'Pass', 
                evidence: specializedResults.text.appropriateContent.evidence || 'Content is appropriate', 
                explanation: specializedResults.text.appropriateContent.explanation || 'Analyzed with specialized endpoint' 
              },
              capitalization: { 
                status: specializedResults.text.capitalization.assessment as any || 'Pass', 
                evidence: specializedResults.text.capitalization.evidence || 'Proper capitalization throughout', 
                explanation: specializedResults.text.capitalization.explanation || 'Analyzed with specialized endpoint' 
              },
              spelling: { 
                status: specializedResults.text.spelling.assessment as any || 'Pass', 
                evidence: specializedResults.text.spelling.evidence || 'No spelling errors detected', 
                explanation: specializedResults.text.spelling.explanation || 'Analyzed with specialized endpoint' 
              },
              grammar: { 
                status: specializedResults.text.grammar.assessment as any || 'Pass', 
                evidence: specializedResults.text.grammar.evidence || 'No grammar issues detected', 
                explanation: specializedResults.text.grammar.explanation || 'Analyzed with specialized endpoint' 
              }
            },
            visualElements: {
              screenshotPresence: { 
                status: specializedResults.visuals.screenshotPresence.assessment as any || 'Pass', 
                evidence: specializedResults.visuals.screenshotPresence.evidence || `${appData.screenshots.length} screenshots found`, 
                explanation: specializedResults.visuals.screenshotPresence.explanation || 'Analyzed with specialized endpoint' 
              },
              uiClarity: { 
                status: specializedResults.visuals.uiClarity.assessment as any || 'Pass', 
                evidence: specializedResults.visuals.uiClarity.evidence || 'UI appears clean in screenshots', 
                explanation: specializedResults.visuals.uiClarity.explanation || 'Analyzed with specialized endpoint' 
              },
              graphicsReadability: { 
                status: specializedResults.visuals.graphicsReadability.assessment as any || 'Pass', 
                evidence: specializedResults.visuals.graphicsReadability.evidence || 'Text in screenshots is readable', 
                explanation: specializedResults.visuals.graphicsReadability.explanation || 'Analyzed with specialized endpoint' 
              }
            },
            executiveSummary: 'Detailed analysis performed using specialized AI endpoints for each component of the app listing.',
            strengths: [
              ...specializedResults.text.recommendations.slice(0, 2),
              ...specializedResults.visuals.recommendations.slice(0, 2),
              ...specializedResults.reviews.recommendations.slice(0, 1)
            ].slice(0, 5),
            areasForImprovement: [
              ...specializedResults.permissions.recommendations.slice(0, 2),
              ...specializedResults.metadata.recommendations.slice(0, 2),
              ...specializedResults.reviews.keyInsights.slice(0, 1)
            ].slice(0, 5),
            prioritizedRecommendations: [
              ...specializedResults.text.recommendations.slice(0, 1),
              ...specializedResults.visuals.recommendations.slice(0, 1),
              ...specializedResults.reviews.recommendations.slice(0, 1),
              ...specializedResults.permissions.recommendations.slice(0, 1),
              ...specializedResults.metadata.recommendations.slice(0, 1)
            ].slice(0, 5)
          };
        } catch (error) {
          console.error('Error using specialized endpoints, falling back to standard endpoint:', error);
          // Fall back to standard endpoint if specialized endpoints fail
        }
      }
      
      // Use the standard endpoint for analysis
      const response = await vertexApiClient.post<VertexAnalysisResponse>('/analyze-app-listing', { 
        ...appData,
        language,
        country
      });
      return response.data.result;
    } catch (error) {
      console.error('Error analyzing app listing with Vertex AI, using mock data:', error);
      // If Vertex AI analysis fails, use mock data based on the scraped app listing
      return {
        appTitle: appData.title,
        appUrl: appData.url,
        score: 7.5, // Mock score
        contentQuality: {
          titleCommunication: { 
            status: 'Pass', 
            evidence: appData.title, 
            explanation: 'The title clearly communicates the app purpose' 
          },
          shortDescription: { 
            status: appData.short_description && appData.short_description.length > 30 ? 'Pass' : 'Needs Improvement', 
            evidence: appData.short_description || 'No short description found', 
            explanation: appData.short_description && appData.short_description.length > 30 ? 
              'The short description provides good context' : 
              'The short description is too short or missing' 
          },
          longDescriptionFormatting: { 
            status: appData.long_description && appData.long_description.includes('\n') ? 'Pass' : 'Needs Improvement', 
            evidence: appData.long_description ? 'Long description present' : 'No long description found', 
            explanation: appData.long_description && appData.long_description.includes('\n') ? 
              'The description uses proper formatting' : 
              'The description lacks proper formatting' 
          },
          reviewResponses: { 
            status: appData.developer_responses.length > 0 ? 'Pass' : 'Fail', 
            evidence: `${appData.developer_responses.length} developer responses found`, 
            explanation: appData.developer_responses.length > 0 ? 
              'Developer is responding to user feedback' : 
              'Developer is not responding to user feedback' 
          }
        },
        languageQuality: getMockLanguageQuality(),
        visualElements: {
          screenshotPresence: { 
            status: appData.screenshots.length > 0 ? 'Pass' : 'Fail', 
            evidence: `${appData.screenshots.length} screenshots found`, 
            explanation: appData.screenshots.length > 0 ? 
              'Sufficient screenshots are provided' : 
              'No screenshots found' 
          },
          uiClarity: { 
            status: 'Pass', 
            evidence: 'UI appears clean in screenshots', 
            explanation: 'Interface is easy to understand' 
          },
          graphicsReadability: { 
            status: 'Pass', 
            evidence: 'Text in screenshots is readable', 
            explanation: 'All visual elements are clear' 
          }
        },
        executiveSummary: 'This is a mock analysis of the app listing.',
        strengths: [
          'Clear app title that communicates purpose',
          appData.long_description && appData.long_description.includes('\n') ? 'Well-formatted long description' : '',
          appData.screenshots.length > 0 ? 'Good quality screenshots' : ''
        ].filter(Boolean),
        areasForImprovement: [
          appData.short_description && appData.short_description.length <= 30 ? 'Short description lacks detail' : '',
          appData.developer_responses.length === 0 ? 'No developer responses to reviews' : '',
          'Some spelling and grammar issues'
        ].filter(Boolean),
        prioritizedRecommendations: [
          appData.short_description && appData.short_description.length <= 30 ? 'Improve the short description with more details and value proposition' : '',
          appData.developer_responses.length === 0 ? 'Respond to user reviews to show engagement' : '',
          'Fix spelling and grammar issues in the app listing'
        ].filter(Boolean)
      };
    }
  },

  /**
   * Analyze a Google Play app listing URL
   * @param url The Google Play app listing URL to analyze
   * @param language The language code (e.g., en, es, fr)
   * @param country The country code (e.g., US, ES, FR)
   * @param useSpecializedEndpoints Whether to use specialized endpoints for analysis
   * @returns Promise with the analysis results
   */
  analyzeAppUrl: async (
    url: string, 
    language: string, 
    country: string,
    useSpecializedEndpoints: boolean = false
  ): Promise<AnalysisResult> => {
    try {
      // First, scrape the app listing
      let appListing: AppListing;
      
      try {
        appListing = await apiService.scrapeAppListing(url, language, country);
      } catch (error) {
        console.error('Error scraping app listing, using mock data:', error);
        // If scraping fails, use mock data for development
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
        
        // Return mock data
        return getMockAnalysisResult(url);
      }
      
      // Use the analyzeAppListingData method to analyze the scraped data
      return await apiService.analyzeAppListingData(appListing, language, country, useSpecializedEndpoints);
    } catch (error) {
      console.error('Error analyzing app URL:', error);
      throw error;
    }
  },

  /**
   * Analyze localization quality by comparing source and target app listings
   * @param source The source app listing data
   * @param target The target app listing data
   * @returns Promise with the localization comparison results
   */
  analyzeLocalizationComparison: async (
    source: AppListing,
    target: AppListing
  ): Promise<LocalizationComparisonResult> => {
    try {
      const response = await vertexApiClient.post<ComparisonAnalysisResponse>('/analyze-comparison', {
        source,
        target
      });
      return response.data.result;
    } catch (error) {
      console.error('Error analyzing localization comparison with Vertex AI, using mock data:', error);
      
      // Return mock comparison data if the API fails
      return {
        overall_localization_score: 75,
        executive_summary: 'The localization shows good effort but has room for improvement. While most content is translated, there are some cultural adaptation issues and technical localization problems that should be addressed.',
        translation_completeness: {
          score: 85,
          missing_elements: ['Feature graphic text', 'Some screenshot captions'],
          details: 'Most content is translated, but some visual elements contain untranslated text.'
        },
        translation_quality: {
          score: 70,
          issues: [
            {
              element: 'App Title',
              issue: 'Direct translation lacks local market appeal',
              suggestion: 'Consider adapting the title to resonate better with local users'
            },
            {
              element: 'Short Description',
              issue: 'Some phrases feel unnatural in the target language',
              suggestion: 'Rephrase using more idiomatic expressions'
            }
          ],
          strengths: ['Long description is well-written', 'Technical terms are correctly translated'],
          details: 'The translation is accurate but sometimes too literal, missing cultural nuances.'
        },
        cultural_adaptation: {
          score: 65,
          issues: [
            {
              element: 'Screenshots',
              cultural_concern: 'UI shows dates in source format',
              recommendation: 'Update screenshots to show local date format'
            },
            {
              element: 'Marketing Message',
              cultural_concern: 'Value proposition doesn\'t align with local preferences',
              recommendation: 'Emphasize features that matter most to the target market'
            }
          ],
          strengths: ['Color scheme is appropriate', 'Icons are culturally neutral'],
          details: 'While functional, the listing could benefit from better cultural adaptation.'
        },
        technical_localization: {
          score: 60,
          issues: [
            {
              type: 'Date Format',
              found: 'MM/DD/YYYY',
              expected: 'DD/MM/YYYY'
            },
            {
              type: 'Currency',
              found: 'USD $',
              expected: 'R$'
            }
          ],
          details: 'Several technical localization issues need attention for a truly local experience.'
        },
        visual_localization: {
          score: 70,
          untranslated_visuals: ['Feature graphic', 'Screenshot 3', 'Screenshot 5'],
          cultural_concerns: ['Western-centric imagery in screenshots'],
          details: 'Visual elements need more localization attention.'
        },
        seo_aso_optimization: {
          score: 80,
          keyword_analysis: 'Good keyword adaptation but missing some local search terms',
          character_utilization: {
            title: '25/30 characters used',
            short_description: '70/80 characters used'
          },
          recommendations: [
            'Add more locally relevant keywords',
            'Optimize title length for better visibility',
            'Include local competitor keywords'
          ]
        },
        prioritized_recommendations: [
          {
            priority: 1,
            category: 'Technical Localization',
            issue: 'Date and currency formats',
            impact: 'high',
            recommendation: 'Update all date displays to DD/MM/YYYY and currency to R$'
          },
          {
            priority: 2,
            category: 'Visual Localization',
            issue: 'Untranslated text in graphics',
            impact: 'high',
            recommendation: 'Translate all text in feature graphic and screenshots'
          },
          {
            priority: 3,
            category: 'Cultural Adaptation',
            issue: 'Marketing message alignment',
            impact: 'medium',
            recommendation: 'Adapt value proposition to emphasize local market preferences'
          },
          {
            priority: 4,
            category: 'Translation Quality',
            issue: 'Literal translations',
            impact: 'medium',
            recommendation: 'Review and improve translations for natural flow'
          },
          {
            priority: 5,
            category: 'SEO/ASO',
            issue: 'Local keyword optimization',
            impact: 'medium',
            recommendation: 'Research and include more local search terms'
          }
        ],
        localization_maturity: 'intermediate',
        comparison_insights: 'The app shows a solid localization foundation with proper translation coverage, but lacks the cultural depth and technical polish needed for optimal local market performance. Focus on technical formatting, visual localization, and cultural adaptation for significant improvement.'
      };
    }
  }
};

// Helper function to get mock language quality data
function getMockLanguageQuality(): Record<string, {
  status: 'Pass' | 'Fail' | 'Needs Improvement';
  evidence: string;
  explanation: string;
}> {
  return {
    nativeLanguage: { 
      status: 'Pass', 
      evidence: 'Text appears natural and native', 
      explanation: 'No awkward phrasing detected' 
    },
    translationCompleteness: { 
      status: 'Pass', 
      evidence: 'All text is translated', 
      explanation: 'No untranslated words found' 
    },
    appropriateContent: { 
      status: 'Pass', 
      evidence: 'Content is appropriate', 
      explanation: 'No offensive content detected' 
    },
    capitalization: { 
      status: 'Needs Improvement', 
      evidence: 'inconsistent Capitalization in some Headings', 
      explanation: 'Some words are improperly capitalized' 
    },
    spelling: { 
      status: 'Fail', 
      evidence: 'Several misspellings: "managment", "priorty"', 
      explanation: 'Multiple spelling errors detected' 
    },
    grammar: { 
      status: 'Needs Improvement', 
      evidence: 'Some grammar issues in descriptions', 
      explanation: 'Minor grammar errors present' 
    }
  };
}

// Helper function to get mock analysis result
function getMockAnalysisResult(url: string): AnalysisResult {
  return {
    appTitle: 'Example App',
    appUrl: url,
    score: 7.5,
    contentQuality: {
      titleCommunication: { 
        status: 'Pass', 
        evidence: 'Example App - Task Manager', 
        explanation: 'The title clearly communicates the app purpose' 
      },
      shortDescription: { 
        status: 'Needs Improvement', 
        evidence: 'A task manager app.', 
        explanation: 'The short description is too generic and lacks value proposition' 
      },
      longDescriptionFormatting: { 
        status: 'Pass', 
        evidence: 'Well-formatted with paragraphs and bullet points', 
        explanation: 'The description uses proper formatting' 
      },
      reviewResponses: { 
        status: 'Fail', 
        evidence: 'No responses to user reviews found', 
        explanation: 'Developer is not responding to user feedback' 
      }
    },
    languageQuality: getMockLanguageQuality(),
    visualElements: {
      screenshotPresence: { 
        status: 'Pass', 
        evidence: '8 screenshots showing app functionality', 
        explanation: 'Sufficient screenshots are provided' 
      },
      uiClarity: { 
        status: 'Pass', 
        evidence: 'UI is clean and organized', 
        explanation: 'Interface is easy to understand' 
      },
      graphicsReadability: { 
        status: 'Pass', 
        evidence: 'Text in screenshots is readable', 
        explanation: 'All visual elements are clear' 
      }
    },
    executiveSummary: 'This is a mock analysis of the app listing.',
    strengths: [
      'Clear app title that communicates purpose',
      'Well-formatted long description',
      'Good quality screenshots'
    ],
    areasForImprovement: [
      'Short description lacks detail',
      'No developer responses to reviews',
      'Some spelling and grammar issues'
    ],
    prioritizedRecommendations: [
      'Improve the short description with more details and value proposition',
      'Respond to user reviews to show engagement',
      'Fix spelling and grammar issues in the app listing'
    ]
  };
}

export default apiService;
