'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  CircularProgress,
  Divider,
  Chip,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import Layout from '../../components/layout/Layout';
import apiService, { LocalizationComparisonResult } from '../../services/api';

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

function ComparisonResultsContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [results, setResults] = useState<LocalizationComparisonResult | null>(null);
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Get the comparison data from localStorage
        const storedData = localStorage.getItem('comparisonData');
        if (!storedData) {
          setError('No comparison data found');
          setLoading(false);
          return;
        }
        
        const comparisonData = JSON.parse(storedData);
        
        // Clear the stored data
        localStorage.removeItem('comparisonData');
        
        // Analyze the comparison
        const analysisResults = await apiService.analyzeLocalizationComparison(
          comparisonData.source.data,
          comparisonData.target.data
        );
        
        setResults(analysisResults);
      } catch (err) {
        setError('Failed to analyze localization comparison');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, []);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'success.main';
    if (score >= 60) return 'warning.main';
    return 'error.main';
  };
  
  const getMaturityChip = (maturity: string) => {
    let color: 'default' | 'primary' | 'secondary' | 'success' = 'default';
    if (maturity === 'basic') color = 'default';
    else if (maturity === 'intermediate') color = 'primary';
    else if (maturity === 'advanced') color = 'success';
    
    return <Chip label={maturity.toUpperCase()} color={color} size="small" />;
  };
  
  const getImpactIcon = (impact: string) => {
    if (impact === 'high') return <ErrorIcon color="error" />;
    if (impact === 'medium') return <WarningIcon color="warning" />;
    return <CheckCircleIcon color="success" />;
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
              Localization Comparison Analysis
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h5">
                Overall Score: 
                <Box component="span" sx={{ color: getScoreColor(results.overall_localization_score), ml: 1 }}>
                  {results.overall_localization_score}/100
                </Box>
              </Typography>
              {getMaturityChip(results.localization_maturity)}
            </Box>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              {results.executive_summary}
            </Typography>
            
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              {results.comparison_insights}
            </Typography>
          </Paper>
          
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Overview" />
              <Tab label="Translation" />
              <Tab label="Cultural" />
              <Tab label="Technical" />
              <Tab label="Visual" />
              <Tab label="SEO/ASO" />
              <Tab label="Recommendations" />
            </Tabs>
            
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                Localization Quality Breakdown
              </Typography>
              
              <Box sx={{ mt: 3 }}>
                {/* Translation Completeness */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ flex: 1 }}>
                      Translation Completeness
                    </Typography>
                    <Typography variant="h6" sx={{ color: getScoreColor(results.translation_completeness.score) }}>
                      {results.translation_completeness.score}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={results.translation_completeness.score} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                
                {/* Translation Quality */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ flex: 1 }}>
                      Translation Quality
                    </Typography>
                    <Typography variant="h6" sx={{ color: getScoreColor(results.translation_quality.score) }}>
                      {results.translation_quality.score}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={results.translation_quality.score} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                
                {/* Cultural Adaptation */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ flex: 1 }}>
                      Cultural Adaptation
                    </Typography>
                    <Typography variant="h6" sx={{ color: getScoreColor(results.cultural_adaptation.score) }}>
                      {results.cultural_adaptation.score}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={results.cultural_adaptation.score} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                
                {/* Technical Localization */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ flex: 1 }}>
                      Technical Localization
                    </Typography>
                    <Typography variant="h6" sx={{ color: getScoreColor(results.technical_localization.score) }}>
                      {results.technical_localization.score}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={results.technical_localization.score} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                
                {/* Visual Localization */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ flex: 1 }}>
                      Visual Localization
                    </Typography>
                    <Typography variant="h6" sx={{ color: getScoreColor(results.visual_localization.score) }}>
                      {results.visual_localization.score}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={results.visual_localization.score} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                
                {/* SEO/ASO Optimization */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ flex: 1 }}>
                      SEO/ASO Optimization
                    </Typography>
                    <Typography variant="h6" sx={{ color: getScoreColor(results.seo_aso_optimization.score) }}>
                      {results.seo_aso_optimization.score}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={results.seo_aso_optimization.score} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Box>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                Translation Analysis
              </Typography>
              
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Completeness Score: {results.translation_completeness.score}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {results.translation_completeness.details}
                  </Typography>
                  
                  {results.translation_completeness.missing_elements && 
                   results.translation_completeness.missing_elements.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Missing Elements:
                      </Typography>
                      <List dense>
                        {results.translation_completeness.missing_elements.map((element, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <ErrorIcon color="error" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={element} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Quality Score: {results.translation_quality.score}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {results.translation_quality.details}
                  </Typography>
                  
                  {results.translation_quality.strengths && 
                   results.translation_quality.strengths.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Strengths:
                      </Typography>
                      <List dense>
                        {results.translation_quality.strengths.map((strength, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <CheckCircleIcon color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={strength} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                  
                  {results.translation_quality.issues && 
                   results.translation_quality.issues.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Issues:
                      </Typography>
                      {results.translation_quality.issues.map((issue, index) => (
                        <Accordion key={index}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>{issue.element}</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body2" color="error" gutterBottom>
                              Issue: {issue.issue}
                            </Typography>
                            <Typography variant="body2" color="primary">
                              Suggestion: {issue.suggestion}
                            </Typography>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Cultural Adaptation
              </Typography>
              
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Score: {results.cultural_adaptation.score}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {results.cultural_adaptation.details}
                  </Typography>
                  
                  {results.cultural_adaptation.strengths && 
                   results.cultural_adaptation.strengths.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Strengths:
                      </Typography>
                      <List dense>
                        {results.cultural_adaptation.strengths.map((strength, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <CheckCircleIcon color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={strength} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                  
                  {results.cultural_adaptation.issues && 
                   results.cultural_adaptation.issues.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Cultural Concerns:
                      </Typography>
                      {results.cultural_adaptation.issues.map((issue, index) => (
                        <Accordion key={index}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>{issue.element}</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body2" color="error" gutterBottom>
                              Concern: {issue.cultural_concern}
                            </Typography>
                            <Typography variant="body2" color="primary">
                              Recommendation: {issue.recommendation}
                            </Typography>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </TabPanel>
            
            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>
                Technical Localization
              </Typography>
              
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Score: {results.technical_localization.score}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {results.technical_localization.details}
                  </Typography>
                  
                  {results.technical_localization.issues && 
                   results.technical_localization.issues.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Technical Issues:
                      </Typography>
                      <List>
                        {results.technical_localization.issues.map((issue, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <WarningIcon color="warning" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={issue.type}
                              secondary={
                                <>
                                  <Typography component="span" variant="body2" color="error">
                                    Found: {issue.found}
                                  </Typography>
                                  <br />
                                  <Typography component="span" variant="body2" color="success.main">
                                    Expected: {issue.expected}
                                  </Typography>
                                </>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </TabPanel>
            
            <TabPanel value={tabValue} index={4}>
              <Typography variant="h6" gutterBottom>
                Visual Localization
              </Typography>
              
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Score: {results.visual_localization.score}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {results.visual_localization.details}
                  </Typography>
                  
                  {results.visual_localization.untranslated_visuals && 
                   results.visual_localization.untranslated_visuals.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Untranslated Visual Elements:
                      </Typography>
                      <List dense>
                        {results.visual_localization.untranslated_visuals.map((visual, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <ErrorIcon color="error" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={visual} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                  
                  {results.visual_localization.cultural_concerns && 
                   results.visual_localization.cultural_concerns.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Cultural Concerns:
                      </Typography>
                      <List dense>
                        {results.visual_localization.cultural_concerns.map((concern, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <WarningIcon color="warning" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={concern} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </TabPanel>
            
            <TabPanel value={tabValue} index={5}>
              <Typography variant="h6" gutterBottom>
                SEO/ASO Optimization
              </Typography>
              
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Score: {results.seo_aso_optimization.score}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {results.seo_aso_optimization.keyword_analysis}
                  </Typography>
                  
                  {results.seo_aso_optimization.character_utilization && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Character Utilization:
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText 
                            primary="Title"
                            secondary={results.seo_aso_optimization.character_utilization.title}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Short Description"
                            secondary={results.seo_aso_optimization.character_utilization.short_description}
                          />
                        </ListItem>
                      </List>
                    </Box>
                  )}
                  
                  {results.seo_aso_optimization.recommendations && 
                   results.seo_aso_optimization.recommendations.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Recommendations:
                      </Typography>
                      <List>
                        {results.seo_aso_optimization.recommendations.map((rec, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <CheckCircleIcon color="primary" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={rec} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </TabPanel>
            
            <TabPanel value={tabValue} index={6}>
              <Typography variant="h6" gutterBottom>
                Prioritized Recommendations
              </Typography>
              
              {results.prioritized_recommendations.map((rec, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <PriorityHighIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">
                          Priority {rec.priority}: {rec.category}
                        </Typography>
                      </Box>
                      {getImpactIcon(rec.impact)}
                    </Box>
                    
                    <Typography variant="body2" color="error" gutterBottom>
                      Issue: {rec.issue}
                    </Typography>
                    
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {rec.recommendation}
                    </Typography>
                    
                    <Chip 
                      label={`Impact: ${rec.impact}`} 
                      size="small" 
                      sx={{ mt: 1 }}
                      color={rec.impact === 'high' ? 'error' : rec.impact === 'medium' ? 'warning' : 'default'}
                    />
                  </CardContent>
                </Card>
              ))}
            </TabPanel>
          </Paper>
          
          {/* Action Buttons */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="outlined" 
              startIcon={<HomeIcon />}
              onClick={() => router.push('/')}
            >
              New Analysis
            </Button>
            
            <Button 
              variant="contained" 
              startIcon={<ArrowBackIcon />}
              onClick={() => router.back()}
            >
              Back to Preview
            </Button>
          </Box>
        </>
      ) : null}
    </Box>
  );
}

export default function ComparisonResultsPage() {
  return (
    <Layout>
      <Suspense fallback={
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Loading...</Typography>
        </Box>
      }>
        <ComparisonResultsContent />
      </Suspense>
    </Layout>
  );
}
