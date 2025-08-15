import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Divider, Grid, TextField, Typography, Dialog, DialogActions, DialogContent, DialogTitle, Checkbox, FormControlLabel } from '@mui/material';
import { AddCircle } from '@mui/icons-material';

const DescuentoDePacks = () => {
  const [packName, setPackName] = useState('');
  const [packCode, setPackCode] = useState('');
  const [packDescription, setPackDescription] = useState('');
  const [incentive, setIncentive] = useState(0);
  const [price, setPrice] = useState(0);
  const [products, setProducts] = useState([]);
  const [selectedSucursales, setSelectedSucursales] = useState([]);
  const [selectedCanales, setSelectedCanales] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showPriceListModal, setShowPriceListModal] = useState(false); // Modal de lista de precios
  const [showSucursalesModal, setShowSucursalesModal] = useState(false); // Modal de sucursales
  const [showCanalesModal, setShowCanalesModal] = useState(false); // Modal de canales de ventas
  const [productSearch, setProductSearch] = useState('');
  const [priceListSearch, setPriceListSearch] = useState('');
  const [productList, setProductList] = useState([
    { code: 'P001', name: 'Producto 1', price: 100 },
    { code: 'P002', name: 'Producto 2', price: 200 },
    { code: 'P003', name: 'Producto 3', price: 300 },
  ]); // Simulando una lista de productos
  const [sucursalesList] = useState([
    { code: 'S001', name: 'Sucursal 1' },
    { code: 'S002', name: 'Sucursal 2' },
    { code: 'S003', name: 'Sucursal 3' },
  ]); // Simulando una lista de sucursales
  const [canalesList] = useState([
    { code: 'C001', name: 'Canal Online' },
    { code: 'C002', name: 'Canal Telefónico' },
    { code: 'C003', name: 'Canal Físico' },
  ]); // Simulando una lista de canales de ventas

  // Manejo de producto
  const handleAddProduct = () => {
    setShowProductModal(true); // Mostrar modal de productos
  };

  const handleAddSelectedProduct = (product) => {
    setProducts([...products, product]);
    setShowProductModal(false); // Cerrar modal después de seleccionar un producto
  };

  // Manejo de lista de precios
  const handleOpenPriceListModal = () => {
    setShowPriceListModal(true); // Abrir modal de lista de precios
  };

  const handleClosePriceListModal = () => {
    setShowPriceListModal(false); // Cerrar modal de lista de precios
  };

  const handleAddPriceListProduct = (product) => {
    setProducts([...products, product]);
    setShowPriceListModal(false);
  };

  // Manejo de sucursales
  const handleOpenSucursalesModal = () => {
    setShowSucursalesModal(true); // Abrir modal de sucursales
  };

  const handleCloseSucursalesModal = () => {
    setShowSucursalesModal(false); // Cerrar modal de sucursales
  };

  const handleToggleSucursal = (sucursalCode) => {
    setSelectedSucursales((prevSelected) =>
      prevSelected.includes(sucursalCode)
        ? prevSelected.filter((code) => code !== sucursalCode)
        : [...prevSelected, sucursalCode]
    );
  };

  // Manejo de canales de ventas
  const handleOpenCanalesModal = () => {
    setShowCanalesModal(true); // Abrir modal de canales de ventas
  };

  const handleCloseCanalesModal = () => {
    setShowCanalesModal(false); // Cerrar modal de canales de ventas
  };

  const handleToggleCanal = (canalCode) => {
    setSelectedCanales((prevSelected) =>
      prevSelected.includes(canalCode)
        ? prevSelected.filter((code) => code !== canalCode)
        : [...prevSelected, canalCode]
    );
  };

  // Filtrar productos por búsqueda
  const filteredProducts = productList.filter(
    (product) => product.name.toLowerCase().includes(productSearch.toLowerCase()) || product.code.includes(productSearch)
  );

  // Filtrar productos de la lista de precios
  const filteredPriceList = productList.filter(
    (product) => product.name.toLowerCase().includes(priceListSearch.toLowerCase()) || product.code.includes(priceListSearch)
  );

  // Guardar pack
  const handleSave = () => {
    console.log('Pack Guardado:', { packName, packCode, packDescription, incentive, price, products, selectedSucursales, selectedCanales });
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" color="primary" gutterBottom>
        PACK DE PROMOCIONES
      </Typography>

      {/* Formulario principal */}
      <Card sx={{ marginBottom: 4, borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nombre del Pack"
                fullWidth
                value={packName}
                onChange={(e) => setPackName(e.target.value)}
                required
                sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Código del Pack"
                fullWidth
                value={packCode}
                onChange={(e) => setPackCode(e.target.value)}
                required
                readOnly
                sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={9}>
              <TextField
                label="Descripción"
                fullWidth
                multiline
                rows={3}
                value={packDescription}
                onChange={(e) => setPackDescription(e.target.value)}
                sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Incentivo"
                type="number"
                fullWidth
                value={incentive}
                onChange={(e) => setIncentive(parseFloat(e.target.value))}
                required
                InputProps={{ inputProps: { min: 0.01 } }}
                sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Precio Total Estimado"
                type="number"
                fullWidth
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value))}
                required
                InputProps={{ inputProps: { min: 0.01 } }}
                sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Productos del Pack */}
      <Card sx={{ marginBottom: 4, borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" color="primary" gutterBottom>
            Productos del Pack
          </Typography>

          {/* Botón para agregar producto */}
          <Button
            variant="outlined"
            color="primary"
            onClick={handleAddProduct}
            startIcon={<AddCircle />}
            sx={{
              mb: 2,
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': { backgroundColor: 'primary.main', color: 'white' },
            }}
          >
            Agregar Producto
          </Button>

          {/* Botón para agregar lista de precios */}
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleOpenPriceListModal}
            startIcon={<AddCircle />}
            sx={{
              mb: 2,
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': { backgroundColor: 'secondary.main', color: 'white' },
            }}
          >
            Agregar de Lista de Precios
          </Button>

          {/* Botón para agregar sucursales */}
          <Button
            variant="outlined"
            color="success"
            onClick={handleOpenSucursalesModal}
            startIcon={<AddCircle />}
            sx={{
              mb: 2,
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': { backgroundColor: 'success.main', color: 'white' },
            }}
          >
            Agregar Sucursales
          </Button>

          {/* Botón para agregar canales de ventas */}
          <Button
            variant="outlined"
            color="warning"
            onClick={handleOpenCanalesModal}
            startIcon={<AddCircle />}
            sx={{
              mb: 2,
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': { backgroundColor: 'warning.main', color: 'white' },
            }}
          >
            Agregar Canal de Ventas
          </Button>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={3}>
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': { backgroundColor: 'secondary.main', color: 'white' },
            }}
          >
            Sucursales
          </Button>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': { backgroundColor: 'error.main', color: 'white' },
            }}
          >
            Actualizar
          </Button>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Button
            variant="outlined"
            color="warning"
            fullWidth
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': { backgroundColor: 'warning.main', color: 'white' },
            }}
          >
            Historial
          </Button>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': { backgroundColor: 'primary.main', color: 'white' },
            }}
          >
            Nuevo
          </Button>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={handleSave}
            sx={{ borderRadius: 2, textTransform: 'none', boxShadow: 3 }}
          >
            Registrar
          </Button>
        </Grid>
      </Grid>

      {/* Modal de Canales de Ventas */}
      <Dialog open={showCanalesModal} onClose={handleCloseCanalesModal}>
        <DialogTitle>Seleccionar Canal de Ventas</DialogTitle>
        <DialogContent>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {canalesList.map((canal) => (
              <FormControlLabel
                key={canal.code}
                control={
                  <Checkbox
                    checked={selectedCanales.includes(canal.code)}
                    onChange={() => handleToggleCanal(canal.code)}
                    name={canal.code}
                  />
                }
                label={`${canal.code} - ${canal.name}`}
              />
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCanalesModal} color="secondary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DescuentoDePacks;