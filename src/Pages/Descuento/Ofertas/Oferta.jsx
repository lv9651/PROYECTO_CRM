import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Chip,
} from "@mui/material";
import { PlusCircle, Save, Trash2, MapPin } from "lucide-react";
import ModalAgregarProducto from "./ModalAgregarProducto";
import ModalSucursal from "./ModalSucursal";
import { useAuth } from '../../../Compo/AuthContext';
import ModalHistorialOferta from "./HistorialOferta";
import { BASE_URL } from '../../../Conf/config';
const Oferta = () => {
  const [form, setForm] = useState({
    codigo: "", // iddescuento
    nombre: "",
    tipo: "",
    fechainicio: "",
    fechafin: "",
    estado: "HABILITADO",
    sucursal: [],
  });

  const [detalle, setDetalle] = useState([]);
  const [oferta, setOferta] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openSucursalModal, setOpenSucursalModal] = useState(false);
  const [modo, setModo] = useState("detalle");
  const [openHistorialModal, setOpenHistorialModal] = useState(false);

  const { user } = useAuth();

  // ➕ Agregar producto al detalle u oferta
  const handleAgregarProducto = (producto) => {
    const nuevo = {
      codigoproducto: producto.codigo,
       idproducto: producto.id,
      nombreproducto: producto.producto,
      laboratorio: producto.laboratorio,
      esFraccion: false,
      cantidad: 1,
      descuento: 0,
         tipoproducto: producto.tipoproducto
    };

    if (modo === "detalle") {
      if (detalle.some((p) => p.idproducto === nuevo.idproducto)) return;
      setDetalle((prev) => [...prev, nuevo]);
    } else {
      if (oferta.some((p) => p.idproducto === nuevo.idproducto)) return;
      setOferta((prev) => [...prev, nuevo]);
    }
  };

  // ❌ Eliminar producto
const handleEliminarFila = (codigo, tipo) => {
  if (tipo === "detalle") {
    setDetalle((prev) => prev.filter((p) => p.idproducto !== codigo));
  } else {
    setOferta((prev) => prev.filter((p) => p.idproducto !== codigo));
  }
};

  const handleSeleccionarSucursales = (sucursalesSeleccionadas) => {
    setForm((prev) => ({ ...prev, sucursal: sucursalesSeleccionadas }));
  };

const handleSeleccionarPack = (pack) => {
  const sucursales = JSON.parse(pack.idsucursal || "[]");
  const productos = JSON.parse(pack.idproducto || '{"detalle":[],"oferta":[]}');

  const detallePack = (productos.detalle || []).map(d => ({
    ...d,
    cantidad: Number(d.cantidad),
  }));

  const ofertaPack = (productos.oferta || []).map(o => ({
    ...o,
    cantidad: Number(o.cantidad),
    descuento: Number(o.descuento) * 100, // convertir a porcentaje
  }));

  setForm({
    ...form,
    codigo: pack.idDescuento,
    nombre: pack.descripcion,
    fechainicio: pack.fechaInicio.split("T")[0],
    fechafin: pack.fechaFin.split("T")[0],
    estado: pack.estado === "Activo" ? "1" : "0",
    sucursal: sucursales,
    tipo: detallePack[0]?.tipo === 1 ? "Por monto" : detallePack[0]?.tipo === 2 ? "Por cantidad" : "",
  });

  setDetalle(detallePack);
  setOferta(ofertaPack);
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 💾 GUARDAR O ACTUALIZAR OFERTA
  const handleGuardarOActualizar = async () => {

    if (!form.nombre.trim()) {
    alert("❌ Debe ingresar el nombre del pack.");
    return;
  }
  if (!form.tipo) {
    alert("❌ Debe seleccionar el tipo de oferta.");
    return;
  }
  if (!form.fechainicio || !form.fechafin) {
    alert("❌ Debe seleccionar fecha de inicio y fin.");
    return;
  }
  if (new Date(form.fechafin) < new Date(form.fechainicio)) {
    alert("❌ La fecha de fin no puede ser menor que la fecha de inicio.");
    return;
  }
  if (form.sucursal.length === 0) {
    alert("❌ Debe seleccionar al menos una sucursal.");
    return;
  }
  if (detalle.length === 0) {
    alert("❌ Debe agregar al menos un producto en el detalle.");
    return;
  }
  if (oferta.length === 0) {
    alert("❌ Debe agregar al menos un producto en la oferta.");
    return;
  }
    const isNew = !form.codigo; // Si no tiene código, es nuevo
    const data = {
      iddescuento: isNew ? 0 : form.codigo,
      descripcion: form.nombre,
      fechainicio: form.fechainicio,
      fechafin: form.fechafin,
      idtipodescuento: 3,
      todosucursal: false,
      idsucursal: JSON.stringify(
        form.sucursal.map((s) => ({ idSucursal: s.idSucursal, nombreSucursal: s.nombreSucursal }))
      ),
      todolistaprecio: false,
      idlistaprecio: "[]",
      todotipoproducto: false,
      descuentotodotipoproducto: 0,
      idtipoproducto: detalle[0]?.tipoproducto || oferta[0]?.tipoproducto || "",
      excluiridproducto: "[]",
      todoproducto: false,
      descuentotodoproducto: 0,
      idproducto: JSON.stringify({
        detalle: detalle.map((d) => ({
          codigoproducto: d.codigoproducto,
             idproducto:d.idproducto,
          nombreproducto: d.nombreproducto,
          laboratorio: d.laboratorio,
          esFraccion: d.esFraccion,
          cantidad: Number(d.cantidad),
          tipo: form.tipo === "Por monto" ? 1 : 2,
        })),
        oferta: oferta.map((o) => ({
          codigoproducto: o.codigoproducto,
           idproducto: o.idproducto,
          nombreproducto: o.nombreproducto,
          laboratorio: o.laboratorio,
          esFraccion: o.esFraccion,
          cantidad: Number(o.cantidad),
          tipo: form.tipo === "Por monto" ? 1 : 2,
          descuento: Number(o.descuento) / 100,
        })),
      }),
      todocliente: true,
      descuentotodocliente: 0,
      idcanalventa: "",
      idcliente: "",
      idestado: form.estado,
      usuariomanipula: user?.emp_codigo,
    };

    try {
      const res = await fetch(
        isNew
          ? `${BASE_URL}/api/Descuento/Insertar-Descu`
          : `${BASE_URL}/api/Descuento/Insertar-Descu`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (res.ok) {
        const id = await res.json();
        alert(`✅ Oferta ${isNew ? "guardada" : "actualizada"} correctamente. ID: ${id}`);
          setForm({
        codigo: "",
        nombre: "",
        tipo: "",
        fechainicio: "",
        fechafin: "",
        estado: "HABILITADO",
        sucursal: [],
      });
        setDetalle([]); // limpia los productos del detalle
  setOferta([]);  
      } else {
        const error = await res.text();
        alert(`❌ Error: ${error}`);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error de conexión con el servidor.");
    }
  };

  return (
    <Box sx={{ p: 4, bgcolor: "#fff", borderRadius: 3, boxShadow: 3, maxWidth: 1300, mx: "auto" }}>
      <Typography variant="h5" color="primary" gutterBottom>
        🏷️ MANTENIMIENTO DE OFERTAS
      </Typography>

      {/* FORMULARIO PRINCIPAL */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 4 }}>
        <TextField
          label="Código"
          name="codigo"
          value={form.codigo}
          fullWidth
          InputProps={{ readOnly: true, style: { cursor: "pointer", backgroundColor: "#f5f5f5" } }}
          onClick={() => setOpenHistorialModal(true)}
        />
        <TextField label="Nombre del Pack" name="nombre" value={form.nombre} onChange={handleChange} fullWidth />
        <FormControl fullWidth>
          <InputLabel>Tipo</InputLabel>
          <Select name="tipo" value={form.tipo} onChange={handleChange} label="Tipo">
            <MenuItem value="Por monto">Por monto</MenuItem>
            <MenuItem value="Por cantidad">Por cantidad</MenuItem>
          </Select>
        </FormControl>
        <TextField type="date" label="Fecha Inicio" name="fechainicio" value={form.fechainicio} onChange={handleChange} InputLabelProps={{ shrink: true }} />
        <TextField type="date" label="Fecha Fin" name="fechafin" value={form.fechafin} onChange={handleChange} InputLabelProps={{ shrink: true }} />
        <FormControl fullWidth>
          <InputLabel>Estado</InputLabel>
          <Select name="estado" value={form.estado} onChange={handleChange} label="Estado">
            <MenuItem value="1">HABILITADO</MenuItem>
            <MenuItem value="0">INHABILITADO</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* SUCURSALES */}
      <Typography variant="h6" sx={{ mb: 1 }}>🏪 Sucursales asignadas</Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        {form.sucursal.length > 0 ? form.sucursal.map((s) => (
          <Chip key={s.idSucursal} label={s.nombreSucursal} color="primary" />
        )) : (
          <Typography variant="body2" color="text.secondary">No hay sucursales seleccionadas.</Typography>
        )}
      </Box>
      <Button variant="contained" color="secondary" startIcon={<MapPin size={18} />} onClick={() => setOpenSucursalModal(true)}>
        Seleccionar sucursales
      </Button>

      {/* DETALLE */}
      <Typography variant="h6" color="secondary" sx={{ mt: 4, mb: 1 }}>🧩 DETALLE</Typography>
      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Producto</TableCell>
              <TableCell>Laboratorio</TableCell>
              <TableCell>Fracción</TableCell>
              <TableCell>Cantidad</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {detalle.map((d, i) => (
              <TableRow key={i}>
                <TableCell>
                <IconButton color="error" onClick={() => handleEliminarFila(d.codigoproducto, "detalle")}>
  <Trash2 size={18} />
</IconButton>
                </TableCell>
                <TableCell>{d.codigoproducto}</TableCell>
                <TableCell>{d.nombreproducto}</TableCell>
                <TableCell>{d.laboratorio}</TableCell>
                <TableCell>
                  <input type="checkbox" checked={d.esFraccion} onChange={(e) => {
                    const updated = [...detalle];
                    updated[i].esFraccion = e.target.checked;
                    setDetalle(updated);
                  }} />
                </TableCell>
                <TableCell>
                  <TextField type="number" size="small" value={d.cantidad} onChange={(e) => {
                    const updated = [...detalle];
                    updated[i].cantidad = e.target.value;
                    setDetalle(updated);
                  }} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Button variant="contained" color="success" startIcon={<PlusCircle size={18} />} onClick={() => { setModo("detalle"); setOpenModal(true); }}>
        Agregar Producto al Detalle
      </Button>

      {/* OFERTA */}
      <Typography variant="h6" color="secondary" sx={{ mt: 4, mb: 1 }}>🎯 OFERTA</Typography>
      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Producto</TableCell>
              <TableCell>Laboratorio</TableCell>
              <TableCell>Fracción</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>% Descuento</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {oferta.map((o, i) => (
              <TableRow key={i}>
                <TableCell>
            <IconButton color="error" onClick={() => handleEliminarFila(o.codigoproducto, "oferta")}>
  <Trash2 size={18} />
</IconButton>
                </TableCell>
                <TableCell>{o.codigoproducto}</TableCell>
                <TableCell>{o.nombreproducto}</TableCell>
                <TableCell>{o.laboratorio}</TableCell>
                <TableCell>
                  <input type="checkbox" checked={o.esFraccion} onChange={(e) => {
                    const updated = [...oferta];
                    updated[i].esFraccion = e.target.checked;
                    setOferta(updated);
                  }} />
                </TableCell>
                <TableCell>
                  <TextField type="number" size="small" value={o.cantidad} onChange={(e) => {
                    const updated = [...oferta];
                    updated[i].cantidad = e.target.value;
                    setOferta(updated);
                  }} />
                </TableCell>
                <TableCell>
                  <TextField type="number" size="small" value={o.descuento} onChange={(e) => {
                    const updated = [...oferta];
                    updated[i].descuento = e.target.value;
                    setOferta(updated);
                  }} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Button variant="contained" color="primary" startIcon={<PlusCircle size={18} />} onClick={() => { setModo("oferta"); setOpenModal(true); }}>
        Agregar Producto a la Oferta
      </Button>

      {/* GUARDAR / ACTUALIZAR */}
      <Box textAlign="right" sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color={form.codigo ? "warning" : "success"} // Cambia color si es actualizar
          startIcon={<Save />}
          onClick={handleGuardarOActualizar}
        >
          {form.codigo ? "Actualizar Oferta" : "Guardar Oferta"}
        </Button>
      </Box>

      {/* MODALES */}
      <ModalAgregarProducto
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSelect={handleAgregarProducto}
        productosSeleccionados={modo === "detalle" ? detalle : oferta}
      />
      <ModalSucursal
        open={openSucursalModal}
        onClose={() => setOpenSucursalModal(false)}
        onSelect={handleSeleccionarSucursales}
        sucursalesSeleccionadas={form.sucursal}
      />
      <ModalHistorialOferta
        open={openHistorialModal}
        onClose={() => setOpenHistorialModal(false)}
        onSelect={handleSeleccionarPack}
      />
    </Box>
  );
};

export default Oferta;