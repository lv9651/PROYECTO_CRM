import React from 'react';
import {
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Divider
} from '@mui/material';

export default function GuardarFinal({ datos, canalesDisponibles = [], listasDisponibles = [] }) {
  if (!datos) {
    return <Typography>No hay datos para mostrar.</Typography>;
  }

  // Mostrar el JSON completo y formateado para debug
  const datosComoString = JSON.stringify(datos, null, 2);

  const {
    descripcion,
    fechaInicio,
    fechaFin,
    canales, // array de IDs
    listas,  // array de IDs o objetos con descripcion?
    descuentoPara,
    proveedorSeleccionado,
    laboratorioSeleccionado,
    productosSeleccionados,
    porcentajeQFLab,
    porcentajeProvLab,
  } = datos;

  // Obtener las descripciones de canales seleccionados:
  const canalesNombres = canales
    .map(id => {
      const canal = canalesDisponibles.find(c => c.idCanalVenta === id);
      return canal ? canal.descripcion : id;
    })
    .join(', ');

  // Obtener las descripciones de listas seleccionadas:
  // Aquí revisa si listas es array de IDs o ya con descripciones (según tu estructura)
  const listasNombres = listas
    .map(item => {
      if (typeof item === 'object' && item.descripcion) {
        return item.descripcion;
      }
      const lista = listasDisponibles.find(l => l.idListaPrecio === item);
      return lista ? lista.descripcion : item;
    })
    .join(', ');

  const handleGuardar = () => {
    // Aquí implementa tu lógica real para guardar, ej axios.post(...)
    console.log('Datos a guardar:', datos);
    alert('Datos guardados correctamente');
  };

  return (
    <Paper sx={{ padding: 3 }}>
     

      
      <Typography variant="h6" gutterBottom>Productos Seleccionados</Typography>
      <Table size="small" sx={{ mb: 3 }}>
        <TableHead>
          <TableRow>
            <TableCell>Tipo</TableCell>
            <TableCell>Código</TableCell>
            <TableCell align="right">PC</TableCell>
            <TableCell>Producto</TableCell>
            <TableCell>Lista</TableCell>
            <TableCell>Precio</TableCell>
            <TableCell>Dessucursal</TableCell>
            <TableCell>DesProveedor</TableCell>
            <TableCell>Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {productosSeleccionados.map((prod) => (
            <TableRow key={prod.idproducto}>
              <TableCell>PRIMARIO</TableCell>
              <TableCell>{prod.codigoproducto}</TableCell>
              <TableCell align="right">{prod.vvf?.toFixed(2) ?? '0.00'}</TableCell>
              <TableCell>{prod.producto.trim()}</TableCell>
              <TableCell>{prod.lista}</TableCell>
              <TableCell>{prod.PVV}</TableCell>
              <TableCell>{prod.descq}</TableCell>
              <TableCell>{prod.descprov}</TableCell>
              <TableCell>
                {(() => {
                  const precio = parseFloat(prod.PVV) || 0;
                  const qf = parseFloat(prod.descq) || 0;
                  const prov = parseFloat(prod.descprov) || 0;
                  const total = precio - (precio * ((qf + prov) / 100));
                  return total.toFixed(2);
                })()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}