import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

export const PackFormSection = ({ title, children, sx = {} }) => (
  <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3, ...sx }}>
    <CardContent>
      {title && (
        <Typography variant="h6" color="primary" gutterBottom>
          {title}
        </Typography>
      )}
      {children}
    </CardContent>
  </Card>
);

export default PackFormSection;