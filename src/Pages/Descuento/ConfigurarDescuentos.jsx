import React, { useState, useEffect, useRef } from 'react';
import {
  Button, Grid, Modal, TextField, Typography, Box,
  Table, TableHead, TableBody, TableRow, TableCell,
  Paper, Checkbox, CircularProgress, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import axios from 'axios';
import { Snackbar, Alert } from '@mui/material';
export default function ConfigurarDescuentos({
  descripcion,
  fechaInicio,
  fechaFin,
  canales,
  listas,
  descuentoPara,
  proveedorSeleccionado,
  laboratorioSeleccionado,  onDatosCambio
}){
  
  const [mensajeAlerta, setMensajeAlerta] = useState('');
const [openAlerta, setOpenAlerta] = useState(false);

   const [openModalProducto, setOpenModalProducto] = useState(false);
  const [openModalLaboratorio, setOpenModalLaboratorio] = useState(false);
  const [porcentajeQFLab, setPorcentajeQFLab] = useState('');
  const [porcentajeProvLab, setPorcentajeProvLab] = useState('');
  const [laboratorios, setLaboratorios] = useState([]);
    const [productos, setProductos] = useState([]);
  const [loadingLabs, setLoadingLabs] = useState(false);
    const [loadingProductos, setLoadingProductos] = useState(false);
  const [selectedLabs, setSelectedLabs] = useState([]);
   const [selectedProductos, setSelectedProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [productosLaboratorio, setProductosLaboratorio] = useState([]);
const [tipoProducto, setTipoProducto] = useState('IS'); 
  const debounceTimeout = useRef(null);
  const [descuentosAplicadoss, setDescuentosAplicadoss] = useState([]);
const [productosSeleccionados, setProductosSeleccionados] = useState([]);
const productosMarcados = [...productosLaboratorio, ...productosSeleccionados];

  const handleOpenLabModal = () => {
    setOpenModalLaboratorio(true);
    fetchLaboratorios(''); // carga inicial
  };

  const handleCloseLabModal = () => setOpenModalLaboratorio(false);

  const toggleSelectLab = (id) => {
    setSelectedLabs(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const fetchLaboratorios = async (filtro) => {
    setLoadingLabs(true);
    try {
      const res = await axios.get(`https://localhost:7146/api/Descuento/buscarlaborat?filtro=${encodeURIComponent(filtro)}`);
      setLaboratorios(res.data);
    } catch {
      setLaboratorios([]);
    } finally {
      setLoadingLabs(false);
    }
  };

    const handleOpenProductoModal = () => {
    setOpenModalProducto(true);
    fetchProductos(); // Cargar los productos iniciales
  };

  // Cierra el modal de productos
  const handleCloseProductoModal = () => setOpenModalProducto(false);

  // Toggle para seleccionar un producto

  // Buscar productos con un top 25 por defecto
  const fetchProductos = async () => {
    setLoadingProductos(true);
    try {
      const response = await axios.get('https://localhost:7146/api/Descuento/buscarproducto', {
        params: {
          codigoproducto: '',       // vacío
          nombreproducto: searchTerm, // buscar por nombre de producto
          tipoproducto:tipoProducto || '', // filtrar por tipo de producto
          estado: 'HABILITADO',      // siempre habilitado
          laboratorio: '',           // vacío
          top: 25                    // máximo 25 resultados
        }
      });
      setProductos(response.data); // Actualizar los productos con la respuesta
    } catch (error) {
      console.error("Error al obtener productos:", error);
    } finally {
      setLoadingProductos(false);
    }
  };
  const handleTipoProductoChange = (e) => {
    const nuevoTipo = e.target.value;  // Obtener el tipo seleccionado
    setTipoProducto(nuevoTipo);        // Actualizar el estado del tipo de producto
    fetchProductos(nuevoTipo);         // Llamar a la API con el nuevo tipo de producto
  };

    const toggleSelectProducto = (codigo) => {
    setSelectedProductos((prevSelected) =>
      prevSelected.includes(codigo) 
        ? prevSelected.filter((item) => item !== codigo) 
        : [...prevSelected, codigo]
    );
  };
useEffect(() => {
  if (tipoProducto !== '') {
    fetchProductos(tipoProducto); // Realizar la llamada solo si tipoProducto tiene valor
  } else {
    fetchProductos(''); // Si tipoProducto está vacío, enviar '' a la API
  }
}, [tipoProducto]);


  // Guardar los productos seleccionados
 const handleGuardarProductos = () => {
    setProductosLaboratorio(productosSeleccionados);  // Reflect selected products
    handleCloseProductoModal();
  };
  

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => fetchLaboratorios(value), 500);
  };
 
// Función para manejar la selección de un producto y enviar la solicitud a la API
  const handleSeleccionarProducto = async (producto) => {
    const productoId = producto.idproducto || producto.id;
    if (!productoId || listas.length === 0) return;

    try {
      const response = await axios.post('https://localhost:7146/api/Descuento/obtener-precios', {
        idProducto: productoId,
        listas: listas.join('|'),
      });

      if (response.data && response.data.length > 0) {
        const qf = parseFloat(porcentajeQFLab) || 0;
        const prov = parseFloat(porcentajeProvLab) || 0;

        const nuevos = response.data.map(item => {
          const totalDescuento = qf + prov;
          const precio = parseFloat(item.precio) || 0;
          const precioFinal = precio - (precio * (totalDescuento / 100));

          return {
            ...item,
            qf,
            prov,
            total: precioFinal.toFixed(2)
          };
        });

        setDescuentosAplicadoss(nuevos);
      }
    } catch (error) {
      console.error("Error al obtener descuentos:", error);
    }
  };

  // Aquí el useEffect para ejecutar la llamada al API cuando cambian los productos


  const fetchProductosPorLaboratorio = async (labId) => {
    try {
      const res = await axios.post('https://localhost:7146/api/Descuento/listarLabor', {
        laboratorio: labId,
        producto: '',
        top: 200
      });
      return res.data;
    } catch {
      return [];
    }
  };

  const handleGuardarLab = async () => {
    const todos = [];
    for (const labId of selectedLabs) {
      const prods = await fetchProductosPorLaboratorio(labId);
      todos.push(...prods);
    }
    setProductosLaboratorio(todos);
    handleCloseLabModal();
  };

  const handleCambioPorcentaje = (codigo, campo, valor) => {
  setDescuentosAplicadoss(prev =>
    prev.map(item => {
      if (item.codigo === codigo) {
        const nuevoValor = parseFloat(valor) || 0;
        const nuevoQf = campo === 'qf' ? nuevoValor : item.qf || 0;
        const nuevoProv = campo === 'prov' ? nuevoValor : item.prov || 0;
        const totalDescuento = nuevoQf + nuevoProv;
        const precio = parseFloat(item.precio) || 0;
        const precioFinal = precio - (precio * (totalDescuento / 100));

        return {
          ...item,
          qf: nuevoQf,
          prov: nuevoProv,
          total: precioFinal.toFixed(2)
        };
      }
      return item;
    })
  );
};



 const handleProductoSeleccionado = (prod) => {
  const yaExiste = productosSeleccionados.some(p => p.codigo === prod.codigo) ||
                   productosLaboratorio.some(p => p.codigoproducto === prod.codigo);

  if (yaExiste) {
    setMensajeAlerta(`El producto "${prod.producto}" ya está en la lista de seleccionados`);
    setOpenAlerta(true);
    return; // No lo agrega de nuevo
  }

  setProductosSeleccionados(prev => [...prev, prod]);
};
  const productosFinal = productosLaboratorio;

  const descuentosAplicados = []; // Luego puedes calcular los descuentos
  const handleTipoChange = (e, index) => {
    const updatedProductos = [...productosLaboratorio];
    updatedProductos[index].tipoProducto = e.target.value;  // Actualiza el tipo del producto
    setProductosLaboratorio(updatedProductos);
  };
  
   useEffect(() => {
    const todosProductos = [...productosFinal, ...productosSeleccionados];
    todosProductos.forEach(prod => {
      handleSeleccionarProducto(prod);
    });
  }, [productosFinal, productosSeleccionados]);

  const productosConLista = [...productosFinal, ...productosSeleccionados].map(prod => {
    const descuento = descuentosAplicadoss.find(desc =>
      desc.codigo === prod.codigo || desc.idproducto === prod.idproducto || desc.id === prod.id
    );

    return {
      ...prod,
      lista: descuento?.lista || 'hola',
           PVV: descuento?.precio || 'hola',
      precio: descuento?.precio || null,
      total: descuento?.total || null,
   descq: descuento?.qf || null ,
      descprov:descuento?.prov || null
    };
  });

  useEffect(() => {
    const datosParaEnviar = {
      productosSeleccionados: productosConLista,
      porcentajeQFLab,
      porcentajeProvLab,
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

    console.log('Datos enviados a wizard:', datosParaEnviar);
    onDatosCambio(datosParaEnviar);
  }, [
    productosConLista,
    porcentajeQFLab,
    porcentajeProvLab,
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
  ]);
  return (
      <>
      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid item>
          <Button variant="outlined" onClick={handleOpenLabModal}>
            Todo Laboratorio
          </Button>
        </Grid>

       <Grid >
        <Grid item>
          <Button variant="outlined" onClick={handleOpenProductoModal}>
            Todo Producto
          </Button>
        </Grid>
      </Grid>
    </Grid>
     {/* Modal de Productos */}
   <Modal open={openModalProducto} onClose={handleCloseProductoModal}>
      <Box sx={{
        width: 600, bgcolor: 'background.paper', p: 4,
        borderRadius: 2, boxShadow: 24, mx: 'auto', mt: '10%',
        maxHeight: '80vh', overflowY: 'auto',
      }}>
        <Typography variant="h6" gutterBottom>Seleccionar Productos</Typography>

        {/* Campo de búsqueda de productos */}
        <TextField
          fullWidth label="Buscar productos"
          variant="outlined" value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Select para elegir el tipo de producto */}
        <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
          <InputLabel>Tipo de Producto</InputLabel>
          <Select
            value={tipoProducto}
            onChange={handleTipoProductoChange}
            label="Tipo de Producto"
          >
            <MenuItem value="EC">ECONOMATO</MenuItem>
            <MenuItem value="FM">FÓRMULA MAGISTRAL</MenuItem>
            <MenuItem value="IM">MATERIA PRIMA</MenuItem>
            <MenuItem value="IS">INSUMOS</MenuItem>
            <MenuItem value="ML">MATERIAL LABORATORIO</MenuItem>
            <MenuItem value="PK">PACK PROMOCIONAL</MenuItem>
            <MenuItem value="PT">PRODUCTO TERMINADO</MenuItem>
            <MenuItem value="SV">SERVICIOS</MenuItem>
              <MenuItem value="">TODOS</MenuItem>
          </Select>
        </FormControl>

        {/* Tabla de Productos */}
        <Paper variant="outlined" sx={{ maxHeight: 300, overflowY: 'auto' }}>
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
              {loadingProductos ? (
                <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={24} /></TableCell></TableRow>
              ) : productos.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center">No se encontraron productos.</TableCell></TableRow>
              ) : productos.map(prod => (
                <TableRow key={prod.codigoProducto}>
                  <TableCell padding="checkbox">
                   <Checkbox
          checked={productosSeleccionados.some(p => p.codigo === prod.codigo)}
          onChange={() => handleProductoSeleccionado(prod)}
        />  
                  </TableCell>
                  <TableCell>{prod.codigo}</TableCell>
                  <TableCell>{prod.producto}</TableCell>
                  <TableCell>{prod.tipoproducto}</TableCell>
                  <TableCell>{prod.unidadmedida}</TableCell>
                  <TableCell>{prod.laboratorio}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Button onClick={handleCloseProductoModal}>Cancelar</Button>
          <Button variant="contained" sx={{ ml: 2 }} onClick={() => {/* Guardar productos */}}>Guardar</Button>
        </Box>
      </Box>
    </Modal>
<Box
  sx={{
    mt: 4,
    display: 'flex',
    gap: 2,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    overflowX: 'auto'
  }}
>
  {/* Tabla: Productos Seleccionados */}
<Box sx={{ width: '40%', minWidth: 400 }}>
    <Typography variant="h6" gutterBottom>Productos Seleccionados</Typography>
    <Paper
      variant="outlined"
      sx={{
        maxHeight: 300,
        overflowX: 'auto',
        overflowY: 'auto',
      }}
    >
      <Box sx={{ minWidth: 800 }}>
  <Table size="small" stickyHeader>
  <TableHead>
  <TableRow>
    <TableCell>TIPO</TableCell>
    <TableCell>Cód</TableCell>
    <TableCell>Producto</TableCell>
    <TableCell>Laboratorio</TableCell>
    <TableCell>Cantidad</TableCell>
    <TableCell>VVF</TableCell>
    <TableCell>Canal de Lista</TableCell> {/* Nueva columna */}
  </TableRow>
</TableHead>
   <TableBody>
  {productosConLista.map((prod, idx) => (
<TableRow key={idx} onClick={() => handleSeleccionarProducto(prod)}>
      <TableCell>
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel>Tipo</InputLabel>
          <Select
            value={prod.tipoSeleccionado || 'Primario'}
            onChange={(e) => handleTipoChange(e, idx)}
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
      <TableCell>{prod.lista}</TableCell> {/* ✅ Aquí aparece la lista del API */}
    </TableRow>
  ))}
</TableBody>
  </Table>
</Box>
    </Paper>
  </Box>

  {/* Tabla: Descuentos Aplicados */}
<Box sx={{ width: '60%', minWidth: 600 }}>
    <Typography variant="h6" gutterBottom>Descuentos Aplicados</Typography>
    <Paper
      variant="outlined"
      sx={{
        maxHeight: 300,
        overflowX: 'auto',
        overflowY: 'auto',
      }}
    >
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
            {descuentosAplicadoss.map((desc, idx) => (
              <TableRow key={idx}>
                <TableCell>{desc.lista}</TableCell>
                <TableCell>{desc.precio}</TableCell>
            <TableCell>
  <TextField
    type="number"
    value={desc.qf}
    onChange={(e) => handleCambioPorcentaje(desc.codigo, 'qf', e.target.value)}
    size="small"
    inputProps={{ min: 0 }}
  />
</TableCell>
              <TableCell>
  <TextField
    type="number"
    value={desc.prov}
    onChange={(e) => handleCambioPorcentaje(desc.codigo, 'prov', e.target.value)}
    size="small"
    inputProps={{ min: 0 }}
  />
</TableCell>
                <TableCell>{desc.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  </Box>
</Box>

      <Modal open={openModalLaboratorio} onClose={handleCloseLabModal}>
        <Box sx={{
          width: 600, bgcolor: 'background.paper', p: 4,
          borderRadius: 2, boxShadow: 24, mx: 'auto', mt: '10%',
          maxHeight: '80vh', overflowY: 'auto',
        }}>
          <Typography variant="h6" gutterBottom>Asignar Descuento a Todo Laboratorio</Typography>
          <TextField
            fullWidth label="Buscar laboratorios"
            variant="outlined" value={searchTerm}
            onChange={handleSearchChange} sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="% QF" type="number"
              value={porcentajeQFLab} onChange={e => setPorcentajeQFLab(e.target.value)} fullWidth
            />
            <TextField
              label="% Proveedor" type="number"
              value={porcentajeProvLab} onChange={e => setPorcentajeProvLab(e.target.value)} fullWidth
            />
          </Box>
          <Paper variant="outlined" sx={{ maxHeight: 300, overflowY: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Descripción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingLabs ? (
                  <TableRow><TableCell colSpan={3} align="center"><CircularProgress size={24}/></TableCell></TableRow>
                ) : laboratorios.length === 0 ? (
                  <TableRow><TableCell colSpan={3} align="center">No hay laboratorios.</TableCell></TableRow>
                ) : laboratorios.map(lab => (
                  <TableRow key={lab.idLaboratorio}>
                    <TableCell padding="checkbox">
                      <Checkbox checked={selectedLabs.includes(lab.idLaboratorio)}
                                onChange={() => toggleSelectLab(lab.idLaboratorio)} />
                    </TableCell>
                    <TableCell>{lab.idLaboratorio}</TableCell>
                    <TableCell>{lab.descripcion}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Button onClick={handleCloseLabModal}>Cancelar</Button>
            <Button variant="contained" sx={{ ml: 2 }} onClick={handleGuardarLab}>Guardar</Button>
          </Box>
        </Box>
      </Modal>
      <Snackbar
  open={openAlerta}
  autoHideDuration={3000}
  onClose={() => setOpenAlerta(false)}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
>
  <Alert severity="warning" onClose={() => setOpenAlerta(false)}>
    {mensajeAlerta}
  </Alert>
</Snackbar>
    </>
  );
}