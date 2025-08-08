import React, { useState, useEffect, useRef } from 'react';
import {
  Button, Grid, Modal, TextField, Typography, Box,
  Table, TableHead, TableBody, TableRow, TableCell,
  Paper, Checkbox, CircularProgress, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import axios from 'axios';

export default function ConfigurarDescuentos({
  descripcion,
  fechaInicio,
  fechaFin,
  canales,
  listas,
  descuentoPara,
  proveedorSeleccionado,
  laboratorioSeleccionado
}){
  
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
  // Verificamos que haya un idProducto o id y que haya listas seleccionadas
    console.log(producto);
  const productoId = producto.idproducto || producto.id; // Primero intentamos con idProducto, si no, usamos id

  if (!productoId || listas.length === 0) return;

  try {
    // Hacer la llamada a la API para obtener descuentos aplicados
    const response = await axios.post('https://localhost:7146/api/Descuento/obtener-precios', {
      idProducto: productoId,  // Enviamos el idProducto o id
      listas: listas.join('|') // Concatenamos las listas seleccionadas
    });

    // Comprobamos si la API devuelve descuentos
    if (response.data && response.data.length > 0) {
      setDescuentosAplicadoss(prevDescuentos => [
        ...prevDescuentos,
        ...response.data
      ]);
    }
  } catch (error) {
    console.error("Error al obtener descuentos:", error);
  }
};
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
  const handleProductoSeleccionado = (prod) => {
    setProductosSeleccionados((prevSeleccionados) => {
      if (prevSeleccionados.some(p => p.codigo === prod.codigo)) {
        return prevSeleccionados.filter(p => p.codigo !== prod.codigo);
      } else {
        return [...prevSeleccionados, prod];
      }
    });
  };
  const productosFinal = productosLaboratorio;

  const descuentosAplicados = []; // Luego puedes calcular los descuentos
  const handleTipoChange = (e, index) => {
    const updatedProductos = [...productosLaboratorio];
    updatedProductos[index].tipoProducto = e.target.value;  // Actualiza el tipo del producto
    setProductosLaboratorio(updatedProductos);
  };
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
      </TableRow>
    </TableHead>
    <TableBody>
      {/* Combina productosFinal y productosSeleccionados */}
      {[...productosFinal, ...productosSeleccionados].map((prod, idx) => (
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
          
          {/* Usar `codigoproducto` para productosFinal y `codigo` para productosSeleccionados */}
          <TableCell>{prod.codigoproducto || prod.codigo}</TableCell>
          <TableCell>{prod.producto}</TableCell>
          <TableCell>{prod.laboratorio}</TableCell>
          <TableCell>{1}</TableCell> {/* Cantidad está fija en 1, puedes cambiarla si es necesario */}
          <TableCell>{prod.vvf || '0'}</TableCell> {/* Si no hay "vvf", mostrar "N/A" */}
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
                <TableCell>{desc.qf}%</TableCell>
                <TableCell>{desc.prov}%</TableCell>
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
    </>
  );
}