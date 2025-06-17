import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Select, MenuItem,
  Button, Paper, Grid, FormControl, InputLabel, Card,
  CardContent, Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, IconButton
} from '@mui/material';
import { Edit, Delete, Save, Cancel } from '@mui/icons-material';
import axios from 'axios';
import { BASE_URL } from '../../Conf/config'; 


const CuotaGeneral = () => {
  const [mes, setMes] = useState('');
  const [año, setAño] = useState(new Date().getFullYear());
  const [monto, setMonto] = useState('');
  const [registros, setRegistros] = useState([]);

  const [editIndex, setEditIndex] = useState(null);
  const [editMes, setEditMes] = useState('');
  const [editAño, setEditAño] = useState('');
  const [editMonto, setEditMonto] = useState('');

  const API_URL = `${BASE_URL}/api/CuotaRepresentanteMedicoGeneral`;

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  useEffect(() => {
    axios.get(API_URL)
      .then(res => setRegistros(res.data))
      .catch(err => console.error(err));
  }, []);

const handleAgregar = () => {
  if (mes && año && monto) {
    const nuevo = {
      mes,
      año: Number(año),
      monto: Number(monto)
    };

    axios.post(API_URL, nuevo)
      .then(() => {
        axios.get(API_URL)
          .then(res => setRegistros(res.data)); // recarga datos reales
        setMes('');
        setAño(new Date().getFullYear());
        setMonto('');
      })
      .catch(err => console.error('Error al guardar', err));
  }
};

  const handleDelete = (index) => {
    const id = registros[index].id;
    axios.delete(`${API_URL}/${id}`)
      .then(() => {
        setRegistros(prev => prev.filter((_, i) => i !== index));
        if (editIndex === index) setEditIndex(null);
      })
      .catch(err => console.error('Error al eliminar', err));
  };

  const handleEdit = (index) => {
    const reg = registros[index];
    setEditIndex(index);
    setEditMes(reg.mes);
    setEditAño(reg.año.toString());
    setEditMonto(reg.monto.toString());
  };

  const handleSaveEdit = () => {
    if (!editMes || !editAño || !editMonto) {
      alert('Completa todos los campos');
      return;
    }

    const updatedCuota = {
      id: registros[editIndex].id,
      mes: editMes,
      año: Number(editAño),
      monto: Number(editMonto)
    };

    axios.put(`${API_URL}/${updatedCuota.id}`, updatedCuota)
      .then(() => {
        const updatedList = [...registros];
        updatedList[editIndex] = updatedCuota;
        setRegistros(updatedList);
        setEditIndex(null);
      })
      .catch(err => console.error('Error al actualizar', err));
  };

  const handleCancelEdit = () => {
    setEditIndex(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Ingreso de Cuotas Generales
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Mes</InputLabel>
                <Select
                  value={mes}
                  label="Mes"
                  onChange={(e) => setMes(e.target.value)}
                >
                  {meses.map((m) => (
                    <MenuItem key={m} value={m}>{m}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Año"
                type="number"
                value={año}
                onChange={(e) => setAño(e.target.value)}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Monto"
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={3} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleAgregar}
                disabled={!mes || !año || !monto}
                sx={{ height: '100%' }}
              >
                Agregar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Paper>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Cuotas Registradas</Typography>

          {registros.length === 0 ? (
            <Typography>No hay registros.</Typography>
          ) : (
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Mes</TableCell>
                    <TableCell>Año</TableCell>
                    <TableCell>Monto</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {registros.map((reg, idx) => (
                    editIndex === idx ? (
                      <TableRow key={idx}>
                        <TableCell>
                          <FormControl fullWidth size="small">
                            <Select
                              value={editMes}
                              onChange={(e) => setEditMes(e.target.value)}
                            >
                              {meses.map((m) => (
                                <MenuItem key={m} value={m}>{m}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={editAño}
                            onChange={(e) => setEditAño(e.target.value)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={editMonto}
                            onChange={(e) => setEditMonto(e.target.value)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={handleSaveEdit} color="primary"><Save /></IconButton>
                          <IconButton onClick={handleCancelEdit}><Cancel /></IconButton>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow key={idx}>
                        <TableCell>{reg.mes}</TableCell>
                        <TableCell>{reg.año}</TableCell>
                        <TableCell>S/ {Number(reg.monto).toFixed(2)}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleEdit(idx)} color="primary"><Edit /></IconButton>
                          <IconButton onClick={() => handleDelete(idx)} color="error"><Delete /></IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default CuotaGeneral;