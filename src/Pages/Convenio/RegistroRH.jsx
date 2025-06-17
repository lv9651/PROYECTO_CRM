import React, { useState } from 'react';
import {
  Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Modal, Box, TextField, MenuItem, Checkbox, FormControlLabel, CircularProgress, Alert,
  TablePagination
} from '@mui/material';
import axios from 'axios';
import { BASE_URL } from '../../Conf/config';
import { useAuth } from '../../Compo/AuthContext';

const empresas = ['QF', 'MS', 'VINALI'];
const tiposDocumento = ['RH', 'FT'];

const RegistroRH = () => {
  const { user } = useAuth();

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [registros, setRegistros] = useState([]);
  const [filtros, setFiltros] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(5);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [registroActual, setRegistroActual] = useState(null);
  const [formulario, setFormulario] = useState({
    fechaEmision: '',
    empresa: '',
    verificacion: false,
    tipoDocumento: '',
    importe: '',
    renta: '',
    totalPagar: '',
    ruc: '',
    descripcion: '',
    observaciones: ''
  });

  const cargarDatos = () => {
    if (!fechaInicio || !fechaFin) {
      setError('Debe ingresar ambas fechas');
      return;
    }

    setLoading(true);
    setError('');

    axios.get(`${BASE_URL}/api/Convenio`, {
      params: {
        fechaInicio,
        fechaFin,
        idRepresentante: '1'
      }
    })
      .then(res => {
        setRegistros(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al cargar convenios:', err);
        setError('Error al cargar los registros.');
        setLoading(false);
      });
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
    setPagina(0);
  };

  const filtrarRegistros = () => {
    return registros.filter(reg => {
      return Object.keys(filtros).every(key =>
        (reg[key] || '').toString().toLowerCase().includes(filtros[key]?.toLowerCase() || '')
      );
    });
  };

  const abrirModal = (registro) => {
    setRegistroActual(registro);
    setFormulario({
      fechaEmision: '',
      empresa: '',
      verificacion: false,
      tipoDocumento: '',
      importe: '',
      renta: '',
      totalPagar: '',
      ruc: '',
      descripcion: '',
      observaciones: ''
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => setModalAbierto(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormulario(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGuardar = () => {
    console.log('📦 Datos guardados para:', registroActual);
    console.log(formulario);
    cerrarModal();
  };

  const handleChangePagina = (event, newPage) => {
    setPagina(newPage);
  };

  const handleChangeFilasPorPagina = (event) => {
    setFilasPorPagina(parseInt(event.target.value, 10));
    setPagina(0);
  };

  const registrosFiltrados = filtrarRegistros();
  const registrosPaginados = registrosFiltrados.slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Gestión de RXH</Typography>

      <Box display="flex" gap={2} mb={3}>
        <TextField
          type="date"
          label="Fecha Inicio"
          value={fechaInicio}
          onChange={e => setFechaInicio(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField
          type="date"
          label="Fecha Fin"
          value={fechaFin}
          onChange={e => setFechaFin(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <Button variant="contained" onClick={cargarDatos}>Buscar</Button>
      </Box>

      {error && <Alert severity="warning">{error}</Alert>}
      {loading && <Box textAlign="center"><CircularProgress /></Box>}

      {!loading && registros.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {[
                  { key: 'zona', label: 'Zona' },
                  { key: 'representante_Medico', label: 'Representate Medico' },
                  { key: 'medico', label: 'Médico' },
                  { key: 'documento', label: 'Documento' },
                  { key: 'descripcion', label: 'Banco' },
                  { key: 'cuenta', label: 'Cuenta' },
                  { key: 'cci', label: 'CCI' },
                  { key: 'unidaD_FM', label: 'UNIDAD FM' },
                  { key: 'venta', label: 'Venta (S/)' },
                ].map(({ key, label }) => (
                  <TableCell key={key} sx={{ minWidth: 120 }}>
                    <TextField
                      variant="standard"
                      placeholder={label}
                      value={filtros[key] || ''}
                      onChange={(e) => handleFiltroChange(key, e.target.value)}
                      fullWidth
                    />
                  </TableCell>
                ))}
                <TableCell><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {registrosPaginados.map((reg, idx) => (
                <TableRow key={idx}>
                  <TableCell>{reg.zona}</TableCell>
                  <TableCell>{reg.representante_Medico}</TableCell>
                  <TableCell>{reg.medico}</TableCell>
                  <TableCell>{reg.documento}</TableCell>
                  <TableCell>{reg.descripcion}</TableCell>
                  <TableCell>{reg.cuenta}</TableCell>
                  <TableCell>{reg.cci}</TableCell>
                  <TableCell>{reg.unidaD_FM}</TableCell>
                  <TableCell>{reg.venta ?? '-'}</TableCell>
                  <TableCell>
                    <Button variant="outlined" onClick={() => abrirModal(reg)}>Registrar RXH</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <TablePagination
            rowsPerPageOptions={[15, 30, 50]}
            component="div"
            count={registrosFiltrados.length}
            rowsPerPage={filasPorPagina}
            page={pagina}
            onPageChange={handleChangePagina}
            onRowsPerPageChange={handleChangeFilasPorPagina}
          />
        </TableContainer>
      )}

    <Modal
  open={modalAbierto}
  onClose={cerrarModal}
  closeAfterTransition
  BackdropProps={{ style: { backgroundColor: 'rgba(0, 0, 0, 0.5)' } }}
>
  <Box
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: { xs: '90%', sm: 600 },
      bgcolor: 'background.paper',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      p: 5,
      borderRadius: 4,
      maxHeight: '90vh',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}
  >
    <Typography variant="h5" fontWeight="bold" textAlign="center" mb={2}>
      Registro RXH - {registroActual?.medico}
    </Typography>

    <TextField
      label="Fecha de Emisión"
      type="date"
      name="fechaEmision"
      value={formulario.fechaEmision}
      onChange={handleChange}
      InputLabelProps={{ shrink: true }}
      fullWidth
    />

    <TextField
      select
      label="Empresa"
      name="empresa"
      value={formulario.empresa}
      onChange={handleChange}
      fullWidth
    >
      {empresas.map((e, i) => (
        <MenuItem key={i} value={e}>
          {e}
        </MenuItem>
      ))}
    </TextField>

    <FormControlLabel
      control={
        <Checkbox
          name="verificacion"
          checked={formulario.verificacion}
          onChange={handleChange}
          color="primary"
        />
      }
      label="Verificación"
    />

    <TextField
      select
      label="Tipo de Documento"
      name="tipoDocumento"
      value={formulario.tipoDocumento}
      onChange={handleChange}
      fullWidth
    >
      {tiposDocumento.map((doc, i) => (
        <MenuItem key={i} value={doc}>
          {doc}
        </MenuItem>
      ))}
    </TextField>

    <Box
      sx={{
        display: 'flex',
        gap: 2,
        flexWrap: 'wrap',
        justifyContent: 'space-between'
      }}
    >
      <TextField
        label="Importe"
        name="importe"
        type="number"
        value={formulario.importe}
        onChange={handleChange}
        sx={{ flex: '1 1 30%' }}
      />
      <TextField
        label="Renta"
        name="renta"
        type="number"
        value={formulario.renta}
        onChange={handleChange}
        sx={{ flex: '1 1 30%' }}
      />
      <TextField
        label="Total a Pagar"
        name="totalPagar"
        type="number"
        value={formulario.totalPagar}
        onChange={handleChange}
        sx={{ flex: '1 1 30%' }}
      />
    </Box>

    <TextField
      label="RUC"
      name="ruc"
      value={formulario.ruc}
      onChange={handleChange}
      fullWidth
    />
    <TextField
      label="Descripción"
      name="descripcion"
      value={formulario.descripcion}
      onChange={handleChange}
      fullWidth
    />
    <TextField
      label="Observaciones"
      name="observaciones"
      value={formulario.observaciones}
      onChange={handleChange}
      fullWidth
      multiline
      rows={4}
    />

    <Box textAlign="right" mt={2}>
      <Button variant="contained" color="primary" onClick={handleGuardar}>
        Guardar
      </Button>
    </Box>
  </Box>
</Modal>
    </Container>
  );
};

export default RegistroRH;