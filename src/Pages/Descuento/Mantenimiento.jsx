import React, { useEffect, useState } from 'react';
import {
  Stepper, Step, StepLabel,
  TextField, Button,
  RadioGroup, Radio, FormLabel, Grid, Typography,
  CircularProgress, Table, TableBody, TableCell, TableHead, TableRow, Checkbox, FormControlLabel, Box, Paper
} from '@mui/material';
import dayjs from 'dayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from 'axios';

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
  const [descuentoPara, setDescuentoPara] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [canalesRes, listasRes] = await Promise.all([
          axios.get('https://localhost:7146/api/Descuento/canales'),
          axios.get('https://localhost:7146/api/Descuento/listas-precios')
        ]);
        setCanalesDisponibles(canalesRes.data.sort((a, b) => a.descripcion.localeCompare(b.descripcion)));
        setListasDisponibles(listasRes.data.sort((a, b) => a.descripcion.localeCompare(b.descripcion)));
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

        <div className="mt-6 flex justify-between">
          <Button disabled={step === 0} onClick={handleBack}>Atrás</Button>
          <Button variant="contained" onClick={handleNext}>{step === pasos.length - 1 ? 'Finalizar' : 'Siguiente'}</Button>
        </div>
      </div>
    </LocalizationProvider>
  );
}
