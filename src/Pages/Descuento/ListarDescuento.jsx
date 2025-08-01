import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container, Typography, Table, TableHead, TableRow,
  TableCell, TableBody, Paper, TextField, Button, Box, Stack, IconButton
} from '@mui/material';
import { Visibility, Store } from '@mui/icons-material';
import ModalSucursal from './ModalSucursal'; // Asegúrate de ajustar la ruta según tu estructura

const ListarDescuento = () => {
  const [descuentos, setDescuentos] = useState([]);
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [descuentoSeleccionado, setDescuentoSeleccionado] = useState(null);

  const fetchDescuentos = async () => {
    try {
      const params = {
        descripcion: descripcion || '',
        fechainicio: fechaInicio || ''
      };

      const response = await axios.get('https://localhost:7146/api/descuento/listar', { params });
      setDescuentos(response.data);
    } catch (error) {
      console.error('Error al obtener los descuentos:', error);
    }
  };

  const abrirModal = (item) => {
    setDescuentoSeleccionado(item);
    setModalOpen(true);
  };

  useEffect(() => {
    fetchDescuentos();
  }, []);

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>Listado de Descuentos</Typography>

      {/* Filtros */}
      <Box component={Paper} elevation={3} sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            variant="outlined"
            size="small"
          />
          <TextField
            label="Fecha Inicio"
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <Button variant="contained" onClick={fetchDescuentos}>
            Buscar
          </Button>
        </Stack>
      </Box>

      {/* Tabla de resultados */}
      <Paper elevation={4}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#1976d2' }}>
              <TableCell sx={{ color: 'white' }}>Descripción</TableCell>
              <TableCell sx={{ color: 'white' }}>Fecha Inicio</TableCell>
              <TableCell sx={{ color: 'white' }}>Fecha Fin</TableCell>
              <TableCell sx={{ color: 'white' }}>Usuario Crea</TableCell>
              <TableCell sx={{ color: 'white' }}>Usuario Valida</TableCell>
              <TableCell sx={{ color: 'white' }}>Estado</TableCell>
              <TableCell sx={{ color: 'white' }} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {descuentos.map((item) => (
              <TableRow key={item.idDescuento}>
                <TableCell>{item.descripcion}</TableCell>
                <TableCell>
                  {item.fechaInicio ? new Date(item.fechaInicio).toLocaleString('es-PE') : ''}
                </TableCell>
                <TableCell>
                  {item.fechaFin ? new Date(item.fechaFin).toLocaleString('es-PE') : ''}
                </TableCell>
                <TableCell>{item.usuarioCrea}</TableCell>
                <TableCell>{item.usuarioValida}</TableCell>
                <TableCell>{item.estado}</TableCell>
                <TableCell align="center">
                  <IconButton color="primary" title="Asignar Sucursales" onClick={() => abrirModal(item)}>
                    <Store />
                  </IconButton>
                  <IconButton color="secondary" title="Ver Registro" onClick={() => console.log('Ver registro', item)}>
                    <Visibility />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {descuentos.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Modal de Asignar Sucursales */}
      <ModalSucursal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        descuento={descuentoSeleccionado}
      />
    </Container>
  );
};

export default ListarDescuento;