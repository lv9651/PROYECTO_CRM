import { createTheme } from '@mui/material/styles';

// Colores corporativos estilo Claro
const claroRed = '#15afc6';
const claroDarkRed = '#B30000';
const claroWhite = '#FFFFFF';

const theme = createTheme({
  palette: {
    primary: {
      main: claroRed,
      dark: claroDarkRed,
      contrastText: claroWhite,
    },
    secondary: {
      main: '#00A9E0',
    },
    background: {
      default: '#F5F5F5',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 'bold',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
  },
});

export default theme;