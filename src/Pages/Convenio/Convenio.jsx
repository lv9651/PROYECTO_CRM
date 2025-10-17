import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Divider,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton
} from '@mui/material';
import { Download, Search, Edit, Delete, Assignment } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../Compo/AuthContext';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import SubirExcel from '../Convenio/SubirExcel';

const Convenio = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [documento, setDocumento] = useState('');
  const [medicos, setMedicos] = useState([]);
  const [loadingMedicos, setLoadingMedicos] = useState(false);
  const [errorMedicos, setErrorMedicos] = useState('');

  // Para diálogo de añadir/editar
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' o 'edit'
  const [medicoForm, setMedicoForm] = useState({
    docum: '',
    representante: '',
    lugar: '',
    nombre: '',
    tipo_Documento: '',
    doc_Identidad: '',
    ruc: '',
    banco: '',
    cuenta_Corriente: '',
    cuenta_Interbancaria: ''
  });

  // --- Funciones de API CRUD ---

  const descargarPlantilla = async () => {
    if (!user || !user.emp_codigo || !documento) {
      setError('Debe seleccionar un documento.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const resp = await axios.get('https://localhost:7146/api/Contabilidad_Convenio/ObtenerRepresentanteConPagos', {
        params: {
          idMedico: user.emp_codigo,
          docum: documento
        }
      });
      const convenios = resp.data;
      if (!convenios || convenios.length === 0) {
        setError('No hay datos disponibles para descargar');
        setLoading(false);
        return;
      }

      // Preparar Excel como hacías antes
      let data = [];
      if (documento === 'SIN RXH') {
        data = [["representante", "lugar", "nombre", "tipo_Documento", "doc_Identidad", "ruc", "banco",
                 "cuenta_Corriente", "cuenta_Interbancaria", "Unid_fm", "ventas", "Pago_Bruto", "pago_Despues",
                 "Descuento", "Renta", "Pago_Despues_Neto"]];
        convenios.forEach(c => {
          data.push([
            c.representante,
            c.lugar,
            c.nombre,
            c.tipo_Documento,
            c.doc_Identidad,
            c.ruc,
            c.banco,
            c.cuenta_Corriente ?? '-',
            c.cuenta_Interbancaria ?? '-',
            c.unid_Fm,
            c.ventas,
            c.pago_Bruto,
            c.pago_Despues,
            c.descuento,
            c.renta,
            c.pago_Despues_Neto
          ]);
        });
      } else {
        data = [["Representante", "lugar", "nombre", "tipo_Documento", "doc_Identidad", "ruc", "banco",
                 "cuenta_Corriente", "cuenta_Interbancaria", "unid_Fm", "ventas", "pago_Bruto",
                 "pago_Despues", "descuento", "renta", "pago_Despues_Neto", "fecha_Emision",
                 "documento", "serie", "numero", "importe", "detraccion", "renta_Final", "total_A_Pagar",
                 "descripcion", "observaciones"]];
        convenios.forEach(c => {
          data.push([
            c.representante,
            c.lugar,
            c.nombre,
            c.tipo_Documento,
            c.doc_Identidad,
            c.ruc,
            c.banco,
            c.cuenta_Corriente ?? '-',
            c.cuenta_Interbancaria ?? '-',
            c.unid_Fm,
            c.ventas,
            c.pago_Bruto,
            c.pago_Despues,
            c.descuento,
            c.renta,
            c.pago_Despues_Neto,
            c.fecha_Emision ?? '-',
            c.documento ?? '-',
            c.serie ?? '-',
            c.numero ?? '-',
            c.importe,
            c.detraccion,
            c.renta_Final,
            c.total_A_Pagar,
            c.descripcion ?? '-',
            c.observaciones ?? '-'
          ]);
        });
      }

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Convenios");
      const excelArray = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'convenios.xlsx');
      setLoading(false);
    } catch (err) {
      console.error("Error en descarga:", err);
      setError('Error al cargar los convenios');
      setLoading(false);
    }
  };

  const buscarMedicos = async () => {
    setErrorMedicos('');
    setLoadingMedicos(true);
    setMedicos([]);

    if (!documento) {
      setErrorMedicos('Debe seleccionar un documento para buscar médicos.');
      setLoadingMedicos(false);
      return;
    }

    try {
      const resp = await axios.get('https://localhost:7146/api/Contabilidad_Convenio/ObtMedic', {
        params: {
          docum: documento,
          idmedico: user.emp_codigo
        }
      });
      const datos = resp.data || [];
      setMedicos(datos);
      if (datos.length === 0) {
        setErrorMedicos('No se encontraron médicos para los parámetros indicados.');
      }
    } catch (err) {
      console.error("Error búsqueda médicos:", err);
      setErrorMedicos('Error al buscar médicos');
    } finally {
      setLoadingMedicos(false);
    }
  };

    const handleFileUploaded = () => {
    // Aquí puedes hacer algo después de que el archivo se haya subido, por ejemplo, refrescar la lista de convenios.
    console.log('Archivo subido con éxito');
  };

  const abrirDialogAgregar = () => {
    setDialogMode('add');
    setMedicoForm({
      docum: documento,
      representante: '',
      lugar: '',
      nombre: '',
      tipo_Documento: '',
      doc_Identidad: '',
      ruc: '',
      banco: '',
      cuenta_Corriente: '',
      cuenta_Interbancaria: '',
      idMedico:user.emp_codigo
    });
    setDialogOpen(true);
  };

  const abrirDialogEditar = (medico) => {
    setDialogMode('edit');
    setMedicoForm({ ...medico });
    setDialogOpen(true);
  };

  const guardarMedico = async () => {
    // Validaciones simples
    if (!medicoForm.docum || !medicoForm.doc_Identidad || !medicoForm.nombre) {
      setError('Los campos Docum, Doc Identidad y Nombre son obligatorios');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (dialogMode === 'add') {
        await axios.post('https://localhost:7146/api/Contabilidad_Convenio/InsertMedi', medicoForm);
      } else {
        await axios.put('https://localhost:7146/api/Contabilidad_Convenio/ActuMedic', medicoForm);
      }
      // Refrescar lista
      await buscarMedicos();
      setDialogOpen(false);
    } catch (err) {
      console.error("Error guardando médico:", err);
      setError('Error al guardar médico');
    } finally {
      setLoading(false);
    }
  };

  const eliminarMedico = async (docum, docIdentidad) => {
    setError('');
    setLoading(true);
    try {
      await axios.delete('https://localhost:7146/api/Contabilidad_Convenio/DelMedic', {
        params: {
          docum,
          idmedico: user.emp_codigo,
          docIdentidad
        }
      });
      await buscarMedicos();
    } catch (err) {
      console.error("Error eliminando médico:", err);
      setError('Error al eliminar médico');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Card elevation={4}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Assignment sx={{ mr: 1 }} />
            Confirmación de Convenios Médicos
          </Typography>

          <Grid container spacing={2} alignItems="center" mb={2}>
            <Grid item xs={12} sm={4} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="documento-label">Tipo de Documento</InputLabel>
                <Select
                  labelId="documento-label"
                  value={documento}
                  onChange={e => setDocumento(e.target.value)}
                  label="Tipo de Documento"
                >
                  <MenuItem value="SIN RXH">SIN RXH</MenuItem>
                  <MenuItem value="CON RXH">CON RXH</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4} md={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={buscarMedicos}
                disabled={loadingMedicos || !documento}
                startIcon={<Search />}
              >
                {loadingMedicos ? <CircularProgress size={20} /> : 'Buscar Médicos'}
              </Button>
            </Grid>

            <Grid item xs={12} sm={4} md={3}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={descargarPlantilla}
                disabled={loading || !documento}
                startIcon={<Download />}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Descargar Plantilla'}
              </Button>
            </Grid>

            <Grid item xs={12} sm={4} md={3}>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={abrirDialogAgregar}
                startIcon={<Edit />}
              >
                Agregar Médico
              </Button>
            </Grid>
          </Grid>

          {errorMedicos && <Alert severity="warning" sx={{ mb: 2 }}>{errorMedicos}</Alert>}

          {medicos.length > 0 && (
            <>
              <Divider sx={{ mb: 2 }} />
              <Paper elevation={2} sx={{ maxHeight: 340, overflow: 'auto' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Representante</TableCell>
                      <TableCell>Lugar</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Tipo Doc.</TableCell>
                      <TableCell>Doc. Identidad</TableCell>
                      <TableCell>RUC</TableCell>
                      <TableCell>Banco</TableCell>
                      <TableCell>Cuenta Corriente</TableCell>
                      <TableCell>Cuenta Interbancaria</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {medicos.map((m, i) => (
                      <TableRow key={i} hover>
                        <TableCell>{m.representante}</TableCell>
                        <TableCell>{m.lugar}</TableCell>
                        <TableCell>{m.nombre}</TableCell>
                        <TableCell>{m.tipo_Documento}</TableCell>
                        <TableCell>{m.doc_Identidad}</TableCell>
                        <TableCell>{m.ruc}</TableCell>
                        <TableCell>{m.banco}</TableCell>
                        <TableCell>{m.cuenta_Corriente ?? '-'}</TableCell>
                        <TableCell>{m.cuenta_Interbancaria ?? '-'}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => abrirDialogEditar(m)}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => eliminarMedico(m.docum, m.doc_Identidad)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </>
          )}
              <SubirExcel onFileUploaded={handleFileUploaded} />

          {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
        </CardContent>
      </Card>

      {/* Diálogo para agregar/editar médico */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogMode === 'add' ? 'Agregar Médico' : 'Editar Médico'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1, display: 'grid', gap: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel id="docum-form-label">Docum</InputLabel>
              <Select
                labelId="docum-form-label"
                value={medicoForm.docum}
                onChange={e => setMedicoForm(prev => ({ ...prev, docum: e.target.value }))}
                label="Docum"
              >
                <MenuItem value="SIN RXH">SIN RXH</MenuItem>
                <MenuItem value="CON RXH">CON RXH</MenuItem>
                <MenuItem value="AMBOS">AMBOS</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Documento de Identidad"
              fullWidth
              value={medicoForm.doc_Identidad}
              onChange={e => setMedicoForm(prev => ({ ...prev, doc_Identidad: e.target.value }))}
            />
            <TextField
              size="small"
              label="Nombre"
              fullWidth
              value={medicoForm.nombre}
              onChange={e => setMedicoForm(prev => ({ ...prev, nombre: e.target.value }))}
            />
          {dialogMode === 'edit' && (
  <TextField
    size="small"
    label="Representante"
    fullWidth
    value={medicoForm.representante}
    onChange={e => setMedicoForm(prev => ({ ...prev, representante: e.target.value }))}
  />
)}

            <TextField
              size="small"
              label="Lugar"
              fullWidth
              value={medicoForm.lugar}
              onChange={e => setMedicoForm(prev => ({ ...prev, lugar: e.target.value }))}
            />
          <FormControl size="small" fullWidth>
  <InputLabel id="tipo-doc-label">Tipo Documento</InputLabel>
  <Select
    labelId="tipo-doc-label"
    value={medicoForm.tipo_Documento}
    onChange={e => setMedicoForm(prev => ({ ...prev, tipo_Documento: e.target.value }))}
    label="Tipo Documento"
  >
    <MenuItem value={1}>DNI</MenuItem>
    <MenuItem value={3}>Carnet de Extranjería</MenuItem>
  </Select>
</FormControl>
            <TextField
              size="small"
              label="RUC"
              fullWidth
              value={medicoForm.ruc}
              onChange={e => setMedicoForm(prev => ({ ...prev, ruc: e.target.value }))}
            />
          <FormControl size="small" fullWidth>
  <InputLabel id="banco-label">Banco</InputLabel>
  <Select
    labelId="banco-label"
    value={medicoForm.banco}
    onChange={e => setMedicoForm(prev => ({ ...prev, banco: e.target.value }))}
    label="Banco"
  >
    <MenuItem value="BANBIF">BANBIF</MenuItem>
    <MenuItem value="BANCO DE LA NACION">BANCO DE LA NACION</MenuItem>
    <MenuItem value="BBVA">BBVA</MenuItem>
    <MenuItem value="BCP">BCP</MenuItem>
    <MenuItem value="CAJA PIURA">CAJA PIURA</MenuItem>
    <MenuItem value="FALABELLA">FALABELLA</MenuItem>
    <MenuItem value="INTERBANK">INTERBANK</MenuItem>
    <MenuItem value="SCOTIABANK">SCOTIABANK</MenuItem>
  </Select>
</FormControl>
            <TextField
              size="small"
              label="Cuenta Corriente"
              fullWidth
              value={medicoForm.cuenta_Corriente}
              onChange={e => setMedicoForm(prev => ({ ...prev, cuenta_Corriente: e.target.value }))}
            />
            <TextField
              size="small"
              label="Cuenta Interbancaria"
              fullWidth
              value={medicoForm.cuenta_Interbancaria}
              onChange={e => setMedicoForm(prev => ({ ...prev, cuenta_Interbancaria: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={guardarMedico} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : (dialogMode === 'add' ? 'Agregar' : 'Actualizar')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Convenio;