import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, List, ListItem, ListItemText, Button, Typography,
  FormControl, Select, MenuItem, InputLabel
} from '@mui/material';
import { Search } from '@mui/icons-material';
import LoadingSpinner from '../LoadingSpinner';

export const ProductModal = ({ 
  open, 
  onClose, 
  productSearch, 
  setProductSearch, 
  tipoProducto,
  setTipoProducto,
  productos, 
  loading, 
  onSelectProduct,
  onSearch
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>
      <Search sx={{ mr: 1 }} />
      Buscar Productos
    </DialogTitle>

    <DialogContent>

      {/* SELECT TIPO PRODUCTO */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Tipo de Producto</InputLabel>
        <Select
          value={tipoProducto}
          label="Tipo de Producto"
          onChange={(e) => {
            const value = e.target.value;
            setTipoProducto(value);
            onSearch(productSearch, value);  // << vuelve a buscar según el nuevo tipo
          }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="FM">FORMULA MAGISTRAL</MenuItem>
          <MenuItem value="PT">PRODUCTO TERMINADO</MenuItem>
          <MenuItem value="SV">SERVICIOS</MenuItem>
        </Select>
      </FormControl>

      {/* INPUT BUSQUEDA */}
      <TextField
        label="Buscar por nombre o código"
        fullWidth
        value={productSearch}
        onChange={(e) => {
          const value = e.target.value;
          setProductSearch(value);
          onSearch(value, tipoProducto);  // << envía tipoProducto
        }}
        sx={{ mb: 2 }}
        autoFocus
      />

      {loading ? (
        <LoadingSpinner text="Cargando productos..." />
      ) : productos.length > 0 ? (
        <List dense>
          {productos.map((producto) => (
            <ListItem 
              key={producto.idProducto} 
              button 
              onClick={() => onSelectProduct(producto)}
            >
              <ListItemText
                primary={producto.descripcion}
                secondary={`Código: ${producto.idProducto} | Precio: $${producto.precio}`}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography align="center">
          {productSearch ? "No se encontraron productos" : "Ingrese un término de búsqueda"}
        </Typography>
      )}
    </DialogContent>

    <DialogActions>
      <Button onClick={onClose}>Cerrar</Button>
    </DialogActions>
  </Dialog>
);

export default ProductModal;