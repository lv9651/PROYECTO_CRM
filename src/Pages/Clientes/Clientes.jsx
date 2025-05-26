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
  CardContent,
  CardActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Business, AddBusiness, Visibility } from '@mui/icons-material';

// Lista simulada de clientes dermatológicos
const clientes = [
  { id: 1, nombre: 'Centro DermoPlus', estado: 'Activo', fechaRegistro: '2023-01-10' },
  { id: 2, nombre: 'Clínica Piel Sana', estado: 'Pendiente', fechaRegistro: '2023-02-15' },
  { id: 3, nombre: 'Estética DermaPro', estado: 'Inactivo', fechaRegistro: '2023-03-01' },
  { id: 4, nombre: 'Dermacenter', estado: 'Activo', fechaRegistro: '2023-04-22' },
  { id: 5, nombre: 'Salud Dermatológica', estado: 'Pendiente', fechaRegistro: '2023-05-09' },
  { id: 6, nombre: 'FarmaSkin', estado: 'Inactivo', fechaRegistro: '2023-06-18' },
  { id: 7, nombre: 'Dermatología Integral', estado: 'Activo', fechaRegistro: '2023-07-30' },
  { id: 8, nombre: 'Clinica Dermalux', estado: 'Pendiente', fechaRegistro: '2023-08-12' },
  { id: 9, nombre: 'Piel Perfecta', estado: 'Activo', fechaRegistro: '2023-09-22' },
  { id: 10, nombre: 'Estética DermaCare', estado: 'Inactivo', fechaRegistro: '2023-10-10' },
  { id: 11, nombre: 'Laboratorio Dermalab', estado: 'Activo', fechaRegistro: '2023-11-05' },
  { id: 12, nombre: 'Centro Dermatológico Skinmed', estado: 'Pendiente', fechaRegistro: '2023-12-13' },
  { id: 13, nombre: 'Estética Dermavida', estado: 'Inactivo', fechaRegistro: '2024-01-19' },
  { id: 14, nombre: 'Dermasolutions', estado: 'Activo', fechaRegistro: '2024-02-02' },
  { id: 15, nombre: 'Salud Piel', estado: 'Pendiente', fechaRegistro: '2024-03-10' },
  { id: 16, nombre: 'Centro DermaPlus', estado: 'Inactivo', fechaRegistro: '2024-04-04' },
  { id: 17, nombre: 'Clínica DermaClin', estado: 'Activo', fechaRegistro: '2024-05-06' },
  { id: 18, nombre: 'Dermatología Premium', estado: 'Pendiente', fechaRegistro: '2024-06-10' },
  { id: 19, nombre: 'Farma Derma', estado: 'Inactivo', fechaRegistro: '2024-07-25' },
  { id: 20, nombre: 'Clinica Dermavisión', estado: 'Activo', fechaRegistro: '2024-08-02' },
];

// Colores para los estados
const estadoColor = {
  Activo: 'success',
  Pendiente: 'warning',
  Inactivo: 'default',
};

const Clientes = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* Encabezado */}
      <Box textAlign="center" mb={5}>
        <Typography variant="h4" fontWeight={600}>
          Gestión de Clientes
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Administra clínicas, médicos y centros especializados del rubro dermatológico.
        </Typography>
      </Box>

      {/* Agregar nuevo cliente */}
      <Grid container spacing={3}>
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
              Agregar nuevo cliente
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddBusiness />}
              sx={{ mt: 1 }}
              fullWidth
            >
              Nuevo Cliente
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabla de clientes */}
      <Typography variant="h5" textAlign="center" gutterBottom sx={{ mt: 6 }}>
        Lista de Clientes
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 6 }}>
        <Table sx={{ minWidth: 650 }} aria-label="clientes">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha de Registro</TableCell>
              <TableCell>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell>{cliente.nombre}</TableCell>
                <TableCell>
                  <Chip
                    label={cliente.estado}
                    color={estadoColor[cliente.estado] || 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{cliente.fechaRegistro}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Visibility />}
                  >
                    Ver detalles
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Clientes;