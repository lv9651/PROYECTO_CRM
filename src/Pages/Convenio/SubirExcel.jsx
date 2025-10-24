import React, { useState } from 'react';
import {
  Button, CircularProgress, Grid, Alert, Paper, Typography, FormControl, InputLabel,
  Select, MenuItem, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../Compo/AuthContext';
import { BASE_URL } from '../../Conf/config';

const SubirExcel = ({ onFileUploaded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [tipoPago, setTipoPago] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [mes, setMes] = useState('');
const [anio, setAnio] = useState(new Date().getFullYear());
  const [pagos, setPagos] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('id');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { user } = useAuth();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleTipoPagoChange = (e) => setTipoPago(e.target.value);
  const handleMesChange = (e) => setMes(e.target.value);
  const handleAnioChange = (e) => setAnio(e.target.value);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  // Subir archivo Excel
  const subirArchivo = async () => {
    if (!selectedFile) return setError('Por favor, selecciona un archivo.');
    if (!tipoPago) return setError('El tipo de pago es obligatorio.');

    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('Archivo', selectedFile);
    formData.append('TipoPago', tipoPago);
    formData.append('idRepresentante', user.emp_codigo);

    try {
      const resp = await axios.post(`${BASE_URL}/api/Contabilidad_Convenio/SubirExcel`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Respuesta de la API:', resp.data);
      onFileUploaded();
      setSelectedFile(null);
      handleCloseModal();
    } catch (err) {
      console.error('Error al subir archivo:', err);
      setError('Error al subir el archivo');
    } finally {
      setLoading(false);
    }
  };

  // Obtener pagos por representante, mes y año
  const obtenerPagos = async () => {
    if (!mes || !anio) return setError('Por favor, selecciona mes y año.');

    setError('');
    setLoading(true);

    try {
      const response = await axios.get(`${BASE_URL}/api/Contabilidad_Convenio/representante/${user.emp_codigo}`, {
        params: { mes, anio },
      });
      setPagos(response.data);
    } catch (err) {
      console.error('Error al obtener pagos:', err);
      setError('Error al obtener los pagos');
    } finally {
      setLoading(false);
    }
  };

  // Ordenar los datos
  const sortData = (array) => {
    return array.sort((a, b) => {
      if (orderBy === 'id') return order === 'asc' ? a.id - b.id : b.id - a.id;
      if (orderBy === 'importe') return order === 'asc' ? a.importe - b.importe : b.importe - a.importe;
      return 0;
    });
  };

  const paginatedData = sortData(pagos).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Subir Archivo Excel de Convenios Médicos
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={4} md={3}>
          <Button variant="contained" color="secondary" fullWidth onClick={handleOpenModal}>
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
            <Grid item xs={12} sm={6} md={4}>
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

            <Grid item xs={12} sm={6} md={4}>
              <Button variant="contained" color="secondary" fullWidth component="label">
                Seleccionar Excel
                <input type="file" hidden accept=".xlsx, .xls" onChange={handleFileChange} />
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
        Consultar Pagos por Mes y Año
      </Typography>

      <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
  <FormControl fullWidth size="small">
    <InputLabel id="mes-label">Mes</InputLabel>
    <Select
      labelId="mes-label"
      value={mes}
      onChange={handleMesChange}
      label="Mes"
    >
      {[
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ].map((nombre, index) => (
        <MenuItem key={index} value={index + 1}>
          {nombre}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Grid>

        <Grid item xs={12} sm={4}>
  <TextField
    label="Año"
    type="number"
    fullWidth
    variant="outlined"
    value={anio}
    onChange={handleAnioChange}
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
                      {[
                        'ID', 'Tipo de Pago', 'Representante', 'Lugar', 'Nombre', 'Tipo Documento',
                        'Documento de Identidad', 'RUC', 'Banco', 'Cuenta Corriente',
                        'Cuenta Interbancaria', 'Unidad FM', 'Ventas', 'Pago Bruto',
                        'Pago Después', 'Descuento', 'Renta', 'Pago Después Neto',
                        'Fecha Emisión', 'Documento', 'Serie', 'Numero', 'Importe',
                        'Detracción', 'Renta Final', 'Total a Pagar', 'Descripción', 'Observaciones','FechaCarga'
                      ].map((label) => (
                        <TableCell key={label} sx={{ fontWeight: 'bold' }}>
                          {label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                <TableBody>
  {paginatedData.map((pago) => (
    <TableRow
      hover
      key={pago.id}
      sx={{
        backgroundColor: pago.estado === 1 ? 'rgba(255, 235, 59, 0.3)' : 'inherit'
      }}
    >
      {Object.keys(pago).map((key) => (
        <TableCell key={key}>{pago[key]}</TableCell>
      ))}
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
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
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