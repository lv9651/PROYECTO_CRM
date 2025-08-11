// MantenimientoWizard.jsx
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
          axios.get('https://localhost:7146/api/Descuento/canales'),
          axios.get('https://localhost:7146/api/Descuento/listas-precios'),
          axios.get(`https://localhost:7146/api/Descuento/buscarprove?filtro=${filtroInicial2}`),
          axios.get(`https://localhost:7146/api/Descuento/buscarlaborat?filtro=${filtroInicial}`),
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

  const verificarDatosCompletos = () => {
    if (!datosConfigurarDescuento) return false;
    const tieneProductos = datosConfigurarDescuento.productosSeleccionados?.length > 0;
    const tieneDescuentos = datosConfigurarDescuento.descuentosAplicadoss?.length > 0;
    return tieneProductos && tieneDescuentos;
  };


  console.log('datosConfigurarDescuento lv:', datosConfigurarDescuento.productosSeleccionados);

  const handleNext = () => {
      console.log("📦 Datos enviados desde ConfigurarDescuentos:", datosCompletos);
    if (step === 1) {
   
      // Combinar paso 0 y paso 1 en datosCompletos
   const listasConDescripcion = listasDisponibles
  .filter(l => listas.includes(l.idListaPrecio))
  .map(l => ({
    idListaPrecio: l.idListaPrecio,
    descripcion: l.descripcion
  }));

setDatosCompletos({
  descripcion,
  fechaInicio,
  fechaFin,
  canales,
  listas: listasConDescripcion, // 👈 ahora con descripción
  descuentoPara,
  proveedorSeleccionado,
  laboratorioSeleccionado,
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
              <DatePicker
                label="Fecha Inicio"
                value={fechaInicio}
                onChange={setFechaInicio}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
              />
              <DatePicker
                label="Fecha Fin"
                value={fechaFin}
                onChange={setFechaFin}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
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

            <Grid item xs={12} md={3}>
              <Typography variant="subtitle1">Canales de Venta</Typography>
              <Paper variant="outlined" style={{ marginTop: 8 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell>Descripción</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {canalesDisponibles.map(c => (
                      <TableRow key={c.idCanalVenta}>
                        <TableCell>
                          <Checkbox
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

            <Grid item xs={12} md={3}>
              <Typography variant="subtitle1">Lista de Precios</Typography>
              <Paper variant="outlined" style={{ marginTop: 8 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell>ID</TableCell>
                      <TableCell>Descripción</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {listasDisponibles.map(l => (
                      <TableRow key={l.idListaPrecio}>
                        <TableCell>
                          <Checkbox
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
            onDatosCambio={setDatosConfigurarDescuento} // recibir datos de ConfigurarDescuentos
          />
        )}

        {step === 2 && (
          <GuardarFinal datos={datosCompletos}
            listasDisponibles={listasDisponibles} />
        )}

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
          <Button disabled={step === 0} onClick={handleBack}>Atrás</Button>
          <Button variant="contained" onClick={handleNext}>
            {step === pasos.length - 1 ? 'Finalizar' : 'Siguiente'}
          </Button>
        </div>
      </div>
    </LocalizationProvider>
  );
}