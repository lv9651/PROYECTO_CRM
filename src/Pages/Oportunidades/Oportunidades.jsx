import React from 'react';
import {
  Container,
  Typography,
  Grid,
  CardContent,
  CardActions,
  Button,
  Box,
  Paper,
  Divider,
  Chip
} from '@mui/material';
import { LocalHospital, Visibility } from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Simulación de oportunidades dermatológicas
const visitas = [
  { id: 1, medico: 'Dra. Sánchez - Centro Estético DermoPlus', estado: 'Visita Realizada' },
  { id: 2, medico: 'Dr. López - Clínica Piel Sana', estado: 'Muestra Entregada' },
  { id: 3, medico: 'Dra. Pérez - DermaEstética Pro', estado: 'Cierre Exitoso' },
];

// Avance de oportunidades por mes
const avance = [
  { mes: 'Ene', oportunidades: 5 },
  { mes: 'Feb', oportunidades: 12 },
  { mes: 'Mar', oportunidades: 18 },
  { mes: 'Abr', oportunidades: 22 },
  { mes: 'May', oportunidades: 27 },
  { mes: 'Jun', oportunidades: 30 },
];

// Colores por estado
const estadoColor = {
  'Visita Realizada': 'info',
  'Interés Detectado': 'warning',
  'Muestra Entregada': 'primary',
  'Cierre Exitoso': 'success',
  'No Interesado': 'error'
};

const OportunidadesVisitas = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Encabezado */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h4" fontWeight={600}>Visitas Médicas</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Seguimiento de visitas realizadas por visitadores médicos para promocionar tratamientos dermatológicos.
        </Typography>
      </Box>

      {/* Tarjetas de visitas */}
      <Grid container spacing={3} justifyContent="center">
        {visitas.map((visita) => (
          <Grid item xs={12} sm={6} md={4} key={visita.id}>
            <Paper elevation={3} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocalHospital color="secondary" />
                  <Typography variant="h6">{visita.medico}</Typography>
                </Box>
                <Chip
                  label={visita.estado}
                  color={estadoColor[visita.estado] || 'default'}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </CardContent>
              <Divider />
              <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                <Button size="small" variant="outlined" startIcon={<Visibility />}>
                  Ver detalle
                </Button>
              </CardActions>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Gráfico de avance mensual */}
      <Box sx={{ mt: 8 }}>
        <Typography variant="h5" textAlign="center" gutterBottom>
          Evolución de Oportunidades Captadas
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={avance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="oportunidades"
                stroke="#6a1b9a"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Container>
  );
};

export default OportunidadesVisitas;