import React, { useState } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Checkbox,
  Button,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  Select,
  MenuItem,
  TablePagination
} from '@mui/material';
import axios from 'axios';
import { BASE_URL } from '../../Conf/config';
import { useAuth } from '../../Compo/AuthContext';

const Convenio = () => {
  const { user } = useAuth();
  const [convenios, setConvenios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [error, setError] = useState('');

  // Estados para paginación
  const [page, setPage] = useState(0);
  const rowsPerPage = 5; // fija en 5 filas por página

  const cargarDatos = () => {
    if (!fechaInicio || !fechaFin) {
      setError('Debe ingresar ambas fechas');
      return;
    }

    setError('');
    setLoading(true);

    axios.get(`${BASE_URL}/api/Convenio`, {
      params: {
        fechaInicio,
        fechaFin,
        idRepresentante: user?.emp_codigo || ''
      }
    })
      .then(res => {
        const dataConEstado = res.data.map(c => ({
          ...c,
          observacion: c.observacion ?? '',
          confirmado: false
        }));
        setConvenios(dataConEstado);
        setLoading(false);
        setPage(0); // resetear a primera página al cargar nuevos datos
      })
      .catch(err => {
        console.error('Error al cargar convenios:', err);
        setLoading(false);
      });
  };

  const handleObservacionChange = (index, value) => {
    const nuevos = [...convenios];
    nuevos[index].observacion_vis = value;
    setConvenios(nuevos);
  };

  const handleTipoDocumentoChange = (index, value) => {
    const nuevos = [...convenios];
    nuevos[index].aprob_documento = value;
    setConvenios(nuevos);
  };

  const handleCheck = (index) => {
    const nuevos = [...convenios];
    nuevos[index].confirmado = !nuevos[index].confirmado;
    setConvenios(nuevos);
  };

  const handleProcesar = async () => {
    const confirmados = convenios.filter(c => c.confirmado);

    try {
      for (const reg of confirmados) {
        const nuevo = {
          idRepresentante: user?.emp_codigo ?? null,
          rma_codigo: reg.rma_Codigo,
          med_codigo: reg.med_Codigo,
          representante_Medico: reg.representante_Medico,
          medico: reg.medico,
          descripcion_Banco: reg.descripcion,
          cuenta: reg.cuenta,
          cci: reg.cci,
          observacion: reg.observacion,
          venta: reg.venta,
          unidad_FM: String(reg.unidaD_FM ?? ''),
          pago_despues_del_Neto: reg.unidaD_FM * 10,
          zona: reg.zona,
          Fecha_corte: fechaFin,
          observacion_vis: reg.observacion_vis,
          aprob_documento: reg.aprob_documento,
          documento: reg.documento
        };

        await axios.post(`${BASE_URL}/api/Contabilidad_Convenio`, nuevo);
      }

      alert("✅ Convenios procesados con éxito");
      cargarDatos(); // recargar datos para refrescar tabla
    } catch (err) {
      console.error("Error al registrar:", err);
      alert("❌ Error al procesar los convenios.");
    }
  };

  // Manejar cambio de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Confirmación de Convenios Médicos
      </Typography>

      <Box display="flex" gap={2} mb={3} alignItems="flex-end">
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
        <Button variant="contained" onClick={cargarDatos}>
          Buscar
        </Button>
      </Box>

      {error && <Alert severity="warning">{error}</Alert>}
      {loading && <Box textAlign="center" mt={4}><CircularProgress /></Box>}

      {!loading && convenios.length > 0 && (
        <>
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
            
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Zona</strong></TableCell>
                  <TableCell><strong>Médico</strong></TableCell>
                  <TableCell><strong>Documento</strong></TableCell>
                  <TableCell><strong>Banco</strong></TableCell>
                  <TableCell><strong>Cuenta</strong></TableCell>
                  <TableCell><strong>CCI</strong></TableCell>
                  <TableCell><strong>UNIDAD FM</strong></TableCell>
                  <TableCell><strong>Pago dsp del NETO</strong></TableCell>
                  <TableCell><strong>Venta (S/)</strong></TableCell>
                  <TableCell><strong>Observacion</strong></TableCell>
                  <TableCell><strong>Validacion Doc</strong></TableCell>
                  <TableCell><strong>Confirmar</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {convenios
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((c, i) => (
                    <TableRow
                      key={page * rowsPerPage + i}
                      sx={{
                        backgroundColor: c.val === "1" ? 'rgba(255, 223, 186, 0.5)' : 'inherit' // color suave para destacar
                      }}
                    >
                      <TableCell>{c.zona}</TableCell>
                      <TableCell>{c.medico}</TableCell>
                      <TableCell>{c.documento}</TableCell>
                      <TableCell>{c.descripcion}</TableCell>
                      <TableCell>{c.cuenta}</TableCell>
                      <TableCell>{c.cci}</TableCell>
                      <TableCell>{c.unidaD_FM}</TableCell>
                      <TableCell>{c.pago_despues_del_Neto}</TableCell>
                      <TableCell>{c.venta ?? '-'}</TableCell>
                      <TableCell>
                        <TextField
                          value={c.observacion_vis}
                          onChange={(e) => handleObservacionChange(page * rowsPerPage + i, e.target.value)}
                          size="small"
                          variant="outlined"
                          fullWidth
                          disabled={c.val === "1"}
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <Select
                            value={c.tipoDocumento}
                            onChange={(e) => handleTipoDocumentoChange(page * rowsPerPage + i, e.target.value)}
                            displayEmpty
                          >
                            <MenuItem value="con">Con documento</MenuItem>
                            <MenuItem value="sin">Sin documento</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={c.confirmado}
                          onChange={() => handleCheck(page * rowsPerPage + i)}
                          disabled={c.val === "1"}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={convenios.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]} // sin opción de cambiar filas por página, fijo 5
          />

          <Box mt={3} textAlign="right">
            <Button variant="contained" color="primary" onClick={handleProcesar}>
              Procesar Confirmados
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default Convenio;