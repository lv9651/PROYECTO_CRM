import React, { useState , useEffect} from 'react';
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
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../Conf/config';
const Convenio = () => {
  const { user } = useAuth();
 const navigate = useNavigate();
  // ✅ Hooks definidos fuera de cualquier condición
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [documento, setDocumento] = useState('');
  const [medicos, setMedicos] = useState([]);
  const [loadingMedicos, setLoadingMedicos] = useState(false);
  const [errorMedicos, setErrorMedicos] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');

  const [medicoForm, setMedicoForm] = useState({
    docum: '',
    representante: '',
    lugar: '',
    distrito: '',
    nombre: '',
    tipo_Documento: '',
    doc_Identidad: '',
    ruc: '',
    banco: '',
    cuenta_Corriente: '',
    cuenta_Interbancaria: ''
  });

  // ✅ Mostrar otro módulo si perfil es CONTABILIDAD
   useEffect(() => {
    if (user?.perfilCodigo === 'CONTABILIDAD') {
      navigate('/ConvenioConta');
    }
  }, [user, navigate]);

  // ✅ Funciones
  const descargarPlantilla = async () => {
    if (!user || !user.emp_codigo || !documento) {
      setError('Debe seleccionar un documento.');
      return;
    }
    setError('');
    setLoading(true);
    try {

  
      const resp = await axios.get(`${BASE_URL}/api/Contabilidad_Convenio/ObtenerRepresentanteConPagos`, {
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

      let data = [];
      if (documento === 'SIN RXH') {
        data = [["Representante", "Lugar","distrito","Nombre", "TipoDocumento", "DocIdentidad", "ruc", "banco",
          "CuentaCorriente", "CuentaInterbancaria", "UnidadFm", "Ventas", "PagoBruto", "PagoDespues",
          "Descuento", "Renta", "PagoDespuesNeto"]];
        convenios.forEach(c => {
          data.push([
            c.representante,
            c.lugar,
             c.distrito,
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
        data = [["Representante", "Lugar","distrito","Nombre", "TipoDocumento", "DocIdentidad", "RUC", "Banco",
          "CuentaCorriente", "CuentaInterbancaria", "UnidadFm", "Ventas", "PagoBruto",
          "PagoDespues", "Descuento", "Renta", "PagoDespuesNeto"]];
        convenios.forEach(c => {
          data.push([
            c.representante,
            c.lugar,
             c.distrito,
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
      const resp = await axios.get(`${BASE_URL}/api/Contabilidad_Convenio/ObtMedic`, {
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

  const abrirDialogAgregar = () => {
    setDialogMode('add');
    setMedicoForm({
      docum: documento,
      representante: '',
      lugar: '',
      distrito: '',
      nombre: '',
      tipo_Documento: '',
      doc_Identidad: '',
      ruc: '',
      banco: '',
      cuenta_Corriente: '',
      cuenta_Interbancaria: '',
      idMedico: user.emp_codigo
    });
    setDialogOpen(true);
  };

  const abrirDialogEditar = (medico) => {
    setDialogMode('edit');
    setMedicoForm({ ...medico });
    setDialogOpen(true);
  };

  const guardarMedico = async () => {
    if (!medicoForm.docum || !medicoForm.doc_Identidad || !medicoForm.nombre) {
      setError('Los campos Docum, Doc Identidad y Nombre son obligatorios');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (dialogMode === 'add') {
        await axios.post(`${BASE_URL}/api/Contabilidad_Convenio/InsertMedi`, medicoForm);
      } else {
        await axios.put(`${BASE_URL}/api/Contabilidad_Convenio/ActuMedic`, medicoForm);
      }
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
      await axios.delete(`${BASE_URL}/api/Contabilidad_Convenio/DelMedic`, {
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

  const handleFileUploaded = () => {
    console.log('Archivo subido con éxito');
  };

  // ✅ Render principal (no CONTABILIDAD)
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
            {/* 🔵 Nuevo botón Consulta RUC */}
  <Grid item xs={12} sm={4} md={3}>
    <Button
      variant="outlined"
      color="info"
      fullWidth
      onClick={() => {
        const shortUrl = "https://e-consultaruc.sunat.gob.pe/cl-ti-itmrconsruc/FrameCriterioBusquedaWeb.jsp"; 
        window.open(shortUrl, "_blank");
      }}
      startIcon={<Search />}
    >
      Consulta RUC
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
                          <TableCell>Distrito</TableCell>
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
                         <TableCell>{m.distrito}</TableCell>
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

     {documento && (
  <SubirExcel 
    documento={documento} 
    onFileUploaded={handleFileUploaded} 
  />
)}
          {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
        </CardContent>
      </Card>

      {/* Diálogo */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogMode === 'add' ? 'Agregar Médico' : 'Editar Médico'}</DialogTitle>
     <DialogContent>
  <Box component="form" sx={{ mt: 1, display: 'grid', gap: 2 }}>
    {/* DOCUM */}
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

    {/* Tipo de documento */}
    <FormControl size="small" fullWidth>
      <InputLabel id="tipo-doc-label">Tipo Documento</InputLabel>
      <Select
        labelId="tipo-doc-label"
        value={medicoForm.tipo_Documento}
        onChange={e => setMedicoForm(prev => ({ ...prev, tipo_Documento: e.target.value }))}
        label="Tipo Documento"
      >
        <MenuItem value="1">DNI</MenuItem>
        <MenuItem value="3">Carnet de Extranjería</MenuItem>
        <MenuItem value="4">Pasaporte</MenuItem>
      </Select>
    </FormControl>

    {/* Documento de identidad con validación dinámica */}
    <TextField
      size="small"
      label="Documento de Identidad"
      fullWidth
      value={medicoForm.doc_Identidad}
      onChange={e => {
        const val = e.target.value.toUpperCase();
        const tipo = medicoForm.tipo_Documento;
        let regex;

        if (tipo === '1') regex = /^[0-9]{0,8}$/;
        else if (tipo === '3') regex = /^[A-Z0-9]{0,12}$/;
        else if (tipo === '4') regex = /^[A-Z0-9]{0,9}$/;
        else regex = /.*/;

        if (regex.test(val)) {
          setMedicoForm(prev => ({ ...prev, doc_Identidad: val }));
        }
      }}
      helperText={
        medicoForm.tipo_Documento === 'DNI'
          ? 'Debe tener exactamente 8 dígitos numéricos'
          : medicoForm.tipo_Documento === 'CARNET'
          ? 'Debe tener de 9 a 12 caracteres alfanuméricos'
          : medicoForm.tipo_Documento === 'PASAPORTE'
          ? 'Debe tener de 8 a 9 caracteres alfanuméricos'
          : ''
      }
    />

    {/* Nombre */}
    <TextField
      size="small"
      label="Nombre"
      fullWidth
      value={medicoForm.nombre}
      onChange={e => setMedicoForm(prev => ({ ...prev, nombre: e.target.value }))}
    />

    {/* Representante (solo en modo edición) */}
    {dialogMode === 'edit' && (
      <TextField
        size="small"
        label="Representante"
        fullWidth
        value={medicoForm.representante}
        onChange={e => setMedicoForm(prev => ({ ...prev, representante: e.target.value }))}
      />
    )}

<FormControl size="small" fullWidth>
  <InputLabel id="lugar-label">Lugar</InputLabel>
  <Select
    labelId="lugar-label"
    value={medicoForm.lugar}
    onChange={e => setMedicoForm(prev => ({ ...prev, lugar: e.target.value, distrito: '' }))}
    label="Lugar"
  >
    <MenuItem value="LIMA">LIMA</MenuItem>
    <MenuItem value="CHICLAYO">CHICLAYO</MenuItem>
    <MenuItem value="AREQUIPA">AREQUIPA</MenuItem>
    <MenuItem value="PIURA">PIURA</MenuItem>
    <MenuItem value="TACNA">TACNA</MenuItem>
    <MenuItem value="TRUJILLO">TRUJILLO</MenuItem>
    <MenuItem value="HUANCAYO">HUANCAYO</MenuItem>
    <MenuItem value="CUSCO">CUSCO</MenuItem>
    <MenuItem value="ICA">ICA</MenuItem>
    <MenuItem value="AYACUCHO">AYACUCHO</MenuItem>
    <MenuItem value="CHINCHA">CHINCHA</MenuItem>
  </Select>
</FormControl>

{/* Distrito (solo si el lugar es LIMA) */}
{medicoForm.lugar === 'LIMA' && (
  <FormControl size="small" fullWidth>
    <InputLabel id="distrito-label">Distrito</InputLabel>
    <Select
      labelId="distrito-label"
      value={medicoForm.distrito}
      onChange={e => setMedicoForm(prev => ({ ...prev, distrito: e.target.value }))}
      label="Distrito"
    >
      <MenuItem value="ATE">ATE</MenuItem>
      <MenuItem value="BREÑA">BREÑA</MenuItem>
      <MenuItem value="CHORRILLOS">CHORRILLOS</MenuItem>
      <MenuItem value="COMAS">COMAS</MenuItem>
      <MenuItem value="JESUS MARIA">JESÚS MARÍA</MenuItem>
      <MenuItem value="LA MOLINA">LA MOLINA</MenuItem>
      <MenuItem value="LA VICTORIA">LA VICTORIA</MenuItem>
      <MenuItem value="LINCE">LINCE</MenuItem>
      <MenuItem value="LOS OLIVOS">LOS OLIVOS</MenuItem>
      <MenuItem value="MIRAFLORES">MIRAFLORES</MenuItem>
      <MenuItem value="PUEBLO LIBRE">PUEBLO LIBRE</MenuItem>
      <MenuItem value="RIMAC">RÍMAC</MenuItem>
      <MenuItem value="SAN BORJA">SAN BORJA</MenuItem>
      <MenuItem value="SAN ISIDRO">SAN ISIDRO</MenuItem>
      <MenuItem value="SAN JUAN DE LURIGANCHO">SAN JUAN DE LURIGANCHO</MenuItem>
      <MenuItem value="SAN JUAN DE MIRAFLORES">SAN JUAN DE MIRAFLORES</MenuItem>
      <MenuItem value="SAN LUIS">SAN LUIS</MenuItem>
      <MenuItem value="SAN MARTIN DE PORRES">SAN MARTÍN DE PORRES</MenuItem>
      <MenuItem value="SAN MIGUEL">SAN MIGUEL</MenuItem>
      <MenuItem value="SANTA ANITA">SANTA ANITA</MenuItem>
      <MenuItem value="SANTIAGO DE SURCO">SANTIAGO DE SURCO</MenuItem>
      <MenuItem value="SURQUILLO">SURQUILLO</MenuItem>
      <MenuItem value="VILLA EL SALVADOR">VILLA EL SALVADOR</MenuItem>
      <MenuItem value="VILLA MARIA DEL TRIUNFO">VILLA MARÍA DEL TRIUNFO</MenuItem>
    </Select>
  </FormControl>
)}

    {/* RUC */}
<TextField
  size="small"
  label="RUC"
  fullWidth
  value={medicoForm.ruc}
  onChange={e => {
    const val = e.target.value.replace(/\D/g, ''); // solo números
    if (val.length <= 11) {
      setMedicoForm(prev => ({ ...prev, ruc: val }));
    }
  }}
  helperText="Debe tener 11 dígitos numéricos"
  inputProps={{ maxLength: 11 }}
/>

    {/* Banco */}
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

    {/* Cuenta Corriente con validación por banco */}
    <TextField
      size="small"
      label="Cuenta Corriente"
      fullWidth
      value={medicoForm.cuenta_Corriente}
      onChange={e => {
        const val = e.target.value.replace(/\D/g, ''); // solo números
        const banco = medicoForm.banco;
        let max = 20;
 {/*
        if (banco === 'BANCO DE LA NACION') max = 14;
        else if (['BBVA', 'FALABELLA', 'INTERBANK'].includes(banco)) max = 13;
        else if (banco === 'CAJA PIURA' ,'BCP') max = 14;
        else if (banco === 'SCOTIABANK') max = 13;*/}

        if (val.length <= max) {
          setMedicoForm(prev => ({ ...prev, cuenta_Corriente: val }));
        }
      }}
      helperText={
        medicoForm.banco === 'BANCO DE LA NACION'
          ? 'Debe tener 14 dígitos'
          : medicoForm.banco === 'BBVA'
          ? 'Debe tener aprox. 13 dígitos'
          : medicoForm.banco === 'BCP'
          ? 'Debe tener 14 dígitos'
          : medicoForm.banco === 'CAJA PIURA'
          ? 'Debe tener 14 dígitos aprox.'
          : medicoForm.banco === 'FALABELLA'
          ? 'Debe tener 13 dígitos'
          : medicoForm.banco === 'INTERBANK'
          ? 'Debe tener 13 dígitos'
          : medicoForm.banco === 'SCOTIABANK'
          ? 'Debe tener entre 11 y 13 dígitos'
          : ''
      }
    />

    {/* Cuenta interbancaria (CCI) */}
    <TextField
      size="small"
      label="Cuenta Interbancaria (CCI)"
      fullWidth
      value={medicoForm.cuenta_Interbancaria}
      onChange={e => {
        const val = e.target.value.replace(/\D/g, ''); // solo números
        if (val.length <= 20) {
          setMedicoForm(prev => ({ ...prev, cuenta_Interbancaria: val }));
        }
      }}
      helperText="Debe tener 20 dígitos numéricos"
    />
  </Box>
</DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={guardarMedico} variant="contained" color="primary">Guardar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Convenio;