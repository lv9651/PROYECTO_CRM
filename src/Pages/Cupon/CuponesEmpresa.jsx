import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, TextField, Button, Paper,
  Table, TableHead, TableRow, TableCell, TableBody,
  FormControl, Select, MenuItem, Alert, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Popper,Checkbox, FormControlLabel 
} from '@mui/material';
import { Autocomplete } from '@mui/material';
import { useAuth } from '../../Compo/AuthContext';
import { BASE_URL } from '../../Conf/config';
const obtenerProductosDesdeJson = (js) => {
  try {
    const p = JSON.parse(js);
    return Array.isArray(p) ? p.map(i => i.descripcion) : [];
  } catch { return []; }
};

const obtenerSucursalesDesdeJson = (js) => {
  try {
    const s = JSON.parse(js);
    return Array.isArray(s) ? s.map(i => i.descripcion) : [];
  } catch { return []; }
};


const obtenerListaprecioDesdeJson = (js) => {
  try {
    const s = JSON.parse(js);
    return Array.isArray(s) ? s.map(i => i.descripcion) : [];
  } catch { return []; }
};

const obtenerCanalVentaDesdeJson = (js) => {
  try {
    const s = JSON.parse(js);
    return Array.isArray(s) ? s.map(i => i.descripcion) : [];
  } catch { return []; }
};

const obtenerClienteesdeJson = (js) => {
  try {
    const s = JSON.parse(js);
    return Array.isArray(s) ? s.map(i => i.descripcion) : [];
  } catch { return []; }
};


const obtenerDiasdesdeJson = (js) => {
  try {
    const dias = JSON.parse(js);
    return Array.isArray(dias) ? dias : [];
  } catch {
    return [];
  }
};

const obtenerMontoDesdeJson = (js) => {
  try {
    const p = JSON.parse(js);
    return (Array.isArray(p) && p.length > 0) ? p[0].descuento : 0;
  } catch { return 0; }
};



const CustomPopper = (props) => {
  return (
    <Popper
      {...props}
      style={{ ...props.style, width: '850px', maxHeight: '300px', overflowY: 'auto', zIndex: 1500 }}
      placement="bottom-start"
    />
  );
};

const GestionCupones = () => {
  const { user } = useAuth();
  const [nombreCupon, setNombreCupon] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [limite, setLimite] = useState('');
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [sucursalesSeleccionadas, setSucursalesSeleccionadas] = useState([]);
  const [ListaPrecioSeleccionadas, setListaPrecioSeleccionadas] = useState([]);
  const [filtroCliente, setFiltroCliente] = useState('');
  const [ClienteSeleccionadas, setClienteSeleccionadas] = useState([]);
  const [CanalVentaSeleccionadas, setCanalVentaSeleccionadas] = useState([]);
  const [monto, setMonto] = useState('');
  const [cupones, setCupones] = useState([]);
  const [error, setError] = useState('');
  const [productosAPI, setProductosAPI] = useState([]);
  const [sucursalesAPI, setSucursalesAPI] = useState([]);
  const [ListadepreciosAPI, setListadepreciosAPI] = useState([]);
  const [CanalVentaAPI, setCanalVentaAPI] = useState([]);
   const [ClientesAPI, setClientesAPI] = useState([]);
const [listaPrecio, setListaPrecio] = useState('');

  // Estado para el diálogo
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogContent, setDialogContent] = useState('');
const [sinLimite, setSinLimite] = useState(false);
const [mensajeExito, setMensajeExito] = useState('');
const [diasSeleccionados, setDiasSeleccionados] = useState([]);
const diasSemana = [
  { label: 'Lunes', value: 'lunes' },
  { label: 'Martes', value: 'martes' },
  { label: 'Miércoles', value: 'miercoles' },
  { label: 'Jueves', value: 'jueves' },
  { label: 'Viernes', value: 'viernes' },
  { label: 'Sábado', value: 'sabado' },
  { label: 'Domingo', value: 'domingo' },
];

  const handleOpenDialog = (title, contentArray) => {
    setDialogTitle(title);
    setDialogContent(contentArray.join('\n'));
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

useEffect(() => {
  console.log("🧪 empresa:", empresa, "| filtroCliente:", filtroCliente, "| longitud:", filtroCliente.length);

  if (!empresa ) {
    console.log('⛔ No se ejecuta fetch porque falta empresa o filtro < 2');
    return;
  }

  const endpointListar = empresa === 'QF'
    ? `${BASE_URL}/api/Empresa/listar/QF`
    : `${BASE_URL}/api/Empresa/listar/MS`;

  fetch(endpointListar)
    .then(res => res.json())
    .then(data => {
      const list = data.map(c => ({
        id: c.iddescuento,
        nombre: c.descripcion,
        fechaInicio: c.fechainicio?.split('T')[0],
        fechaFin: c.fechafin?.split('T')[0],
        limite: c.limite,
        productos: obtenerProductosDesdeJson(c.idproducto),
        sucursales: obtenerSucursalesDesdeJson(c.idsucursal),
        monto: obtenerMontoDesdeJson(c.idproducto),
        listaprecio: obtenerListaprecioDesdeJson(c.idlistaprecio),
        canalventa: obtenerCanalVentaDesdeJson(c.idcanalventa),
        monto: obtenerMontoDesdeJson(c.idproducto),
        clientes: obtenerClienteesdeJson(c.idcliente),
          dias: obtenerDiasdesdeJson(c.dias),
      }));
      setCupones(list);
    })
    .catch(() => setError('Error al cargar cupones existentes'));
}, [empresa]);

  useEffect(() => {
    if (!empresa) return;
    fetch(`${BASE_URL}/api/empresa/${empresa}`)
      .then(res => res.json())
      .then(data => {
        setProductosAPI(data.productos || []);
        setSucursalesAPI(data.sucursales || []);
          setListadepreciosAPI(data.listaPrecio || []);
           setCanalVentaAPI(data.canalventas || []);
           
        setProductosSeleccionados([]);
        setSucursalesSeleccionadas([]);
         setListaPrecioSeleccionadas ([]);
          setCanalVentaSeleccionadas ([]);
         
        setMonto('');
      })
      .catch(() => setError('Error al cargar datos desde la API'));
  }, [empresa]);

 useEffect(() => {
  console.log("✅ useEffect ejecutado. Empresa:", empresa, "Filtro:", filtroCliente);

  if (!empresa || filtroCliente.length < 2) {
    console.log('⛔ No se ejecuta fetch porque falta empresa o filtro < 2');
    return;
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    fetch(`${BASE_URL}/api/Empresa/buscar?empresa=${empresa}&filtro=${filtroCliente}`, {
      signal: controller.signal,
    })
      .then(async res => {
        const text = await res.text();
        console.log("📥 Respuesta en texto:", text); // <-- IMPORTANTE

        if (!text) {
          console.warn("⚠️ Respuesta vacía");
          return [];
        }

        try {
          const data = JSON.parse(text);
          console.log("✅ JSON parseado correctamente:", data);
          setClientesAPI(data);
        } catch (err) {
          console.error("❌ Error al parsear JSON:", err);
          setClientesAPI([]);
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error("❌ Error en fetch:", err);
        }
      });
  }, 300);

  return () => {
    controller.abort();
    clearTimeout(timeout);
  };
}, [empresa, filtroCliente]);

  const crearCupon = () => {
    setError('');
    if (!nombreCupon || !empresa || !fechaInicio || !fechaFin || 
        productosSeleccionados.length === 0 || sucursalesSeleccionadas.length === 0 || !monto) {
      setError('Todos los campos son obligatorios');
      return;
    }
    if (new Date(fechaInicio) > new Date(fechaFin)) {
      setError('La fecha de inicio no puede ser mayor a la fecha de fin');
      return;
    }
    if (isNaN(limite) || parseInt(limite, 10) <= 0) {
      setError('El límite debe ser un número mayor a 0');
      return;
    }

   
    const nuevoCupon = {
      nombre: nombreCupon,
      empresa,
      fechaInicio,
      fechaFin,
      limite: parseInt(limite, 10),
      productos: productosSeleccionados.map(p => p.nombre),
      sucursales: sucursalesSeleccionadas.map(s => s.descripcion),
      monto,
      creado: new Date().toLocaleDateString()
    };
    setCupones(prev => [nuevoCupon, ...prev]);

  if (isNaN(monto) || parseFloat(monto) < 0 || parseFloat(monto) > 100) {
  setError('El monto debe ser un número entre 0 y 100');
  return;
}

const todosClientes = ClienteSeleccionadas.length === 1 && ClienteSeleccionadas[0].cliTercero_codigo === '*';
const todosProductos= productosSeleccionados.length === 1 && productosSeleccionados[0].idproducto === '*';

    const jsonParaGuardar = {
      iddescuento: 0,
      descripcion: nombreCupon,
      fechainicio: new Date(fechaInicio).toISOString(),
      fechafin: new Date(fechaFin).toISOString(),
      idtipodescuento: 4,
      todosucursal: sucursalesSeleccionadas.length === sucursalesAPI.length,
      idsucursal: JSON.stringify(sucursalesSeleccionadas.map(s => ({
        idsucursal: s.idsucursal,
        descripcion: s.descripcion
      }))),
     todolistaprecio: ListaPrecioSeleccionadas.length === ListadepreciosAPI.length,
 idlistaprecio: ListaPrecioSeleccionadas.length === 0 
  ? '' 
  : JSON.stringify(ListaPrecioSeleccionadas.map(t => ({
      idlistaprecio: t.idlistaprecio,
      descripcion: t.descripcion
    }))),
dias: empresa === 'QF' ? JSON.stringify(diasSeleccionados) : '',
tododias: diasSeleccionados.length === 7 ? true : false,
     todoproducto: todosProductos,
      descuentotodotipoproducto: 0.0,
      idtipoproducto: '',
      excluiridproducto: '',

  descuentotodoproducto: todosProductos ? parseFloat(monto) / 100 : 0.0,
   idproducto: todosProductos
  ? '*'
  : JSON.stringify(productosSeleccionados.map(p => ({
      idproducto: p.idproducto,
      descripcion: p.nombre,
      descuento: parseFloat(monto) / 100
    }))),
    todocliente:todosClientes,
    descuentotodocliente: todosClientes ? parseFloat(monto) / 100 : 0.0,
      idcliente:  todosClientes
    ? '*'
    : ClienteSeleccionadas.length === 0 
      ? '' 
      : JSON.stringify(ClienteSeleccionadas.map(z => ({
          cliTercero_codigo: z.cliTercero_codigo,
          nrodocumento: z.nrodocumento,
          descripcion: z.descripcion
        }))),
      idestado: 1,
      usuariomanipula: user?.emp_codigo || 0,
   limite: sinLimite || !limite ? 0 : parseInt(limite),
        es_ilimitado:sinLimite,
        idcanalventa:  CanalVentaSeleccionadas.length === 0
  ? ''
  : JSON.stringify(CanalVentaSeleccionadas.map(x => ({
      idcanalventa: x.idcanalventa,
      descripcion: x.descripcion
    }))),
        todocanalventa: CanalVentaSeleccionadas.length === CanalVentaAPI.length,
      
    };

 fetch(`${BASE_URL}/api/Empresa/guardar/${empresa}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(jsonParaGuardar)
})
 .then(res => res.json())
.then(data => {
  if (!(Array.isArray(data) || (data && typeof data === 'object' && 'mensaje' in data))) {
    console.error("Respuesta inesperada, se esperaba un array o un objeto con 'mensaje':", data);
    setError("La respuesta del servidor no es válida.");
    return;
  }
    const list = data.map(c => ({
      id: c.iddescuento,
      nombre: c.descripcion,
      fechaInicio: c.fechainicio?.split('T')[0],
      fechaFin: c.fechafin?.split('T')[0],
      limite: c.limite,
      productos: obtenerProductosDesdeJson(c.idproducto),
      sucursales: obtenerSucursalesDesdeJson(c.idsucursal),
      monto: obtenerMontoDesdeJson(c.idproducto),
      creado: new Date(c.fechacreacion).toLocaleDateString()
    }));

    setCupones(list);

    // 🔄 Luego del guardado, hacer el listar
    const endpointListar = empresa === 'QF'
      ? `${BASE_URL}/api/Empresa/listar/QF`
      : `${BASE_URL}/api/Empresa/listar/MS`;

    fetch(endpointListar)
      .then(res => res.json())
      .then(data => setCupones(data))
      .catch(err => console.error('Error al listar cupones:', err));
  })
  .catch(err => console.error('Error al guardar cupón:', err));
    setNombreCupon('');
    setEmpresa('');
    setFechaInicio('');
    setFechaFin('');
    setLimite('');

    setProductosSeleccionados([]);
    setSucursalesSeleccionadas([]);
     setListaPrecioSeleccionadas([]);
     setCanalVentaSeleccionadas([]);
       setClienteSeleccionadas([]);

    setMonto('');
  };
  const estiloCeldaLista = {
  fontSize: '0.8rem',
  maxWidth: 140,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  cursor: 'pointer'
};

   const eliminarCupon = (id) => {
  if (!window.confirm('¿Estás seguro de eliminar este cupón?')) return;

  if (!empresa) {
    setError('Debe seleccionar una empresa antes de eliminar');
    return;
  }

  fetch(`${BASE_URL}/api/empresa/${id}?empresa=${empresa}`, {
    method: 'DELETE'
  })
    .then(res => {
      if (!res.ok) throw new Error('Error al eliminar');
      setCupones(prev => prev.filter(c => c.id !== id));
    })
    .catch(() => setError('No se pudo eliminar el cupón'));
};
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Cupones por Empresa
      </Typography>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
{mensajeExito && <Alert severity="success" sx={{ mb: 2 }}>{mensajeExito}</Alert>}
      {/* Formulario */}
      <Box display="flex" flexDirection="column" gap={2} mb={4}>
        <TextField label="Nombre del cupón" value={nombreCupon} onChange={e => setNombreCupon(e.target.value)} fullWidth />
        <FormControl fullWidth>
          <InputLabel>Empresa</InputLabel>
          <Select value={empresa} onChange={e => setEmpresa(e.target.value)} label="Empresa">
            <MenuItem value="">Seleccione empresa</MenuItem>
            <MenuItem value="QF">QF</MenuItem>
            <MenuItem value="MS">MS</MenuItem>
          
          </Select>
        </FormControl>
        {empresa && (
          <>
          <Autocomplete
  multiple
  disableCloseOnSelect
  options={[{ nombre: '__ALL__', idproducto: '*' }, ...productosAPI]}
  getOptionLabel={(option) =>
    option.nombre === '__ALL__'
      ? 'Todos los productos'
      : option.nombre
  }
  value={
    productosSeleccionados.length === 1 && productosSeleccionados[0].idproducto === '*'
      ? [{ nombre: '__ALL__', idproducto: '*' }]
      : productosSeleccionados
  }
  onChange={(e, val) => {
    if (val.some(x => x.nombre === '__ALL__')) {
      setProductosSeleccionados([{ nombre: '__ALL__', idproducto: '*' }]);
    } else {
      setProductosSeleccionados(val);
    }
  }}
  isOptionEqualToValue={(o, v) => o.idproducto === v.idproducto}
  renderTags={(selected, getTagProps) => {
    if (
      selected.length === 1 &&
      selected[0].idproducto === '*'
    ) {
      return (
        <span {...getTagProps({ index: 0 })}>
          Todos los productos
        </span>
      );
    }

    return selected.map((option, index) => (
      <span key={index} {...getTagProps({ index })}>
        {option.nombre}
      </span>
    ));
  }}
  renderInput={(params) => (
    <TextField {...params} label="Productos" placeholder="Buscar producto" />
  )}
  PopperComponent={CustomPopper}
/>
           <Autocomplete
  multiple
  options={[{ descripcion: '__ALL__' }, ...sucursalesAPI]}
  getOptionLabel={option => option.descripcion === '__ALL__' ? 'Todas las sucursales' : option.descripcion}
  value={sucursalesSeleccionadas}
  onChange={(e, val) =>
    val.some(x => x.descripcion === '__ALL__')
      ? setSucursalesSeleccionadas(sucursalesAPI)
      : setSucursalesSeleccionadas(val)
  }
  isOptionEqualToValue={(o, v) => o.descripcion === v.descripcion}
  renderTags={(selected, getTagProps) => {
    if (selected.length === sucursalesAPI.length) {
      return ['Todas las sucursales'].map((value, index) => (
        <span key={index} style={{ padding: '4px 8px', background: '#e0f2f1', borderRadius: 8 }}>
          {value}
        </span>
      ));
    }
    return selected.map((option, index) => (
      <span key={index} style={{ padding: '4px 8px', background: '#f0f0f0', borderRadius: 8 }}>
        {option.descripcion}
      </span>
    ));
  }}
  renderInput={params => <TextField {...params} label="Sucursales" placeholder="Buscar..." />}
  PopperComponent={CustomPopper}
/>
            <TextField label="Monto %" type="number" value={monto} onChange={e => setMonto(e.target.value)} fullWidth />
          </>
        )}
        {empresa === 'QF' && (
          <>
<Autocomplete
  multiple
  options={[{ descripcion: '__ALL__' }, ...ListadepreciosAPI]}
  getOptionLabel={option =>
    option.descripcion === '__ALL__' ? 'Todas las listas de precio' : option.descripcion
  }
  value={ListaPrecioSeleccionadas}
  onChange={(e, val) =>
    val.some(x => x.descripcion === '__ALL__')
      ? setListaPrecioSeleccionadas(ListadepreciosAPI)
      : setListaPrecioSeleccionadas(val)
  }
  isOptionEqualToValue={(o, v) => o.descripcion === v.descripcion}
  renderTags={(selected, getTagProps) => {
    if (selected.length === ListadepreciosAPI.length) {
      return ['Todas las listas de precio'].map((value, index) => (
        <span key={index} style={{ padding: '4px 8px', background: '#e0f7fa', borderRadius: 8 }}>
          {value}
        </span>
      ));
    }
    return selected.map((option, index) => (
      <span key={index} style={{ padding: '4px 8px', background: '#f0f0f0', borderRadius: 8 }}>
        {option.descripcion}
      </span>
    ));
  }}
  renderInput={params => (
    <TextField {...params} label="Lista de precio" placeholder="Buscar..." />
  )}
  PopperComponent={CustomPopper}
/>

        <Autocomplete
  multiple
  options={[{ descripcion: '__ALL__' }, ...CanalVentaAPI]}
  getOptionLabel={option =>
    option.descripcion === '__ALL__' ? 'Todos los canales de venta' : option.descripcion
  }
  value={CanalVentaSeleccionadas}
  onChange={(e, val) =>
    val.some(x => x.descripcion === '__ALL__')
      ? setCanalVentaSeleccionadas(CanalVentaAPI)
      : setCanalVentaSeleccionadas(val)
  }
  isOptionEqualToValue={(o, v) => o.descripcion === v.descripcion}
  renderTags={(selected, getTagProps) => {
    if (selected.length === CanalVentaAPI.length) {
      return ['Todos los canales de venta'].map((value, index) => (
        <span key={index} style={{ padding: '4px 8px', background: '#e0f7fa', borderRadius: 8 }}>
          {value}
        </span>
      ));
    }
    return selected.map((option, index) => (
      <span key={index} style={{ padding: '4px 8px', background: '#f0f0f0', borderRadius: 8 }}>
        {option.descripcion}
      </span>
    ));
  }}
  renderInput={params => (
    <TextField {...params} label="Canal venta" placeholder="Buscar..." />
  )}
  PopperComponent={CustomPopper}
/>
            

<Autocomplete
  multiple
  disableCloseOnSelect
  options={[{ descripcion: '__ALL__', cliTercero_codigo: '*' }, ...ClientesAPI]}
  getOptionLabel={(option) =>
    option.descripcion === '__ALL__'
      ? 'Todos los clientes'
      : `${option.descripcion} - ${option.nrodocumento}`
  }
  value={
    ClienteSeleccionadas.length === 1 && ClienteSeleccionadas[0].cliTercero_codigo === '*'
      ? [{ descripcion: '__ALL__', cliTercero_codigo: '*' }]
      : ClienteSeleccionadas
  }
  onInputChange={(e, value) => setFiltroCliente(value)}
  onChange={(e, val) => {
    if (val.some(x => x.descripcion === '__ALL__')) {
      setClienteSeleccionadas([{ descripcion: '__ALL__', cliTercero_codigo: '*' }]); // solo uno
    } else {
      setClienteSeleccionadas(val);
    }
  }}
  isOptionEqualToValue={(o, v) => o.cliTercero_codigo === v.cliTercero_codigo}
  renderTags={(selected, getTagProps) => {
    if (
      selected.length === 1 &&
      selected[0].cliTercero_codigo === '*'
    ) {
      return (
        <span {...getTagProps({ index: 0 })}>
          Todos los clientes
        </span>
      );
    }

    return selected.map((option, index) => (
      <span key={index} {...getTagProps({ index })}>
        {option.descripcion} - {option.nrodocumento}
      </span>
    ));
  }}
  renderInput={(params) => (
    <TextField {...params} label="Clientes" placeholder="Buscar por nombre o documento" />
  )}
  PopperComponent={CustomPopper}
/>
  <Box>
    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
      Días habilitados del cupón
    </Typography>
    <Box display="flex" flexWrap="wrap" gap={2}>
      {diasSemana.map(dia => (
        <FormControlLabel
          key={dia.value}
          control={
            <Checkbox
              checked={diasSeleccionados.includes(dia.value)}
              onChange={(e) => {
                if (e.target.checked) {
                  setDiasSeleccionados(prev => [...prev, dia.value]);
                } else {
                  setDiasSeleccionados(prev => prev.filter(d => d !== dia.value));
                }
              }}
            />
          }
          label={dia.label}
        />
      ))}
    </Box>
  </Box>
        </>    
)}
        <Box display="flex" gap={2}>
          <TextField label="Fecha Inicio" type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
          <TextField label="Fecha Fin" type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
        </Box>
        <FormControlLabel
  control={
    <Checkbox
      checked={sinLimite}
      onChange={(e) => {
        setSinLimite(e.target.checked);
        if (e.target.checked) {
          setLimite('');
        }
      }}
    />
  }
  label="Sin límite"
/>
        <TextField
  label="Límite de uso"
  type="number"
  value={limite}
  onChange={e => setLimite(e.target.value)}
  fullWidth
  disabled={sinLimite}
/>
      
        <Button variant="contained" onClick={crearCupon}>Crear Cupón</Button>
      </Box>

      {/* Tabla */}
      {cupones.length > 0 && (
      <Box sx={{ mt: 4, pl: 4, pr: 2 }}>
  <Paper elevation={3} sx={{ borderRadius: 3, p: 2, backgroundColor: '#fefefe' }}>
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#e0f7fa' }}>
            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem', width: 180 }}>Nombre</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem', width: 200 }}>Productos</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem', width: 200 }}>Sucursales</TableCell>
            {empresa === 'QF' && (
              <>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem', width: 180 }}>Lista Precio</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem', width: 180 }}>Canal Venta</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem', width: 200 }}>Clientes</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem', width: 140 }}>Días</TableCell>
              </>
            )}
            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem', width: 80, textAlign: 'center' }}>%</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem', width: 120 }}>Inicio</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem', width: 120 }}>Fin</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem', width: 100, textAlign: 'center' }}>Límite</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem', width: 100, textAlign: 'center' }}>Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {cupones.map((c, i) => (
            <TableRow
              key={i}
              hover
              sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}
            >
              <TableCell sx={{ fontSize: '0.85rem' }}>{c.nombre}</TableCell>
              <TableCell sx={estiloCeldaLista} onClick={() => handleOpenDialog('Productos', c.productos)} title={c.productos.join(', ')}>
                {c.productos.join(', ')}
              </TableCell>
              <TableCell sx={estiloCeldaLista} onClick={() => handleOpenDialog('Sucursales', c.sucursales)} title={c.sucursales.join(', ')}>
                {c.sucursales.join(', ')}
              </TableCell>

              {empresa === 'QF' && (
                <>
                  <TableCell sx={estiloCeldaLista} onClick={() => handleOpenDialog('Lista de Precio', c.listaprecio)} title={c.listaprecio?.join(', ')}>
                    {(c.listaprecio || []).join(', ')}
                  </TableCell>
                  <TableCell sx={estiloCeldaLista} onClick={() => handleOpenDialog('Canal Venta', c.canalventa)} title={c.canalventa?.join(', ')}>
                    {(c.canalventa || []).join(', ')}
                  </TableCell>
                  <TableCell sx={estiloCeldaLista} onClick={() => handleOpenDialog('Clientes', c.clientes)} title={c.clientes?.join(', ')}>
                    {(c.clientes || []).join(', ')}
                  </TableCell>
              <TableCell
  sx={estiloCeldaLista}
  onClick={() => handleOpenDialog('Días', c.dias)}
  title={(c.dias || []).join(', ')}
>
  {(c.dias || []).join(', ')}
</TableCell>
                </>
              )}

              <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center' }}>{(c.monto * 100).toFixed(0)}%</TableCell>
              <TableCell sx={{ fontSize: '0.8rem' }}>{c.fechaInicio}</TableCell>
              <TableCell sx={{ fontSize: '0.8rem' }}>{c.fechaFin}</TableCell>
              <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center' }}>{c.limite}</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => eliminarCupon(c.id)}
                >
                  Eliminar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  </Paper>
</Box>
      )}

      {/* Diálogo */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent dividers>
          <DialogContentText style={{ whiteSpace: 'pre-wrap' }}>
            {dialogContent}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GestionCupones;