import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent,
  DialogTitle, Grid, TextField, Typography, Checkbox, FormControlLabel , List, 
  ListItem, 
  ListItemText, 
  ListItemIcon ,InputAdornment 
} from '@mui/material';
import { AddCircle } from '@mui/icons-material';
import axios from 'axios';

const DescuentoDePacks = () => {
  // Estados para la información básica del pack
  const [packName, setPackName] = useState('');
  const [packCode, setPackCode] = useState('');
  const [packDescription, setPackDescription] = useState('');
  const [incentive, setIncentive] = useState(0);
  const [price, setPrice] = useState(0);

  const [descuento, setDescuento] = useState(0);
const [fechaDesde, setFechaDesde] = useState('');
const [fechaHasta, setFechaHasta] = useState('');
const [ordenamiento, setOrdenamiento] = useState(0);

  // Estados para los productos, sucursales y canales
  const [products, setProducts] = useState([]);
  const [selectedSucursales, setSelectedSucursales] = useState([]);
  const [selectedCanales, setSelectedCanales] = useState([]);

  // Estados para controlar los modales
  const [showProductModal, setShowProductModal] = useState(false);
  const [showSucursalesModal, setShowSucursalesModal] = useState(false);
  const [showCanalesModal, setShowCanalesModal] = useState(false);

  // Estados para las búsquedas
  const [productSearch, setProductSearch] = useState('');
  const [sucursalSearch, setSucursalSearch] = useState('');
  const [canalSearch, setCanalSearch] = useState('');

  // Datos de la API
  const [productosApi, setProductosApi] = useState([]);
  const [sucursalesApi, setSucursalesApi] = useState([]);
  const [canalesApi, setCanalesApi] = useState([]);

  // Llamada a la API para obtener los productos, sucursales y canales
  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const { data } = await axios.get('https://localhost:7146/api/Descuento/sucursalQF');
        setSucursalesApi(data);  // Guardamos las sucursales
      } catch (e) {
        console.error('Error al cargar las sucursales:', e);
      }
    };

    const fetchCanales = async () => {
      try {
        const { data } = await axios.get('https://localhost:7146/api/Descuento/canales');
        setCanalesApi(data);  // Guardamos los canales
      } catch (e) {
        console.error('Error al cargar los canales de venta:', e);
      }
    };

    fetchSucursales();
    fetchCanales();
  }, []);

  // Función para obtener productos por nombre
  const fetchProductos = async (nombreProducto) => {
    try {
      const { data } = await axios.get(`https://localhost:7146/api/Descuento/BuscarPorNombrepack/${nombreProducto}`);
      setProductosApi(data);  // Guardamos los productos obtenidos
    } catch (e) {
      console.error('Error al cargar los productos:', e);
    }
  };

  // Filtrar sucursales basado en la búsqueda
  const filteredSucursales = sucursalesApi.filter((s) => {
    const lowerSearch = sucursalSearch.toLowerCase();
    return (
      !sucursalSearch || s.nombreSucursal.toLowerCase().includes(lowerSearch) ||
      s.idSucursal.toString().includes(lowerSearch)
    );
  });

  // Filtrar canales basado en la búsqueda
  const filteredCanales = canalesApi.filter((c) => {
    const lowerSearch = canalSearch.toLowerCase();
    return (
      !canalSearch || c.nombreCanal.toLowerCase().includes(lowerSearch) ||
      c.idCanal.toString().includes(lowerSearch)
    );
  });

  // Actualización de productos seleccionados
const handleAddSelectedProduct = (product) => {
  const newProduct = {
    code: product.idProducto,
    name: product.descripcion,
    price: product.precio, // Precio normal
    precioOriginal: product.precio, // Guardamos el precio original
    precioXFraccion: product.precioXFraccion, // Guardamos el precio por fracción
    usarFraccion: false, // Inicialmente no usa fracción
    cantidad: 1,
    incentivo: 0.00,
  };
  setProducts((prev) => [...prev, newProduct]);
  setShowProductModal(false);
};
  const handleRemoveProduct = (idx) => {
    const updatedProducts = products.filter((_, index) => index !== idx);
    setProducts(updatedProducts);
  };

const handleUpdateProduct = (idx, field, value) => {
  const updatedProducts = [...products];
  
  // Si estamos cambiando usarFraccion, necesitamos lógica adicional
  if (field === 'usarFraccion') {
    updatedProducts[idx].usarFraccion = value;
    
    // Si activamos usar fracción y hay precioXFraccion, actualizamos el precio mostrado
    if (value && updatedProducts[idx].precioXFraccion > 0) {
      updatedProducts[idx].price = updatedProducts[idx].precioXFraccion;
    } else if (!value) {
      // Si desactivamos, volvemos al precio normal
      updatedProducts[idx].price = updatedProducts[idx].precioOriginal || updatedProducts[idx].price;
    }
  } else {
    updatedProducts[idx][field] = value;
  }
  
  setProducts(updatedProducts);
};

  // Actualización de sucursales seleccionadas
  const handleToggleSucursal = (id) => {
    setSelectedSucursales((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // Actualización de canales seleccionados
  const handleToggleCanal = (id) => {
    setSelectedCanales((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  // Función para guardar el pack
  const handleSave = () => {
    console.log({
      packName, packCode, packDescription, incentive, price,
      products, selectedSucursales, selectedCanales
    });
  };

  // Uso de efectos para realizar la búsqueda de productos
useEffect(() => {
  // Solo hace la búsqueda si hay al menos 2 caracteres (puedes ajustar este número)
  if (productSearch && productSearch.trim().length >= 2) {
    const timer = setTimeout(() => {
      fetchProductos(productSearch);
    }, 500); // Agrega un pequeño debounce para evitar muchas llamadas mientras se escribe
    
    return () => clearTimeout(timer); // Limpia el timer si el search term cambia antes de que se complete
  } else {
    setProductosApi([]); // Limpia los resultados si no hay suficiente texto
  }
}, [productSearch]);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" color="primary" gutterBottom>
        Pack de Promociones
      </Typography>

      {/* Datos generales del pack */}
    <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
  <CardContent>
    <Grid container spacing={3}>
      {/* Primera fila */}
      <Grid item xs={12} md={6}>
        <TextField
          label="Nombre del Pack"
          fullWidth
          value={packName}
          onChange={(e) => setPackName(e.target.value)}
        />
      </Grid>
      
      <Grid item xs={12} md={3}>
        <TextField
          label="Código del Pack"
          fullWidth
          value={packCode}
          readOnly
        />
      </Grid>

      <Grid item xs={12} md={3}>
        <TextField
          label="% Descuento"
          type="number"
          fullWidth
          value={descuento}
          onChange={(e) => setDescuento(parseFloat(e.target.value))}
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
        />
      </Grid>

      {/* Segunda fila */}
      <Grid item xs={12} md={4}>
        <TextField
          label="Incentivo"
          type="number"
          fullWidth
          value={incentive}
          onChange={(e) => setIncentive(parseFloat(e.target.value))}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          label="Precio Estimado"
          type="number"
          fullWidth
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value))}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          label="Ordenamiento"
          type="number"
          fullWidth
          value={ordenamiento}
          onChange={(e) => setOrdenamiento(parseInt(e.target.value))}
        />
      </Grid>

      {/* Tercera fila */}
      <Grid item xs={12} md={6}>
        <TextField
          label="Fecha Desde"
          type="date"
          fullWidth
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          label="Fecha Hasta"
          type="date"
          fullWidth
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      {/* Cuarta fila (Descripción abajo para mejor flujo visual) */}
      <Grid item xs={12}>
        <TextField
          label="Descripción"
          fullWidth
          multiline
          rows={3}
          value={packDescription}
          onChange={(e) => setPackDescription(e.target.value)}
        />
      </Grid>
    </Grid>
  </CardContent>
</Card>
      {/* Productos del Pack */}
      <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" color="primary" gutterBottom>
            Productos del Pack
          </Typography>

          <Button
            variant="outlined"
            color="primary"
            onClick={() => setShowProductModal(true)}
            startIcon={<AddCircle />}
            sx={{ mb: 2 }}
          >
            Agregar Producto
          </Button>

          <Button
            variant="outlined"
            color="primary"
            onClick={() => setShowSucursalesModal(true)}
            startIcon={<AddCircle />}
            sx={{ mb: 2, ml: 2 }}
          >
            Agregar Sucursal
          </Button>

          <Button
            variant="outlined"
            color="warning"
            onClick={() => setShowCanalesModal(true)}
            startIcon={<AddCircle />}
            sx={{ mb: 2, ml: 2 }}
          >
            Agregar Canal de Ventas
          </Button>

          {/* Tabla de productos */}
          {products.length > 0 && (
            <Box sx={{ overflowX: 'auto', mt: 2 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
  <thead>
    <tr style={{ backgroundColor: '#f5f5f5' }}>
      <th style={{ border: '1px solid #ccc', padding: '8px' }}>Código</th>
      <th style={{ border: '1px solid #ccc', padding: '8px' }}>Descripción</th>
      <th style={{ border: '1px solid #ccc', padding: '8px' }}>Cantidad</th>
      <th style={{ border: '1px solid #ccc', padding: '8px' }}>PVF</th>
      <th style={{ border: '1px solid #ccc', padding: '8px' }}>xFraccion</th>
      <th style={{ border: '1px solid #ccc', padding: '8px' }}>Incentivo</th>
      <th style={{ border: '1px solid #ccc', padding: '8px' }}>Acciones</th>
    </tr>
  </thead>
  <tbody>
    {products.map((product, idx) => (
      <tr key={idx}>
        <td style={{ border: '1px solid #ccc', padding: '8px' }}>{product.code}</td>
        <td style={{ border: '1px solid #ccc', padding: '8px' }}>{product.name}</td>
        <td style={{ border: '1px solid #ccc', padding: '8px' }}>
          <input
            type="number"
            value={product.cantidad}
            onChange={(e) => handleUpdateProduct(idx, 'cantidad', parseInt(e.target.value))}
            style={{ width: '60px', textAlign: 'center' }}
          />
        </td>
        <td style={{ border: '1px solid #ccc', padding: '8px' }}>
          {product.usarFraccion ? product.precioXFraccion : product.price}
        </td>
        <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
          <input
            type="checkbox"
            checked={product.usarFraccion}
            onChange={(e) => {
              const updatedProducts = [...products];
              updatedProducts[idx].usarFraccion = e.target.checked;
              setProducts(updatedProducts);
            }}
            disabled={product.precioXFraccion <= 0} // SOLO SE BLOQUEA SI NO HAY PRECIOXFRACCION
          />
        </td>
        <td style={{ border: '1px solid #ccc', padding: '8px' }}>
          <input
            type="number"
            value={product.incentivo}
            readOnly // INCENTIVO NO EDITABLE
            style={{ width: '60px', textAlign: 'center', backgroundColor: '#f5f5f5' }}
          />
        </td>
        <td style={{ border: '1px solid #ccc', padding: '8px' }}>
          <Button color="error" onClick={() => handleRemoveProduct(idx)}>
            Eliminar
          </Button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Botón de guardar */}
      <Button variant="contained" color="primary" onClick={handleSave} sx={{ width: '100%' }}>
        Guardar Pack
      </Button>

      {/* Modal de productos */}
      <Dialog open={showProductModal} onClose={() => setShowProductModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Buscar Productos</DialogTitle>
        <DialogContent>
          <TextField
            label="Buscar Producto"
            fullWidth
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            sx={{ mb: 2 }}
          />
          {productosApi.length > 0 ? (
            productosApi.map((producto) => (
              <FormControlLabel
                key={producto.idProducto}
                control={
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleAddSelectedProduct(producto)}  // Agregar el producto al pack
                    sx={{ display: 'block', mb: 1 }}
                  >
                    {producto.descripcion}
                  </Button>
                }
              />
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              No se encontraron productos.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowProductModal(false)} color="primary">Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Sucursales */}
   <Dialog
  open={showSucursalesModal}
  onClose={() => setShowSucursalesModal(false)}
  maxWidth="md"
  fullWidth
>
  <DialogTitle>Buscar Sucursales</DialogTitle>
  <DialogContent>
    <TextField
      label="Buscar Sucursal"
      fullWidth
      value={sucursalSearch}
      onChange={(e) => setSucursalSearch(e.target.value)}
      sx={{ mb: 2 }}
      variant="outlined"
    />

    <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
      {filteredSucursales.length > 0 ? (
        <List>
          {filteredSucursales.map((sucursal) => (
            <ListItem
              key={sucursal.idSucursal}
              button
              onClick={() => handleToggleSucursal(sucursal.idSucursal)}
              selected={selectedSucursales.includes(sucursal.idSucursal)}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.08)',
                },
                padding: '10px',
              }}
            >
              <ListItemText
                primary={sucursal.nombreSucursal}
                secondary={`ID: ${sucursal.idSucursal}`}
              />
              <ListItemIcon>
                <Checkbox
                  checked={selectedSucursales.includes(sucursal.idSucursal)}
                  onChange={() => handleToggleSucursal(sucursal.idSucursal)}
                />
              </ListItemIcon>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="textSecondary" align="center">
          No se encontraron sucursales que coincidan con la búsqueda.
        </Typography>
      )}
    </Box>
  </DialogContent>
  <DialogActions>
    <Button
      onClick={() => setShowSucursalesModal(false)}
      color="primary"
      variant="contained"
    >
      Cerrar
    </Button>
  </DialogActions>
</Dialog>

      {/* Modal de Canales */}
      <Dialog open={showCanalesModal} onClose={() => setShowCanalesModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Buscar Canales</DialogTitle>
        <DialogContent>
          <TextField
            label="Buscar Canal"
            fullWidth
            value={canalSearch}
            onChange={(e) => setCanalSearch(e.target.value)}
            sx={{ mb: 2 }}
          />
          {filteredCanales.map((canal) => (
            <FormControlLabel
              key={canal.idCanalVenta}
              control={
                <Checkbox
                  checked={selectedCanales.includes(canal.idCanalVenta)}
                  onChange={() => handleToggleCanal(canal.idCanalVenta)}
                />
              }
              label={canal.descripcion}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCanalesModal(false)} color="primary">Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DescuentoDePacks;