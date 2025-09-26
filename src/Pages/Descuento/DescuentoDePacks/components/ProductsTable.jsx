import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, Checkbox, Button, InputAdornment
} from '@mui/material';
import { Close } from '@mui/icons-material';

export const ProductsTable = ({ products, onUpdateProduct, onRemoveProduct }) => {
  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.light' }}>
            <TableCell>Código</TableCell>
            <TableCell>Descripción</TableCell>
            <TableCell align="center">Cantidad</TableCell>
            <TableCell align="right">Precio Unitario</TableCell>
            <TableCell align="center">xFracción</TableCell>
            <TableCell align="right">Incentivo</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product, idx) => {
            const usarFraccion = product.precioXFraccion > 0 ? product.usarFraccion : false;
            const precioMostrado = usarFraccion ? product.precioXFraccion : product.precioOriginal;
            
            return (
              <TableRow key={idx} hover>
                <TableCell>{product.code}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell align="center">
                  <TextField
                    type="number"
                    value={product.cantidad}
                    onChange={(e) => onUpdateProduct(idx, 'cantidad', parseInt(e.target.value))}
                    size="small"
                    sx={{ width: 70 }}
                    inputProps={{ min: 1 }}
                  />
                </TableCell>
                <TableCell align="right">{precioMostrado.toFixed(2)}</TableCell>
                <TableCell align="center">
                  <Checkbox
                    checked={usarFraccion}
                    onChange={(e) => onUpdateProduct(idx, 'usarFraccion', e.target.checked)}
                    disabled={product.precioXFraccion <= 0}
                    color="primary"
                  />
                </TableCell>
                <TableCell align="right">
                  <TextField
                    type="number"
                    value={product.incentivo}
                    size="small"
                    sx={{ width: 90 }}
                    InputProps={{
                      readOnly: true,
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Button 
                    color="error" 
                    size="small"
                    onClick={() => onRemoveProduct(idx)}
                    startIcon={<Close />}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductsTable;