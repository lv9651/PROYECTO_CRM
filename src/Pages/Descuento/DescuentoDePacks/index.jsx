import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Button, Grid, TextField, Typography, InputAdornment,
  CircularProgress, Card, CardContent,Snackbar,Alert
} from '@mui/material';
import { useAuth } from '../../../Compo/AuthContext';

// Hooks
import { usePackManagement } from './hooks/usePackManagement';
import { useApiData } from './hooks/useApiData';
import { usePackCalculations } from './hooks/usePackCalculations';
import { usePackOperations } from './hooks/usePackOperations';

// Components
import PackFormSection from './components/PackFormSection';
import ProductsTable from './components/ProductsTable';
import ActionButtons from './components/ActionButtons';
import ProductModal from './components/modals/ProductModal';
import SelectionModal from './components/modals/SelectionModal';
import HistorialModal from './components/modals/HistorialModal';
import ListasPrecioModal from './components/modals/ListasPrecioModal';

// Constants
import { PACK_CONFIG } from './constants/packConstants';

const DescuentoDePacks = () => {
  // Estados locales
  const [products, setProducts] = useState([]);
  const [selectedSucursales, setSelectedSucursales] = useState([]);
  const [selectedCanales, setSelectedCanales] = useState([]);
  const [selectedListasPrecio, setSelectedListasPrecio] = useState([]);
  const [currentPackId, setCurrentPackId] = useState(0);
  
  // Estados de modales
  const [modals, setModals] = useState({
    product: false,
    sucursales: false,
    canales: false,
    listasPrecio: false,
    historial: false
  });
  
  // Estados de búsqueda
  const [searchValues, setSearchValues] = useState({
    product: '',
    sucursal: '',
    canal: '',
    listaPrecio: '',
    historial: ''
  });

    const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success', 'error', 'warning', 'info'
    duration: 6000 // 6 segundos
  });

  // Hooks personalizados
  const { packState, updateField, loadPackData,resetPack  } = usePackManagement();
  const { apiData, loading, fetchSucursales, fetchCanales, fetchListasPrecio, 
          fetchHistorial, fetchProductos, savePack } = useApiData();
  const { calcularPrecioBase, calcularPrecioConDescuento, 
          calcularDescuentoDesdePrecio } = usePackCalculations();
          
  const { handleSave: prepareSaveData, handleLoadPack } = usePackOperations(
    packState, products, selectedSucursales, selectedCanales, selectedListasPrecio, apiData
  );

  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  // Efectos para carga inicial
  useEffect(() => {
    fetchSucursales();
    fetchCanales();
  }, [fetchSucursales, fetchCanales]);

  // Debounce para búsqueda de productos
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProductos(searchValues.product);
    }, PACK_CONFIG.DEBOUNCE_DELAY);
    
    return () => clearTimeout(timer);
  }, [searchValues.product, fetchProductos]);

  // Cálculo de precios
  useEffect(() => {
    const precioBase = calcularPrecioBase(products);
    const nuevoPrecio = calcularPrecioConDescuento(precioBase, packState.descuento);
    updateField('price', parseFloat(nuevoPrecio.toFixed(2)));
  }, [products, packState.descuento, calcularPrecioBase, calcularPrecioConDescuento, updateField]);

  // Handlers de productos
  const handleAddSelectedProduct = useCallback((product) => {

    const newProduct = {
      code: product.idProducto,
      name: product.descripcion,
      price: product.precio,
      precioOriginal: product.precio,
      precioXFraccion: Number(product.precioXFraccion) || 0,
      usarFraccion: false,
      cantidad: 1,
      incentivo: product.incentivo || 0,
      incentivo_total:packState.incentivo
    };
    setProducts((prev) => [...prev, newProduct]);
    setModals(prev => ({ ...prev, product: false }));
    setSearchValues(prev => ({ ...prev, product: '' }));
  }, [packState.incentivo]);

  
  const handleUpdateProduct = useCallback((idx, field, value) => {
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
  }, []);

  const handleRemoveProduct = useCallback((indexToRemove) => {
    setProducts(prev => prev.filter((_, index) => index !== indexToRemove));
  }, []);

  // Handlers de selección
  const handleToggleSucursal = useCallback((id) => {
    setSelectedSucursales(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  }, []);

  const handleToggleCanal = useCallback((id) => {
    setSelectedCanales(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  }, []);

  const handleToggleListaPrecio = useCallback((id) => {
    setSelectedListasPrecio(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }, []);

  const showNotification = useCallback((message, severity = 'success', duration = 6000) => {
  setNotification({
    open: true,
    message,
    severity,
    duration
  });
}, []);

useEffect(() => {
  const incentivoTotal = products.reduce((acc, product) => {
    const incentivoProducto = Number(product.incentivo) || 0;
    return acc + incentivoProducto;
  }, 0);

  // Actualizamos el campo incentivo_total en el estado del pack
  updateField('incentivo_total', parseFloat(incentivoTotal.toFixed(2)));
}, [products, updateField]);
// 🆕 Función para cerrar notificaciones
const handleCloseNotification = useCallback((event, reason) => {
  if (reason === 'clickaway') {
    return;
  }
  setNotification(prev => ({ ...prev, open: false }));
}, []);
  // Handlers de modales
  const handleOpenModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  }, []);

  const handleCloseModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  }, []);

  const handleOpenListasPrecioModal = useCallback(() => {
    fetchListasPrecio();
    handleOpenModal('listasPrecio');
  }, [fetchListasPrecio, handleOpenModal]);

  const handleOpenHistorialModal = useCallback(() => {
    fetchHistorial();
    handleOpenModal('historial');
  }, [fetchHistorial, handleOpenModal]);

  // Handlers de formulario
  const handleDescuentoChange = useCallback((value) => {
    const precioBase = calcularPrecioBase(products);
    const nuevoPrecio = calcularPrecioConDescuento(precioBase, value);
    updateField('descuento', parseFloat(value));
    updateField('price', parseFloat(nuevoPrecio.toFixed(2)));
  }, [products, calcularPrecioBase, calcularPrecioConDescuento, updateField]);

  const handlePriceChange = useCallback((value) => {
    const precioBase = calcularPrecioBase(products);
    const nuevoDescuento = calcularDescuentoDesdePrecio(precioBase, value);
    updateField('price', parseFloat(value));
    updateField('descuento', parseFloat(nuevoDescuento.toFixed(2)));
  }, [products, calcularPrecioBase, calcularDescuentoDesdePrecio, updateField]);

  const handleSave = useCallback(async () => {
  setIsSaving(true);
  try {
    const packData = await prepareSaveData();
    const result = await savePack(packData);
    
    // 🆕 Notificación de éxito
    showNotification(
      `Pack guardado exitosamente con ID: ${result}`,
      'success',
      8000
    );
    
    // Limpiar formulario
    resetPack();
    setProducts([]);
    setSelectedSucursales([]);
    setSelectedCanales([]);
    setSelectedListasPrecio([]);
    setCurrentPackId(0);
    
    setSearchValues({
      product: '',
      sucursal: '',
      canal: '',
      listaPrecio: '',
      historial: ''
    });
    
  } catch (error) {
    console.error("Error al guardar:", error);
    
    // 🆕 Notificación de error
    showNotification(
      `Error al guardar: ${error.response?.data?.message || error.message}`,
      'error',
      10000
    );
    
  } finally {
    setIsSaving(false);
  }
}, [prepareSaveData, savePack, resetPack, showNotification]);   

  // Handler de carga desde historial
  const handleLoadPackFromHistory = useCallback((packData) => {
    handleLoadPack(
      packData, 
      setProducts, 
      setSelectedSucursales, 
      setSelectedCanales, 
      setSelectedListasPrecio, 
      loadPackData, 
      setCurrentPackId
    );
    handleCloseModal('historial');
  }, [handleLoadPack, loadPackData, handleCloseModal]);


  // Filtros memoizados
  const filteredSucursales = useMemo(() => {
    const lowerSearch = searchValues.sucursal.toLowerCase();
    return apiData.sucursales.filter((s) =>
      !searchValues.sucursal ||
      s.nombreSucursal.toLowerCase().includes(lowerSearch) ||
      s.idSucursal.toString().includes(lowerSearch)
    );
  }, [apiData.sucursales, searchValues.sucursal]);

  const filteredCanales = useMemo(() => {
    const lowerSearch = searchValues.canal.toLowerCase();
    return apiData.canales.filter((c) =>
      !searchValues.canal ||
      c.nombreCanal.toLowerCase().includes(lowerSearch) ||
      c.idCanal.toString().includes(lowerSearch)
    );
  }, [apiData.canales, searchValues.canal]);

  const filteredHistorial = useMemo(() => {
    if (!searchValues.historial) return apiData.historial;
    const lowerFilter = searchValues.historial.toLowerCase();
    return apiData.historial.filter(pack =>
      pack.IdDescuento.toString().includes(lowerFilter) ||
      pack.Descripcion.toLowerCase().includes(lowerFilter) ||
      pack.IdProductoPack.toString().includes(lowerFilter)
    );
  }, [apiData.historial, searchValues.historial]);

  const filteredListasPrecio = useMemo(() => {
    return apiData.listasPrecio.filter(lista =>
      lista.descripcion.toLowerCase().includes(searchValues.listaPrecio.toLowerCase()) ||
      lista.idListaPrecio.toString().includes(searchValues.listaPrecio)
    );
  }, [apiData.listasPrecio, searchValues.listaPrecio]);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" color="primary" gutterBottom>
        Pack de Promociones
      </Typography>
  <Snackbar
      open={notification.open}
      autoHideDuration={notification.duration}
      onClose={handleCloseNotification}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{
        '& .MuiSnackbarContent-root': {
          borderRadius: 2
        }
      }}
    >
      <Alert 
        onClose={handleCloseNotification} 
        severity={notification.severity}
        variant="filled"
        sx={{ 
          width: '100%',
          alignItems: 'center',
          fontSize: '0.95rem'
        }}
        iconMapping={{
          success: '✅',
          error: '❌',
          warning: '⚠️',
          info: 'ℹ️'
        }}
      >
        <Typography variant="body1" fontWeight="medium">
          {notification.message}
        </Typography>
      </Alert>
    </Snackbar>
    <PackFormSection title="Datos generales del pack">
  <Grid container spacing={3}>
    {/* Primera fila - Información básica */}
    <Grid item xs={12} md={4}>
      <TextField
        label="Nombre del Pack *"
        fullWidth
        value={packState.packName}
        onChange={(e) => updateField('packName', e.target.value)}
        variant="outlined"
        size="medium"
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#fafafa',
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#f5f5f5',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            },
            '&.Mui-focused': {
              backgroundColor: '#fff',
              boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
            }
          }
        }}
        placeholder="Ingresa el nombre del pack"
        helperText="Nombre descriptivo para identificar el pack"
      />
    </Grid>
    
    <Grid item xs={12} md={4}>
      <TextField
        label="Código del Pack"
        fullWidth
        value={packState.packCode}
        variant="outlined"
        size="medium"
        InputProps={{
          readOnly: true,
          sx: { 
            backgroundColor: '#f8f9fa',
            borderRadius: 2,
            '& .MuiInputBase-input': { 
              color: '#6c757d',
              fontStyle: 'italic',
              fontWeight: '500'
            }
          }
        }}
        helperText="Código generado automáticamente"
      />
    </Grid>

    <Grid item xs={12} md={4}>
      <TextField
        label="% Descuento *"
        type="number"
        fullWidth
        value={packState.descuento}
        onChange={(e) => handleDescuentoChange(e.target.value)}
        variant="outlined"
        size="medium"
        InputProps={{
          endAdornment: <InputAdornment position="end">%</InputAdornment>,
          inputProps: { 
            min: 0, 
            max: 100,
            step: 0.1
          },
          sx: {
            backgroundColor: '#fff',
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#fafafa'
            }
          }
        }}
        sx={{
          '& input[type=number]': {
            textAlign: 'center',
            fontWeight: '600',
            color: packState.descuento > 0 ? '#1976d2' : 'inherit'
          }
        }}
        helperText="Descuento aplicado al pack completo"
      />
    </Grid>

    {/* Segunda fila - Precios e incentivos */}
    <Grid item xs={12} md={4}>
      <TextField
  label="Incentivo Total"
  type="number"
  fullWidth
  value={packState.incentivo_total}
  variant="outlined"
  size="medium"
  InputProps={{
    readOnly: true,
    endAdornment: <InputAdornment position="end">%</InputAdornment>,
    sx: {
      backgroundColor: '#f8f9fa',
      borderRadius: 2,
      '& .MuiInputBase-input': {
        color: '#2e7d32',
        fontWeight: 'bold',
      }
    }
  }}
  helperText="Suma del incentivo de todos los productos del pack"
/>
    </Grid>

    <Grid item xs={12} md={4}>
      <TextField
        label="Precio Estimado *"
        type="number"
        fullWidth
        value={packState.price}
        onChange={(e) => handlePriceChange(e.target.value)}
        variant="outlined"
        size="medium"
        InputProps={{
          startAdornment: <InputAdornment position="start">S/</InputAdornment>,
          inputProps: { 
            min: 0,
            step: 0.01
          },
          sx: {
            backgroundColor: '#fff',
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#fafafa'
            }
          }
        }}
        sx={{
          '& input': {
            textAlign: 'right',
            fontWeight: '600',
            color: '#2e7d32'
          }
        }}
        helperText="Precio final con descuento aplicado"
      />
    </Grid>

    <Grid item xs={12} md={4}>
      <Box sx={{ 
        p: 3, 
        backgroundColor: 'rgba(25, 118, 210, 0.04)', 
        borderRadius: 2, 
        border: '2px dashed rgba(25, 118, 210, 0.3)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
          S/{packState.price.toFixed(2)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Precio final
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {packState.descuento > 0 ? `Con ${packState.descuento}% descuento` : 'Sin descuento aplicado'}
        </Typography>
      </Box>
    </Grid>

    {/* Tercera fila - Fechas de vigencia */}
    <Grid item xs={12} md={6}>
      <Box sx={{ 
        p: 3, 
        backgroundColor: '#f8f9fa', 
        borderRadius: 2,
        border: '1px solid #e9ecef',
        height: '100%'
      }}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box 
            component="span" 
            sx={{ 
              width: 24, 
              height: 24, 
              backgroundColor: 'primary.main', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.8rem',
              mr: 1.5
            }}
          >
            📅
          </Box>
          Período de Vigencia
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Fecha Desde *"
              type="date"
              fullWidth
              value={packState.fechaDesde}
              onChange={(e) => updateField('fechaDesde', e.target.value)}
              variant="outlined"
              size="medium"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                sx: {
                  backgroundColor: '#fff',
                  borderRadius: 1
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Fecha Hasta *"
              type="date"
              fullWidth
              value={packState.fechaHasta}
              onChange={(e) => updateField('fechaHasta', e.target.value)}
              variant="outlined"
              size="medium"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                sx: {
                  backgroundColor: '#fff',
                  borderRadius: 1
                }
              }}
            />
          </Grid>
        </Grid>
        
        {packState.fechaDesde && packState.fechaHasta && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            backgroundColor: new Date(packState.fechaHasta) > new Date() ? 
              'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
            borderRadius: 1,
            border: `1px solid ${new Date(packState.fechaHasta) > new Date() ? '#4caf50' : '#f44336'}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Box 
              sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                backgroundColor: new Date(packState.fechaHasta) > new Date() ? '#4caf50' : '#f44336' 
              }} 
            />
            <Typography variant="body2" fontWeight="medium">
              {new Date(packState.fechaHasta) > new Date() ? 
                '✅ Período vigente' : '❌ Período vencido'}
            </Typography>
          </Box>
        )}
      </Box>
      
    </Grid>

    {/* Descripción */}
    <Grid item xs={12} md={6}>
      <TextField
        label="Descripción del Pack"
        fullWidth
        multiline
        rows={4}
        value={packState.packDescription}
        onChange={(e) => updateField('packDescription', e.target.value)}
        variant="outlined"
        size="medium"
        placeholder="Describe los beneficios, características y condiciones especiales de este pack promocional..."
        InputProps={{
          sx: {
            backgroundColor: '#fff',
            borderRadius: 2,
            transition: 'all 0.3s ease'
          }
        }}
        helperText={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Información adicional opcional</span>
            <Typography 
              variant="caption" 
              color={packState.packDescription.length > 450 ? 'error' : 'text.secondary'}
              fontWeight={packState.packDescription.length > 450 ? 'bold' : 'normal'}
            >
              {packState.packDescription.length}/500
            </Typography>
          </Box>
        }
        inputProps={{ maxLength: 500 }}
      />
    </Grid>

    {/* Barra de estado */}
    <Grid item xs={12}>
      <Box sx={{ 
        display: 'flex', 
        gap: 1.5, 
        flexWrap: 'wrap',
        mt: 1
      }}>
        {[
          { 
            label: 'Nombre', 
            value: packState.packName, 
            required: true,
            icon: '📝'
          },
          { 
            label: 'Descuento', 
            value: packState.descuento > 0, 
            required: true,
            icon: '💰'
          },
          { 
            label: 'Precio', 
            value: `S/${packState.price.toFixed(2)}`, 
            required: false,
            icon: '💵'
          },
          { 
            label: 'Fechas', 
            value: packState.fechaDesde && packState.fechaHasta, 
            required: true,
            icon: '📅'
          }
        ].map((item, index) => (
          <Box
            key={index}
            sx={{
              px: 2,
              py: 1,
              backgroundColor: item.required 
                ? (item.value ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)') 
                : 'rgba(158, 158, 158, 0.1)',
              borderRadius: 2,
              border: `1px solid ${item.required 
                ? (item.value ? '#4caf50' : '#f44336') 
                : '#9e9e9e'}`,
              fontSize: '0.8rem',
              fontWeight: 'medium',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <span>{item.icon}</span>
            <span>
              {item.label}: {typeof item.value === 'boolean' 
                ? (item.value ? 'Completado' : 'Pendiente') 
                : item.value}
            </span>
          </Box>
        ))}
      </Box>
    </Grid>
  </Grid>
</PackFormSection>

      {/* Productos del Pack */}
      <PackFormSection title="Productos del Pack">
        <ActionButtons
          onAddProducts={() => handleOpenModal('product')}
          onAddSucursales={() => handleOpenModal('sucursales')}
          onAddCanales={() => handleOpenModal('canales')}
          onAddListasPrecio={handleOpenListasPrecioModal}
          onViewHistory={handleOpenHistorialModal}
          selectedSucursalesCount={selectedSucursales.length}
          selectedCanalesCount={selectedCanales.length}
          selectedListasPrecioCount={selectedListasPrecio.length}
        />

        {products.length > 0 ? (
          <ProductsTable
            products={products}
            onUpdateProduct={handleUpdateProduct}
            onRemoveProduct={handleRemoveProduct}
          />
        ) : (
          <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
            No hay productos agregados al pack
          </Typography>
        )}
      </PackFormSection>

      {/* Botón de guardar */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        size="large"
        fullWidth
        disabled={!packState.packName || products.length === 0 || isSaving}
        sx={{ mt: 2 }}
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

      {/* Modales */}
      <ProductModal
        open={modals.product}
        onClose={() => handleCloseModal('product')}
        productSearch={searchValues.product}
        setProductSearch={(value) => setSearchValues(prev => ({ ...prev, product: value }))}
        productos={apiData.productos}
        loading={loading.productos}
        onSelectProduct={handleAddSelectedProduct}
      />

      <SelectionModal
        open={modals.sucursales}
        onClose={() => handleCloseModal('sucursales')}
        title="Seleccionar Sucursales"
        searchValue={searchValues.sucursal}
        setSearchValue={(value) => setSearchValues(prev => ({ ...prev, sucursal: value }))}
        items={filteredSucursales}
        loading={loading.sucursales}
        selectedItems={selectedSucursales}
        onToggleItem={handleToggleSucursal}
        getItemName={(item) => item.nombreSucursal}
        getItemId={(item) => item.idSucursal}
        selectionCount={true}
      />

      <SelectionModal
        open={modals.canales}
        onClose={() => handleCloseModal('canales')}
        title="Seleccionar Canales"
        searchValue={searchValues.canal}
        setSearchValue={(value) => setSearchValues(prev => ({ ...prev, canal: value }))}
        items={filteredCanales}
        loading={loading.canales}
        selectedItems={selectedCanales}
        onToggleItem={handleToggleCanal}
        getItemName={(item) => item.descripcion}
        getItemId={(item) => item.idCanalVenta}
        selectionCount={true}
      />

      <ListasPrecioModal
        open={modals.listasPrecio}
        onClose={() => handleCloseModal('listasPrecio')}
        listasPrecio={filteredListasPrecio}
        loading={loading.listasPrecio}
        selectedListasPrecio={selectedListasPrecio}
        onToggleListaPrecio={handleToggleListaPrecio}
        searchValue={searchValues.listaPrecio}
        setSearchValue={(value) => setSearchValues(prev => ({ ...prev, listaPrecio: value }))}
      />

      <HistorialModal
        open={modals.historial}
        onClose={() => handleCloseModal('historial')}
        packs={filteredHistorial}
        loading={loading.historial}
        filtro={searchValues.historial}
        setFiltro={(value) => setSearchValues(prev => ({ ...prev, historial: value }))}
        onLoadPack={handleLoadPackFromHistory}
      />
    </Box>
  );
};

export default DescuentoDePacks;