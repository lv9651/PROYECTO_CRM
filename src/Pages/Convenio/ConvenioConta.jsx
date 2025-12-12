import React, { useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper
} from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import { useAuth } from '../../Compo/AuthContext';
import { BASE_URL } from '../../Conf/config';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import PagoConvenioModal from './PagoConvenioModal';
import FiltrarPagoModal from './FiltrarPagoModal';
const Contabilidad = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  const [mes, setMes] = useState('');
  const [anio, setAnio] = useState(currentYear);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultados, setResultados] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [archivo, setArchivo] = useState(null);
const [openFiltrar, setOpenFiltrar] = useState(false);
  const [openModal, setOpenModal] = useState(false);
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

  const buscarMedicosPorFecha = async () => {
    setError('');
    setResultados([]);
    setSearchTerm('');

    if (!mes || !anio) {
      setError('Debes seleccionar mes y año.');
      return;
    }

    setLoading(true);

    try {
      const idRepresentante = user?.perfilCodigo === 'CONTABILIDAD' ? 0 : user?.emp_codigo;

      const response = await axios.get(
        `${BASE_URL}/api/Contabilidad_Convenio/representante/${idRepresentante}`,
        {
          params: { mes, anio }
        }
      );

      setResultados(response.data || []);
    } catch (err) {
      console.error(err);
      setError('Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  const resultadosFiltrados = resultados.filter(m =>
    m.representante.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportarExcel = () => {
    if (resultadosFiltrados.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    const datosExcel = resultadosFiltrados.map(item => ({
      Id: item.id,
      TipoPago: item.tipoPago,
      Representante: item.representante,
      Lugar: item.lugar,
      distrito: item.distrito,
      Nombre: item.nombre,
      TipoDocumento: item.tipoDocumento,
      DocIdentidad: item.docIdentidad,
      RUC: item.ruc,
      Banco: item.banco,
      CuentaCorriente: item.cuentaCorriente,
      CuentaInterbancaria: item.cuentaInterbancaria,
      UnidadFm: item.unidadFm,
      Ventas: item.ventas,
      PagoBruto: item.pagoBruto,
      PagoDespues: item.pagoDespues,
      Descuento: item.descuento,
      Renta: item.renta,
      PagoDespuesNeto: item.pagoDespuesNeto,
         FechaCarga: item.fechaCarga ? dayjs(item.fechaCarga).format('YYYY-MM-DD') : '',
      FechaEmision: item.fechaEmision ? dayjs(item.fechaEmision).format('YYYY-MM-DD') : '',
      Documento: item.documento,
      Serie: item.serie,
      Numero: item.numero,
      Importe: item.importe,
      Detraccion: item.detraccion,
      RentaFinal: item.rentaFinal,
      TotalAPagar: item.totalAPagar,
      Descripcion: item.descripcion,
      Observaciones: item.observaciones,

      
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pagos');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'PagosRepresentante.xlsx');
  };

  const subirExcel = async () => {
    if (!archivo) {
      alert("Selecciona un archivo Excel.");
      return;
    }

    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('archivo', archivo);
      formData.append('usuario', user?.emp_codigo || 'SYSTEM');

      const response = await axios.post(
        `${BASE_URL}/api/Contabilidad_Convenio/subir-excelConta`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      alert(`Se actualizaron ${response.data.cantidad} registros.`);
      setArchivo(null);
    } catch (err) {
      console.error(err);
      setError('Error al subir el archivo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Card elevation={4}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Revisión de Médicos por Mes y Año
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Mes"
                select
                fullWidth
                size="small"
                SelectProps={{ native: true }}
                value={mes}
                onChange={(e) => setMes(e.target.value)}
              >
                <option value="">Selecciona Mes</option>
                {meses.map(m => (
                  <option key={m.valor} value={m.valor}>{m.nombre}</option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Año"
                select
                fullWidth
                size="small"
                SelectProps={{ native: true }}
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
              >
                <option value="">Selecciona Año</option>
                {Array.from({ length: 10 }, (_, i) => {
                  const year = currentYear - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                onClick={buscarMedicosPorFecha}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Buscar'}
              </Button>
            </Grid>

            {resultados.length > 0 && (
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={exportarExcel}
                  disabled={loading}
                >
                  Descargar Excel
                </Button>
              </Grid>
            )}
          </Grid>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={6}>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setArchivo(e.target.files[0])}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Button
                variant="contained"
                fullWidth
                onClick={subirExcel}
                disabled={loading || !archivo}
              >
                {loading ? <CircularProgress size={24} /> : 'Actualizar Pagos'}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
  <Button
    variant="outlined"
    fullWidth
    onClick={() => setOpenModal(true)}
    disabled={loading}
  >
    Cargar Varios Documentos
  </Button>
</Grid>

         <Grid item xs={12} sm={6} md={6}>
  <Button
    variant="outlined"
    fullWidth
     onClick={() => setOpenFiltrar(true)}
    disabled={loading}
  >
  HISTORIAL DOCUMENTOS
  </Button>
</Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {resultados.length > 0 && (
            <>
              <TextField
                label="Buscar Representante"
                variant="outlined"
                size="small"
                fullWidth
                sx={{ mb: 2 }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtra por representante"
              />
              <Paper elevation={2} sx={{ maxHeight: 400, overflow: 'auto' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Id</TableCell>
                      <TableCell>Tipo Pago</TableCell>
                      <TableCell>Representante</TableCell>
                      <TableCell>Lugar</TableCell>
                      <TableCell>Distrito</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Tipo Documento</TableCell>
                      <TableCell>Doc Identidad</TableCell>
                      <TableCell>RUC</TableCell>
                      <TableCell>Banco</TableCell>
                      <TableCell>Cuenta Corriente</TableCell>
                      <TableCell>Cuenta Interbancaria</TableCell>
                      <TableCell>Unidad FM</TableCell>
                      <TableCell>Ventas</TableCell>
                      <TableCell>Pago Bruto</TableCell>
                      <TableCell>Pago Después</TableCell>
                      <TableCell>Descuento</TableCell>
                      <TableCell>Renta</TableCell>
                      <TableCell>Pago Después Neto</TableCell>
                      <TableCell>Fecha Carga</TableCell>
                      <TableCell>Fecha Emisión</TableCell>
                      <TableCell>Documento</TableCell>
                      <TableCell>Serie</TableCell>
                      <TableCell>Número</TableCell>
                      <TableCell>Importe</TableCell>
                      <TableCell>Detracción</TableCell>
                      <TableCell>Renta Final</TableCell>
                      <TableCell>Total A Pagar</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell>Observaciones</TableCell>
                      <TableCell>Fecha Carga Conta</TableCell>
                    </TableRow>
                  </TableHead>
               <TableBody>
  {resultadosFiltrados.length > 0 ? (
    resultadosFiltrados.map((m, i) => (
      <TableRow
        key={i}
        sx={{
          backgroundColor: m.estado === 1 ? 'rgba(255, 235, 59, 0.3)' : 'inherit'
        }}
      >
        <TableCell>{m.id}</TableCell>
        <TableCell>{m.tipoPago}</TableCell>
        <TableCell>{m.representante}</TableCell>
        <TableCell>{m.lugar}</TableCell>
        <TableCell>{m.distrito}</TableCell>
        <TableCell>{m.nombre}</TableCell>
        <TableCell>{m.tipoDocumento}</TableCell>
        <TableCell>{m.docIdentidad}</TableCell>
        <TableCell>{m.ruc}</TableCell>
        <TableCell>{m.banco}</TableCell>
        <TableCell>{m.cuentaCorriente}</TableCell>
        <TableCell>{m.cuentaInterbancaria}</TableCell>
        <TableCell>{m.unidadFm}</TableCell>
        <TableCell>{m.ventas}</TableCell>
        <TableCell>{m.pagoBruto}</TableCell>
        <TableCell>{m.pagoDespues}</TableCell>
        <TableCell>{m.descuento}</TableCell>
        <TableCell>{m.renta}</TableCell>
        <TableCell>{m.pagoDespuesNeto}</TableCell>
        <TableCell>{m.fechaCarga ? dayjs(m.fechaCarga).format('YYYY-MM-DD') : ''}</TableCell>
        <TableCell>{m.fechaEmision ? dayjs(m.fechaEmision).format('YYYY-MM-DD') : ''}</TableCell>
        <TableCell>{m.documento}</TableCell>
        <TableCell>{m.serie}</TableCell>
        <TableCell>{m.numero}</TableCell>
        <TableCell>{m.importe}</TableCell>
        <TableCell>{m.detraccion}</TableCell>
        <TableCell>{m.rentaFinal}</TableCell>
        <TableCell>{m.totalAPagar}</TableCell>
        <TableCell>{m.descripcion}</TableCell>
        <TableCell>{m.observaciones}</TableCell>
        <TableCell>{m.fecha_carga_conta ? dayjs(m.fecha_carga_conta).format('YYYY-MM-DD') : ''}</TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={31} align="center">
        No se encontraron resultados para el filtro.
      </TableCell>
    </TableRow>
  )}
</TableBody>
                </Table>
              </Paper>
            </>
          )}

          {!loading && resultados.length === 0 && !error && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No se encontraron resultados.
            </Alert>
          )}
        </CardContent>
      </Card>
      <PagoConvenioModal
  open={openModal}
  onClose={() => setOpenModal(false)}
  onRefresh={buscarMedicosPorFecha}
/>
<FiltrarPagoModal
  open={openFiltrar}
  onClose={() => setOpenFiltrar(false)}
/>
    </Container>
    
  );
  
};

export default Contabilidad;