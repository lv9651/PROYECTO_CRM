import React, { useState } from 'react';
import {
  Button, CircularProgress, Grid, Alert, Paper, Typography, FormControl, InputLabel, 
  Select, MenuItem, Dialog, DialogActions, DialogContent, DialogTitle, TextField, 
  Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, 
  TableSortLabel, IconButton
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../Compo/AuthContext';

const SubirExcel = ({ onFileUploaded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [tipoPago, setTipoPago] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [pagos, setPagos] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('id');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const [editedPago, setEditedPago] = useState(null); // Estado para manejar edición
  const { user } = useAuth();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleTipoPagoChange = (e) => {
    setTipoPago(e.target.value);
  };

  const handleFechaDesdeChange = (e) => {
    setFechaDesde(e.target.value);
  };

  const handleFechaHastaChange = (e) => {
    setFechaHasta(e.target.value);
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const subirArchivo = async () => {
    if (!selectedFile) {
      setError('Por favor, selecciona un archivo.');
      return;
    }

    if (!tipoPago) {
      setError('El tipo de pago es obligatorio.');
      return;
    }

    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('Archivo', selectedFile);
    formData.append('TipoPago', tipoPago);
    formData.append('idrepresentante', user.emp_codigo);

    try {
      const resp = await axios.post('https://localhost:7146/api/Contabilidad_Convenio/SubirExcel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Respuesta de la API:', resp.data);
      onFileUploaded(); // Callback para actualizar el estado
      setSelectedFile(null);
      handleCloseModal();
    } catch (err) {
      console.error('Error al subir archivo:', err);
      setError('Error al subir el archivo');
    } finally {
      setLoading(false);
    }
  };

  const obtenerPagos = async () => {
    if (!fechaDesde || !fechaHasta) {
      setError('Por favor, selecciona un rango de fechas.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await axios.get('https://localhost:7146/api/Contabilidad_Convenio/representante/' + user.emp_codigo, {
        params: { fechaDesde: fechaDesde, fechaHasta: fechaHasta },
      });
      setPagos(response.data);
    } catch (err) {
      console.error('Error al obtener pagos:', err);
      setError('Error al obtener los pagos');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const sortData = (array) => {
    return array.sort((a, b) => {
      if (orderBy === 'id') {
        return order === 'asc' ? a.id - b.id : b.id - a.id;
      }
      if (orderBy === 'importe') {
        return order === 'asc' ? a.importe - b.importe : b.importe - a.importe;
      }
      return 0;
    });
  };

  const paginatedData = sortData(pagos).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleDelete = (id) => {
    console.log("Eliminar pago con ID:", id);
    setPagos(pagos.filter(pago => pago.id !== id));
  };

  const handleCellEdit = (id, key, value) => {
    setPagos(pagos.map(pago => 
      pago.id === id ? { ...pago, [key]: value } : pago
    ));
  };

  const handleUpdatePago = async (pago) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.put(
        `https://localhost:7146/api/Contabilidad_Convenio/ActrepresentanteCarg/${pago.id}`,
        pago
      );
      console.log('Pago actualizado:', response.data);
      // Recargar la lista de pagos o realizar alguna acción adicional
      obtenerPagos();
    } catch (err) {
      console.error('Error al actualizar el pago:', err);
      setError('Error al actualizar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Subir Archivo Excel de Convenios Médicos
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={4} md={3}>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={handleOpenModal}
          >
            Subir Excel
          </Button>
        </Grid>
      </Grid>

      {/* Modal de subida de archivo */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth>
        <DialogTitle>Subir Archivo y Seleccionar Tipo de Pago</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error">{error}</Alert>}

          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} sm={4} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="tipo-pago-label">Tipo de Pago</InputLabel>
                <Select
                  labelId="tipo-pago-label"
                  value={tipoPago}
                  onChange={handleTipoPagoChange}
                  label="Tipo de Pago"
                >
                  <MenuItem value="CON RXH">CON RXH</MenuItem>
                  <MenuItem value="SIN RXH">SIN RXH</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4} md={3}>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                component="label"
              >
                Seleccionar Excel
                <input
                  type="file"
                  hidden
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                />
              </Button>
            </Grid>

            {selectedFile && (
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">
                  Archivo seleccionado: {selectedFile.name}
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Cancelar
          </Button>
          <Button onClick={subirArchivo} color="primary" disabled={loading}>
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Subir Archivo'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Consultar pagos */}
      <Typography variant="h5" gutterBottom mt={4}>
        Consultar Pagos por Fecha
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Fecha Desde"
            type="date"
            fullWidth
            variant="outlined"
            value={fechaDesde}
            onChange={handleFechaDesdeChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            label="Fecha Hasta"
            type="date"
            fullWidth
            variant="outlined"
            value={fechaHasta}
            onChange={handleFechaHastaChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={obtenerPagos}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Obtener Pagos'}
          </Button>
        </Grid>
      </Grid>

      {/* Mostrar pagos */}
      {pagos.length > 0 && (
        <Grid container spacing={2} mt={3}>
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Resultados de los Pagos
              </Typography>
              <TableContainer>
                <Table sx={{ minWidth: 1200 }} aria-labelledby="tableTitle">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      {['ID', 'Tipo de Pago', 'Representante', 'Lugar', 'Nombre', 'Tipo Documento', 'Documento de Identidad', 'RUC', 'Banco', 'Cuenta Corriente', 'Cuenta Interbancaria', 'Unidad FM', 'Ventas', 'Pago Bruto', 'Pago Después', 'Descuento', 'Renta', 'Pago Después Neto', 'Fecha Emisión', 'Documento', 'Serie', 'Numero', 'Importe', 'Detracción', 'Renta Final', 'Total a Pagar', 'Descripción', 'Observaciones', 'Acciones'].map((label) => (
                        <TableCell key={label} sx={{ fontWeight: 'bold' }}>
                          {label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedData.map((pago) => (
                      <TableRow hover key={pago.id}>
                        {Object.keys(pago).map((key) => (
                          key !== 'id' ? (
                            <TableCell key={key} sx={{ padding: '10px' }}>
                              <TextField
                                fullWidth
                                variant="outlined"
                                value={pago[key]}
                                onChange={(e) => handleCellEdit(pago.id, key, e.target.value)}
                                size="small"
                                sx={{ maxWidth: 180 }} // Ajuste de tamaño para las celdas de texto
                              />
                            </TableCell>
                          ) : <TableCell key={key}>{pago[key]}</TableCell>
                        ))}
                        <TableCell>
                          <IconButton color="error" onClick={() => handleDelete(pago.id)}>
                            <DeleteIcon />
                          </IconButton>
                          <IconButton color="primary" onClick={() => handleUpdatePago(pago)}>
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={pagos.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  '& .MuiTablePagination-select': { fontSize: '1rem' },
                  '& .MuiTablePagination-toolbar': { padding: '16px' },
                }}
              />
            </Paper>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
};

export default SubirExcel;