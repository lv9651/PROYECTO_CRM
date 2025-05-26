import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  Chip,
  Divider,
  CardActions,
  CardContent
} from '@mui/material';
import { CalendarToday, AddCircle, Visibility } from '@mui/icons-material';

// Datos de reuniones simuladas
const reuniones = [
  {
    id: 1,
    cliente: 'Dra. Sánchez – Centro DermoPlus',
    fecha: '2025-04-20',
    estado: 'Programada'
  },
  {
    id: 2,
    cliente: 'Dr. López – Clínica Piel Sana',
    fecha: '2025-04-15',
    estado: 'Completada'
  },
];

const estadoColor = {
  Programada: 'info',
  Completada: 'success',
  Cancelada: 'error'
};

const Reuniones = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* Título */}
      <Box textAlign="center" mb={5}>
        <Typography variant="h4" fontWeight={600}>
          Reuniones Programadas
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Gestiona tus reuniones con médicos y centros especializados.
        </Typography>
      </Box>

      {/* Reuniones Listadas */}
      <Grid container spacing={3}>
        {reuniones.map((reunion) => (
          <Grid item xs={12} sm={6} md={4} key={reunion.id}>
            <Paper elevation={3} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <CalendarToday color="primary" />
                  <Typography variant="h6">{reunion.cliente}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Fecha: {new Date(reunion.fecha).toLocaleDateString()}
                </Typography>
                <Chip
                  label={reunion.estado}
                  color={estadoColor[reunion.estado] || 'default'}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </CardContent>
              <Divider />
              <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Visibility />}
                >
                  Ver detalles
                </Button>
              </CardActions>
            </Paper>
          </Grid>
        ))}

        {/* Botón para nueva reunión */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={2}
            sx={{
              borderRadius: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              py: 4,
              textAlign: 'center',
              bgcolor: '#f4f6f8',
              border: '2px dashed #b0bec5'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Agendar nueva reunión
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddCircle />}
              sx={{ mt: 1 }}
              fullWidth
            >
              Nueva Reunión
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Reuniones;