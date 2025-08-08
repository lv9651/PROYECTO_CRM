import React, { useEffect, useState } from 'react';
import {
  Stepper, Step, StepLabel,
  TextField, Button,
  RadioGroup, Radio, FormLabel, Grid, Typography,
  CircularProgress, Table, TableBody, TableCell, TableHead, TableRow, Checkbox, FormControlLabel, Box, Paper,Autocomplete, MenuItem, Select
} from '@mui/material';
import dayjs from 'dayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from 'axios';
import ConfigurarDescuentos from '../Descuento/ConfigurarDescuentos';
const pasos = ['Seleccionar Atributos', 'Configurar Descuentos', 'Guardar Cambios'];

export default function MantenimientoWizard() {
  const [step, setStep] = useState(0);
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState(dayjs());
  const [fechaFin, setFechaFin] = useState(dayjs().add(7, 'day'));
  const [canales, setCanales] = useState([]);
  const [listas, setListas] = useState([]);
  const [canalesDisponibles, setCanalesDisponibles] = useState([]);
  const [listasDisponibles, setListasDisponibles] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [laboratorios, setLaboratorios] = useState([]);
  const [descuentoPara, setDescuentoPara] = useState('Proveedor');
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState('');
  const [laboratorioSeleccionado, setLaboratorioSeleccionado] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const filtroInicial = 'AT';
          const filtroInicial2 = 'LA';
        const [canalesRes, listasRes, proveedoresRes, laboratoriosRes] = await Promise.all([
          axios.get('https://localhost:7146/api/Descuento/canales'),
          axios.get('https://localhost:7146/api/Descuento/listas-precios'),
          axios.get(`https://localhost:7146/api/Descuento/buscarprove?filtro=${filtroInicial2}`),
          axios.get(`https://localhost:7146/api/Descuento/buscarlaborat?filtro=${filtroInicial}`)
        ]);
        setCanalesDisponibles(canalesRes.data);
        setListasDisponibles(listasRes.data);
        setProveedores(proveedoresRes.data);
        setLaboratorios(laboratoriosRes.data);
      } catch (err) {
        console.error('Error cargando datos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  const toggleCanal = (id) => {
    setCanales(prev => prev.includes(id)
      ? prev.filter(c => c !== id)
      : [...prev, id]);
  };

  const toggleLista = (id) => {
    setListas(prev => prev.includes(id)
      ? prev.filter(c => c !== id)
      : [...prev, id]);
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  if (loading) {
    return <div className="p-10 text-center"><CircularProgress /> Cargando datos...</div>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="p-10">
        <Stepper activeStep={step} alternativeLabel>
          {pasos.map(label => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>

        {step === 0 && (
          <Grid container spacing={6} className="mt-6">
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                label="Descripción" 
                variant="outlined" 
                margin="normal"
                value={descripcion} 
                onChange={(e) => setDescripcion(e.target.value)}
              />
              <DatePicker 
                label="Fecha Inicio" 
                value={fechaInicio} 
                onChange={setFechaInicio} 
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" variant="outlined" />} 
              />
              <DatePicker 
                label="Fecha Fin" 
                value={fechaFin} 
                onChange={setFechaFin} 
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" variant="outlined" />} 
              />
              <FormLabel component="legend" sx={{ mt: 2 }}>Descuento Para</FormLabel>
              <RadioGroup row value={descuentoPara} onChange={(e) => setDescuentoPara(e.target.value)}>
                <FormControlLabel value="Proveedor" control={<Radio />} label="Proveedor" />
                <FormControlLabel value="Laboratorio" control={<Radio />} label="Laboratorio" />
              </RadioGroup>
                 {descuentoPara === 'Proveedor' && (
  <>
    <FormLabel component="legend" sx={{ mt: 2 }}>Proveedor</FormLabel>
    <Autocomplete
      options={proveedores}
      getOptionLabel={(option) => `${option.ruc || ''} - ${option.razonSocial || ''}`}
      value={proveedorSeleccionado}
      onChange={(e, newValue) => setProveedorSeleccionado(newValue)}
      onInputChange={async (e, value) => {
        if (value && value.length >= 3) {
          try {
            const res = await axios.get(`https://localhost:7146/api/Descuento/buscarprove?filtro=${value}`);
            setProveedores(res.data);
          } catch (err) {
            console.error('Error cargando proveedores:', err);
          }
        }
      }}
      renderInput={(params) => (
        <TextField {...params} label="Seleccionar Proveedor" variant="outlined" sx={{ mt: 1 }} fullWidth />
      )}
      freeSolo
    />
  </>
)}

{descuentoPara === 'Laboratorio' && (
  <>
    <FormLabel component="legend" sx={{ mt: 2 }}>Laboratorio</FormLabel>
    <Autocomplete
      options={laboratorios}
      getOptionLabel={(option) => option.descripcion || ''}
      value={laboratorioSeleccionado}
      onChange={(e, newValue) => setLaboratorioSeleccionado(newValue)}
      onInputChange={async (e, value) => {
        if (value && value.length >= 3) {
          try {
            const res = await axios.get(`https://localhost:7146/api/Descuento/buscarlaborat?filtro=${value}`);
            setLaboratorios(res.data);
          } catch (err) {
            console.error('Error cargando laboratorios:', err);
          }
        }
      }}
      renderInput={(params) => (
        <TextField {...params} label="Seleccionar Laboratorio" variant="outlined" sx={{ mt: 1 }} fullWidth />
      )}
      freeSolo
    />
  </>
)}

         
          </Grid>
      
            

            <Grid item xs={12} md={3}>
              <Typography variant="subtitle1">Canales de Venta</Typography>
              <Box mt={2}>
                <Paper variant="outlined" sx={{ borderColor: 'grey.400' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Descripción</TableCell>
    
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {canalesDisponibles.map((c) => (
                        <TableRow key={c.idCanalVenta}>
                          <TableCell>
                            <Checkbox checked={canales.includes(c.idCanalVenta)} onChange={() => toggleCanal(c.idCanalVenta)} />
                          </TableCell>
                          <TableCell>{c.descripcion}</TableCell>
    
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Box>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography variant="subtitle1">Lista de Precios</Typography>
              <Box mt={2}>
                <Paper variant="outlined" sx={{ borderColor: 'grey.400' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell></TableCell>
                        <TableCell>ID</TableCell>
                        <TableCell>Descripción</TableCell>
           
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {listasDisponibles.map((l) => (
                        <TableRow key={l.idListaPrecio}>
                          <TableCell>
                            <Checkbox checked={listas.includes(l.idListaPrecio)} onChange={() => toggleLista(l.idListaPrecio)} />
                          </TableCell>
                          <TableCell>{l.idListaPrecio}</TableCell>
                          <TableCell>{l.descripcion}</TableCell>
            
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        )}
        {step === 1 && (
  <ConfigurarDescuentos    descripcion={descripcion}
    fechaInicio={fechaInicio}
    fechaFin={fechaFin}
    canales={canales}
    listas={listas}
    descuentoPara={descuentoPara}
    proveedorSeleccionado={proveedorSeleccionado}
    laboratorioSeleccionado={laboratorioSeleccionado} />
)}


        <div className="mt-6 flex justify-between">
          <Button disabled={step === 0} onClick={handleBack}>Atrás</Button>
          <Button variant="contained" onClick={handleNext}>{step === pasos.length - 1 ? 'Finalizar' : 'Siguiente'}</Button>
        </div>
      </div>
    </LocalizationProvider>
  );
}
