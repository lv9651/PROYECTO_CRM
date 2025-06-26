import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Modal,
  TextField,
  Checkbox,
  FormControlLabel,
  Divider,
  Grid,
  IconButton,Collapse 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { BASE_URL } from '../../Conf/config';
import TablePagination from '@mui/material/TablePagination';
import { useAuth } from '../../Compo/AuthContext';
const meses = [
  { nombre: 'Enero', valor: 1 },
  { nombre: 'Febrero', valor: 2 },
  { nombre: 'Marzo', valor: 3 },
  { nombre: 'Abril', valor: 4 },
  { nombre: 'Mayo', valor: 5 },
  { nombre: 'Junio', valor: 6 },
  { nombre: 'Julio', valor: 7 },
  { nombre: 'Agosto', valor: 8 },
  { nombre: 'Septiembre', valor: 9 },
  { nombre: 'Octubre', valor: 10 },
  { nombre: 'Noviembre', valor: 11 },
  { nombre: 'Diciembre', valor: 12 }
];

const anios = [2022, 2023, 2024, 2025];
const empresas = ['QF', 'MS', 'VINALI'];
const tiposDocumento = ['RH', 'FT'];

const ConsultaPorMes = () => {
  const { user } = useAuth();
  const [anio, setAnio] = useState('');
  const [mes, setMes] = useState('');
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detallesVisibles, setDetallesVisibles] = useState({});
  const toggleDetalle = (id) => {
    setDetallesVisibles(prev => ({ ...prev, [id]: !prev[id] }));
  };
 const [filtroZona, setFiltroZona] = useState('');
  const [filtroRepresentante, setFiltroRepresentante] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [registroActual, setRegistroActual] = useState(null);
const [rentaDisabled, setRentaDisabled] = useState(false);
  const [page, setPage] = useState(0);
  const rowsPerPage = 4;
const [detraccionDisabled, setDetraccionDisabled] = useState(false);
  const formatearFechaInput = (fecha) => {
    if (!fecha) return '';
    const d = new Date(fecha);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formulario, setFormulario] = useState({
    fechaEmision: '',
    empresa: '',
    verificacion: false,
    tipoDocumento: '',
    serie: '',
    nrodocumento: '',
    importe: '',
    detraccion: '',
    renta: '',
    totalPagar: '',
    ruc: '',
    descripcion: '',
    observaciones: '',
    aprob_documento: ''
  });

  const handleBuscar = () => {
    if (!anio || !mes) {
      setError('Debe seleccionar año y mes');
      return;
    }

    setError('');
    setLoading(true);

    axios.get(`${BASE_URL}/api/Contabilidad_Convenio`, {
      params: {
        anio,
        mes
      }
    })
      .then(res => {
        setDatos(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Error al consultar los datos');
        setLoading(false);
      });
  };

  const abrirModal = (registro) => {
    setRegistroActual(registro);
        const importe = parseFloat(registro.importe) || 0;
    const detraccion = parseFloat(registro.detraccion) || 0;
    const renta = parseFloat(registro.renta) || 0;
    const totalPagar = (importe - detraccion - renta).toFixed(2);
  
    setFormulario({
      fechaEmision: formatearFechaInput(registro.fechaEmision),
      empresa: registro.empresa || '',
      verificacion: registro.verificacion || false,
      tipoDocumento: registro.tipoDocumento || '',
      serie: registro.serie || '',
      nrodocumento: registro.nrodocumento || '',
      importe: registro.importe || '',
      detraccion: registro.detraccion || '',
      renta: registro.renta || '',
      totalPagar: registro.totalPagar || '',
      ruc: registro.ruc || '',
      descripcion: registro.descripcion || '',
      observaciones: registro.observaciones || '',
         aprob_documento: registro.aprob_documento || ''
    });
  
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setRegistroActual(null);
  };

const handleChange = (e) => {
  const { name, value, type, checked } = e.target;
  const val = type === 'checkbox' ? checked : value;

  let tempForm = {
    ...formulario,
    [name]: val
  };

  const tipoDoc = name === 'tipoDocumento' ? val : tempForm.tipoDocumento;
  const importe = parseFloat(name === 'importe' ? val : tempForm.importe) || 0;
  let renta = parseFloat(name === 'renta' ? val : tempForm.renta) || 0;

  const igv = importe * 0.18;
  const baseConIgv = importe + igv;
  const detraccionCalculada = (baseConIgv * 0.12).toFixed(2);

  // ---------- Tipo de documento ----------
  if (name === 'tipoDocumento') {
    if (val === 'RH') {
      tempForm.detraccion = 0;
      tempForm.renta = 0;
      setDetraccionDisabled(true);
      setRentaDisabled(false);
    } else {
      setRentaDisabled(val === 'FT');
      if (val === 'FT') tempForm.renta = 0;

      if (importe > 700) {
        tempForm.detraccion = detraccionCalculada;
        setDetraccionDisabled(false);
      } else {
        tempForm.detraccion = 0;
        setDetraccionDisabled(true);
      }
    }
  }

  // ---------- Importe ----------
  if (name === 'importe') {
    if (tipoDoc !== 'RH') {
      if (importe > 700) {
        tempForm.detraccion = detraccionCalculada;
        setDetraccionDisabled(false);
      } else {
        tempForm.detraccion = 0;
        setDetraccionDisabled(true);
      }
    } else {
      tempForm.detraccion = 0;
      setDetraccionDisabled(true);
    }
  }

  // ---------- Renta (si cambia directamente) ----------
  if (name === 'renta' && tipoDoc === 'FT') {
    tempForm.renta = 0;
  }

  // ---------- Cálculo total a pagar ----------
  const detraccion = parseFloat(tempForm.detraccion) || 0;

  let totalPagar = 0;
  if (tipoDoc === 'FT') {
    totalPagar = (importe + igv-detraccion).toFixed(2);
  } else {
    totalPagar = (importe - detraccion - renta).toFixed(2);
  }

  setFormulario({
    ...tempForm,
    totalPagar
  });
};
  const handleGuardar = () => {
    if (!registroActual || !registroActual.id) {
      alert('Registro no válido para actualizar');
      return;
    }
  
    const payload = {
      Id: registroActual.id,
      FechaEmision: formulario.fechaEmision,
      Empresa: formulario.empresa,
      Verificacion: formulario.verificacion,
      TipoDocumento: formulario.tipoDocumento,
      serie: formulario.serie || '',
       nrodocumento: formulario.nrodocumento || '',
      Importe: parseFloat(formulario.importe) || 0,
      Detraccion: parseFloat(formulario.detraccion) || 0,
      Renta: parseFloat(formulario.renta) || 0,
      TotalPagar: parseFloat(formulario.totalPagar) || 0,
      Ruc: formulario.ruc,
      Descripcion: formulario.descripcion,
      Observaciones: formulario.observaciones,
          aprob_documento: formulario.aprob_documento,
        idempleado: parseInt(user?.emp_codigo) || 0
    };
  
    axios.put(`${BASE_URL}/api/Contabilidad_Convenio/${registroActual.id}`, payload)
      .then(() => {
        alert('Registro actualizado correctamente');
        cerrarModal();
        handleBuscar(); // <-- Aquí recargas los datos
      })
      .catch((error) => {
        console.error('Error al actualizar:', error.response || error);
        alert('Error al actualizar el registro');
      });
  };

 const datosFiltrados = datos.filter(item =>
  (item.zona?.toLowerCase() || '').includes(filtroZona.toLowerCase()) &&
  (item.representante_Medico?.toLowerCase() || '').includes(filtroRepresentante.toLowerCase())
);
  const datosPaginados = datosFiltrados.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
 const handleFiltroZonaChange = (e) => {
    setFiltroZona(e.target.value);
    setPage(0);
  };
  const handleFiltroRepresentanteChange = (e) => {
    setFiltroRepresentante(e.target.value);
    setPage(0);
  };  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Consulta de Convenios por Mes
      </Typography>

      <Box display="flex" gap={2} mb={3}>
        <FormControl fullWidth>
          <InputLabel>Año</InputLabel>
          <Select value={anio} onChange={(e) => setAnio(e.target.value)} label="Año">
            {anios.map((a) => (
              <MenuItem key={a} value={a}>{a}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Mes</InputLabel>
          <Select value={mes} onChange={(e) => setMes(e.target.value)} label="Mes">
            {meses.map((m) => (
              <MenuItem key={m.valor} value={m.valor}>{m.nombre}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" onClick={handleBuscar}>Buscar</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <CircularProgress />}

      {!loading && datos.length > 0 && (
 <TableContainer 
  component={Paper}
  sx={{
    maxWidth: '100%',
    overflowX: 'auto',
    border: '1px solid #e0e0e0', // Borde exterior para el contenedor
    '& .MuiTable-root': {
      borderCollapse: 'collapse', // Esto asegura que los bordes se unan correctamente
    },
    '& .MuiTableCell-root': {
      border: '1px solid #e0e0e0', // Borde para todas las celdas
      padding: '8px',
      fontSize: '0.75rem',
    },
    '& .MuiTableHead-root .MuiTableCell-root': {
      backgroundColor: '#f5f5f5',
      fontWeight: 'bold',
      borderBottom: '2px solid #bdbdbd', // Borde más grueso para el encabezado
    }
  }}
>
    
   <Table size="small">   
            <TableHead>
              <TableRow>
              <TableCell sx={{ display: 'none' }}><strong>ID</strong></TableCell>
                <TableCell><strong>Zona</strong></TableCell>
                <TableCell><strong>Representante</strong></TableCell>
                <TableCell><strong>Médico</strong></TableCell>
                <TableCell><strong>Documento</strong></TableCell>
                <TableCell><strong>Banco</strong></TableCell>
                <TableCell><strong>Cuenta</strong></TableCell>
                <TableCell><strong>CCI</strong></TableCell>
                <TableCell><strong>UNIDAD FM</strong></TableCell>
                <TableCell><strong>PAGO DSP DEL NETO</strong></TableCell>
                <TableCell><strong>Observacion</strong></TableCell>
                 <TableCell><strong>Aprob. Doc</strong></TableCell>
                <TableCell><strong>Acciones</strong></TableCell>
              </TableRow>
               <TableRow>
                <TableCell>
                  <TextField
                    variant="standard"
                    value={filtroZona}
                    onChange={(e) => setFiltroZona(e.target.value)}
                    placeholder="Filtrar Zona"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    variant="standard"
                    value={filtroRepresentante}
                    onChange={(e) => setFiltroRepresentante(e.target.value)}
                    placeholder="Filtrar Representante"
                    fullWidth
                  />
                </TableCell>
                <TableCell colSpan={8} />
              </TableRow>
            </TableHead>
            <TableBody>
            {datosPaginados.map((item, i) => (
  <React.Fragment key={i}>
    <TableRow hover>
      <TableCell sx={{ display: 'none' }}>{item.id}</TableCell>
      <TableCell>{item.zona}</TableCell>
      <TableCell>{item.representante_Medico}</TableCell>
      <TableCell>{item.medico}</TableCell>
      <TableCell>{item.documento}</TableCell>
      <TableCell>{item.descripcion_Banco}</TableCell>
      <TableCell>{item.cuenta}</TableCell>
      <TableCell>{item.cci}</TableCell>
      <TableCell>{item.unidad_FM}</TableCell>
      <TableCell>{item.pago_despues_del_Neto}</TableCell>
      <TableCell>{item.observacion}</TableCell>
        <TableCell>{item.aprob_documento}</TableCell>
      <TableCell>
        <Button size="small" variant="outlined" onClick={() => abrirModal(item)}>
          Registrar RXH
        </Button>
        <Button
          size="small"
          onClick={() => toggleDetalle(item.id)}
          sx={{ ml: 1 }}
        >
          {detallesVisibles[item.id] ? 'Ocultar Detalle' : 'Ver Detalle'}
        </Button>
      </TableCell>
    </TableRow>

  <TableRow>
  <TableCell colSpan={11} sx={{ p: 0, border: 0 }}>
    <Collapse in={detallesVisibles[item.id]} timeout="auto" unmountOnExit>
      <Box sx={{ 
        p: 2, 
        backgroundColor: '#f0f7ff', // Fondo azul claro
        borderLeft: '3px solid #1976d2', // Borde lateral azul
        margin: '8px 0',
        borderRadius: '4px'
      }}>
        <Table 
          size="small" 
          aria-label="detalle RXH"
          sx={{
            '& .MuiTableCell-root': {
              backgroundColor: '#f0f7ff', // Mismo fondo para todas las celdas
              border: '1px solid #bbdefb', // Bordes azules claros
              fontSize: '0.75rem'
            },
            '& .MuiTableHead-root .MuiTableCell-root': {
              backgroundColor: '#e3f2fd', // Fondo más oscuro para encabezados
              fontWeight: 'bold',
              borderBottom: '2px solid #90caf9'
            }
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell><strong>Fecha Emisión</strong></TableCell>
              <TableCell><strong>Empresa</strong></TableCell>
              <TableCell><strong>Tipo Documento</strong></TableCell>
              <TableCell><strong>serie</strong></TableCell>
              <TableCell><strong>nrodocumento</strong></TableCell>
              <TableCell><strong>Importe</strong></TableCell>
              <TableCell><strong>Detracción</strong></TableCell>
              <TableCell><strong>Renta</strong></TableCell>
              <TableCell><strong>Total a Pagar</strong></TableCell>
              <TableCell><strong>RUC</strong></TableCell>
              <TableCell><strong>Descripción</strong></TableCell>
              <TableCell><strong>Observaciones</strong></TableCell>
            
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{item.fechaEmision}</TableCell>
              <TableCell>{item.empresa}</TableCell>
              <TableCell>{item.tipoDocumento}</TableCell>
              <TableCell>{item.serie}</TableCell>
              <TableCell>{item.nrodocumento}</TableCell>
              <TableCell>{item.importe}</TableCell>
              <TableCell>{item.detraccion}</TableCell>
              <TableCell>{item.renta}</TableCell>
              <TableCell>{item.totalPagar}</TableCell>
              <TableCell>{item.ruc}</TableCell>
              <TableCell>{item.descripcion}</TableCell>
              <TableCell>{item.observaciones}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      ) : (
        <Typography variant="body2" color="text.secondary">No se ha registrado detalle RXH.</Typography>
      )}

          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  </React.Fragment>
))}
            </TableBody>
          </Table>
                <TablePagination
  component="div"
  count={datosFiltrados.length}
  page={page}
  onPageChange={(event, newPage) => setPage(newPage)}
  rowsPerPage={rowsPerPage}
  rowsPerPageOptions={[rowsPerPage]} // Sólo 5 filas por página, sin opción a cambiar
/>
        </TableContainer>
      )}

      <Modal
        open={modalAbierto}
        onClose={cerrarModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        closeAfterTransition
        BackdropProps={{ style: { backgroundColor: 'rgba(0, 0, 0, 0.45)' } }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 600 },
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            maxHeight: '85vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #eee' }}>
            <Typography id="modal-title" variant="h6" component="h2" sx={{ fontWeight: '600' }}>
              Registrar RXH - {registroActual?.medico}
            </Typography>
            <IconButton onClick={cerrarModal} size="small" aria-label="Cerrar modal">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Body */}
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Sección Datos Básicos */}
            <Box sx={{
              border: '1px solid #ddd',
              borderRadius: 2,
              p: 3,
              backgroundColor: '#fafafa',
              boxShadow: 'inset 0 0 5px #eee'
            }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
                Datos Básicos
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Fecha Emisión"
                    name="fechaEmision"
                    type="date"
                    value={formulario.fechaEmision}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Empresa</InputLabel>
                    <Select
                      name="empresa"
                      value={formulario.empresa}
                      onChange={handleChange}
                      label="Empresa"
                    >
                      {empresas.map((e) => (
                        <MenuItem key={e} value={e}>{e}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} display="flex" alignItems="center">
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="verificacion"
                        checked={formulario.verificacion}
                        onChange={handleChange}
                      />
                    }
                    label="Verificación"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Tipo de Documento</InputLabel>
                    <Select
                      name="tipoDocumento"
                      value={formulario.tipoDocumento}
                      onChange={handleChange}
                      label="Tipo de Documento"
                    >
                      {tiposDocumento.map((t) => (
                        <MenuItem key={t} value={t}>{t}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            {/* Sección Detalles Financieros */}
            <Box sx={{
              border: '1px solid #ddd',
              borderRadius: 2,
              p: 3,
              backgroundColor: '#fafafa',
              boxShadow: 'inset 0 0 5px #eee'
            }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
                Detalles Financieros
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="serie"
                    name="serie"
                    value={formulario.serie}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                  />
                </Grid>

                  <Grid item xs={12} sm={6}>
                  <TextField
                    label="nrodocumento"
                    name="nrodocumento"
                    value={formulario.nrodocumento}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Importe"
                    name="importe"
                    type="number"
                    value={formulario.importe}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Detracción"
                    name="detraccion"
                    type="number"
                    value={formulario.detraccion}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                     disabled={detraccionDisabled}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Renta"
                    name="renta"
                    type="number"
                    value={formulario.renta}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                     disabled={rentaDisabled}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Total a Pagar"
                    name="totalPagar"
                    type="number"
                    value={formulario.totalPagar}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Sección Información Adicional */}
            <Box sx={{
              border: '1px solid #ddd',
              borderRadius: 2,
              p: 3,
              backgroundColor: '#fafafa',
              boxShadow: 'inset 0 0 5px #eee'
            }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
                Información Adicional
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="RUC"
                    name="ruc"
                    value={formulario.ruc}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Descripción"
                    name="descripcion"
                    value={formulario.descripcion}
                    onChange={handleChange}
                    multiline
                    rows={2}
                    fullWidth
                    size="small"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Observaciones"
                    name="observaciones"
                    value={formulario.observaciones}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    fullWidth
                    size="small"
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>

          {/* Footer con botones */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
              p: 2,
              borderTop: '1px solid #eee',
              mt: 'auto',
              bgcolor: 'background.paper',
              borderRadius: '0 0 12px 12px'
            }}
          >
            <Button variant="outlined" onClick={cerrarModal}>Cancelar</Button>
            <Button variant="contained" onClick={handleGuardar}>Guardar</Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default ConsultaPorMes;