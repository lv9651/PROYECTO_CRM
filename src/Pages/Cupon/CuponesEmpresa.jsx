import React, { useState } from 'react';
import {
  Container, Typography, Box, TextField, Button, Paper,
  Table, TableHead, TableRow, TableCell, TableBody,
  FormControl, Select, MenuItem, Alert
} from '@mui/material';

const GestionCupones = () => {
  const [nombreCupon, setNombreCupon] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [limite, setLimite] = useState('');
  const [cupones, setCupones] = useState([]);
  const [error, setError] = useState('');

  const crearCupon = () => {
    // Validación
    if (!nombreCupon || !empresa || !fechaInicio || !fechaFin || !limite) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      setError('La fecha de inicio no puede ser mayor a la fecha de fin');
      return;
    }

    const nuevoCupon = {
      nombre: nombreCupon,
      empresa,
      fechaInicio,
      fechaFin,
      limite: parseInt(limite, 10),
      creado: new Date().toLocaleDateString()
    };

    setCupones([...cupones, nuevoCupon]);
    // Limpiar formulario
    setNombreCupon('');
    setEmpresa('');
    setFechaInicio('');
    setFechaFin('');
    setLimite('');
    setError('');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Cupones por Empresa
      </Typography>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      <Box display="flex" flexDirection="column" gap={2} mb={4}>
        <TextField
          label="Nombre del cupón"
          value={nombreCupon}
          onChange={(e) => setNombreCupon(e.target.value)}
          fullWidth
        />
        <FormControl fullWidth>
          <Select
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">Seleccione empresa</MenuItem>
            <MenuItem value="QF">QF</MenuItem>
            <MenuItem value="MS">MS</MenuItem>
            <MenuItem value="QUINSAFARM">QUINSAFARM</MenuItem>
          </Select>
        </FormControl>
        <Box display="flex" gap={2}>
          <TextField
            label="Fecha Inicio"
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Fecha Fin"
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>
        <TextField
          label="Límite de uso"
          type="number"
          value={limite}
          onChange={(e) => setLimite(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={crearCupon}>
          Crear Cupón
        </Button>
      </Box>

      {cupones.length > 0 && (
        <Paper>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Nombre</strong></TableCell>
                <TableCell><strong>Empresa</strong></TableCell>
                <TableCell><strong>Fecha Inicio</strong></TableCell>
                <TableCell><strong>Fecha Fin</strong></TableCell>
                <TableCell><strong>Límite</strong></TableCell>
                <TableCell><strong>Creado</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cupones.map((c, i) => (
                <TableRow key={i}>
                  <TableCell>{c.nombre}</TableCell>
                  <TableCell>{c.empresa}</TableCell>
                  <TableCell>{c.fechaInicio}</TableCell>
                  <TableCell>{c.fechaFin}</TableCell>
                  <TableCell>{c.limite}</TableCell>
                  <TableCell>{c.creado}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>
  );
};

export default GestionCupones;