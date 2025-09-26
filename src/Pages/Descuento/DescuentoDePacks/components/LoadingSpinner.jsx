import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export const LoadingSpinner = ({ size = 24, text = "Cargando...", sx = {} }) => (
  <Box display="flex" alignItems="center" justifyContent="center" p={2} sx={sx}>
    <CircularProgress size={size} sx={{ mr: text ? 2 : 0 }} />
    {text && <Typography variant="body2">{text}</Typography>}
  </Box>
);

export default LoadingSpinner;