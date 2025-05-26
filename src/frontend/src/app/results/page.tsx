'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  CircularProgress,
  Divider,
  Chip,
  Alert
} from '@mui/material';
import Layout from '../../components/layout/Layout';
import apiService, { AnalysisResult } from '../../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      style={{ width: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  const language = searchParams.get('language') || 'en';
  const country = searchParams.get('country') || 'US';
  const specialized = searchParams.get('specialized') === 'true';
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Results from the API
  const [results, setResults] = useState<AnalysisResult | null>(null);
  
  useEffect(() => {
    const fetchResults = async () => {
      if (!url) {
        setError('No URL provided');
        setLoading(false);
        return;
      }
      
      try {
        // Check if we have scraped data in localStorage
        const storedAppData = localStorage.getItem('scrapedAppData');
        let appData;
        
        if (storedAppData) {
          // Use the stored data
          appData = JSON.parse(storedAppData);
          console.log('Using stored app data from preview page');
          
          // Clear the stored data to avoid using it for future analyses
          localStorage.removeItem('scrapedAppData');
          
          // Send the app data directly to Vertex AI for analysis
          try {
            const response = await apiService.analyzeAppListingData(appData, language, country, specialized);
            setResults(response);
            setLoading(false);
            return;
          } catch (analysisError) {
            console.error('Error analyzing stored app data:', analysisError);
            // If analysis fails, fall back to the regular flow
          }
        }
        
        // If no stored data or analysis failed, use the regular flow
        const analysisResults = await apiService.analyzeAppUrl(url, language, country, specialized);
        setResults(analysisResults);
      } catch (err) {
        setError('Failed to fetch analysis results');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [url, language, country, specialized]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const renderStatusChip = (status: string) => {
    let color: 'success' | 'warning' | 'error' = 'success';
    
    if (status === 'Needs Improvement') {
      color = 'warning';
    } else if (status === 'Fail') {
      color = 'error';
    }
    
    return <Chip label={status} color={color} size="small" />;
  };

  return (
    <Box sx={{ width: '100%', py: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : results ? (
          <>
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h4" gutterBottom>
                Localization Audit Results
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle1" color="text.secondary">
                  {results.appTitle} ({results.appUrl})
                </Typography>
                {specialized && (
                  <Chip 
                    label="Specialized Analysis" 
                    color="primary" 
                    size="small" 
                    variant="outlined"
                  />
                )}
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Typography variant="h5" sx={{ mr: 2 }}>
                  Overall Score: {results.score}/10
                </Typography>
                
                <Chip 
                  label={results.score >= 8 ? 'Good' : results.score >= 6 ? 'Needs Improvement' : 'Poor'} 
                  color={results.score >= 8 ? 'success' : results.score >= 6 ? 'warning' : 'error'} 
                />
              </Box>
            </Paper>
            
            <Paper sx={{ width: '100%' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
              >
                <Tab label="Summary" />
                <Tab label="Content Quality" />
                <Tab label="Language Quality" />
                <Tab label="Visual Elements" />
              </Tabs>
              
              <TabPanel value={tabValue} index={0}>
                <Typography variant="h6" gutterBottom>
                  Executive Summary
                </Typography>
                
                {results.executiveSummary && (
                  <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="body1">
                      {results.executiveSummary}
                    </Typography>
                  </Paper>
                )}
                
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mt: 4 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom color="success.main">
                      Strengths
                    </Typography>
                    
                    {results.strengths && results.strengths.length > 0 ? (
                      <Paper sx={{ p: 2 }}>
                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                          {results.strengths.map((strength, index) => (
                            <Typography component="li" key={index} sx={{ mb: 1 }}>
                              {strength}
                            </Typography>
                          ))}
                        </Box>
                      </Paper>
                    ) : (
                      <Typography color="text.secondary">No strengths identified</Typography>
                    )}
                  </Box>
                  
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom color="error.main">
                      Areas for Improvement
                    </Typography>
                    
                    {results.areasForImprovement && results.areasForImprovement.length > 0 ? (
                      <Paper sx={{ p: 2 }}>
                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                          {results.areasForImprovement.map((area, index) => (
                            <Typography component="li" key={index} sx={{ mb: 1 }}>
                              {area}
                            </Typography>
                          ))}
                        </Box>
                      </Paper>
                    ) : (
                      <Typography color="text.secondary">No areas for improvement identified</Typography>
                    )}
                  </Box>
                </Box>
                
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom color="primary.main">
                    Prioritized Recommendations
                  </Typography>
                  
                  {results.prioritizedRecommendations && results.prioritizedRecommendations.length > 0 ? (
                    <Paper sx={{ p: 2 }}>
                      <Box component="ol" sx={{ pl: 3, m: 0 }}>
                        {results.prioritizedRecommendations.map((recommendation, index) => (
                          <Typography component="li" key={index} sx={{ mb: 1 }}>
                            {recommendation}
                          </Typography>
                        ))}
                      </Box>
                    </Paper>
                  ) : (
                    <Typography color="text.secondary">No recommendations available</Typography>
                  )}
                </Box>
              </TabPanel>
              
              <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" gutterBottom>
                  Content Quality Assessment
                </Typography>
                
                <Box sx={{ mt: 3 }}>
                  {Object.entries(results.contentQuality).map(([key, value]: [string, { status: string; evidence: string; explanation: string }]) => (
                    <Paper key={key} sx={{ p: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight={500}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Typography>
                        {renderStatusChip(value.status)}
                      </Box>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Evidence:</strong> {value.evidence}
                      </Typography>
                      
                      <Typography variant="body2">
                        <strong>Explanation:</strong> {value.explanation}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              </TabPanel>
              
              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" gutterBottom>
                  Language Quality Assessment
                </Typography>
                
                <Box sx={{ mt: 3 }}>
                  {Object.entries(results.languageQuality).map(([key, value]: [string, { status: string; evidence: string; explanation: string }]) => (
                    <Paper key={key} sx={{ p: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight={500}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Typography>
                        {renderStatusChip(value.status)}
                      </Box>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Evidence:</strong> {value.evidence}
                      </Typography>
                      
                      <Typography variant="body2">
                        <strong>Explanation:</strong> {value.explanation}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              </TabPanel>
              
              <TabPanel value={tabValue} index={3}>
                <Typography variant="h6" gutterBottom>
                  Visual Elements Assessment
                </Typography>
                
                <Box sx={{ mt: 3 }}>
                  {Object.entries(results.visualElements).map(([key, value]: [string, { status: string; evidence: string; explanation: string }]) => (
                    <Paper key={key} sx={{ p: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight={500}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Typography>
                        {renderStatusChip(value.status)}
                      </Box>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Evidence:</strong> {value.evidence}
                      </Typography>
                      
                      <Typography variant="body2">
                        <strong>Explanation:</strong> {value.explanation}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              </TabPanel>
            </Paper>
          </>
        ) : null}
    </Box>
  );
}

export default function ResultsPage() {
  return (
    <Layout>
      <Suspense fallback={
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Loading...</Typography>
        </Box>
      }>
        <ResultsContent />
      </Suspense>
    </Layout>
  );
}
