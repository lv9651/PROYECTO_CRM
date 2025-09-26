import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, List, ListItem, ListItemText, ListItemIcon,
  Checkbox, Button, Typography, Chip, Box
} from '@mui/material';
import { AttachMoney, Search } from '@mui/icons-material';
import LoadingSpinner from '../LoadingSpinner';

export const ListasPrecioModal = ({
  open,
  onClose,
  listasPrecio,
  loading,
  selectedListasPrecio,
  onToggleListaPrecio,
  searchValue,
  setSearchValue
}) => {
  const filteredListas = listasPrecio.filter(lista =>
    lista.descripcion.toLowerCase().includes(searchValue.toLowerCase()) ||
    lista.idListaPrecio.toString().includes(searchValue) ||
    lista.estado.toLowerCase().includes(searchValue.toLowerCase())
  );

  const getEstadoColor = (estado) => {
    switch (estado.toLowerCase()) {
      case 'activo': return 'success';
      case 'inactivo': return 'error';
      default: return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <AttachMoney sx={{ mr: 1, color: 'primary.main' }} />
          Seleccionar Listas de Precio
          <Chip 
            label={`${selectedListasPrecio.length} seleccionadas`} 
            size="small" 
            color="primary" 
            variant="outlined"
            sx={{ ml: 2 }}
          />
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <TextField
          label="Buscar listas de precio..."
          fullWidth
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <Search sx={{ color: 'text.secondary', mr: 1 }} />
            ),
          }}
          placeholder="Buscar por descripción, ID o estado..."
        />
        
        {loading ? (
          <LoadingSpinner text="Cargando listas de precio..." />
        ) : filteredListas.length > 0 ? (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredListas.map((lista) => (
              <ListItem
                key={lista.idListaPrecio}
                button
                onClick={() => onToggleListaPrecio(lista.idListaPrecio)}
                selected={selectedListasPrecio.includes(lista.idListaPrecio)}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    borderColor: 'primary.main'
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    borderColor: 'primary.main'
                  }
                }}
              >
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={selectedListasPrecio.includes(lista.idListaPrecio)}
                    tabIndex={-1}
                    disableRipple
                    color="primary"
                  />
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {lista.descripcion}
                      </Typography>
                      <Chip
                        label={lista.estado}
                        size="small"
                        color={getEstadoColor(lista.estado)}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        ID: {lista.idListaPrecio}
                      </Typography>
                      {lista.fechaCreacion && (
                        <Typography variant="caption" color="text.secondary">
                          Creado: {new Date(lista.fechaCreacion).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box textAlign="center" py={4}>
            <AttachMoney sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.Secondary" gutterBottom>
              {searchValue ? 'No se encontraron listas de precio' : 'No hay listas de precio disponibles'}
            </Typography>
            {searchValue && (
              <Typography variant="body2" color="text.secondary">
                Intenta con otros términos de búsqueda
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
        <Button 
          onClick={onClose} 
          variant="contained" 
          color="primary"
        >
          Confirmar ({selectedListasPrecio.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ListasPrecioModal; 