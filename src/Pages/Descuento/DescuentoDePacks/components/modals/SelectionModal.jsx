import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, List, ListItem, ListItemText, ListItemIcon,
  Checkbox, Button, Typography, Chip
} from '@mui/material';
import LoadingSpinner from '../LoadingSpinner';

export const SelectionModal = ({
  open,
  onClose,
  title,
  searchValue,
  setSearchValue,
  items,
  loading,
  selectedItems,
  onToggleItem,
  getItemName,
  getItemId,
  getItemSecondary,
  selectionCount
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>
      <Typography variant="h6" component="span">
        {title}
      </Typography>
      {selectionCount !== undefined && (
        <Chip 
          label={`${selectedItems.length} seleccionados`} 
          size="small" 
          color="primary" 
          variant="outlined"
          sx={{ ml: 2 }}
        />
      )}
    </DialogTitle>
    <DialogContent>
      <TextField
        label="Buscar"
        fullWidth
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        sx={{ mb: 2 }}
      />
      
      {loading ? (
        <LoadingSpinner text="Cargando..." />
      ) : items.length > 0 ? (
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {items.map((item) => (
            <ListItem
              key={getItemId(item)}
              button
              onClick={() => onToggleItem(getItemId(item))}
              selected={selectedItems.includes(getItemId(item))}
            >
              <ListItemText 
                primary={getItemName(item)} 
                secondary={getItemSecondary ? getItemSecondary(item) : null}
              />
              <ListItemIcon>
                <Checkbox
                  edge="end"
                  checked={selectedItems.includes(getItemId(item))}
                  onChange={() => onToggleItem(getItemId(item))}
                />
              </ListItemIcon>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="textSecondary" align="center">
          No se encontraron elementos
        </Typography>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} variant="outlined">
        Cancelar
      </Button>
      <Button onClick={onClose} variant="contained" color="primary">
        Aceptar
      </Button>
    </DialogActions>
  </Dialog>
);

export default SelectionModal;