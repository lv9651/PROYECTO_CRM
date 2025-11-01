import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  CircularProgress,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import { PlusCircle, Trash2 } from "lucide-react";
import axios from "axios";
import { BASE_URL } from '../../../Conf/config';
const ModalAgregarProducto = ({
  open,
  onClose,
  onSelect,
  productosSeleccionados = [],
  onDelete,
}) => {
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoProducto, setTipoProducto] = useState("PT");
  const [loading, setLoading] = useState(false);
  const [alerta, setAlerta] = useState({
    open: false,
    mensaje: "",
    tipo: "success",
  });

  // 🔍 Buscar productos desde la API
  const buscarProductos = async () => {
    setLoading(true);
    try {
      const url = `${BASE_URL}/api/Descuento/buscarproducto?tipoproducto=${tipoProducto}&estado=HABILITADO&top=25${
        searchTerm ? `&nombreproducto=${encodeURIComponent(searchTerm)}` : ""
      }`;

      const { data } = await axios.get(url);
      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al buscar productos:", error);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  // ▶️ Buscar automáticamente al abrir el modal o cambiar tipo
  useEffect(() => {
    if (open) buscarProductos();
  }, [open, tipoProducto]);

  // ➕ Agregar producto (sin duplicados)
  const handleAgregarProducto = (producto) => {
    const yaExiste = productosSeleccionados.some(
      (p) => p.codigo === producto.codigo
    );

    if (yaExiste) {
      setAlerta({
        open: true,
        mensaje: "⚠️ Este producto ya fue agregado.",
        tipo: "warning",
      });
      return;
    }

    onSelect(producto);
    setAlerta({
      open: true,
      mensaje: "✅ Producto agregado correctamente.",
      tipo: "success",
    });
  };

  // ❌ Eliminar producto seleccionado
  const handleEliminarProducto = (producto) => {
    if (onDelete) onDelete(producto);
    setAlerta({
      open: true,
      mensaje: "🗑️ Producto eliminado.",
      tipo: "info",
    });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Buscar Productos</DialogTitle>
        <DialogContent>
          {/* Campo de búsqueda */}
          <TextField
            fullWidth
            label="Buscar productos por nombre"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscarProductos()}
            sx={{ mb: 2 }}
          />

          {/* Filtro tipo de producto */}
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Tipo de Producto</InputLabel>
            <Select
              value={tipoProducto}
              onChange={(e) => setTipoProducto(e.target.value)}
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

          {/* Tabla de resultados */}
          {loading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress />
            </Box>
          ) : (
            <Paper variant="outlined" sx={{ maxHeight: 400, overflowY: "auto" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>Código</TableCell>
                    <TableCell>Producto</TableCell>
                    <TableCell>TP</TableCell>
                    <TableCell>Laboratorio</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productos.length > 0 ? (
                    productos.map((p, index) => {
                      const yaAgregado = productosSeleccionados.some(
                        (prod) => prod.codigo === p.codigo
                      );
                      return (
                        <TableRow key={index} hover>
                          <TableCell>
                            {yaAgregado ? (
                              <IconButton
                                color="error"
                                onClick={() => handleEliminarProducto(p)}
                                title="Eliminar producto"
                              >
                                <Trash2 size={18} />
                              </IconButton>
                            ) : (
                              <IconButton
                                color="success"
                                onClick={() => handleAgregarProducto(p)}
                                title="Agregar producto"
                              >
                                <PlusCircle size={18} />
                              </IconButton>
                            )}
                          </TableCell>
                          <TableCell>{p.codigo}</TableCell>
                          <TableCell>{p.producto}</TableCell>
                          <TableCell>{p.tipoproducto}</TableCell>
                          <TableCell>{p.laboratorio}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No se encontraron productos
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
          )}
        </DialogContent>
      </Dialog>

      {/* 🔔 Snackbar de notificación */}
      <Snackbar
        open={alerta.open}
        autoHideDuration={2500}
        onClose={() => setAlerta({ ...alerta, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={alerta.tipo}
          onClose={() => setAlerta({ ...alerta, open: false })}
          sx={{ width: "100%" }}
        >
          {alerta.mensaje}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ModalAgregarProducto;