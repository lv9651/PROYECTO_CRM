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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel
} from '@mui/material';
import { Business, Visibility } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Datos mock de cuentas farmacéuticas con DNI peruanos
const cuentasFarmaceuticas = [
  { id: 1, nombre: 'Laboratorios Dermacare', dni: '10123456', telefono: '(01) 233-4521', usuarioRegistro: 'admin1', fechaCreacion: '2023-01-12', tipoCliente: 'Empresa', estadoCuenta: 'Cliente' },
  { id: 2, nombre: 'Dermofarma S.A.', dni: '10234567', telefono: '(01) 234-5678', usuarioRegistro: 'admin2', fechaCreacion: '2023-02-15', tipoCliente: 'Empresa', estadoCuenta: 'Prospecto' },
  { id: 3, nombre: 'Salud Piel Perú', dni: '10345678', telefono: '(01) 265-8912', usuarioRegistro: 'admin3', fechaCreacion: '2023-03-10', tipoCliente: 'Empresa', estadoCuenta: 'Cliente' },
  { id: 4, nombre: 'PharmaSkin', dni: '10456789', telefono: '(01) 278-9634', usuarioRegistro: 'admin4', fechaCreacion: '2023-04-18', tipoCliente: 'Empresa', estadoCuenta: 'Prospecto' },
  { id: 5, nombre: 'Derma Pharma S.A.C.', dni: '10567890', telefono: '(01) 310-4567', usuarioRegistro: 'admin5', fechaCreacion: '2023-05-22', tipoCliente: 'Empresa', estadoCuenta: 'Cliente' },
  { id: 6, nombre: 'Laboratorios Piel Sana', dni: '10678901', telefono: '(01) 324-7891', usuarioRegistro: 'admin6', fechaCreacion: '2023-06-30', tipoCliente: 'Empresa', estadoCuenta: 'Prospecto' },
  { id: 7, nombre: 'Farmacia Dermaclin', dni: '10789012', telefono: '(01) 312-5678', usuarioRegistro: 'admin7', fechaCreacion: '2023-07-05', tipoCliente: 'Empresa', estadoCuenta: 'Cliente' },
  { id: 8, nombre: 'Dermatológica S.A.', dni: '10890123', telefono: '(01) 299-4578', usuarioRegistro: 'admin8', fechaCreacion: '2023-08-09', tipoCliente: 'Empresa', estadoCuenta: 'Prospecto' },
  { id: 9, nombre: 'Biopharma Dermato', dni: '10901234', telefono: '(01) 378-5689', usuarioRegistro: 'admin9', fechaCreacion: '2023-09-14', tipoCliente: 'Empresa', estadoCuenta: 'Cliente' },
  { id: 10, nombre: 'Dermatolabs', dni: '11012345', telefono: '(01) 450-1234', usuarioRegistro: 'admin10', fechaCreacion: '2023-10-21', tipoCliente: 'Empresa', estadoCuenta: 'Prospecto' },
  { id: 11, nombre: 'Piel Perfecta Farmacéutica', dni: '11123456', telefono: '(01) 475-9087', usuarioRegistro: 'admin11', fechaCreacion: '2023-11-03', tipoCliente: 'Empresa', estadoCuenta: 'Cliente' },
  { id: 12, nombre: 'BioDerm Perú', dni: '11234567', telefono: '(01) 420-5678', usuarioRegistro: 'admin12', fechaCreacion: '2023-12-12', tipoCliente: 'Empresa', estadoCuenta: 'Prospecto' },
  { id: 13, nombre: 'DermaPlus Perú', dni: '11345678', telefono: '(01) 436-2345', usuarioRegistro: 'admin13', fechaCreacion: '2024-01-10', tipoCliente: 'Empresa', estadoCuenta: 'Cliente' },
  { id: 14, nombre: 'Farmacéutica Dermatológica', dni: '11456789', telefono: '(01) 299-8765', usuarioRegistro: 'admin14', fechaCreacion: '2024-02-05', tipoCliente: 'Empresa', estadoCuenta: 'Prospecto' },
  { id: 15, nombre: 'Dermatología y Salud', dni: '11567890', telefono: '(01) 267-3490', usuarioRegistro: 'admin15', fechaCreacion: '2024-03-15', tipoCliente: 'Empresa', estadoCuenta: 'Cliente' },
  { id: 16, nombre: 'Laboratorios SkinCare', dni: '11678901', telefono: '(01) 313-7482', usuarioRegistro: 'admin16', fechaCreacion: '2024-04-20', tipoCliente: 'Empresa', estadoCuenta: 'Prospecto' },
  { id: 17, nombre: 'FarmaSkin Perú', dni: '11789012', telefono: '(01) 350-2687', usuarioRegistro: 'admin17', fechaCreacion: '2024-05-25', tipoCliente: 'Empresa', estadoCuenta: 'Cliente' },
  { id: 18, nombre: 'SkinPharma', dni: '11890123', telefono: '(01) 410-8976', usuarioRegistro: 'admin18', fechaCreacion: '2024-06-30', tipoCliente: 'Empresa', estadoCuenta: 'Prospecto' },
  { id: 19, nombre: 'Dermatofarma SAC', dni: '11901234', telefono: '(01) 375-6298', usuarioRegistro: 'admin19', fechaCreacion: '2024-07-10', tipoCliente: 'Empresa', estadoCuenta: 'Cliente' },
  { id: 20, nombre: 'Salud Dermatológica', dni: '12012345', telefono: '(01) 389-4673', usuarioRegistro: 'admin20', fechaCreacion: '2024-08-20', tipoCliente: 'Empresa', estadoCuenta: 'Prospecto' }
];

// Datos para gráfico de progreso
const avanceCuentas = [
  { mes: 'Ene', progreso: 10 },
  { mes: 'Feb', progreso: 20 },
  { mes: 'Mar', progreso: 35 },
  { mes: 'Abr', progreso: 50 },
  { mes: 'May', progreso: 70 },
  { mes: 'Jun', progreso: 85 },
];

// Colores para el estado de la cuenta
const estadoColor = {
  Cliente: 'success',
  Prospecto: 'warning',
};

// Componente principal
const Cuentas = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* Encabezado */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h4" fontWeight={600}>
          Cuentas Farmacéuticas
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Control de laboratorios y farmacéuticas asociadas con enfoque en dermatología.
        </Typography>
      </Box>

      {/* Agregar nueva cuenta */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={0}
            sx={{
              border: '2px dashed #cfd8dc',
              borderRadius: 3,
              textAlign: 'center',
              height: '100%',
              p: 4,
              bgcolor: '#f9f9f9',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Business sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6">Agregar nueva cuenta</Typography>
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              startIcon={<Business />}
            >
              Nueva Cuenta
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabla de clientes */}
      <Typography variant="h5" textAlign="center" gutterBottom sx={{ mt: 6 }}>
        Clientes de Cuentas Farmacéuticas
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 6 }}>
        <Table sx={{ minWidth: 650 }} aria-label="clientes de cuentas farmacéuticas">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>DNI</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Usuario Registro</TableCell>
              <TableCell>Fecha de Creación</TableCell>
              <TableCell>Tipo de Cliente</TableCell>
              <TableCell>Estado Cuenta</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cuentasFarmaceuticas.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell>{cliente.nombre}</TableCell>
                <TableCell>{cliente.dni}</TableCell>
                <TableCell>{cliente.telefono}</TableCell>
                <TableCell>{cliente.usuarioRegistro}</TableCell>
                <TableCell>{cliente.fechaCreacion}</TableCell>
                <TableCell>{cliente.tipoCliente}</TableCell>
                <TableCell>
                  <Chip label={cliente.estadoCuenta} color={estadoColor[cliente.estadoCuenta]} size="small" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Gráfico de Avance */}
      <Box sx={{ mt: 8 }}>
        <Typography variant="h5" textAlign="center" gutterBottom>
          Avance en Integración de Cuentas
        </Typography>
        <Typography variant="body2" textAlign="center" color="text.secondary" mb={3}>
          Seguimiento mensual de progreso de incorporación de cuentas clave.
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={avanceCuentas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="progreso"
                stroke="#1976d2"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Container>
  );
};

export default Cuentas;