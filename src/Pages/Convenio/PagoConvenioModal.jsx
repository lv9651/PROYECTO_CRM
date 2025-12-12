import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  IconButton,
  Autocomplete,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  Typography,
  Box,
  Divider
} from '@mui/material';
import { AddCircle, RemoveCircle } from '@mui/icons-material';
import axios from 'axios';
import { BASE_URL } from '../../Conf/config';
import { useAuth } from '../../Compo/AuthContext';

const PagoConvenioModal = ({ open, onClose, onRefresh, anio }) => {
  const { user } = useAuth();

  const meses = [
    { nombre: 'Enero', valor: '01' }, { nombre: 'Febrero', valor: '02' },
    { nombre: 'Marzo', valor: '03' }, { nombre: 'Abril', valor: '04' },
    { nombre: 'Mayo', valor: '05' }, { nombre: 'Junio', valor: '06' },
    { nombre: 'Julio', valor: '07' }, { nombre: 'Agosto', valor: '08' },
    { nombre: 'Septiembre', valor: '09' }, { nombre: 'Octubre', valor: '10' },
    { nombre: 'Noviembre', valor: '11' }, { nombre: 'Diciembre', valor: '12' },
  ];

  const [rows, setRows] = useState([
    { 
      idRepresentante: '', 
      nombre: '', 
      medicosDisponibles: [], 
      medicosSeleccionados: [], 
      mes: '', 
      periodo: '', 
      documento: null 
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [sugerencias, setSugerencias] = useState([]);

  useEffect(() => {
    if (open) {
      setRows([
        { 
          idRepresentante: '', 
          nombre: '', 
          medicosDisponibles: [], 
          medicosSeleccionados: [], 
          mes: '', 
          periodo: '', 
          documento: null 
        }
      ]);
    }
  }, [open, anio]);

  const handleAddRow = () => {
    setRows([
      ...rows,
      { 
        idRepresentante: '', 
        nombre: '', 
        medicosDisponibles: [], 
        medicosSeleccionados: [], 
        mes: '', 
        periodo: '', 
        documento: null 
      }
    ]);
  };

  const handleRemoveRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const buscarRepresentantes = async (valor) => {
    if (!valor || valor.length < 2) return;

    try {
      const response = await axios.get(
        `${BASE_URL}/api/Contabilidad_Convenio/buscar-rep-pago`,
        { params: { nombre: valor } }
      );
      setSugerencias(response.data);
    } catch (error) {
      console.error("Error buscando representante:", error);
    }
  };

const handleMesChange = (index, mes) => {
  const currentYear = new Date().getFullYear(); // año actual
  setRows((prevRows) => {
    const newRows = [...prevRows];
    newRows[index].mes = mes;
    newRows[index].periodo = `${currentYear}-${mes.padStart(2, '0')}`;
    return newRows;
  });
};

  const handleRepresentanteSelect = async (index, representante) => {
    if (!representante) return;

    const updated = [...rows];
    updated[index].idRepresentante = representante.idMedico;
    updated[index].nombre = representante.representante;
    updated[index].medicosDisponibles = [];
    updated[index].medicosSeleccionados = [];
    setRows(updated);

    try {
      const response = await axios.get(
        `${BASE_URL}/api/Contabilidad_Convenio/medicos_pago/${representante.idMedico}`
      );

      updated[index].medicosDisponibles = response.data;
      setRows(updated);
    } catch (error) {
      console.error("Error obteniendo médicos:", error);
    }
  };

  const toggleMedico = (rowIndex, nombre) => {
    const updated = [...rows];
    const lista = updated[rowIndex].medicosSeleccionados;

    updated[rowIndex].medicosSeleccionados = lista.includes(nombre)
      ? lista.filter((m) => m !== nombre)
      : [...lista, nombre];

    setRows(updated);
  };

 const handleUpload = async () => {
  for (const row of rows) {
    if (!row.idRepresentante || !row.periodo || !row.nombre || !row.documento) {
      alert(`Todos los campos son obligatorios para ${row.nombre || "fila"}!`);
      return;
    }
  }

  setLoading(true);

  try {
    for (const row of rows) {
      const formData = new FormData();
      formData.append("IDREPRESENTANTE", row.idRepresentante.toString());
      formData.append("PERIODO", row.periodo);
      formData.append("NOMBRE", row.medicosSeleccionados.join(", "));
      formData.append("DOCUMENTO", row.documento);

     
      // No necesitas enviar los médicos si el backend no lo espera

      await axios.post(`${BASE_URL}/api/Contabilidad_Convenio/insertar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    alert(`Se cargaron ${rows.length} registros.`);
    setRows([{
      idRepresentante: '', nombre: '', medicosDisponibles: [], medicosSeleccionados: [], mes: '', periodo: '', documento: null
    }]);
    onRefresh();
    onClose();
  } catch (err) {
    console.error(err.response?.data || err);
    alert("Error al subir documentos.");
  } finally {
    setLoading(false);
  }
};
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>

      {/* Encabezado estilizado */}
      <DialogTitle
        sx={{
          background: "#1976d2",
          color: "white",
          fontWeight: "bold",
          textAlign: "center"
        }}
      >
        Cargar Documentos de Pagos
      </DialogTitle>

      <DialogContent dividers sx={{ maxHeight: "70vh", overflowY: "auto" }}>
        
        {rows.map((row, index) => (
          <Paper
            key={index}
            elevation={3}
            sx={{ p: 2, mb: 2, borderRadius: 2, background: "#f9f9f9" }}
          >
            <Grid container spacing={2} alignItems="center">

              {/* REPRESENTANTE */}
              <Grid item xs={4}>
                <Autocomplete
                  freeSolo
                  options={sugerencias}
                  getOptionLabel={(opt) => opt.representante || ""}
                  onInputChange={(e, value) => buscarRepresentantes(value)}
                  onChange={(e, value) => handleRepresentanteSelect(index, value)}
                  renderInput={(params) => (
                    <TextField {...params} label="Representante" fullWidth />
                  )}
                />
              </Grid>

              {/* MES */}
              <Grid item xs={3}>
                <TextField
                  label="Mes"
                  select
                  fullWidth
                  SelectProps={{ native: true }}
                  value={row.mes}
                  onChange={(e) => handleMesChange(index, e.target.value)}
                >
                  <option value="">Selecciona Mes</option>
                  {meses.map((m) => (
                    <option key={m.valor} value={m.valor}>{m.nombre}</option>
                  ))}
                </TextField>
              </Grid>

              {/* DOCUMENTO */}
              <Grid item xs={4}>
                <Button
                  variant="contained"
                  component="label"
                  fullWidth
                  sx={{ bgcolor: "#0288d1" }}
                >
                  Subir Documento
                  <input
                    hidden
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg"
                    onChange={(e) =>
                      setRows((prev) => {
                        const newRows = [...prev];
                        newRows[index].documento = e.target.files[0];
                        return newRows;
                      })
                    }
                  />
                </Button>

                {row.documento && (
                  <Typography variant="caption" color="green">
                    {row.documento.name}
                  </Typography>
                )}
              </Grid>

              {/* BOTÓN REMOVE */}
              <Grid item xs={1}>
                <IconButton color="error" onClick={() => handleRemoveRow(index)}>
                  <RemoveCircle />
                </IconButton>
              </Grid>

              {/* MÉDICOS CON CHECKBOXES */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2, maxHeight: 180, overflowY: 'auto' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Seleccione Médicos
                  </Typography>

                  <Divider sx={{ mb: 1 }} />

                  <FormGroup>
                    {row.medicosDisponibles.map((m, i) => (
                      <FormControlLabel
                        key={i}
                        control={
                          <Checkbox
                            checked={row.medicosSeleccionados.includes(m.nombre)}
                            onChange={() => toggleMedico(index, m.nombre)}
                          />
                        }
                        label={m.nombre}
                      />
                    ))}
                  </FormGroup>
                </Paper>
              </Grid>

            </Grid>
          </Paper>
        ))}

        <Button
          startIcon={<AddCircle />}
          onClick={handleAddRow}
          variant="outlined"
          fullWidth
          sx={{ mt: 2 }}
        >
          Agregar Documento
        </Button>

      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={loading}
          sx={{ bgcolor: "#2e7d32" }}
        >
          {loading ? "Subiendo..." : "Subir Documentos"}
        </Button>
      </DialogActions>

    </Dialog>
  );
};

export default PagoConvenioModal;