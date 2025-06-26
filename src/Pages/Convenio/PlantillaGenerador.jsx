import React, { useState } from 'react';
import {
  Container, Typography, FormControl, InputLabel, Select, MenuItem,
  Button, Box, TableContainer, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, TablePagination, Grid, CircularProgress, Alert
} from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axios from 'axios';
import { BASE_URL } from '../../Conf/config';

// Plantillas
const plantillas = [
  { label: 'Registro de Compra', opcion: 1 },
  { label: 'Registro de Recibo por Honorarios', opcion: 2 },
  { label: 'Registro de Devengue …', opcion: 3 },
  { label: 'Registro de Reparables …', opcion: 4 },
  { label: 'Pagos de Tesorería', opcion: 5 }
];

// Años y meses
const anios = [2023, 2024, 2025];
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

// Mapas personalizados por opción
const columnMappings = {
  1: {
   ctA_CONTABLE: 'CTA CONTABLE',
  añO_Y_MES_PROCESO:'AÑO Y MES PROCESO',
  subdiario:'SUBDIARIO',
  comprobante:'COMPROBANTE',
  fechA_DOCUMENTO:'FECHA DOCUMENTO',
  tipO_ANEXO:'TIPO ANEXO',
  codigO_PROVEEDOR:'CODIGO PROVEEDOR',
  tipO_DOCUMENTO:'TIPO DOCUMENTO',
  nrO_DOCUMENTO:'NRO DOCUMENTO',
  fechA_VENCIMIENTO:'FECHA VENCIMIENTO',
  igv:'IGV',
tasa_Igv:'TASA IGV',
  importe:'IMPORTE',
  conv:'CONV',
fecha_registro:'FECHA REGISTRO',
  tipo_Cambio:'TIPO CAMBIO',
  glosa:'GLOSA',
  destino:'DESTINO',
  porC_OPE_MIXTA:'PORC OPE MIXTA',
  valoR_CIF:'VALOR CIF',
  tipO_DOC_REF:'TIPO DOC REF',
  nrO_DOC_REF:'NRO DOC REF',
  centrO_DE_COSTOS:'CENTRO DE COSTOS',
  detraccion:'DETRACCION',
  nrO_DOC_DETRACCION:'NRO DOC DETRACCION',
  fechA_DETRACCION:'FECHA DETRACCION',
  fechA_DOC_REF:'FECHA DOC REF',
  glosA_MOVIMIENTO:'GLOSA MOVIMIENTO',
  documentO_ANULADO:'DOCUMENTO ANULADO',
  igV_POR_APLICAR:'IGV POR APLICAR',
  codigO_DETRACCION:'CODIGO DETRACCION',
  importacion:'IMPORTACION',
  debE_HABER:'DEBE / HABER',
  tasA_DETRACCION:'TASA DETRACCION',
  importE_DETRACCION:'IMPORTE DETRACCION',
  nrO_FILE:'NRO FILE',
  otroS_TRIBUTOS:'OTROS TRIBUTOS',
  imP_BOLSA:'IMP BOLSA',



    // ... agrega solo los necesarios para opción 1
  },
  2: {
   ctA_CONTABLE: 'CTA CONTABLE',
  añO_Y_MES_PROCESO:'AÑO Y MES PROCESO',
  subdiario:'SUBDIARIO',
  comprobante:'COMPROBANTE',
  fechA_DOCUMENTO:'FECHA DOCUMENTO',
  tipO_ANEXO:'TIPO ANEXO',
  codigO_DE_ANEXO:'CODIGO DE ANEXO',
  tipO_DOCUMENTO:'TIPO DOCUMENTO',
  nrO_DOCUMENTO:'NRO DOCUMENTO',
    fechA_VENCIMIENTO:'FECHA VENCIMIENTO',

  importe:'IMPORTE',
  conv:'CONV',
fecha_registro:'FECHA REGISTRO',
  tipo_Cambio:'TIPO CAMBIO',
  glosa:'GLOSA',
  destinO_DE_COMPRA:'DESTINO DE COMPRA',

  centrO_DE_COSTOS:'CENTRO DE COSTOS',

  glosA_MOVIMIENTO:'GLOSA MOVIMIENTO',
  documentO_ANULADO:'DOCUMENTO ANULADO',

  importacion:'IMPORTACION',
  debE_HABER:'DEBE / HABER',

  nrO_FILE:'NRO FILE',

    // ... agrega solo los necesarios para opción 2
  },
  3: {
   ctA_CONTABLE: 'CTA CONTABLE',
  añO_Y_MES_PROCESO:'AÑO Y MES PROCESO',
  subdiario:'SUBDIARIO',
  comprobante:'COMPROBANTE',
  fechA_DOCUMENTO:'FECHA DOCUMENTO',
  tipO_ANEXO:'TIPO ANEXO',
  codigO_DE_ANEXO:'CODIGO DE ANEXO',
  tipO_DOCUMENTO:'TIPO DOCUMENTO',
  nrO_DOCUMENTO:'NRO DOCUMENTO',
    fechA_VENCIMIENTO:'FECHA VENCIMIENTO',
moneda:'MONEDA',

  importe:'IMPORTE',
  conv:'CONV',
fecha_registro:'FECHA REGISTRO',
  tipo_Cambio:'TIPO CAMBIO',
  glosa:'GLOSA',


  centrO_DE_COSTOS:'CENTRO DE COSTOS',

  glosA_MOVIMIENTO:'GLOSA MOVIMIENTO',
  documentO_ANULADO:'DOCUMENTO ANULADO',

  debE_HABER:'DEBE / HABER',

  mediO_DE_PAGO:'MEDIO DE PAGO',

  nrO_FILE:'NRO FILE',

    flujO_DE_EFECTIVO:'FLUJO DE EFECTIVO',

    // ... agrega solo los necesarios para opción 2
  },



  4: {
   ctA_CONTABLE: 'CTA CONTABLE',
  añO_Y_MES_PROCESO:'AÑO Y MES PROCESO',
  subdiario:'SUBDIARIO',
  comprobante:'COMPROBANTE',
  fechA_DOCUMENTO:'FECHA DOCUMENTO',
  tipO_ANEXO:'TIPO ANEXO',
  codigO_DE_ANEXO:'CODIGO DE ANEXO',
  tipO_DOCUMENTO:'TIPO DOCUMENTO',
  nrO_DOCUMENTO:'NRO DOCUMENTO',
    fechA_VENCIMIENTO:'FECHA VENCIMIENTO',
moneda:'MONEDA',

  importe:'IMPORTE',
  conv:'CONV',
fecha_registro:'FECHA REGISTRO',
  tipo_Cambio:'TIPO CAMBIO',
  glosa:'GLOSA',


  centrO_DE_COSTOS:'CENTRO DE COSTOS',

  glosA_MOVIMIENTO:'GLOSA MOVIMIENTO',
  documentO_ANULADO:'DOCUMENTO ANULADO',

  debE_HABER:'DEBE / HABER',

  mediO_DE_PAGO:'MEDIO DE PAGO',

  nrO_FILE:'NRO FILE',

    flujO_DE_EFECTIVO:'FLUJO DE EFECTIVO',

    // ... agrega solo los necesarios para opción 2
  },


   5: {
   mes: 'MES DEL REPORTE-CONVENIO',
  zona:'LOCAL',
  representante_Medico:'VISITADOR MEDICO',
  tipoDocumento:'COMPROBANTE',
  descripcion_Banco:'BANCO',
  fechaEmision:'FECHA EMISION DEL COMPROBANTE',
  fecha_vali_cont:'DIA DE VALIDACION-CONTABILIDAD',
   fecha_valid_tesoreria:'DIA DE VALIDACION-TESORERIA',
  observaciones:'OBSERVACION',
  cuenta:'NRO CUENTA',
    cci:'TRANSFERENCIAS INTERBANCARIAS',
tipo_doc_ide:'TIPO DOCUMENTO',
documento:'NUMERO DE DOCUMENTO IDENTIDAD',
  medico:'NOMBRE DEL PROVEEDOR',
totalPagar:'MONTO DEL ABONO',
  

    // ... agrega solo los necesarios para opción 2
  },
};

const PlantillaGenerador = () => {
  const [plantilla, setPlantilla] = useState('');
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
  const [anio, setAnio] = useState('');
  const [mes, setMes] = useState('');
  const [datosApi, setDatosApi] = useState([]);
  const [tablaVisible, setTablaVisible] = useState(false);
  const [pagina, setPagina] = useState(0);
  const filasPorPagina = 10;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerar = async () => {
    const sel = plantillas.find(p => p.label === plantilla);
    if (!sel || !anio || !mes) {
      alert('Selecciona plantilla, año y mes');
      return;
    }

    setOpcionSeleccionada(sel.opcion);
    setLoading(true);
    setError('');

    try {
      const fechaInicio = `${anio}-${String(mes).padStart(2, '0')}-01`;
      const fechaFin = new Date(anio, mes, 0).toISOString().slice(0, 10);

      const res = await axios.get(`${BASE_URL}/api/convenio/reporte-convenios`, {
        params: { fechaInicio, fechaFin, opcion: sel.opcion }
      });

      if (res.data.length === 0) {
        setError('No se encontraron datos.');
        setTablaVisible(false);
        return;
      }

      setDatosApi(res.data);
      setTablaVisible(true);
      setPagina(0);
    } catch (err) {
      console.error(err);
      setError('Error al cargar datos desde la API');
    } finally {
      setLoading(false);
    }
  };

  const handleExportarExcel = () => {
    if (datosApi.length === 0) return;

    const campos = Object.keys(datosApi[0]);
    const mapping = columnMappings[opcionSeleccionada] || {};

    const datosRenombrados = datosApi.map(row => {
      const nuevo = {};
      campos.forEach(col => {
        const nombre = mapping[col] || col;
        nuevo[nombre] = row[col];
      });
      return nuevo;
    });

    const worksheet = XLSX.utils.json_to_sheet(datosRenombrados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');

    const fileName = `Reporte_${plantilla.replace(/\s+/g, '_')}_${anio}_${mes}.xlsx`;
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Generador de Plantillas Contables</Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Plantilla</InputLabel>
          <Select
            value={plantilla}
            onChange={e => {
              const sel = plantillas.find(p => p.label === e.target.value);
              setPlantilla(e.target.value);
              setOpcionSeleccionada(sel?.opcion || null);
            }}
            label="Plantilla"
          >
            {plantillas.map(p => <MenuItem key={p.opcion} value={p.label}>{p.label}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Año</InputLabel>
          <Select value={anio} onChange={e => setAnio(e.target.value)} label="Año">
            {anios.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Mes</InputLabel>
          <Select value={mes} onChange={e => setMes(e.target.value)} label="Mes">
            {meses.map(m => <MenuItem key={m.valor} value={m.valor}>{m.nombre}</MenuItem>)}
          </Select>
        </FormControl>

        <Button variant="contained" onClick={handleGenerar}>Generar Tabla</Button>
      </Box>

      {loading && <CircularProgress />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {tablaVisible && !loading && (
        <Box>
          <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6">
              {plantilla} ({meses.find(m => m.valor === +mes)?.nombre} {anio})
            </Typography>
            <Button variant="outlined" onClick={handleExportarExcel}>Exportar a Excel</Button>
          </Grid>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {datosApi[0] && Object.keys(datosApi[0]).map(col => {
                    const nombre = columnMappings[opcionSeleccionada]?.[col] || col;
                    return <TableCell key={col}><strong>{nombre}</strong></TableCell>;
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {datosApi.slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina)
                  .map((row, idx) => (
                    <TableRow key={idx}>
                      {Object.keys(row).map((col, i) => (
                        <TableCell key={i}>{row[col]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[filasPorPagina]}
              component="div"
              count={datosApi.length}
              page={pagina}
              rowsPerPage={filasPorPagina}
              onPageChange={(e, newPage) => setPagina(newPage)}
            />
          </TableContainer>
        </Box>
      )}
    </Container>
  );
};

export default PlantillaGenerador;