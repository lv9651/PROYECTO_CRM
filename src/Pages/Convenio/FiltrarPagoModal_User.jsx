import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, Table, TableHead, TableBody,
  TableRow, TableCell, Paper, Typography,
  Select, MenuItem, FormControl, InputLabel,
  Autocomplete
} from '@mui/material';
import axios from 'axios';
import { BASE_URL } from '../../Conf/config';

const FiltrarPagoModal = ({ open, onClose,idMedico }) => {
  const [representante, setRepresentante] = useState(null);
  const [representantes, setRepresentantes] = useState([]);
  const [anio, setAnio] = useState('');
  const [mes, setMes] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);

  // Años (últimos 10)
  const anios = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  // Meses
  const meses = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ];

  // 🔹 Cargar TODOS los representantes al abrir
  useEffect(() => {
    if (open) {
      cargarTodos();
      setRepresentante(null);
    }
  }, [open]);

  const cargarTodos = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/Contabilidad_Convenio/buscar-rep-pago`,
        { params: { Nombre: 'TODOS' } }
      );
      setRepresentantes(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFiltrar = async () => {
    if (!anio || !mes) {
      alert('Debe seleccionar año y mes');
      return;
    }

    const periodo = `${anio}-${mes}`;

    // 👉 Si no selecciona representante → TODOS
    const representanteEnviar = representante
      ? representante.representante
      : 'TODOS';

    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/Contabilidad_Convenio/filtrarConta`,
        {
          params: {
            representante: idMedico,
            periodo
          }
        }
      );
      setResultados(response.data);
    } catch (err) {
      console.error(err);
      alert('Error al filtrar pagos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Filtrar Pagos por Convenio</DialogTitle>

      <DialogContent>
        <Grid container spacing={2} sx={{ mb: 2 }}>

          {/* REPRESENTANTE */}
   
{/* AÑO */}
<Grid item xs={6}>
  <FormControl fullWidth sx={{ minWidth: 200, height: 56 }}>
    <InputLabel>Año</InputLabel>
    <Select
      value={anio}
      label="Año"
      onChange={(e) => setAnio(e.target.value)}
      sx={{
        height: 56,
        '& .MuiSelect-select': {
          height: 56,
          display: 'flex',
          alignItems: 'center'
        }
      }}
    >
      {anios.map((a) => (
        <MenuItem key={a} value={a}>{a}</MenuItem>
      ))}
    </Select>
  </FormControl>
</Grid>

          {/* MES */}
<Grid item xs={6}>
  <FormControl fullWidth sx={{ minWidth: 200, height: 56 }}>
    <InputLabel>Mes</InputLabel>
    <Select
      value={mes}
      label="Mes"
      onChange={(e) => setMes(e.target.value)}
      sx={{
        height: 56,
        '& .MuiSelect-select': {
          height: 56,
          display: 'flex',
          alignItems: 'center'
        }
      }}
    >
      {meses.map((m) => (
        <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
      ))}
    </Select>
  </FormControl>
</Grid>

          {/* BOTÓN */}
          <Grid item xs={12}>
            <Button
              onClick={handleFiltrar}
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Buscando...' : 'Filtrar'}
            </Button>
          </Grid>
        </Grid>

        {/* RESULTADOS */}
        {resultados.length > 0 && (
          <Paper sx={{ maxHeight: 400, overflowY: 'auto', mt: 2 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Periodo</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Documento</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resultados.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.periodo}</TableCell>
                    <TableCell>{new Date(r.fecha).toLocaleDateString()}</TableCell>
                    <TableCell>{r.nombre}</TableCell>
                    <TableCell>
                      {r.documento ? (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            const base64 = r.documento;
                            let mime = 'application/octet-stream';
                            if (base64.startsWith('JVBER')) mime = 'application/pdf';

                            const bytes = atob(base64)
                              .split('')
                              .map(c => c.charCodeAt(0));
                            const blob = new Blob([new Uint8Array(bytes)], { type: mime });
                            window.open(URL.createObjectURL(blob), '_blank');
                          }}
                        >
                          Ver Documento
                        </Button>
                      ) : 'Sin documento'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}

        {resultados.length === 0 && !loading && (
          <Typography sx={{ mt: 2 }} variant="body2">
            No hay resultados
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FiltrarPagoModal;