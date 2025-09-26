import React from 'react';
import { Button, Box } from '@mui/material';
import { AddCircle, History } from '@mui/icons-material';

export const ActionButtons = ({ 
  onAddProducts, 
  onAddSucursales, 
  onAddCanales, 
  onAddListasPrecio,
  onViewHistory,
  selectedSucursalesCount,
  selectedCanalesCount,
  selectedListasPrecioCount 
}) => {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
      <Button
        variant="outlined"
        color="primary"
        onClick={onAddProducts}
        startIcon={<AddCircle />}
      >
        Productos
      </Button>

      <Button
        variant="outlined"
        color="secondary"
        onClick={onAddSucursales}
        startIcon={<AddCircle />}
      >
        Sucursales ({selectedSucursalesCount})
      </Button>

      <Button
        variant="outlined"
        color="warning"
        onClick={onAddCanales}
        startIcon={<AddCircle />}
      >
        Canales ({selectedCanalesCount})
      </Button>

      <Button
        variant="outlined"
        color="success"
        onClick={onAddListasPrecio}
        startIcon={<AddCircle />}
      >
        Listas de Precio ({selectedListasPrecioCount})
      </Button>

      <Button
        variant="outlined"
        color="info"
        onClick={onViewHistory}
        startIcon={<History />}
      >
        Ver Historial
      </Button>
    </Box>
  );
};

export default ActionButtons;