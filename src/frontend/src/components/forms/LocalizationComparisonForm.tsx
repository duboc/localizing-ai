'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Chip
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import PreviewIcon from '@mui/icons-material/Preview';

// Common languages and countries for Google Play
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' }
];

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'ES', name: 'Spain' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'IT', name: 'Italy' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'RU', name: 'Russia' }
];

export default function LocalizationComparisonForm() {
  const router = useRouter();
  
  // Source form state
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [sourceCountry, setSourceCountry] = useState('US');
  
  // Target form state
  const [targetUrl, setTargetUrl] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('pt');
  const [targetCountry, setTargetCountry] = useState('BR');
  
  const [error, setError] = useState('');

  const validateUrl = (url: string): boolean => {
    const playStorePattern = /^https:\/\/play\.google\.com\/store\/apps\/details\?id=[\w.]+/;
    return playStorePattern.test(url);
  };

  const handleSubmit = () => {
    setError('');
    
    // Validate URLs
    if (!sourceUrl || !targetUrl) {
      setError('Please provide both source and target URLs');
      return;
    }
    
    if (!validateUrl(sourceUrl)) {
      setError('Source URL must be a valid Google Play Store link');
      return;
    }
    
    if (!validateUrl(targetUrl)) {
      setError('Target URL must be a valid Google Play Store link');
      return;
    }
    
    if (sourceUrl === targetUrl && sourceLanguage === targetLanguage && sourceCountry === targetCountry) {
      setError('Source and target must be different for comparison');
      return;
    }
    
    // Navigate to comparison preview page
    const params = new URLSearchParams({
      sourceUrl,
      sourceLanguage,
      sourceCountry,
      targetUrl,
      targetLanguage,
      targetCountry
    });
    
    router.push(`/comparison-preview?${params.toString()}`);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, mx: 'auto', maxWidth: 1200 }}>
      <Typography variant="h5" gutterBottom>
        Localization Quality Comparison
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Compare source and target app listings to identify localization issues, missing translations, and cultural adaptation opportunities.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ 
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 4,
        alignItems: { xs: 'stretch', md: 'flex-start' }
      }}>
        {/* Source Section */}
        <Box sx={{ flex: { xs: 1, md: '0 0 45%' } }}>
          <Box sx={{ mb: 2 }}>
            <Chip label="Source" color="primary" size="small" />
            <Typography variant="h6" sx={{ mt: 1 }}>
              Original App Listing
            </Typography>
          </Box>
          
          <TextField
            fullWidth
            label="Source Google Play URL"
            placeholder="https://play.google.com/store/apps/details?id=..."
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            margin="normal"
            helperText="The original version of the app listing"
          />
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Language</InputLabel>
              <Select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                label="Language"
              >
                {LANGUAGES.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Country</InputLabel>
              <Select
                value={sourceCountry}
                onChange={(e) => setSourceCountry(e.target.value)}
                label="Country"
              >
                {COUNTRIES.map((country) => (
                  <MenuItem key={country.code} value={country.code}>
                    {country.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        {/* Arrow Divider */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flex: { xs: 0, md: '0 0 10%' },
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
        
        {/* Target Section */}
        <Box sx={{ flex: { xs: 1, md: '0 0 45%' } }}>
          <Box sx={{ mb: 2 }}>
            <Chip label="Target" color="secondary" size="small" />
            <Typography variant="h6" sx={{ mt: 1 }}>
              Localized App Listing
            </Typography>
          </Box>
          
          <TextField
            fullWidth
            label="Target Google Play URL"
            placeholder="https://play.google.com/store/apps/details?id=..."
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            margin="normal"
            helperText="The localized version to compare against"
          />
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Language</InputLabel>
              <Select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                label="Language"
              >
                {LANGUAGES.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Country</InputLabel>
              <Select
                value={targetCountry}
                onChange={(e) => setTargetCountry(e.target.value)}
                label="Country"
              >
                {COUNTRIES.map((country) => (
                  <MenuItem key={country.code} value={country.code}>
                    {country.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>
      
      <Divider sx={{ my: 4 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<PreviewIcon />}
          onClick={handleSubmit}
        >
          Preview Comparison
        </Button>
      </Box>
    </Paper>
  );
}
