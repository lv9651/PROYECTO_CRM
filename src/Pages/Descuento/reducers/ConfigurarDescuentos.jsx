import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Button, Grid, Modal, TextField, Typography, Box,
  Table, TableHead, TableBody, TableRow, TableCell,
  Paper, Checkbox, CircularProgress, Select, MenuItem, 
  FormControl, InputLabel, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { Snackbar, Alert } from '@mui/material';
import { BASE_URL } from '../../Conf/config';
// Componente para el modal de productos
const ProductosModal = React.memo(({ 
  open, 
  onClose, 
  productos, 
  loading, 
  searchTerm,
  tipoProducto,
  selectedProductos,
  onSearchChange,
  onTipoChange,
  onSelectProducto,
  onGuardar
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        width: 600, 
        bgcolor: 'background.paper', 
        p: 4,
        borderRadius: 2, 
        boxShadow: 24, 
        mx: 'auto', 
        mt: '10%',
        maxHeight: '80vh', 
        overflowY: 'auto',
      }}>
        <Typography variant="h6" gutterBottom>Seleccionar Productos</Typography>
        
        <TextField
          fullWidth 
          label="Buscar productos"
          variant="outlined" 
          value={searchTerm}
          onChange={onSearchChange}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
          <InputLabel>Tipo de Producto</InputLabel>
          <Select
            value={tipoProducto}
            onChange={onTipoChange}
            label="Tipo de Producto"
          >
            <MenuItem value="EC">ECONOMATO</MenuItem>
            <MenuItem value="G">GRANEL</MenuItem>
            <MenuItem value="M">MATERIA PRIMA</MenuItem>
            <MenuItem value="PT">PRODUCTO TERMINADO</MenuItem>
            <MenuItem value="S">SERVICIOS</MenuItem>
            <MenuItem value="">TODOS</MenuItem>
          </Select>
        </FormControl>

        <Paper variant="outlined" sx={{ maxHeight: 300, overflowY: 'auto', mb: 2 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Producto</TableCell>
                <TableCell>TP</TableCell>
                <TableCell>UMA</TableCell>
                <TableCell>Laboratorio</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={24} /></TableCell></TableRow>
              ) : productos.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center">No se encontraron productos.</TableCell></TableRow>
              ) : productos.map(prod => (
                <TableRow key={prod.codigoProducto || prod.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedProductos.some(p => p.codigo === prod.codigo)}
                      onChange={() => onSelectProducto(prod)}
                    />  
                  </TableCell>
                  <TableCell>{prod.codigo || prod.codigoproducto}</TableCell>
                  <TableCell>{prod.producto}</TableCell>
                  <TableCell>{prod.tipoproducto}</TableCell>
                  <TableCell>{prod.unidadmedida}</TableCell>
                  <TableCell>{prod.laboratorio}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
   
        </Box>
      </Box>
    </Modal>
  );
});

// Componente para el modal de laboratorios
const LaboratoriosModal = React.memo(({
  open,
  onClose,
  laboratorios,
  loading,
  searchTerm,
  porcentajeQFLab,
  porcentajeProvLab,
  selectedLabs,
  onSearchChange,
  onPorcentajeQFChange,
  onPorcentajeProvChange,
  onToggleLab,
  onGuardar
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        width: 600, 
        bgcolor: 'background.paper', 
        p: 4,
        borderRadius: 2, 
        boxShadow: 24, 
        mx: 'auto', 
        mt: '10%',
        maxHeight: '80vh', 
        overflowY: 'auto',
      }}>
        <Typography variant="h6" gutterBottom>Asignar Descuento a Todo Laboratorio</Typography>
        
        <TextField
          fullWidth 
          label="Buscar laboratorios"
          variant="outlined" 
          value={searchTerm}
          onChange={onSearchChange}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="% QF" 
            type="number"
            fullWidth
            value={porcentajeQFLab}
            onChange={onPorcentajeQFChange}
          />
          <TextField
            label="% Proveedor" 
            type="number"
            fullWidth
            value={porcentajeProvLab}
            onChange={onPorcentajeProvChange}
          />
        </Box>

        <Paper variant="outlined" sx={{ maxHeight: 300, overflowY: 'auto', mb: 2 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Descripción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={3} align="center"><CircularProgress size={24}/></TableCell></TableRow>
              ) : laboratorios.length === 0 ? (
                <TableRow><TableCell colSpan={3} align="center">No hay laboratorios.</TableCell></TableRow>
              ) : laboratorios.map(lab => (
                <TableRow key={lab.idLaboratorio}>
                  <TableCell padding="checkbox">
                    <Checkbox 
                      checked={selectedLabs.includes(lab.idLaboratorio)}
                      onChange={() => onToggleLab(lab.idLaboratorio)}
                    />
                  </TableCell>
                  <TableCell>{lab.idLaboratorio}</TableCell>
                  <TableCell>{lab.descripcion}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button onClick={onClose} sx={{ mr: 2 }}>Cancelar</Button>
<Button 
  variant="contained" 
  onClick={onGuardar}
  disabled={loading} // Deshabilitar durante la carga
>
  {loading ? <CircularProgress size={24} /> : 'Guardar'}
</Button>
        </Box>
      </Box>
    </Modal>
  );
});

// Componente principal ConfigurarDescuentos
const ConfigurarDescuentos = ({
  descripcion,
  fechaInicio,
  fechaFin,
  canales,
  listas,
  descuentoPara,
  proveedorSeleccionado,
  laboratorioSeleccionado,
  onDatosCambio
}) => {
  // Estados del componente principal
  const [mensajeAlerta, setMensajeAlerta] = useState('');
  const [openAlerta, setOpenAlerta] = useState(false);
  const [openModalProducto, setOpenModalProducto] = useState(false);
  const [openModalLaboratorio, setOpenModalLaboratorio] = useState(false);
  const [porcentajeQFLab, setPorcentajeQFLab] = useState(0);
  const [porcentajeProvLab, setPorcentajeProvLab] = useState(0);
  const [laboratorios, setLaboratorios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState({
    laboratorios: false,
    productos: false,
    descuentos: false
  });
  const [selectedLabs, setSelectedLabs] = useState([]);
  const [selectedProductos, setSelectedProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [productosLaboratorio, setProductosLaboratorio] = useState([]);
  const [tipoProducto, setTipoProducto] = useState('IS');
  const [descuentosAplicados, setDescuentosAplicados] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [productoSeleccionadoActual, setProductoSeleccionadoActual] = useState(null);
  const [openDialogEliminar, setOpenDialogEliminar] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [porcentajesGlobales, setPorcentajesGlobales] = useState({
  qf: porcentajeQFLab,  // Valor inicial del modal
  prov: porcentajeProvLab  // Valor inicial del modal
});
  const [porcentajesPorProducto, setPorcentajesPorProducto] = useState({
    _default: {
      qf: 0,
      prov: 0
    }
  });

  const debounceTimeout = useRef(null);

const getProductId = useCallback((producto) => {
  // Priorizar codigoProducto para productos del modal

 return producto.codigo || producto.codigoProducto || producto.idproducto || producto.id
}, []);
const getApiProductId = useCallback((producto) => {
  // Priorizar los campos que contienen el ID real para la API
  return producto.id || producto.idproducto || producto.codigoProducto || producto.codigo;
}, []);
  // Función para calcular el total con descuentos
  const calcularTotal = useCallback((precio, qf, prov) => {
    const totalDescuento = qf + prov;
    return (precio - (precio * (totalDescuento / 100))).toFixed(2);
  }, []);

  // |ner descuentos para un producto específico
const getDescuentosProducto = useCallback((producto) => {
  const productId = getProductId(producto);

  return porcentajesPorProducto[productId] || { 
    qf: porcentajesGlobales.qf, 
    prov: porcentajesGlobales.prov 
  };
}, [porcentajesPorProducto, porcentajesGlobales, getProductId]);

  // Manejar selección de producto
  const handleSeleccionarProducto = useCallback(async (producto) => {

    
    const productoId = getApiProductId(producto);

 if (!productoId || !listas?.length) return;

    setProductoSeleccionadoActual(producto);
    setLoading(prev => ({ ...prev, descuentos: true }));
    
    try {
      const response = await axios.post(`${BASE_URL}/api/Descuento/obtener-precios`, {
        idProducto: productoId,
        listas: listas.join('|'),
      });

      if (response.data && response.data.length > 0) {
        const descuentosActuales = getDescuentosProducto(producto);

        const nuevosDescuentos = response.data.map(item => {
          const totalDescuento = descuentosActuales.qf + descuentosActuales.prov;
          const precio = parseFloat(item.precio) || 0;
          const precioFinal = precio - (precio * (totalDescuento / 100));

          return {
            ...item,
            codigo: producto.codigo,
            idproducto: producto.idproducto,
            id: producto.id,
            qf: descuentosActuales.qf,
            prov: descuentosActuales.prov,
            
            total: precioFinal.toFixed(2)
          };
        });

        setDescuentosAplicados(prev => [
          ...prev.filter(d => 
            d.codigo !== producto.codigo && 
            d.idproducto !== producto.idproducto && 
            d.id !== producto.id
          ),
          ...nuevosDescuentos
        ]);
      }
    } catch (error) {
      setMensajeAlerta(`Error al obtener descuentos: ${error.message}`);
      setOpenAlerta(true);
    } finally {
      setLoading(prev => ({ ...prev, descuentos: false }));
    }
  }, [listas, getDescuentosProducto, getApiProductId ]);

  // Manejar cambio de porcentajes
  
  const handleCambioPorcentaje = useCallback((productoId, lista, campo, valor) => {
  const nuevoValor = parseFloat(valor) || 0;

  setPorcentajesPorProducto(prev => {
    // Crear una COPIA del estado actual
    const nuevosPorcentajes = { ...prev };
    
    // Si el producto no tiene configuración, crearla
    if (!nuevosPorcentajes[productoId]) {
      nuevosPorcentajes[productoId] = {
        qf: porcentajesGlobales.qf,
        prov: porcentajesGlobales.prov
      };
    }
    
    // Actualizar SOLO el valor que cambió
    nuevosPorcentajes[productoId][campo] = nuevoValor;

    // Actualizar precios
    setDescuentosAplicados(prevDescuentos => 
      prevDescuentos.map(item => {
        if (getProductId(item) === productoId && item.lista === lista) {
          const totalDescuento = nuevosPorcentajes[productoId].qf + nuevosPorcentajes[productoId].prov;
          const precioFinal = item.precio - (item.precio * (totalDescuento / 100));
          
          return {
            ...item,
            qf: nuevosPorcentajes[productoId].qf,
            prov: nuevosPorcentajes[productoId].prov,
            total: precioFinal.toFixed(2)
          };
        }
        return item;
      })
    );

    return nuevosPorcentajes;
  });
}, [porcentajesGlobales]);
  // Función para abrir diálogo de eliminación
  const handleOpenDialogEliminar = useCallback((producto) => {
    setProductoAEliminar(producto);
    setOpenDialogEliminar(true);
  }, []);

  // Función para cerrar diálogo de eliminación
  const handleCloseDialogEliminar = useCallback(() => {
    setOpenDialogEliminar(false);
    setProductoAEliminar(null);
  }, []);

  // Función para confirmar eliminación
  const handleConfirmarEliminar = useCallback(() => {
    if (!productoAEliminar) {
      handleCloseDialogEliminar();
      return;
    }

    const nuevosProductosLab = productosLaboratorio.filter(prod => 
      !(prod.codigoproducto && productoAEliminar.codigoproducto && prod.codigoproducto === productoAEliminar.codigoproducto) &&
      !(prod.codigo && productoAEliminar.codigo && prod.codigo === productoAEliminar.codigo)
    );
    
    const nuevosProductosSelec = productosSeleccionados.filter(prod =>
      !(prod.codigoproducto && productoAEliminar.codigoproducto && prod.codigoproducto === productoAEliminar.codigoproducto) &&
      !(prod.codigo && productoAEliminar.codigo && prod.codigo === productoAEliminar.codigo)
    );

    const nuevosDescuentos = descuentosAplicados.filter(desc =>
      !(desc.codigo && productoAEliminar.codigo && desc.codigo === productoAEliminar.codigo) &&
      !(desc.idproducto && productoAEliminar.idproducto && desc.idproducto === productoAEliminar.idproducto) &&
      !(desc.id && productoAEliminar.id && desc.id === productoAEliminar.id)
    );

    setProductosLaboratorio(nuevosProductosLab);
    setProductosSeleccionados(nuevosProductosSelec);
    setDescuentosAplicados(nuevosDescuentos);

    if (productoSeleccionadoActual && 
        ((productoSeleccionadoActual.codigo && productoAEliminar.codigo && productoSeleccionadoActual.codigo === productoAEliminar.codigo) ||
         (productoSeleccionadoActual.idproducto && productoAEliminar.idproducto && productoSeleccionadoActual.idproducto === productoAEliminar.idproducto) ||
         (productoSeleccionadoActual.id && productoAEliminar.id && productoSeleccionadoActual.id === productoAEliminar.id))) {
      setProductoSeleccionadoActual(null);
    }

    handleCloseDialogEliminar();
  }, [productoAEliminar, productosLaboratorio, productosSeleccionados, descuentosAplicados, productoSeleccionadoActual, handleCloseDialogEliminar]);

  const handlePorcentajeQFChange = useCallback((e) => {
  const value = parseFloat(e.target.value) || 0;
  setPorcentajesGlobales(prev => ({...prev, qf: value}));
  setPorcentajeQFLab(value);
}, []);

const handlePorcentajeProvChange = useCallback((e) => {
  const value = parseFloat(e.target.value) || 0;
  setPorcentajesGlobales(prev => ({...prev, prov: value}));
  setPorcentajeProvLab(value);
}, []);
  // Función para cambiar tipo de producto
  const handleTipoChange = useCallback((e, producto) => {
    const updatedProductos = [...productosLaboratorio];
    const index = updatedProductos.findIndex(p => 
      (p.codigoproducto && producto.codigoproducto && p.codigoproducto === producto.codigoproducto) ||
      (p.codigo && producto.codigo && p.codigo === producto.codigo) ||
      (p.id && producto.id && p.id === producto.id)
    );
    
    if (index !== -1) {
      updatedProductos[index].tipoProducto = e.target.value;
      setProductosLaboratorio(updatedProductos);
    }
  }, [productosLaboratorio]);

  // Productos para mostrar en la tabla
const productosConLista = useMemo(() => {
  return [...productosLaboratorio, ...productosSeleccionados].map(prod => {
    const productoId = getProductId(prod);
    
    // Buscar si ya tenemos descuentos aplicados para este producto
    const descuentosProducto = descuentosAplicados.filter(desc =>
      getApiProductId(desc) === productoId
    );

    // Si no hay descuentos aplicados aún, usar la información base del producto
    const primerDescuento = descuentosProducto[0] || {
      lista: prod.lista || '',
      precio: prod.precio || 0,
      total: prod.total || 0
    };

    const porcentajes = porcentajesPorProducto[productoId] || { 
      qf: porcentajesGlobales.qf, 
      prov: porcentajesGlobales.prov 
    };

    return {
      ...prod,
      lista: primerDescuento.lista,
      precio: primerDescuento.precio,
      total: primerDescuento.total,
      descq: porcentajes.qf,
      descprov: porcentajes.prov,
      todosDescuentos: descuentosProducto.length > 0 ? descuentosProducto : prod.todosLosPrecios || [],
      idUnico: productoId
    };
  });
}, [productosLaboratorio, productosSeleccionados, descuentosAplicados, porcentajesPorProducto, porcentajesGlobales, getProductId, getApiProductId]);

  // Descuentos para mostrar (del producto seleccionado)
  const descuentosParaMostrar = useMemo(() => {
    if (!productoSeleccionadoActual) return [];
    const productId = getProductId(productoSeleccionadoActual);
    return descuentosAplicados.filter(d => 
      d.codigo === productId || d.idproducto === productId || d.id === productId
    );
  }, [descuentosAplicados, productoSeleccionadoActual, getProductId]);

  // Efecto para enviar datos al componente padre
  useEffect(() => {
    const datosParaEnviar = {
      productosSeleccionados: productosConLista.map(prod => {
        const descuentos = getDescuentosProducto(prod);
        return {
          ...prod,
          descq: descuentos.qf,
          descprov: descuentos.prov,
          total: calcularTotal(prod.precio || 0, descuentos.qf, descuentos.prov)
        };
      }),
      porcentajeQFLab: porcentajesPorProducto._default.qf,
      porcentajeProvLab: porcentajesPorProducto._default.prov,
      selectedLabs,
      tipoProducto,
      searchTerm,
      descripcion,
      fechaInicio,
      fechaFin,
      canales,
      listas,
      descuentoPara,
      proveedorSeleccionado,
      laboratorioSeleccionado,
    };

    onDatosCambio(datosParaEnviar);
  }, [
    productosConLista,
    porcentajesPorProducto,
    selectedLabs,
    tipoProducto,
    searchTerm,
    descripcion,
    fechaInicio,
    fechaFin,
    canales,
    listas,
    descuentoPara,
    proveedorSeleccionado,
    laboratorioSeleccionado,
    onDatosCambio,
    getDescuentosProducto,
    calcularTotal
  ]);

  // Funciones para el modal de productos
  const handleOpenProductoModal = useCallback(() => {
    setOpenModalProducto(true);
  }, []);

  const handleCloseProductoModal = useCallback(() => {
    setOpenModalProducto(false);
  }, []);

  const handleToggleSelectProducto = useCallback((codigo) => {
    setSelectedProductos(prev =>
      prev.includes(codigo) ? prev.filter(i => i !== codigo) : [...prev, codigo]
    );
  }, []);

  const handleGuardarProductosSeleccionados = useCallback(() => {
    setProductosSeleccionados(prev => [...prev, ...selectedProductos]);
    setSelectedProductos([]);
    handleCloseProductoModal();
  }, [selectedProductos, handleCloseProductoModal]);

  // Funciones para el modal de laboratorios
  const handleOpenLabModal = useCallback(() => {
    setOpenModalLaboratorio(true);
    fetchLaboratorios('');
  }, []);

  const handleCloseLabModal = useCallback(() => {
    setOpenModalLaboratorio(false);
  }, []);

  const toggleSelectLab = useCallback((id) => {
    setSelectedLabs(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const fetchLaboratorios = useCallback(async (filtro) => {
    setLoading(prev => ({ ...prev, laboratorios: true }));
    try {
      const res = await axios.get(`${BASE_URL}/api/Descuento/buscarlaborat?filtro=${encodeURIComponent(filtro)}`);
      setLaboratorios(res.data);
    } catch (error) {
      setMensajeAlerta(`Error al cargar laboratorios: ${error.message}`);
      setOpenAlerta(true);
      setLaboratorios([]);
    } finally {
      setLoading(prev => ({ ...prev, laboratorios: false }));
    }
  }, []);

  const fetchProductos = useCallback(async () => {
    setLoading(prev => ({ ...prev, productos: true }));
    try {
      const response = await axios.get(`${BASE_URL}/api/Descuento/buscarproducto`, {
        params: {
          codigoproducto: '',
          nombreproducto: searchTerm,
          tipoproducto: tipoProducto || '',
          estado: '1',
          laboratorio: '',
          top: 25
        }
      });
      setProductos(response.data);
    } catch (error) {
      setMensajeAlerta(`Error al obtener productos: ${error.message}`);
      setOpenAlerta(true);
      setProductos([]);
    } finally {
      setLoading(prev => ({ ...prev, productos: false }));
    }
  }, [searchTerm, tipoProducto]);

  const handleTipoProductoChange = useCallback((e) => {
    setTipoProducto(e.target.value);
  }, []);
const handleProductoSeleccionado = useCallback(async (prod) => {
  const productoId = getApiProductId(prod);

  // Verificación robusta de duplicados
  const productoYaExiste = [...productosSeleccionados, ...productosLaboratorio].some(
    p => getApiProductId(p) === productoId
  );

  if (productoYaExiste) {
    setMensajeAlerta('Este producto ya ha sido seleccionado');
    setOpenAlerta(true);
    return; // Salir de la función si ya existe
  }

  // Inicialización del producto
  const nuevoProducto = {
    ...prod,
    idUnico: productoId,
    descq: porcentajesGlobales.qf,
    descprov: porcentajesGlobales.prov,
    lista: listas[0] || '',
     vvf: prod.vvf || 0  
  };

  // Actualización de estados (solo si no es duplicado)
  setProductosSeleccionados(prev => [...prev, nuevoProducto]);
  
  setPorcentajesPorProducto(prev => ({
    ...prev,
    [productoId]: {
      qf: porcentajesGlobales.qf,
      prov: porcentajesGlobales.prov
    }
  }));

  // Cargar precios
  try {
    const response = await axios.post(`${BASE_URL}/api/Descuento/obtener-precios`, {
      idProducto: productoId,
      listas: listas.join('|'),
    });

    if (response.data?.length > 0) {
      setDescuentosAplicados(prev => [
        ...prev.filter(d => getApiProductId(d) !== productoId),
        ...response.data.map(item => ({
          ...item,
          ...nuevoProducto,
          precio: item.precio,
          total: calcularTotal(item.precio, nuevoProducto.descq, nuevoProducto.descprov)
        }))
      ]);
    }
  } catch (error) {
    console.error('Error al obtener precios:', error);
    // Opcional: Revertir la selección si falla la API
    setProductosSeleccionados(prev => prev.filter(p => getApiProductId(p) !== productoId));
  }
}, [
  listas, 
  porcentajesGlobales, 
  calcularTotal,
  productosSeleccionados,
  productosLaboratorio,
  getApiProductId
]);

  const handleGuardarProductos = useCallback(() => {
    setProductosLaboratorio(prev => [...prev, ...selectedProductos]);
    setSelectedProductos([]);
    setOpenModalProducto(false);
  }, [selectedProductos]);

  const fetchProductosPorLaboratorio = useCallback(async (labId) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/Descuento/listarLabor`, {
        laboratorio: labId,
        producto: '',
        top: 200
      });
      return res.data;
    } catch (error) {
      setMensajeAlerta(`Error al obtener productos del laboratorio: ${error.message}`);
      setOpenAlerta(true);
      return [];
    }
  }, []);
const handleGuardarLab = useCallback(async () => {
  if (selectedLabs.length === 0) {
    setMensajeAlerta('Debe seleccionar al menos un laboratorio');
    setOpenAlerta(true);
    return;
  }

  setLoading(prev => ({ ...prev, productos: true }));
  try {
    const productosConPrecios = [];
    
    // 1. Obtener productos de cada laboratorio
    for (const labId of selectedLabs) {
      const productosLab = await fetchProductosPorLaboratorio(labId);
      
      // 2. Para cada producto, obtener sus precios y listas
      for (const producto of productosLab) {
        try {
          const productoId = getApiProductId(producto);
          
          const response = await axios.post(`${BASE_URL}/api/Descuento/obtener-precios`, {
            idProducto: productoId,
            listas: listas.join('|'),
          });

          // 3. Solo agregar si tiene datos válidos
          if (response.data && response.data.length > 0) {
            // Crear objeto producto con toda la información necesaria
            const productoConInfo = {
              ...producto,
              idUnico: productoId,
              descq: porcentajesGlobales.qf,
              descprov: porcentajesGlobales.prov,
              // Guardar TODOS los precios y listas disponibles
              todosLosPrecios: response.data,
              // Tomar el primer precio como principal para mostrar
              lista: response.data[0]?.lista || '',
              precio: response.data[0]?.precio || 0,
              total: calcularTotal(response.data[0]?.precio || 0, porcentajesGlobales.qf, porcentajesGlobales.prov)
            };
            
            productosConPrecios.push(productoConInfo);

            // 4. Inicializar descuentos para este producto
            setPorcentajesPorProducto(prev => ({
              ...prev,
              [productoId]: {
                qf: porcentajesGlobales.qf,
                prov: porcentajesGlobales.prov
              }
            }));

            // 5. Guardar en descuentos aplicados para cada lista
            const nuevosDescuentos = response.data.map(item => ({
              ...item,
              ...productoConInfo,
              precio: item.precio,
              total: calcularTotal(item.precio, porcentajesGlobales.qf, porcentajesGlobales.prov),
              qf: porcentajesGlobales.qf,
              prov: porcentajesGlobales.prov
            }));

            setDescuentosAplicados(prev => [
              ...prev.filter(d => getApiProductId(d) !== productoId),
              ...nuevosDescuentos
            ]);
          }
        } catch (error) {
          console.warn(`Producto ${producto.codigo} sin datos:`, error.message);
        }
      }
    }

    // 6. Actualizar estado con productos que tienen precios
    if (productosConPrecios.length > 0) {
      setProductosLaboratorio(prev => [...prev, ...productosConPrecios]);
      setMensajeAlerta(`Se agregaron ${productosConPrecios.length} productos con precios`);
      setOpenAlerta(true);
      handleCloseLabModal();
    } else {
      setMensajeAlerta('Los laboratorios seleccionados no tienen productos con precios configurados');
      setOpenAlerta(true);
    }
  } catch (error) {
    setMensajeAlerta(`Error al guardar laboratorios: ${error.message}`);
    setOpenAlerta(true);
  } finally {
    setLoading(prev => ({ ...prev, productos: false }));
  }
}, [selectedLabs, fetchProductosPorLaboratorio, handleCloseLabModal, listas, porcentajesGlobales, calcularTotal, getApiProductId]);
  // Efecto para aplicar descuentos iniciales
useEffect(() => {
  const productosSinDescuentos = [...productosLaboratorio, ...productosSeleccionados]
    .filter(prod => {
      const id = getProductId(prod);
      return !descuentosAplicados.some(d => getProductId(d) === id);
    });

  if (productosSinDescuentos.length > 0) {
    productosSinDescuentos.forEach(prod => {
      handleSeleccionarProducto(prod);
    });
  }
}, [productosLaboratorio, productosSeleccionados]); 
  useEffect(() => {
    if (openModalProducto) {
      fetchProductos();
    }
  }, [openModalProducto, searchTerm, tipoProducto, fetchProductos]);


  return (
    <>
      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid item>
          <Button variant="outlined" onClick={handleOpenLabModal}>
            Todo Laboratorio
          </Button>
        </Grid>
        <Grid item>
          <Button variant="outlined" onClick={handleOpenProductoModal}>
            Todo Producto
          </Button>
        </Grid>
      </Grid>

      <ProductosModal
        open={openModalProducto}
        onClose={handleCloseProductoModal}
        productos={productos}
        loading={loading.productos}
        searchTerm={searchTerm}
        tipoProducto={tipoProducto}
        selectedProductos={selectedProductos}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        onTipoChange={handleTipoProductoChange}
        onSelectProducto={handleProductoSeleccionado}
        onGuardar={handleGuardarProductosSeleccionados}
      />

      <LaboratoriosModal
        open={openModalLaboratorio}
        onClose={handleCloseLabModal}
        laboratorios={laboratorios}
  loading={loading.laboratorios || loading.productos} 
        searchTerm={searchTerm}
        porcentajeQFLab={porcentajeQFLab}
        porcentajeProvLab={porcentajeProvLab}
        selectedLabs={selectedLabs}
        onSearchChange={(e) => {
          const value = e.target.value;
          setSearchTerm(value);
          if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
          debounceTimeout.current = setTimeout(() => fetchLaboratorios(value), 500);
        }}
     onPorcentajeQFChange={handlePorcentajeQFChange}
  onPorcentajeProvChange={handlePorcentajeProvChange}
        onToggleLab={toggleSelectLab}
        onGuardar={handleGuardarLab}
      />

      <Box sx={{ mt: 4, display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Tabla: Productos Seleccionados */}
        <Box sx={{ width: { xs: '100%', md: '40%' }, minWidth: 300 }}>
          <Typography variant="h6" gutterBottom>Productos Seleccionados</Typography>
          <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
            <Box sx={{ minWidth: 600 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>TIPO</TableCell>
                    <TableCell>Cód</TableCell>
                    <TableCell>Producto</TableCell>
                    <TableCell>Laboratorio</TableCell>
                    <TableCell>Cantidad</TableCell>
                    <TableCell>VVF</TableCell>
                    <TableCell>Canal de Lista</TableCell>
                       <TableCell>Precio</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productosConLista.map((prod) => (
                    <TableRow 
                      key={prod.idUnico}
                      hover
                      onClick={() => handleSeleccionarProducto(prod)}
                      selected={productoSeleccionadoActual && prod.idUnico === getProductId(productoSeleccionadoActual)}
                    >
                      <TableCell>
                        <FormControl fullWidth variant="outlined" size="small">
                          <Select
                            value={prod.tipoSeleccionado || 'Primario'}
                            onChange={(e) => handleTipoChange(e, prod)}
                            label="Tipo"
                          >
                            <MenuItem value="Primario">Primario</MenuItem>
                            <MenuItem value="Secundario" disabled>Secundario</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>{prod.codigoproducto || prod.codigo}</TableCell>
                      <TableCell>{prod.producto}</TableCell>
                      <TableCell>{prod.laboratorio}</TableCell>
                      <TableCell>{1}</TableCell>
                      <TableCell>{prod.vvf || '0'}</TableCell>
                      <TableCell>{prod.lista}</TableCell>
                      <TableCell>{prod.precio}</TableCell>
                      <TableCell>
                        <IconButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDialogEliminar(prod);
                          }}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </Box>

        {/* Tabla: Descuentos Aplicados */}
        <Box sx={{ width: { xs: '100%', md: '60%' }, minWidth: 300 }}>
          <Typography variant="h6" gutterBottom>
            {productoSeleccionadoActual 
              ? `Descuentos para ${productoSeleccionadoActual.producto}` 
              : 'Seleccione un producto para ver descuentos'}
          </Typography>
          <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
            <Box sx={{ minWidth: 600 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Lista</TableCell>
                    <TableCell>PV</TableCell>
                    <TableCell>%D QF</TableCell>
                    <TableCell>%D Proveedor</TableCell>
                    <TableCell>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!productoSeleccionadoActual ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Seleccione un producto para ver sus descuentos
                      </TableCell>
                    </TableRow>
                  ) : descuentosParaMostrar.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        {loading.descuentos ? <CircularProgress size={24} /> : 'No hay descuentos para este producto'}
                      </TableCell>
                    </TableRow>
                  ) : descuentosParaMostrar.map((desc, idx) => {
                    const productoId = desc.codigo || desc.idproducto || desc.id;
                    const porcentajes = getDescuentosProducto(desc);

                    return (
                      <TableRow key={`${productoId}-${desc.lista}-${idx}`}>
                        <TableCell>{desc.lista}</TableCell>
                        <TableCell>{desc.precio}</TableCell>
                        <TableCell>
  <TextField
    type="number"
  value={porcentajesPorProducto[productoId]?.qf ?? porcentajesGlobales.qf}
  onChange={(e) => {
    const value = e.target.value;
    console.log('Input cambiado:', value); // Para depuración
    handleCambioPorcentaje(productoId, desc.lista, 'qf', value);
  }}
    size="small"
    inputProps={{ min: 0, step: 0.01 }}
  />
</TableCell>
<TableCell>
  <TextField
    type="number"
  value={porcentajesPorProducto[productoId]?.prov ?? porcentajesGlobales.prov}
 onChange={(e) => {
    const value = e.target.value;
    console.log('Input cambiado:', value); // Para depuración
    handleCambioPorcentaje(productoId, desc.lista, 'prov', value);
  }}
    size="small"
    inputProps={{ min: 0, step: 0.01 }}
  />
</TableCell>
                        <TableCell>{desc.total}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={openDialogEliminar}
        onClose={handleCloseDialogEliminar}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Está seguro que desea eliminar el producto {productoAEliminar?.producto}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogEliminar}>Cancelar</Button>
          <Button onClick={handleConfirmarEliminar} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openAlerta}
        autoHideDuration={6000}
        onClose={() => setOpenAlerta(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="warning" onClose={() => setOpenAlerta(false)}>
          {mensajeAlerta}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ConfigurarDescuentos;