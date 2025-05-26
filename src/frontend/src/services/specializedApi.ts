import axios from 'axios';
import { Screenshot, AppListing } from './api';

// Define the base URL for the Vertex API
const VERTEX_API_URL = process.env.NEXT_PUBLIC_VERTEX_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const vertexApiClient = axios.create({
  baseURL: VERTEX_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Define interfaces for types that are used in the API but not exported
interface AppReview {
  author: string;
  rating?: number;
  date?: string;
  text: string;
}

interface DeveloperResponse {
  date?: string;
  text: string;
}

// Define interfaces for specialized analysis requests
export interface TextAnalysisRequest {
  app_id: string;
  title: string;
  short_description?: string;
  long_description?: string;
  language: string;
  country: string;
  model?: string;
}

export interface VisualAnalysisRequest {
  app_id: string;
  title: string;
  screenshots: Screenshot[];
  icon_url: string;
  feature_graphic?: string;
  language: string;
  country: string;
  model?: string;
}

export interface ReviewsAnalysisRequest {
  app_id: string;
  title: string;
  developer: string;
  user_reviews: AppReview[];
  developer_responses: DeveloperResponse[];
  language: string;
  country: string;
  model?: string;
}

export interface PermissionsAnalysisRequest {
  app_id: string;
  title: string;
  developer: string;
  category?: string;
  app_permissions: string[];
  language: string;
  country: string;
  model?: string;
}

export interface MetadataAnalysisRequest {
  app_id: string;
  title: string;
  developer: string;
  category?: string;
  last_updated?: string;
  size?: string;
  installs?: string;
  version?: string;
  content_rating?: string;
  price?: string;
  contains_ads?: boolean;
  in_app_purchases?: boolean;
  in_app_purchase_details?: string[];
  language: string;
  country: string;
  model?: string;
}

// Define interfaces for specialized analysis results
export interface TextAnalysisResult {
  appTitleCommunication: Record<string, string>;
  shortDescriptionValue: Record<string, string>;
  longDescriptionFormatting: Record<string, string>;
  nativeLanguage: Record<string, string>;
  translationCompleteness: Record<string, string>;
  appropriateContent: Record<string, string>;
  capitalization: Record<string, string>;
  spelling: Record<string, string>;
  grammar: Record<string, string>;
  recommendations: string[];
}

export interface VisualAnalysisResult {
  screenshotPresence: Record<string, string>;
  uiClarity: Record<string, string>;
  graphicsReadability: Record<string, string>;
  culturalAppropriateness: Record<string, string>;
  textInGraphics: Record<string, string>;
  visualConsistency: Record<string, string>;
  recommendations: string[];
}

export interface ReviewsAnalysisResult {
  userSentiment: Record<string, string>;
  localizationIssues: Record<string, string>;
  featureRequests: Record<string, string>;
  marketFit: Record<string, string>;
  responseRate: Record<string, string>;
  responseQuality: Record<string, string>;
  languageQuality: Record<string, string>;
  culturalAppropriateness: Record<string, string>;
  keyInsights: string[];
  recommendations: string[];
  responseTemplate: string;
}

export interface PermissionsAnalysisResult {
  necessity: Record<string, string>;
  transparency: Record<string, string>;
  privacySensitivity: Record<string, string>;
  marketAppropriateness: Record<string, string>;
  competitiveComparison: Record<string, string>;
  regulatoryCompliance: Record<string, string>;
  keyConcerns: string[];
  recommendations: string[];
  marketSpecificConsiderations: string;
}

export interface MetadataAnalysisResult {
  updateFrequency: Record<string, string>;
  appSize: Record<string, string>;
  installCount: Record<string, string>;
  versionNaming: Record<string, string>;
  contentRating: Record<string, string>;
  pricingStrategy: Record<string, string>;
  monetizationTransparency: Record<string, string>;
  inAppPurchaseLocalization: Record<string, string>;
  keyInsights: string[];
  recommendations: string[];
  marketSpecificConsiderations: string;
}

// Define interfaces for specialized analysis responses
interface TextAnalysisResponse {
  result: TextAnalysisResult;
  token_info?: Record<string, unknown>;
}

interface VisualAnalysisResponse {
  result: VisualAnalysisResult;
  token_info?: Record<string, unknown>;
}

interface ReviewsAnalysisResponse {
  result: ReviewsAnalysisResult;
  token_info?: Record<string, unknown>;
}

interface PermissionsAnalysisResponse {
  result: PermissionsAnalysisResult;
  token_info?: Record<string, unknown>;
}

interface MetadataAnalysisResponse {
  result: MetadataAnalysisResult;
  token_info?: Record<string, unknown>;
}

// Define the specialized API service
export const specializedApiService = {
  analyzeAppText: async (request: TextAnalysisRequest): Promise<TextAnalysisResult> => {
    try {
      const response = await vertexApiClient.post<TextAnalysisResponse>('/analyze-app-text', request);
      return response.data.result;
    } catch (error) {
      console.error('Error analyzing app text:', error);
      throw error;
    }
  },

  analyzeAppVisuals: async (request: VisualAnalysisRequest): Promise<VisualAnalysisResult> => {
    try {
      const response = await vertexApiClient.post<VisualAnalysisResponse>('/analyze-app-visuals', request);
      return response.data.result;
    } catch (error) {
      console.error('Error analyzing app visuals:', error);
      throw error;
    }
  },

  analyzeAppReviews: async (request: ReviewsAnalysisRequest): Promise<ReviewsAnalysisResult> => {
    try {
      const response = await vertexApiClient.post<ReviewsAnalysisResponse>('/analyze-app-reviews', request);
      return response.data.result;
    } catch (error) {
      console.error('Error analyzing app reviews:', error);
      throw error;
    }
  },

  analyzeAppPermissions: async (request: PermissionsAnalysisRequest): Promise<PermissionsAnalysisResult> => {
    try {
      const response = await vertexApiClient.post<PermissionsAnalysisResponse>('/analyze-app-permissions', request);
      return response.data.result;
    } catch (error) {
      console.error('Error analyzing app permissions:', error);
      throw error;
    }
  },

  analyzeAppMetadata: async (request: MetadataAnalysisRequest): Promise<MetadataAnalysisResult> => {
    try {
      const response = await vertexApiClient.post<MetadataAnalysisResponse>('/analyze-app-metadata', request);
      return response.data.result;
    } catch (error) {
      console.error('Error analyzing app metadata:', error);
      throw error;
    }
  },

  analyzeAppListingWithSpecializedEndpoints: async (
    appData: AppListing, 
    language: string, 
    country: string
  ): Promise<{
    text: TextAnalysisResult;
    visuals: VisualAnalysisResult;
    reviews: ReviewsAnalysisResult;
    permissions: PermissionsAnalysisResult;
    metadata: MetadataAnalysisResult;
  }> => {
    try {
      // Create requests for each specialized endpoint
      const textRequest: TextAnalysisRequest = {
        app_id: appData.app_id,
        title: appData.title,
        short_description: appData.short_description,
        long_description: appData.long_description,
        language,
        country
      };

      const visualsRequest: VisualAnalysisRequest = {
        app_id: appData.app_id,
        title: appData.title,
        screenshots: appData.screenshots,
        icon_url: appData.icon_url,
        feature_graphic: appData.feature_graphic,
        language,
        country
      };

      const reviewsRequest: ReviewsAnalysisRequest = {
        app_id: appData.app_id,
        title: appData.title,
        developer: appData.developer,
        user_reviews: appData.user_reviews,
        developer_responses: appData.developer_responses,
        language,
        country
      };

      const permissionsRequest: PermissionsAnalysisRequest = {
        app_id: appData.app_id,
        title: appData.title,
        developer: appData.developer,
        category: appData.category,
        app_permissions: appData.app_permissions || [],
        language,
        country
      };

      const metadataRequest: MetadataAnalysisRequest = {
        app_id: appData.app_id,
        title: appData.title,
        developer: appData.developer,
        category: appData.category,
        last_updated: appData.last_updated,
        size: appData.size,
        installs: appData.installs,
        version: appData.version,
        content_rating: appData.content_rating,
        price: appData.price,
        contains_ads: appData.contains_ads,
        in_app_purchases: appData.in_app_purchases,
        in_app_purchase_details: appData.in_app_purchase_details,
        language,
        country
      };

      // Make all API calls in parallel for better performance
      const [textResult, visualsResult, reviewsResult, permissionsResult, metadataResult] = await Promise.all([
        specializedApiService.analyzeAppText(textRequest),
        specializedApiService.analyzeAppVisuals(visualsRequest),
        specializedApiService.analyzeAppReviews(reviewsRequest),
        specializedApiService.analyzeAppPermissions(permissionsRequest),
        specializedApiService.analyzeAppMetadata(metadataRequest)
      ]);

      return {
        text: textResult,
        visuals: visualsResult,
        reviews: reviewsResult,
        permissions: permissionsResult,
        metadata: metadataResult
      };
    } catch (error) {
      console.error('Error analyzing app listing with specialized endpoints:', error);
      throw error;
    }
  }
};

export default specializedApiService;
