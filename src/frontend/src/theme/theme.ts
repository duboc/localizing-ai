import { createTheme } from '@mui/material/styles';

// Google-like color palette
const googleBlue = '#4285F4';
const googleRed = '#EA4335';
const googleYellow = '#FBBC05';
const googleGreen = '#34A853';
const googleGrey = '#9AA0A6';
const googleLightGrey = '#F1F3F4';
const googleDarkGrey = '#202124';

// Create a theme instance with Google-like styling
const theme = createTheme({
  palette: {
    primary: {
      main: googleBlue,
      light: '#80b4ff',
      dark: '#0059c1',
      contrastText: '#ffffff',
    },
    secondary: {
      main: googleRed,
      light: '#ff7961',
      dark: '#b00020',
      contrastText: '#ffffff',
    },
    error: {
      main: googleRed,
    },
    warning: {
      main: googleYellow,
    },
    success: {
      main: googleGreen,
    },
    info: {
      main: googleBlue,
    },
    text: {
      primary: googleDarkGrey,
      secondary: googleGrey,
    },
    background: {
      default: '#ffffff',
      paper: googleLightGrey,
    },
  },
  typography: {
    fontFamily: [
      'Google Sans',
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 400,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 400,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 400,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
    },
    button: {
      textTransform: 'none', // Google buttons don't use uppercase text
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8, // Google uses rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24, // Google buttons are more rounded
          padding: '8px 24px',
          boxShadow: 'none', // Google buttons typically don't have shadows
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.3)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 24, // Google search-like input
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

export default theme;
