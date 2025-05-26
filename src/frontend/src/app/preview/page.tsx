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
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Divider,
  Avatar,
  Chip,
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Card,
  CardMedia,
  IconButton,
  Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CancelIcon from '@mui/icons-material/Cancel';
import HomeIcon from '@mui/icons-material/Home';
import Layout from '../../components/layout/Layout';
import apiService, { AppListing } from '../../services/api';

function PreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  const language = searchParams.get('language') || 'en';
  const country = searchParams.get('country') || 'US';
  const specialized = searchParams.get('specialized') === 'true';
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appData, setAppData] = useState<AppListing | null>(null);
  
  useEffect(() => {
    const fetchAppData = async () => {
      if (!url) {
        setError('No URL provided');
        setLoading(false);
        return;
      }
      
      try {
        const scrapedData = await apiService.scrapeAppListing(url, language, country);
        setAppData(scrapedData);
      } catch (err) {
        setError('Failed to scrape app listing');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppData();
  }, [url, language, country]);
  
  const handleAnalyze = () => {
    // Store the scraped data in localStorage
    if (appData) {
      localStorage.setItem('scrapedAppData', JSON.stringify(appData));
      router.push(`/results?url=${encodeURIComponent(url || '')}&language=${language}&country=${country}&specialized=${specialized}`);
    }
  };
  
  const handleEditParams = () => {
    router.back();
  };

  const renderScreenshots = (screenshots: AppListing['screenshots']) => {
    if (!screenshots || screenshots.length === 0) {
      return <Typography color="text.secondary">No screenshots available</Typography>;
    }

    return (
      <Box sx={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: 2, pb: 2 }}>
        {screenshots.map((screenshot, index) => (
          <Card key={index} sx={{ minWidth: 200, maxWidth: 200, flexShrink: 0 }}>
            <CardMedia
              component="img"
              height="356"
              image={screenshot.url}
              alt={screenshot.alt_text || `Screenshot ${index + 1}`}
              sx={{ objectFit: 'cover' }}
            />
          </Card>
        ))}
      </Box>
    );
  };

  const renderReviews = (reviews: AppListing['user_reviews']) => {
    if (!reviews || reviews.length === 0) {
      return <Typography color="text.secondary">No reviews available</Typography>;
    }

    return (
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {reviews.slice(0, 3).map((review, index) => (
          <ListItem key={index} alignItems="flex-start" sx={{ px: 0 }}>
            <ListItemAvatar>
              <Avatar>{review.author.charAt(0)}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2">{review.author}</Typography>
                  {review.rating && <Rating value={review.rating} readOnly size="small" />}
                  {review.date && <Typography variant="caption" color="text.secondary">{review.date}</Typography>}
                </Box>
              }
              secondary={review.text}
            />
          </ListItem>
        ))}
        {reviews.length > 3 && (
          <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
            +{reviews.length - 3} more reviews
          </Typography>
        )}
      </List>
    );
  };

  const renderDeveloperResponses = (responses: AppListing['developer_responses']) => {
    if (!responses || responses.length === 0) {
      return <Typography color="text.secondary">No developer responses available</Typography>;
    }

    return (
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {responses.slice(0, 2).map((response, index) => (
          <ListItem key={index} alignItems="flex-start" sx={{ px: 0 }}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: 'primary.main' }}>D</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2">Developer</Typography>
                  {response.date && <Typography variant="caption" color="text.secondary">{response.date}</Typography>}
                </Box>
              }
              secondary={response.text}
            />
          </ListItem>
        ))}
        {responses.length > 2 && (
          <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
            +{responses.length - 2} more responses
          </Typography>
        )}
      </List>
    );
  };

  return (
    <Box sx={{ width: '100%', py: 4 }}>
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Scraping app listing data...</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      ) : appData ? (
        <>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              App Listing Preview
            </Typography>
            
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Review the scraped data before proceeding with analysis
            </Typography>
            
            {/* App Metadata Section */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { xs: 'flex-start', sm: 'center' } }}>
                <Avatar 
                  src={appData.icon_url} 
                  alt={appData.title}
                  sx={{ width: 80, height: 80 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5">{appData.title}</Typography>
                  <Typography variant="subtitle1" color="text.secondary">{appData.developer}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    {appData.rating && (
                      <>
                        <Rating value={appData.rating} precision={0.1} readOnly size="small" />
                        <Typography variant="body2">
                          {appData.rating.toFixed(1)}
                        </Typography>
                      </>
                    )}
                    {appData.reviews_count && (
                      <Typography variant="body2" color="text.secondary">
                        ({appData.reviews_count.toLocaleString()} reviews)
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {appData.category && <Chip label={appData.category} size="small" />}
                    {appData.content_rating && <Chip label={appData.content_rating} size="small" />}
                    {appData.price ? <Chip label={appData.price} size="small" /> : <Chip label="Free" size="small" />}
                  </Box>
                </Box>
              </Box>
            </Box>
            
            {/* Description Section */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Description</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {/* Short Description */}
                <Typography variant="subtitle1" fontWeight={500}>Short Description</Typography>
                <Typography paragraph>{appData.short_description || 'No short description available'}</Typography>
                
                <Divider sx={{ my: 2 }} />
                
                {/* Long Description */}
                <Typography variant="subtitle1" fontWeight={500}>Long Description</Typography>
                <Typography 
                  component="div" 
                  sx={{ 
                    whiteSpace: 'pre-wrap',
                    '& p': { mt: 1, mb: 1 }
                  }}
                >
                  {appData.long_description || 'No long description available'}
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            {/* Screenshots Section */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Visual Elements</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {/* Feature Graphic */}
                {appData.feature_graphic && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight={500} gutterBottom>Feature Graphic</Typography>
                    <Card>
                      <CardMedia
                        component="img"
                        height="200"
                        image={appData.feature_graphic}
                        alt="Feature graphic"
                        sx={{ objectFit: 'cover' }}
                      />
                    </Card>
                  </Box>
                )}
                
                {/* Screenshots */}
                <Typography variant="subtitle1" fontWeight={500} gutterBottom>Screenshots</Typography>
                {renderScreenshots(appData.screenshots)}
              </AccordionDetails>
            </Accordion>
            
            {/* Reviews Section */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Reviews & Responses</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={500} gutterBottom>User Reviews</Typography>
                    {renderReviews(appData.user_reviews)}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={500} gutterBottom>Developer Responses</Typography>
                    {renderDeveloperResponses(appData.developer_responses)}
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
            
            {/* Additional Information Section */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Additional Information</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={500} gutterBottom>App Details</Typography>
                    <List dense>
                      {appData.version && (
                        <ListItem>
                          <ListItemText primary="Version" secondary={appData.version} />
                        </ListItem>
                      )}
                      {appData.last_updated && (
                        <ListItem>
                          <ListItemText primary="Last Updated" secondary={appData.last_updated} />
                        </ListItem>
                      )}
                      {appData.size && (
                        <ListItem>
                          <ListItemText primary="Size" secondary={appData.size} />
                        </ListItem>
                      )}
                      {appData.installs && (
                        <ListItem>
                          <ListItemText primary="Installs" secondary={appData.installs} />
                        </ListItem>
                      )}
                      {appData.min_os_version && (
                        <ListItem>
                          <ListItemText primary="Minimum OS Version" secondary={appData.min_os_version} />
                        </ListItem>
                      )}
                      <ListItem>
                        <ListItemText 
                          primary="Contains Ads" 
                          secondary={appData.contains_ads === true ? 'Yes' : appData.contains_ads === false ? 'No' : 'Unknown'} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="In-app Purchases" 
                          secondary={appData.in_app_purchases === true ? 'Yes' : appData.in_app_purchases === false ? 'No' : 'Unknown'} 
                        />
                      </ListItem>
                    </List>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={500} gutterBottom>Developer Information</Typography>
                    <List dense>
                      {appData.developer_email && (
                        <ListItem>
                          <ListItemText primary="Email" secondary={appData.developer_email} />
                        </ListItem>
                      )}
                      {appData.developer_website && (
                        <ListItem>
                          <ListItemText primary="Website" secondary={appData.developer_website} />
                        </ListItem>
                      )}
                      {appData.privacy_policy_url && (
                        <ListItem>
                          <ListItemText primary="Privacy Policy" secondary={appData.privacy_policy_url} />
                        </ListItem>
                      )}
                    </List>
                    
                    {appData.app_permissions && appData.app_permissions.length > 0 && (
                      <>
                        <Typography variant="subtitle1" fontWeight={500} gutterBottom sx={{ mt: 2 }}>App Permissions</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {appData.app_permissions.map((permission, index) => (
                            <Chip key={index} label={permission} size="small" />
                          ))}
                        </Box>
                      </>
                    )}
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
            
            {/* Action Buttons */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                startIcon={<CancelIcon />}
                onClick={() => router.push('/')}
              >
                Cancel
              </Button>
              
              <Box>
                <Button 
                  sx={{ mr: 2 }} 
                  startIcon={<ArrowBackIcon />}
                  onClick={handleEditParams}
                >
                  Edit Parameters
                </Button>
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  startIcon={<AnalyticsIcon />}
                  onClick={handleAnalyze}
                >
                  Analyze Now
                </Button>
              </Box>
            </Box>
          </Paper>
        </>
      ) : null}
    </Box>
  );
}

export default function PreviewPage() {
  return (
    <Layout>
      <Suspense fallback={
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Loading...</Typography>
        </Box>
      }>
        <PreviewContentWrapper />
      </Suspense>
    </Layout>
  );
}

function PreviewContentWrapper() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const actionButtons = (
    <Tooltip title="Go to Home">
      <IconButton onClick={handleGoHome} color="primary">
        <HomeIcon />
      </IconButton>
    </Tooltip>
  );

  return (
    <Layout actionButtons={actionButtons}>
      <PreviewContent />
    </Layout>
  );
}
