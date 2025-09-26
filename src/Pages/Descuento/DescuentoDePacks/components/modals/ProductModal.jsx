import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, List, ListItem, ListItemText, Button, Typography
} from '@mui/material';
import { Search } from '@mui/icons-material';
import LoadingSpinner from '../LoadingSpinner';

export const ProductModal = ({ 
  open, 
  onClose, 
  productSearch, 
  setProductSearch, 
  productos, 
  loading, 
  onSelectProduct 
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>
      <Search sx={{ mr: 1, verticalAlign: 'middle' }} />
      Buscar Productos
    </DialogTitle>
    <DialogContent>
      <TextField
        label="Buscar por nombre o código"
        fullWidth
        value={productSearch}
        onChange={(e) => setProductSearch(e.target.value)}
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
              sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
            >
              <ListItemText
                primary={producto.descripcion}
                secondary={`Código: ${producto.idProducto} | Precio: $${producto.precio}`}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="textSecondary" align="center">
          {productSearch ? 'No se encontraron productos' : 'Ingrese un término de búsqueda'}
        </Typography>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary" variant="outlined">
        Cerrar
      </Button>
    </DialogActions>
  </Dialog>
);

export default ProductModal;