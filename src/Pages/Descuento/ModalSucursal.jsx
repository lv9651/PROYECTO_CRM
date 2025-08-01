import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableHead, TableRow,
  Button, Checkbox, Typography
} from '@mui/material';
import axios from 'axios';

const ModalSucursal = ({ open, onClose, descuento }) => {
  const [sucursales, setSucursales] = useState([]);
  const [sucursalesSeleccionadas, setSucursalesSeleccionadas] = useState([]);

  useEffect(() => {
    if (open && descuento?.idDescuento) {
      axios
        .get(`https://localhost:7146/api/descuento/obtener-sucursales-descuento/${descuento.idDescuento}`)
        .then(res => {
          const data = res.data || [];
          setSucursales(data);
          // Preseleccionar las sucursales ya asignadas
          const seleccionadas = data.filter(s => s.asignado).map(s => s.suc_Codigo);
          setSucursalesSeleccionadas(seleccionadas);
        })
        .catch(err => {
          console.error('Error cargando sucursales:', err);
        });
    }
  }, [open, descuento]);

  const handleCheckboxChange = (codigo) => {
    setSucursalesSeleccionadas(prev =>
      prev.includes(codigo)
        ? prev.filter(c => c !== codigo)
        : [...prev, codigo]
    );
  };

const handleGuardar = async () => {
  try {
  const payload = {
  IdDescuento: descuento?.idDescuento,
  IdSucursales: sucursales
    .filter(s => sucursalesSeleccionadas.includes(s.suc_Codigo))
    .map(s => s.suc_Codigo.toString()), // si backend espera List<string>
  UsuarioCrea: 'pri'
};

    const response = await axios.post(
      'https://localhost:7146/api/descuento/asignar-sucursales',
      payload
    );

    if (response.data.mensaje === 'ok') {
      console.log('Sucursales asignadas correctamente');
      onClose();
    } else {
      alert('Error: ' + response.data.error);
    }
  } catch (error) {
    console.error('Error en el POST:', error);
    alert('Error inesperado al guardar las sucursales.');
  }
};

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Asignar Sucursales – {descuento?.descripcion || 'Descuento'}
      </DialogTitle>

      <DialogContent dividers>
        {sucursales.length > 0 ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Seleccionar</TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Descripción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sucursales.map((suc) => (
                <TableRow key={suc.suc_Codigo}>
                  <TableCell>
                    <Checkbox
                      checked={sucursalesSeleccionadas.includes(suc.suc_Codigo)}
                      onChange={() => handleCheckboxChange(suc.suc_Codigo)}
                    />
                  </TableCell>
                  <TableCell>{suc.suc_Codigo}</TableCell>
                  <TableCell>{suc.descripcion}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography>No hay sucursales disponibles.</Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleGuardar}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalSucursal;