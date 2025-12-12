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
  Autocomplete
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
  { idRepresentante: '', nombre: '', medicosDisponibles: [], medicosSeleccionados: [], mes: '', periodo: '', documento: null }
]);

  const [loading, setLoading] = useState(false);
  const [sugerencias, setSugerencias] = useState([]); // LISTA DE RESULTADOS DEL API

  useEffect(() => {
    if (open) {
      setRows([{ idRepresentante: '', nombre: '', medico: '', mes: '', periodo: '', documento: null }]);
    }
  }, [open, anio]);

  const handleAddRow = () => {
    setRows([...rows, { idRepresentante: '', nombre: '', medico: '', mes: '', periodo: '', documento: null }]);
  };

  const handleRemoveRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  // 🔍 Buscar representantes mientras se escribe
  const buscarRepresentantes = async (valor) => {
    try {
      if (!valor || valor.length < 2) return;

      const response = await axios.get(
        `${BASE_URL}/api/Contabilidad_Convenio/buscar-rep-pago`,
        { params: { nombre: valor } }
      );

      setSugerencias(response.data); // lista completa
    } catch (error) {
      console.error("Error buscando representante:", error);
    }
  };

  const handleMesChange = (index, mes) => {
    const newRows = [...rows];
    newRows[index].mes = mes;
    newRows[index].periodo = `${anio}-${mes}`;
    setRows(newRows);
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

    updated[index].medicosDisponibles = response.data; // lista de médicos
    setRows(updated);

  } catch (error) {
    console.error("Error obteniendo médicos:", error);
  }
};
  const handleUpload = async () => {
    for (const row of rows) {
      if (!row.idRepresentante || !row.periodo || !row.nombre || !row.documento) {
        alert('Todos los campos son obligatorios.');
        return;
      }
    }

    setLoading(true);

    try {
      const formData = new FormData();
      rows.forEach((row, idx) => {
        formData.append(`documentos[${idx}][idRepresentante]`, row.idRepresentante);
        formData.append(`documentos[${idx}][periodo]`, row.periodo);
        formData.append(`documentos[${idx}][nombre]`, row.nombre);
        formData.append(`documentos[${idx}][documento]`, row.documento);
      });

      formData.append('usuario', user?.emp_codigo || 'SYSTEM');

      const response = await axios.post(
        `${BASE_URL}/api/PagoConvenioMedico/multiple-upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert(`Se cargaron ${response.data.cantidad} registros.`);

      setRows([{ idRepresentante: '', nombre: '', medico: '', mes: '', periodo: '', documento: null }]);
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error al subir documentos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Cargar Documentos de Pagos</DialogTitle>

      <DialogContent>
        {rows.map((row, index) => (
          <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 1 }}>

            {/* 🔵 AUTOCOMPLETE */}
            <Grid item xs={3}>
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

            <Grid item xs={2}>
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

            <Grid item xs={3}>
              <TextField
                label="Médico"
                fullWidth
                value={row.medico}
                onChange={(e) => handleChange(index, 'medico', e.target.value)}
              />
            </Grid>

            <Grid item xs={3}>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg"
                onChange={(e) => handleChange(index, 'documento', e.target.files[0])}
              />
            </Grid>

            <Grid item xs={1}>
              <IconButton color="error" onClick={() => handleRemoveRow(index)}>
                <RemoveCircle />
              </IconButton>
            </Grid>

          </Grid>
        ))}

        <Button startIcon={<AddCircle />} onClick={handleAddRow}>
          Agregar Documento
        </Button>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button onClick={handleUpload} variant="contained" disabled={loading}>
          {loading ? "Subiendo..." : "Subir Documentos"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PagoConvenioModal;