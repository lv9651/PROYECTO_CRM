import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Box, Typography,
  InputAdornment
} from '@mui/material';
import { Search } from '@mui/icons-material';
import LoadingSpinner from '../LoadingSpinner';

export const HistorialModal = ({ 
  open, 
  onClose, 
  packs, 
  loading, 
  filtro, 
  setFiltro, 
  onLoadPack 
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
    <DialogTitle>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">Historial de Packs</Typography>
        <TextField
          label="Buscar por ID o descripción"
          variant="outlined"
          size="small"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
          }}
        />
      </Box>
    </DialogTitle>
    <DialogContent>
      {loading ? (
        <LoadingSpinner text="Cargando historial..." />
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.light' }}>
                <TableCell>ID Descuento</TableCell>
                <TableCell>ID Producto Pack</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Fecha Inicio</TableCell>
                <TableCell>Fecha Fin</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {packs.length > 0 ? (
                packs.map((pack) => (
                  <TableRow key={pack.idDescuento} hover>
                    <TableCell>{pack.idDescuento}</TableCell>
                    <TableCell>{pack.idProductoPack}</TableCell>
                    <TableCell>{pack.descripcion}</TableCell>
                    <TableCell>{new Date(pack.fechaInicio).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(pack.fechaFin).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => onLoadPack(pack)}
                      >
                        Cargar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No se encontraron packs
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        Cerrar
      </Button>
    </DialogActions>
  </Dialog>
);

export default HistorialModal;