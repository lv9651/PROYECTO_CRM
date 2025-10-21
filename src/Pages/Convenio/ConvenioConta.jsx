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

const Contabilidad = () => {
  const { user } = useAuth();

  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultados, setResultados] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const buscarMedicosPorFecha = async () => {
    setError('');
    setResultados([]);
    setSearchTerm('');

    if (!fechaDesde || !fechaHasta) {
      setError('Debes seleccionar ambas fechas.');
      return;
    }

    setLoading(true);

    try {
      const id = user?.perfilCodigo === 'CONTABILIDAD' ? 0 : user?.emp_codigo;

      const response = await axios.get(
        `${BASE_URL}/api/Contabilidad_Convenio/representante/${id}`,
        {
          params: {
            fechaDesde,
            fechaHasta
          }
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

    // Mapear datos para que sean más legibles en Excel
    const datosExcel = resultadosFiltrados.map(item => ({
      Id: item.id,
      TipoPago: item.tipoPago,
      Representante: item.representante,
      Lugar: item.lugar,
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
      FechaRegistro: item.fechaRegistro ? dayjs(item.fechaRegistro).format('YYYY-MM-DD') : '',
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
      FechaCarga: item.fechaCarga ? dayjs(item.fechaCarga).format('YYYY-MM-DD') : '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pagos');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'PagosRepresentante.xlsx');
  };

  return (
    <Container sx={{ py: 4 }}>
      <Card elevation={4}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Revisión de Médicos por Rango de Fecha
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Desde"
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Hasta"
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
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
                <Table stickyHeader size="small" >
                  <TableHead>
                    <TableRow>
                      <TableCell>Id</TableCell>
                      <TableCell>Tipo Pago</TableCell>
                      <TableCell>Representante</TableCell>
                      <TableCell>Lugar</TableCell>
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
                      <TableCell>Fecha Registro</TableCell>
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
                      <TableCell>Fecha Carga</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {resultadosFiltrados.length > 0 ? (
                      resultadosFiltrados.map((m, i) => (
                        <TableRow key={i}>
                          <TableCell>{m.id}</TableCell>
                          <TableCell>{m.tipoPago}</TableCell>
                          <TableCell>{m.representante}</TableCell>
                          <TableCell>{m.lugar}</TableCell>
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
                          <TableCell>{m.fechaRegistro ? dayjs(m.fechaRegistro).format('YYYY-MM-DD') : ''}</TableCell>
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
                          <TableCell>{m.fechaCarga ? dayjs(m.fechaCarga).format('YYYY-MM-DD') : ''}</TableCell>
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
    </Container>
  );
};

export default Contabilidad;