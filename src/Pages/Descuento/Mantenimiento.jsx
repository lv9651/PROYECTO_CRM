import React, { useState, useEffect } from 'react';
import {
  Stepper, Step, StepLabel,
  TextField, Button,
  RadioGroup, Radio, FormLabel, Grid, Typography,
  CircularProgress, Table, TableBody, TableCell, TableHead, TableRow, Checkbox, FormControlLabel, Box, Paper, Autocomplete
} from '@mui/material';
import dayjs from 'dayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from 'axios';
import { useAuth } from '../../Compo/AuthContext';
import { BASE_URL } from '../../Conf/config';
import ConfigurarDescuentos from './ConfigurarDescuentos';
import GuardarFinal from './GuardarFinal';

const pasos = ['Seleccionar Atributos', 'Configurar Descuentos', 'Guardar Cambios'];

export default function MantenimientoWizard() {
  const [step, setStep] = useState(0);

  // Paso 0: Atributos seleccionados
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState(dayjs());
  const [fechaFin, setFechaFin] = useState(dayjs().add(7, 'day'));
  const [canales, setCanales] = useState([]);
  const [listas, setListas] = useState([]);
  const [descuentoPara, setDescuentoPara] = useState('Proveedor');
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [laboratorioSeleccionado, setLaboratorioSeleccionado] = useState(null);
  const { user } = useAuth();

  // Datos del paso 1: descuentos y productos configurados
  const [datosConfigurarDescuento, setDatosConfigurarDescuento] = useState({});

  // Datos cargados para listas, canales, proveedores y laboratorios
  const [canalesDisponibles, setCanalesDisponibles] = useState([]);
  const [listasDisponibles, setListasDisponibles] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [laboratorios, setLaboratorios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Datos completos que combinan paso 0 + paso 1, para enviar a paso 2
  const [datosCompletos, setDatosCompletos] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const filtroInicial = 'AT';
        const filtroInicial2 = 'LA';

        const [canalesRes, listasRes, proveedoresRes, laboratoriosRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/Descuento/canales`),
          axios.get(`${BASE_URL}/api/Descuento/listas-precios`),
          axios.get(`${BASE_URL}/api/Descuento/buscarprove?filtro=${filtroInicial2}`),
          axios.get(`${BASE_URL}/api/Descuento/buscarlaborat?filtro=${filtroInicial}`),
        ]);

        setCanalesDisponibles(canalesRes.data);
        setListasDisponibles(listasRes.data);
        setProveedores(proveedoresRes.data);
        setLaboratorios(laboratoriosRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const toggleCanal = (id) => {
    setCanales(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const toggleLista = (id) => {
    setListas(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]);
  };
  console.log(datosCompletos);

  const handleNext = () => {
    if (step === 1) {
      // Combinar paso 0 y paso 1 en datosCompletos
const listasConDescripcion = listas.map(id => {
  const lista = listasDisponibles.find(l => l.idListaPrecio === Number(id));
  return {
    idListaPrecio: id,
    descripcion: lista?.descripcion || ''
  };
});

      setDatosCompletos({
        descripcion,
        fechaInicio: fechaInicio.toDate(),  // Convierte dayjs a Date
        fechaFin: fechaFin.toDate(),
        canales,
        listass: listasConDescripcion,
        descuentoPara,
        proveedorSeleccionado,
        laboratorioSeleccionado,
        usuariomanipula: user?.emp_codigo || 0,
        ...datosConfigurarDescuento
        
      });
    }
    
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setStep(s => s - 1);
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <CircularProgress /> Cargando datos...
      </div>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div style={{ padding: 40 }}>
        <Stepper activeStep={step} alternativeLabel>
          {pasos.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {step === 0 && (
          <Grid container spacing={3} style={{ marginTop: 20 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Descripción"
                fullWidth
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                margin="normal"
              />
          <TextField
  type="date"
  label="Fecha Inicio"
  name="fechainicio"
  value={fechaInicio.format('YYYY-MM-DD')}
  onChange={(e) => setFechaInicio(e.target.value)}
  renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
  InputLabelProps={{ shrink: true }}
/>

          <TextField
  type="date"
  label="Fecha Fin"
  name="Fechfin"
  value={fechaFin.format('YYYY-MM-DD')}
  onChange={(e) => setFechaFin(e.target.value)}
  renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
  InputLabelProps={{ shrink: true }}
/>



              
           
              <FormLabel component="legend" style={{ marginTop: 16 }}>Descuento Para</FormLabel>
              <RadioGroup row value={descuentoPara} onChange={e => setDescuentoPara(e.target.value)}>
                <FormControlLabel value="Proveedor" control={<Radio />} label="Proveedor" />
                <FormControlLabel value="Laboratorio" control={<Radio />} label="Laboratorio" />
              </RadioGroup>

              {descuentoPara === 'Proveedor' && (
                <>
                  <FormLabel component="legend" style={{ marginTop: 16 }}>Proveedor</FormLabel>
                  <Autocomplete
                    options={proveedores}
                    getOptionLabel={option => `${option.ruc || ''} - ${option.razonSocial || ''}`}
                    value={proveedorSeleccionado}
                    onChange={(e, newVal) => setProveedorSeleccionado(newVal)}
                    renderInput={(params) => <TextField {...params} label="Seleccionar Proveedor" fullWidth margin="normal" />}
                    freeSolo
                  />
                </>
              )}
              {descuentoPara === 'Laboratorio' && (
                <>
                  <FormLabel component="legend" style={{ marginTop: 16 }}>Laboratorio</FormLabel>
                  <Autocomplete
                    options={laboratorios}
                    getOptionLabel={option => option.descripcion || ''}
                    value={laboratorioSeleccionado}
                    onChange={(e, newVal) => setLaboratorioSeleccionado(newVal)}
                    renderInput={(params) => <TextField {...params} label="Seleccionar Laboratorio" fullWidth margin="normal" />}
                    freeSolo
                  />
                </>
              )}
            </Grid>

   {/* CANALES DE VENTA */}
<Grid item xs={12} md={3}>
  <Typography
    variant="subtitle1"
    sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}
  >
    Canales de Venta
  </Typography>
  <Paper
    variant="outlined"
    sx={{
      height: 320,
      overflow: 'auto',
      borderRadius: 2,
      boxShadow: 1,
    }}
  >
    <Table stickyHeader size="small">
      <TableHead>
        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
          <TableCell padding="checkbox"></TableCell>
          <TableCell sx={{ fontWeight: 'bold' }}>Descripción</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {canalesDisponibles.map(c => (
          <TableRow
            key={c.idCanalVenta}
            hover
            sx={{
              '&:hover': { backgroundColor: '#f0f8ff' },
            }}
          >
            <TableCell padding="checkbox">
              <Checkbox
                color="primary"
                checked={canales.includes(c.idCanalVenta)}
                onChange={() => toggleCanal(c.idCanalVenta)}
              />
            </TableCell>
            <TableCell>{c.descripcion}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Paper>
</Grid>
          
{/* LISTA DE PRECIOS */}
<Grid item xs={12} md={3}>
  <Typography
    variant="subtitle1"
    sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}
  >
    Lista de Precios
  </Typography>
  <Paper
    variant="outlined"
    sx={{
      height: 320,
      overflow: 'auto',
      borderRadius: 2,
      boxShadow: 1,
    }}
  >
    <Table stickyHeader size="small">
      <TableHead>
        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
          <TableCell padding="checkbox"></TableCell>
          <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
          <TableCell sx={{ fontWeight: 'bold' }}>Descripción</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {listasDisponibles.map(l => (
          <TableRow
            key={l.idListaPrecio}
            hover
            sx={{
              '&:hover': { backgroundColor: '#f0f8ff' },
            }}
          >
            <TableCell padding="checkbox">
              <Checkbox
                color="primary"
                checked={listas.includes(l.idListaPrecio)}
                onChange={() => toggleLista(l.idListaPrecio)}
              />
            </TableCell>
            <TableCell>{l.idListaPrecio}</TableCell>
            <TableCell>{l.descripcion}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Paper>
</Grid>
          </Grid>
        )}

        {step === 1 && (
          <ConfigurarDescuentos
            descripcion={descripcion}
            fechaInicio={fechaInicio}
            fechaFin={fechaFin}
            canales={canales}
            listas={listas}
            descuentoPara={descuentoPara}
            proveedorSeleccionado={proveedorSeleccionado}
            laboratorioSeleccionado={laboratorioSeleccionado}
            listasDisponibles={listasDisponibles}
            onDatosCambio={setDatosConfigurarDescuento}
          />
        )}

        {step === 2 && (
          <GuardarFinal datos={datosCompletos} listasDisponibles={listasDisponibles} />
        )}

   <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
  <Button disabled={step === 0} onClick={handleBack}>Atrás</Button>
  
  {step === pasos.length - 1 ? (
    <Button
      variant="contained"
      onClick={async () => {
        try {
          const formatearFecha = (fecha, finDelDia = false) => {
            const date = dayjs(fecha);
            return finDelDia
              ? date.hour(23).minute(59).second(59).format('YYYY-MM-DDTHH:mm:ss')
              : date.hour(0).minute(0).second(0).format('YYYY-MM-DDTHH:mm:ss');
          };

          const payload = {
            iddescuento: 0,
            descripcion: datosCompletos.descripcion,
            fechainicio: formatearFecha(datosCompletos.fechaInicio),
            fechafin: formatearFecha(datosCompletos.fechaFin, true),
            idtipodescuento: 1,
            todosucursal: false,
            idsucursal: '',
             idcanalventa: JSON.stringify(
              datosCompletos.canales.map(id => {
                const canal = canalesDisponibles.find(c => c.idCanalVenta === id);
                return {
                  idcanalventa: String(id),
                  descripcion: canal?.descripcion || ''
                };
              })
            ),
            todolistaprecio: false,
            idlistaprecio: JSON.stringify(
              datosCompletos.listass.map(l => ({
                idlistaprecio: String(l.idListaPrecio),
                descripcion: l.descripcion || ''
              }))
            ),
            todotipoproducto: false,
            descuentotodotipoproducto: 0,
            idtipoproducto: "",
            excluiridproducto: "",
            todoproducto: false,
            descuentotodoproducto: 0,
            idproducto: JSON.stringify(
              (datosCompletos.productosSeleccionados || []).map(p => ({
                idproducto: String(p.idproducto),
                descripcion: p.producto,
                descuentoqf: p.descq || 0,
                descuentoprov: p.prov || 0
              }))
            ),
            todocliente: false,
            descuentotodocliente: 0,
            idcliente: "",
            idestado: 1,
            usuariomanipula: datosCompletos.usuariomanipula || 0
          };

          console.log("📦 Enviando a API:", payload);
console.log("🧪 Verificando listas en datosCompletos:", datosCompletos.listas);
          await axios.post(`${BASE_URL}/api/Descuento/Insertar-Descu`, payload);
          alert('✅ Descuento guardado correctamente');
          setStep(0); // Opcional: reinicia el wizard
        } catch (error) {
          console.error('❌ Error al guardar:', error);
          alert('Ocurrió un error al guardar los datos.');
        }
      }}
    >
      Finalizar
    </Button>
  ) : (
    <Button variant="contained" onClick={handleNext}>Siguiente</Button>
  )}
</div>
      </div>
    </LocalizationProvider>
  );
}