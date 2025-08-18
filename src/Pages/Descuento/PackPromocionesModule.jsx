import React, { useState, useEffect, useReducer, useCallback, useMemo } from 'react';
import {
  Box, Button, Card, CardContent,CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, Grid, TextField, Typography, Checkbox, FormControlLabel, 
  List, ListItem, ListItemText, ListItemIcon, InputAdornment, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import { AddCircle, Search, Close } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../Compo/AuthContext';
import History from '@mui/icons-material/History';
// Reducer para manejar el estado del pack
const packReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

const initialState = {
  packName: '',
  packCode: '',
  packDescription: '',
  incentive: 0,
  price: 0,
  descuento: 0,
  fechaDesde: '',
  fechaHasta: '',
  ordenamiento: 0
};

const DescuentoDePacks = () => {
  // Estado del pack usando reducer
  const [packState, dispatch] = useReducer(packReducer, initialState);
  const { 
    packName, packCode, packDescription, incentive, price,
    descuento, fechaDesde, fechaHasta, ordenamiento 
  } = packState;

  // Estados para los productos, sucursales y canales
  const [products, setProducts] = useState([]);
  const [selectedSucursales, setSelectedSucursales] = useState([]);
  const [selectedCanales, setSelectedCanales] = useState([]);
  const { user } = useAuth();
  // Estados para controlar los modales
  const [showProductModal, setShowProductModal] = useState(false);
  const [showSucursalesModal, setShowSucursalesModal] = useState(false);
  const [showCanalesModal, setShowCanalesModal] = useState(false);
const [showListasPrecioModal, setShowListasPrecioModal] = useState(false);
const [listasPrecioApi, setListasPrecioApi] = useState([]);
const [selectedListasPrecio, setSelectedListasPrecio] = useState([]);
const [listaPrecioSearch, setListaPrecioSearch] = useState('');
  // Estados para las búsquedas
  const [productSearch, setProductSearch] = useState('');
  const [sucursalSearch, setSucursalSearch] = useState('');
  const [canalSearch, setCanalSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [currentPackId, setCurrentPackId] = useState(0);
  const [showHistorialModal, setShowHistorialModal] = useState(false);
const [historialPacks, setHistorialPacks] = useState([]);
const [loadingHistorial, setLoadingHistorial] = useState(false);
const [filtroHistorial, setFiltroHistorial] = useState('');

  // Datos de la API
  const [productosApi, setProductosApi] = useState([]);
  const [sucursalesApi, setSucursalesApi] = useState([]);
  const [canalesApi, setCanalesApi] = useState([]);
  const [loading, setLoading] = useState({
    productos: false,
    sucursales: false,
    canales: false
  });
  const handleRemoveProduct = useCallback((indexToRemove) => {
    setProducts(prevProducts => prevProducts.filter((_, index) => index !== indexToRemove));
  }, []);
  // Llamadas a la API con useCallback para memoización
  const fetchSucursales = useCallback(async () => {
    setLoading(prev => ({...prev, sucursales: true}));
    try {
      const { data } = await axios.get('https://localhost:7146/api/Descuento/sucursalQF');
      setSucursalesApi(data);
    } catch (e) {
      console.error('Error al cargar las sucursales:', e);
    } finally {
      setLoading(prev => ({...prev, sucursales: false}));
    }
  }, []);

  const fetchCanales = useCallback(async () => {
    setLoading(prev => ({...prev, canales: true}));
    try {
      const { data } = await axios.get('https://localhost:7146/api/Descuento/canales');
      setCanalesApi(data);
    } catch (e) {
      console.error('Error al cargar los canales de venta:', e);
    } finally {
      setLoading(prev => ({...prev, canales: false}));
    }
  }, []);

  const fetchProductos = useCallback(async (nombreProducto) => {
    if (!nombreProducto || nombreProducto.trim().length < 2) {
      setProductosApi([]);
      return;
    }
    
    setLoading(prev => ({...prev, productos: true}));
    try {
      const { data } = await axios.get(
        `https://localhost:7146/api/Descuento/BuscarPorNombrepack/${nombreProducto}`
      );
      setProductosApi(data);
    } catch (e) {
      console.error('Error al cargar los productos:', e);
    } finally {
      setLoading(prev => ({...prev, productos: false}));
    }
  }, []);

  // Efectos para cargar datos iniciales
  useEffect(() => {
    fetchSucursales();
    fetchCanales();
  }, [fetchSucursales, fetchCanales]);

  const fetchHistorialPacks = useCallback(async () => {
  setLoadingHistorial(true);
  try {
    const { data } = await axios.get('https://localhost:7146/api/Descuento/HistorialPacks');
    setHistorialPacks(data);
  } catch (e) {
    console.error('Error al cargar el historial:', e);
  } finally {
    setLoadingHistorial(false);
  }
}, []);

// Función para buscar en el historial
const filtrarHistorial = useMemo(() => {
  if (!filtroHistorial) return historialPacks;
  
  const lowerFilter = filtroHistorial.toLowerCase();
  return historialPacks.filter(pack => 
    pack.IdDescuento.toString().includes(lowerFilter) ||
    pack.Descripcion.toLowerCase().includes(lowerFilter) ||
    pack.IdProductoPack.toString().includes(lowerFilter)
  );
}, [historialPacks, filtroHistorial]);
  // Debounce para búsqueda de productos
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProductos(productSearch);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [productSearch, fetchProductos]);
const calcularPrecioBase = useCallback(() => {
  return products.reduce((total, product) => {
    const precioProducto = product.usarFraccion ? product.precioXFraccion : product.precioOriginal;
    return total + (precioProducto * product.cantidad);
  }, 0);
}, [products]);

// Efecto para actualizar precios cuando cambian productos o descuento
useEffect(() => {
  const precioBase = calcularPrecioBase();
  const nuevoPrecio = precioBase * (1 - (descuento / 100));
  
  dispatch({ type: 'UPDATE_FIELD', field: 'price', value: parseFloat(nuevoPrecio.toFixed(2)) });
}, [products, descuento, calcularPrecioBase]);

// Handler para cambios en el precio manual
const handlePriceChange = (value) => {
  const precioBase = calcularPrecioBase();
  const nuevoDescuento = precioBase > 0 ? 100 - ((value / precioBase) * 100) : 0;
  
  dispatch({ type: 'UPDATE_FIELD', field: 'price', value: parseFloat(value) });
  dispatch({ type: 'UPDATE_FIELD', field: 'descuento', value: parseFloat(nuevoDescuento.toFixed(2)) });
};


const loadPackData = useCallback((packData) => {
  // Parsear los datos del pack
  const productos = JSON.parse(packData.idproducto);
  const sucursales = JSON.parse(packData.idsucursal);
  const canales = JSON.parse(packData.idcanalventa);
  const listasPrecio = JSON.parse(packData.idlistaprecio);

  // Calcular el descuento basado en el summary
  const descuentoPorcentaje = productos.summary.descuento * 100;

  // Actualizar el estado del pack
  dispatch({
    type: 'UPDATE_FIELD',
    field: 'packName',
    value: packData.descripcion
  });
  dispatch({
    type: 'UPDATE_FIELD',
    field: 'fechaDesde',
    value: packData.fechaInicio.split('T')[0]
  });
  dispatch({
    type: 'UPDATE_FIELD',
    field: 'fechaHasta',
    value: packData.fechaFin.split('T')[0]
  });
  dispatch({
    type: 'UPDATE_FIELD',
    field: 'descuento',
    value: descuentoPorcentaje
  });
  dispatch({
    type: 'UPDATE_FIELD',
    field: 'price',
    value: productos.summary.total
  });
    dispatch({
    type: 'UPDATE_FIELD',
    field: 'packCode',
    value: packData.idProductoPack
  });

  // Actualizar productos
  const productosFormateados = productos.items.map(item => ({
    code: item.id,
    name: item.name,
    price: item.precio,
    precioOriginal: item.precio,
    precioXFraccion: 0, // Puedes ajustar esto si tienes datos de fracción
    usarFraccion: false,
    cantidad: item.cantidad,
    incentivo: 0.00
  }));
  setProducts(productosFormateados);

  // Actualizar sucursales, canales y listas de precio seleccionadas
  setSelectedSucursales(sucursales.map(s => parseInt(s.idsucursal)));
  setSelectedCanales(canales.map(c => parseInt(c.idcanalventa)));
  setSelectedListasPrecio(listasPrecio.map(l => parseInt(l.idListaPrecio)));

  // Cerrar el modal de historial
  setShowHistorialModal(false);
  setCurrentPackId(packData.idDescuento);
}, []);

const fetchListasPrecio = useCallback(async () => {
  try {
    const { data } = await axios.get('https://localhost:7146/api/Descuento/listas-precios');
    setListasPrecioApi(data);
  } catch (e) {
    console.error('Error al cargar las listas de precios:', e);
  }
}, []);

const handleToggleListaPrecio = (id) => {
  setSelectedListasPrecio(prev =>
    prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
  );
};
// Handler para cambios en el % descuento
const handleDescuentoChange = (value) => {
  const precioBase = calcularPrecioBase();
  const nuevoPrecio = precioBase * (1 - (value / 100));
  
  dispatch({ type: 'UPDATE_FIELD', field: 'descuento', value: parseFloat(value) });
  dispatch({ type: 'UPDATE_FIELD', field: 'price', value: parseFloat(nuevoPrecio.toFixed(2)) });
};
  // Filtros memoizados para mejor performance
  const filteredSucursales = useMemo(() => {
    const lowerSearch = sucursalSearch.toLowerCase();
    return sucursalesApi.filter((s) => (
      !sucursalSearch || 
      s.nombreSucursal.toLowerCase().includes(lowerSearch) ||
      s.idSucursal.toString().includes(lowerSearch)
    ));
  }, [sucursalesApi, sucursalSearch]);

  const filteredCanales = useMemo(() => {
    const lowerSearch = canalSearch.toLowerCase();
    return canalesApi.filter((c) => (
      !canalSearch || 
      c.nombreCanal.toLowerCase().includes(lowerSearch) ||
      c.idCanal.toString().includes(lowerSearch)
    ));
  }, [canalesApi, canalSearch]);

  // Handlers para productos
const handleAddSelectedProduct = (product) => {
  const newProduct = {
    code: product.idProducto,
    name: product.descripcion,
    price: product.precio,
    precioOriginal: product.precio,
    precioXFraccion: Number(product.precioXFraccion) || 0,
    usarFraccion: false,
    cantidad: 1,
    incentivo: 0.00,
  };
  setProducts((prev) => [...prev, newProduct]);
  setShowProductModal(false);
  setProductSearch('');
};
const handleUpdateProduct = (idx, field, value) => {
  setProducts(prev => {
    const updated = [...prev];
    
    if (field === 'usarFraccion') {
      if (updated[idx].precioXFraccion > 0) {
        updated[idx].usarFraccion = value;
        updated[idx].price = value ? updated[idx].precioXFraccion : updated[idx].precioOriginal;
      }
    } else {
      updated[idx][field] = value;
    }
    
    return updated;
  });
};

  // Handlers para sucursales y canales
  const handleToggleSucursal = (id) => {
    setSelectedSucursales(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleToggleCanal = (id) => {
    setSelectedCanales(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

const handleSave = async () => {
  setIsSaving(true);
  
  try {
    // Validación básica
    if (!packName) {
      throw new Error("El nombre del pack es requerido");
    }

    // Preparar el objeto con el formato exacto requerido
    const requestData = {
      iddescuento: 0,
      descripcion: packName,
      fechainicio: fechaDesde || new Date().toISOString(),
      fechafin: fechaHasta || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      idtipodescuento: 2,
      todosucursal: selectedSucursales.length === 0,
      idsucursal: selectedSucursales.length > 0 
        ? JSON.stringify(selectedSucursales.map(id => ({ idsucursal: id.toString() }))) 
        : "[]",
      todolistaprecio: selectedListasPrecio.length === 0, // Nuevo campo
      idlistaprecio: selectedListasPrecio.length > 0      // Nuevo campo
        ? JSON.stringify(selectedListasPrecio.map(id => ({
            idListaPrecio: id.toString(),
            descripcion: listasPrecioApi.find(l => l.idListaPrecio === id)?.descripcion || ""
          })))
        : "[]",
      todotipoproducto: false,
      descuentotodotipoproducto: 0,
      idtipoproducto: "[]",
      excluiridproducto: "[]",
      todoproducto: false,
      descuentotodoproducto: parseFloat(descuento) || 0,
  idproducto: products.length > 0 
    ? JSON.stringify({
        items: products.map(p => ({
          id: p.code,
          name: p.name,
          precio: p.usarFraccion ? p.precioXFraccion : p.precioOriginal,
          cantidad: p.cantidad,
          total: (p.usarFraccion ? p.precioXFraccion : p.precioOriginal) * p.cantidad
        })),
        summary: {
          subtotal: calcularPrecioBase(),
          descuento: descuento/100,
          total: price
        }
      })
    : "[]",
      todocliente: true,
      descuentotodocliente: 0,
      idcanalventa: selectedCanales.length > 0
        ? JSON.stringify(selectedCanales.map(id => ({ idcanalventa: id.toString() })))
        : "[]",
      idcliente: "[]",
      idestado: 1,
      usuariomanipula: "1" // Reemplazar con ID de usuario real
    };

    // Validación adicional
    if (isNaN(requestData.descuentotodoproducto)) {
      throw new Error("El descuento debe ser un valor numérico válido");
    }

    const response = await axios.post('https://localhost:7146/api/Descuento/Insertar-Descu', requestData, {
      headers: {
        'Content-Type': 'application/json',
        // Agrega aquí tu header de autenticación si es necesario
        // 'Authorization': `Bearer ${token}`
      }
    });

    console.log("Respuesta del servidor:", response.data);
    alert(`Pack guardado exitosamente con ID: ${response.data}`);
    
  } catch (error) {
    console.error("Error al guardar:", error.response?.data || error);
    alert(`Error: ${error.response?.data?.message || error.message}`);
    
    // Mostrar errores de validación detallados si existen
    if (error.response?.data?.errors) {
      console.error("Errores detallados:", error.response.data.errors);
    }
  } finally {
    setIsSaving(false);
  }
};

  // Componente para la tabla de productos
  const ProductsTable = () => (
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
          // Asegurar que usarFraccion sea false si precioXFraccion <= 0
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
                  onChange={(e) => handleUpdateProduct(idx, 'cantidad', parseInt(e.target.value))}
                  size="small"
                  sx={{ width: 70 }}
                  inputProps={{ min: 1 }}
                />
              </TableCell>
              <TableCell align="right">{precioMostrado.toFixed(2)}</TableCell>
              <TableCell align="center">
                <Checkbox
                  checked={usarFraccion}
                  onChange={(e) => handleUpdateProduct(idx, 'usarFraccion', e.target.checked)}
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
                  onClick={() => handleRemoveProduct(idx)}
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

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" color="primary" gutterBottom>
        Pack de Promociones
      </Typography>

     {/* Datos generales del pack */}
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
          onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'packName', value: e.target.value })}
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
          onChange={(e) => handleDescuentoChange(e.target.value)}
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
            inputProps: { min: 0, max: 100 }
          }}
        />
      </Grid>

      {/* Segunda fila - ahora con 2 campos de 6 columnas cada uno */}
      <Grid item xs={12} md={6}>
        <TextField
          label="Incentivo"
          type="number"
          fullWidth
          value={incentive}
          onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'incentive', value: parseFloat(e.target.value) })}
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          label="Precio Estimado"
          type="number"
          fullWidth
          value={price}
          onChange={(e) => handlePriceChange(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
      </Grid>

      {/* Tercera fila - Fechas */}
      <Grid item xs={12} md={6}>
        <TextField
          label="Fecha Desde"
          type="date"
          fullWidth
          value={fechaDesde}
          onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'fechaDesde', value: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          label="Fecha Hasta"
          type="date"
          fullWidth
          value={fechaHasta}
          onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'fechaHasta', value: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      {/* Cuarta fila - Descripción (ancho completo) */}
      <Grid item xs={12}>
        <TextField
          label="Descripción"
          fullWidth
          multiline
          rows={3}
          value={packDescription}
          onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'packDescription', value: e.target.value })}
        />
      </Grid>
    </Grid>
  </CardContent>
</Card>

      {/* Productos del Pack */}
      <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" color="primary">
              Productos del Pack
            </Typography>
            
            <Box>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setShowProductModal(true)}
                startIcon={<AddCircle />}
                sx={{ mr: 2 }}
              >
                Productos
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setShowSucursalesModal(true)}
                startIcon={<AddCircle />}
                sx={{ mr: 2 }}
              >
                Sucursales ({selectedSucursales.length})
              </Button>

              <Button
                variant="outlined"
                color="warning"
                onClick={() => setShowCanalesModal(true)}
                startIcon={<AddCircle />}
              >
                Canales ({selectedCanales.length})
              </Button>

                <Button
      variant="outlined"
      color="success"
      onClick={() => {
        fetchListasPrecio();
        setShowListasPrecioModal(true);
      }}
      startIcon={<AddCircle />}
    >
      Listas de Precio ({selectedListasPrecio.length})
    </Button>
            </Box>
          </Box>

          {products.length > 0 ? (
            <ProductsTable />
          ) : (
            <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
              No hay productos agregados al pack
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Botón de guardar */}
    <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        size="large"
        fullWidth
        disabled={!packName || products.length === 0 || isSaving}
      >
        {isSaving ? (
          <>
            <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
            Guardando...
          </>
        ) : (
          currentPackId ? 'Actualizar Pack' : 'Guardar Pack'
        )}
      </Button>

  <Button
    variant="outlined"
    color="secondary"
    onClick={() => {
      fetchHistorialPacks();
      setShowHistorialModal(true);
    }}
    startIcon={<History />}
    sx={{ 
      flex: { xs: 1, sm: 'none' },
      py: 1.5,
      borderWidth: 2,
      '&:hover': { borderWidth: 2 }
    }}
  >
    <Typography variant="button" fontWeight="medium">
      Ver Historial
    </Typography>
  </Button>


<HistorialModal
  open={showHistorialModal}
  onClose={() => setShowHistorialModal(false)}
  packs={filtrarHistorial}
  loading={loadingHistorial}
  filtro={filtroHistorial}
  setFiltro={setFiltroHistorial}
   onLoadPack={loadPackData}
/>
      {/* Modal de productos */}
      <ProductModal 
        open={showProductModal}
        onClose={() => setShowProductModal(false)}
        productSearch={productSearch}
        setProductSearch={setProductSearch}
        productosApi={productosApi}
        loading={loading.productos}
        onSelectProduct={handleAddSelectedProduct}
      />

      {/* Modal de Sucursales */}
      <SelectionModal
        open={showSucursalesModal}
        onClose={() => setShowSucursalesModal(false)}
        title="Seleccionar Sucursales"
        searchValue={sucursalSearch}
        setSearchValue={setSucursalSearch}
        items={filteredSucursales}
        loading={loading.sucursales}
        selectedItems={selectedSucursales}
        onToggleItem={handleToggleSucursal}
        getItemName={(item) => item.nombreSucursal}
        getItemId={(item) => item.idSucursal}
      />
      <SelectionModal
  open={showListasPrecioModal}
  onClose={() => setShowListasPrecioModal(false)}
  title="Seleccionar Listas de Precio"
  searchValue={listaPrecioSearch}
  setSearchValue={setListaPrecioSearch}
  items={listasPrecioApi.filter(lista => 
    lista.descripcion.toLowerCase().includes(listaPrecioSearch.toLowerCase()) ||
    lista.idListaPrecio.toString().includes(listaPrecioSearch)
  )}
  loading={false}
  selectedItems={selectedListasPrecio}
  onToggleItem={handleToggleListaPrecio}
  getItemName={(item) => item.descripcion}
  getItemSecondary={(item) => `ID: ${item.idListaPrecio} - ${item.estado}`}
  getItemId={(item) => item.idListaPrecio}
/>

      {/* Modal de Canales */}
      <SelectionModal
        open={showCanalesModal}
        onClose={() => setShowCanalesModal(false)}
        title="Seleccionar Canales"
        searchValue={canalSearch}
        setSearchValue={setCanalSearch}
        items={filteredCanales}
        loading={loading.canales}
        selectedItems={selectedCanales}
        onToggleItem={handleToggleCanal}
        getItemName={(item) => item.descripcion}
        getItemId={(item) => item.idCanalVenta}
      />
    </Box>
  );
};

// Componente Modal para Productos
const ProductModal = ({ open, onClose, productSearch, setProductSearch, productosApi, loading, onSelectProduct }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>
      <Box display="flex" alignItems="center">
        <Search sx={{ mr: 1 }} />
        Buscar Productos
      </Box>
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
        <Typography variant="body2" color="textSecondary" align="center">
          Cargando productos...
        </Typography>
      ) : productosApi.length > 0 ? (
        <List dense>
          {productosApi.map((producto) => (
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
const HistorialModal = ({ open, onClose, packs, loading, filtro, setFiltro,onLoadPack  }) => (
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
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
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
                  <TableCell colSpan={7} align="center">
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
// Componente Modal genérico para selección
const SelectionModal = ({
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
  getItemId
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <TextField
        label="Buscar"
        fullWidth
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        sx={{ mb: 2 }}
      />
      
      {loading ? (
        <Typography variant="body2" color="textSecondary" align="center">
          Cargando...
        </Typography>
      ) : items.length > 0 ? (
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {items.map((item) => (
            <ListItem
              key={getItemId(item)}
              button
              onClick={() => onToggleItem(getItemId(item))}
              selected={selectedItems.includes(getItemId(item))}
            >
              <ListItemText primary={getItemName(item)} />
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
      <Button onClick={onClose} color="primary" variant="contained">
        Aceptar
      </Button>
    </DialogActions>
  </Dialog>
);

export default DescuentoDePacks;