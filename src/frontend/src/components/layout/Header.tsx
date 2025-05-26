'use client';

import { AppBar, Toolbar, Typography, Box, useTheme } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';

export default function Header() {
  const theme = useTheme();
  
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Box display="flex" alignItems="center">
          <LanguageIcon 
            sx={{ 
              color: theme.palette.primary.main,
              fontSize: 32,
              mr: 2
            }} 
          />
          <Typography variant="h6" component="div" fontWeight={500}>
            App Localization Audit Tool
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
