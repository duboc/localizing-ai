'use client';

import { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface AppUrlFormProps {
  onSubmit: (url: string, useSpecializedEndpoints: boolean) => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function AppUrlForm({ onSubmit, isLoading = false, error = null }: AppUrlFormProps) {
  const [url, setUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateUrl = (input: string): boolean => {
    // Basic validation for Google Play Store URLs
    const googlePlayUrlPattern = /^https:\/\/play\.google\.com\/store\/apps\/details\?id=[\w\d\.]+(&hl=[\w\-]+)?$/;
    return googlePlayUrlPattern.test(input);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setValidationError('Please enter a URL');
      return;
    }
    
    if (!validateUrl(url)) {
      setValidationError('Please enter a valid Google Play Store app URL');
      return;
    }
    
    setValidationError(null);
    onSubmit(url, false);
  };

  return (
    <Paper 
      elevation={2}
      sx={{ 
        p: 4, 
        borderRadius: 2,
        width: '100%',
        maxWidth: 800,
        mx: 'auto'
      }}
    >
      <Typography variant="h5" component="h2" gutterBottom align="center" fontWeight={400}>
        Analyze Google Play App Listing
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph align="center">
        Enter a Google Play Store app URL to analyze its localization quality
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
        <TextField
          fullWidth
          label="Google Play Store URL"
          placeholder="https://play.google.com/store/apps/details?id=com.example.app"
          variant="outlined"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          error={!!validationError}
          helperText={validationError}
          disabled={isLoading}
          InputProps={{
            sx: { borderRadius: 6, pr: 1 }
          }}
        />
        
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
            sx={{ 
              minWidth: 200,
              borderRadius: 6
            }}
          >
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }} align="center">
          Example: https://play.google.com/store/apps/details?id=com.google.android.apps.translate
        </Typography>
      </Box>
    </Paper>
  );
}
