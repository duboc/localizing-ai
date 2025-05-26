'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress, 
  Alert,
  Divider,
  Chip,
  Avatar,
  Rating,
  Card,
  CardMedia
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CancelIcon from '@mui/icons-material/Cancel';
import Layout from '../../components/layout/Layout';
import apiService, { AppListing } from '../../services/api';

interface ComparisonData {
  source: AppListing | null;
  target: AppListing | null;
}

// Store the analysis results globally to persist across navigation
let globalAnalysisResults: any = null;

function ComparisonPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Extract parameters
  const sourceUrl = searchParams.get('sourceUrl');
  const sourceLanguage = searchParams.get('sourceLanguage') || 'en';
  const sourceCountry = searchParams.get('sourceCountry') || 'US';
  const targetUrl = searchParams.get('targetUrl');
  const targetLanguage = searchParams.get('targetLanguage') || 'pt';
  const targetCountry = searchParams.get('targetCountry') || 'BR';
  
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonData>({
    source: null,
    target: null
  });
  
  useEffect(() => {
    const fetchBothListings = async () => {
      if (!sourceUrl || !targetUrl) {
        setError('Missing source or target URL');
        setLoading(false);
        return;
      }
      
      try {
        // Fetch both listings in parallel
        const [sourceData, targetData] = await Promise.all([
          apiService.scrapeAppListing(sourceUrl, sourceLanguage, sourceCountry),
          apiService.scrapeAppListing(targetUrl, targetLanguage, targetCountry)
        ]);
        
        setComparisonData({
          source: sourceData,
          target: targetData
        });
      } catch (err) {
        setError('Failed to scrape one or both app listings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBothListings();
  }, [sourceUrl, sourceLanguage, sourceCountry, targetUrl, targetLanguage, targetCountry]);
  
  const handleAnalyze = async () => {
    if (!comparisonData.source || !comparisonData.target) {
      setError('Missing comparison data. Please try refreshing the page.');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      console.log('Starting localization comparison analysis...');
      console.log('Source app:', comparisonData.source.title);
      console.log('Target app:', comparisonData.target.title);

      // Call the analysis API directly
      const analysisResults = await apiService.analyzeLocalizationComparison(
        comparisonData.source,
        comparisonData.target
      );

      console.log('Analysis completed successfully');
      console.log('Analysis results:', analysisResults);

      // Store the results in multiple ways to ensure persistence
      const resultsData = {
        results: analysisResults,
        sourceApp: {
          title: comparisonData.source.title,
          language: sourceLanguage,
          country: sourceCountry
        },
        targetApp: {
          title: comparisonData.target.title,
          language: targetLanguage,
          country: targetCountry
        },
        timestamp: Date.now()
      };

      // Store in global variable
      globalAnalysisResults = resultsData;

      // Store in sessionStorage (more reliable than localStorage for single-tab)
      try {
        sessionStorage.setItem('comparisonResults', JSON.stringify(resultsData));
        console.log('Results stored in sessionStorage');
      } catch (e) {
        console.error('Failed to store in sessionStorage:', e);
      }

      // Also try localStorage as backup
      try {
        localStorage.setItem('comparisonResults', JSON.stringify(resultsData));
        console.log('Results stored in localStorage');
      } catch (e) {
        console.error('Failed to store in localStorage:', e);
      }

      // Verify storage
      const verifySession = sessionStorage.getItem('comparisonResults');
      const verifyLocal = localStorage.getItem('comparisonResults');
      console.log('Verification - sessionStorage:', verifySession ? 'Data found' : 'No data');
      console.log('Verification - localStorage:', verifyLocal ? 'Data found' : 'No data');

      // Navigate to results page
      console.log('Navigating to results page...');
      router.push('/comparison-results');

    } catch (err) {
      console.error('Error during analysis:', err);
      setError('Failed to analyze localization comparison. Please try again.');
      setAnalyzing(false);
    }
  };
  
  const handleEditParams = () => {
    router.back();
  };

  const renderAppPreview = (app: AppListing | null, label: 'Source' | 'Target', language: string, country: string) => {
    if (!app) return null;

    const chipColor = label === 'Source' ? 'primary' : 'secondary';
    
    return (
      <Box>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip label={label} color={chipColor} size="small" />
          <Typography variant="caption" color="text.secondary">
            {language.toUpperCase()}-{country}
          </Typography>
        </Box>
        
        {/* App Header */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Avatar 
            src={app.icon_url} 
            alt={app.title}
            sx={{ width: 60, height: 60 }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" noWrap>{app.title}</Typography>
            <Typography variant="body2" color="text.secondary">{app.developer}</Typography>
            {app.rating && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <Rating value={app.rating} precision={0.1} readOnly size="small" />
                <Typography variant="body2">
                  {app.rating.toFixed(1)}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
        
        {/* Short Description */}
        <Typography variant="subtitle2" gutterBottom>Short Description</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {app.short_description || 'No short description available'}
        </Typography>
        
        {/* Long Description Preview */}
        <Typography variant="subtitle2" gutterBottom>Long Description</Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            maxHeight: 200, 
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 8,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {app.long_description || 'No long description available'}
        </Typography>
        
        {/* Screenshots */}
        {app.screenshots && app.screenshots.length > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Screenshots</Typography>
            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
              {app.screenshots.slice(0, 3).map((screenshot, index) => (
                <Card key={index} sx={{ minWidth: 100, maxWidth: 100 }}>
                  <CardMedia
                    component="img"
                    height="178"
                    image={screenshot.url}
                    alt={screenshot.alt_text || `Screenshot ${index + 1}`}
                    sx={{ objectFit: 'cover' }}
                  />
                </Card>
              ))}
              {app.screenshots.length > 3 && (
                <Box sx={{ 
                  minWidth: 100, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'text.secondary'
                }}>
                  +{app.screenshots.length - 3} more
                </Box>
              )}
            </Box>
          </>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%', py: 4 }}>
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Loading app listings for comparison...</Typography>
        </Box>
      ) : analyzing ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>Analyzing Localization Comparison</Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Comparing {comparisonData.source?.title} vs {comparisonData.target?.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This may take 15-30 seconds...
          </Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      ) : (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Localization Comparison Preview
          </Typography>
          
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Review the app listings before proceeding with localization analysis
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          {/* Side by Side Preview */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
            alignItems: { xs: 'stretch', md: 'flex-start' }
          }}>
            {/* Source App */}
            <Box sx={{ flex: 1 }}>
              {renderAppPreview(
                comparisonData.source, 
                'Source', 
                sourceLanguage, 
                sourceCountry
              )}
            </Box>
            
            {/* Divider */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              py: { xs: 2, md: 0 }
            }}>
              <CompareArrowsIcon 
                color="action" 
                sx={{ 
                  fontSize: 40, 
                  transform: { xs: 'rotate(90deg)', md: 'rotate(0deg)' } 
                }} 
              />
            </Box>
            
            {/* Target App */}
            <Box sx={{ flex: 1 }}>
              {renderAppPreview(
                comparisonData.target, 
                'Target', 
                targetLanguage, 
                targetCountry
              )}
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          {/* Quick Comparison Stats */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Quick Comparison</Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2
            }}>
              <Box sx={{ flex: 1 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Title Length</Typography>
                  <Typography>
                    Source: {comparisonData.source?.title.length || 0} chars
                  </Typography>
                  <Typography>
                    Target: {comparisonData.target?.title.length || 0} chars
                  </Typography>
                </Paper>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Screenshots</Typography>
                  <Typography>
                    Source: {comparisonData.source?.screenshots?.length || 0}
                  </Typography>
                  <Typography>
                    Target: {comparisonData.target?.screenshots?.length || 0}
                  </Typography>
                </Paper>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Ratings</Typography>
                  <Typography>
                    Source: {comparisonData.source?.rating?.toFixed(1) || 'N/A'}
                  </Typography>
                  <Typography>
                    Target: {comparisonData.target?.rating?.toFixed(1) || 'N/A'}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </Box>
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="outlined" 
              startIcon={<CancelIcon />}
              onClick={() => router.push('/')}
              disabled={analyzing}
            >
              Cancel
            </Button>
            
            <Box>
              <Button 
                sx={{ mr: 2 }} 
                startIcon={<ArrowBackIcon />}
                onClick={handleEditParams}
                disabled={analyzing}
              >
                Edit Parameters
              </Button>
              
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                startIcon={<AnalyticsIcon />}
                onClick={handleAnalyze}
                disabled={!comparisonData.source || !comparisonData.target || analyzing}
              >
                {analyzing ? 'Analyzing...' : 'Analyze Localization'}
              </Button>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

// Export the global results for the results page
export { globalAnalysisResults };

export default function ComparisonPreviewPage() {
  return (
    <Layout>
      <Suspense fallback={
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Loading...</Typography>
        </Box>
      }>
        <ComparisonPreviewContent />
      </Suspense>
    </Layout>
  );
}
