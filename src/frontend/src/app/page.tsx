'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CompareIcon from '@mui/icons-material/Compare';
import Layout from '../components/layout/Layout';
import AppUrlForm from '../components/forms/AppUrlForm';
import LocalizationComparisonForm from '../components/forms/LocalizationComparisonForm';

export default function HomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<'single' | 'comparison'>('single');

  const handleModeChange = (event: React.MouseEvent<HTMLElement>, newMode: 'single' | 'comparison' | null) => {
    if (newMode !== null) {
      setMode(newMode);
    }
  };

  const handleSingleAuditSubmit = (url: string, useSpecializedEndpoints: boolean) => {
    // Navigate to confirmation page with URL params
    const params = new URLSearchParams({
      url,
      specialized: useSpecializedEndpoints.toString()
    });
    router.push(`/confirm?${params.toString()}`);
  };

  return (
    <Layout>
      <Box sx={{ 
        minHeight: '80vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        px: 2 
      }}>
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom 
          align="center"
          sx={{ fontWeight: 300, mb: 2 }}
        >
          App Localization Audit Tool
        </Typography>
        
        <Typography 
          variant="h5" 
          color="text.secondary" 
          align="center"
          sx={{ mb: 4, maxWidth: 800 }}
        >
          Analyze the localization quality of Google Play app listings. 
          Get actionable insights to improve your app's global reach.
        </Typography>
        
        {/* Mode Toggle */}
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleModeChange}
          aria-label="audit mode"
          sx={{ mb: 4 }}
        >
          <ToggleButton value="single" aria-label="single listing">
            <AssessmentIcon sx={{ mr: 1 }} />
            Single Listing Audit
          </ToggleButton>
          <ToggleButton value="comparison" aria-label="comparison">
            <CompareIcon sx={{ mr: 1 }} />
            Localization Comparison
          </ToggleButton>
        </ToggleButtonGroup>
        
        {/* Form Display */}
        <Box sx={{ width: '100%', maxWidth: mode === 'comparison' ? 1200 : 600 }}>
          {mode === 'single' ? (
            <AppUrlForm onSubmit={handleSingleAuditSubmit} />
          ) : (
            <LocalizationComparisonForm />
          )}
        </Box>
      </Box>
    </Layout>
  );
}
