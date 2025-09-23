import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import axios from "axios";
import { BASE_URL } from "../../Conf/config";

const API_URL = `${BASE_URL}/api/Contabilidad_Convenio`;

const ClubQFModule = () => {
  const [niveles, setNiveles] = useState([]);
  const [open, setOpen] = useState(false);
  const [nivel, setNivel] = useState({
    idNivel: 0,
    nombre: "",
    minCompra: 0,
    maxCompra: null,
    descuento: 0.0,
    beneficios: "",
    productos: [],
  });

  // 🔹 Listar niveles
  const fetchNiveles = async () => {
    try {
      const res = await axios.get(`${API_URL}/Club-qf`);
      setNiveles(res.data);
    } catch (error) {
      console.error("Error cargando niveles", error);
    }
  };

  useEffect(() => {
    fetchNiveles();
  }, []);

  // 🔹 Abrir modal (crear/editar)
  const handleOpen = (item = null) => {
    if (item) {
      let productosParsed = [];
      try {
        productosParsed = JSON.parse(item.productos || "[]");
      } catch {
        productosParsed = [];
      }
      setNivel({ ...item, productos: productosParsed });
    } else {
      setNivel({
        idNivel: 0,
        nombre: "",
        minCompra: 0,
        maxCompra: null,
        descuento: 0.0,
        beneficios: "",
        productos: [],
      });
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // 🔹 Guardar nivel
  const handleSave = async () => {
    try {
      const payload = {
        ...nivel,
        productos: JSON.stringify(nivel.productos),
      };

      if (nivel.idNivel === 0) {
        await axios.post(`${API_URL}/Club-qf`, payload);
      } else {
        await axios.put(`${API_URL}/Club-qf/${nivel.idNivel}`, payload);
      }
      fetchNiveles();
      handleClose();
    } catch (error) {
      console.error("Error guardando nivel", error);
    }
  };

  // 🔹 Eliminar nivel
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este nivel?")) return;
    try {
      await axios.delete(`${API_URL}/Club-qf/${id}`);
      fetchNiveles();
    } catch (error) {
      console.error("Error eliminando nivel", error);
    }
  };

  // 🔹 Manejo de productos en el modal
  const handleAddProducto = () => {
    setNivel({
      ...nivel,
      productos: [
        ...nivel.productos,
        { idProducto: Date.now(), nombreProducto: "" },
      ],
    });
  };

  const handleRemoveProducto = (id) => {
    setNivel({
      ...nivel,
      productos: nivel.productos.filter((p) => p.idProducto !== id),
    });
  };

  const handleChangeProducto = (id, field, value) => {
    setNivel({
      ...nivel,
      productos: nivel.productos.map((p) =>
        p.idProducto === id ? { ...p, [field]: value } : p
      ),
    });
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Gestión de Niveles - QF Club
      </Typography>

      <Button variant="contained" color="primary" onClick={() => handleOpen()}>
        Nuevo Nivel
      </Button>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Rango</TableCell>
              <TableCell>Descuento</TableCell>
              <TableCell>Beneficios</TableCell>
              <TableCell>Productos</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {niveles.map((nivel) => {
              let productos = [];
              try {
                productos = JSON.parse(nivel.productos || "[]");
              } catch {
                productos = [];
              }

              return (
                <TableRow key={nivel.idNivel}>
                  <TableCell>{nivel.idNivel}</TableCell>
                  <TableCell>{nivel.nombre}</TableCell>
                  <TableCell>
                    {nivel.minCompra} - {nivel.maxCompra ?? "∞"}
                  </TableCell>
                  <TableCell>{(nivel.descuento * 100).toFixed(0)}%</TableCell>
                  <TableCell>
                    <ul>
                      {nivel.beneficios?.split(";").map((b, i) => (
                        <li key={i}>{b.trim()}</li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>
                    <ul>
                      {productos.map((p) => (
                        <li key={p.idProducto}>
                          {p.idProducto} - {p.nombreProducto}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpen(nivel)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(nivel.idNivel)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal Formulario */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {nivel.idNivel === 0 ? "Nuevo Nivel" : "Editar Nivel"}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nombre"
            fullWidth
            value={nivel.nombre}
            onChange={(e) => setNivel({ ...nivel, nombre: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Compra mínima"
            type="number"
            fullWidth
            value={nivel.minCompra}
            onChange={(e) =>
              setNivel({ ...nivel, minCompra: parseInt(e.target.value) })
            }
          />
          <TextField
            margin="dense"
            label="Compra máxima"
            type="number"
            fullWidth
            value={nivel.maxCompra ?? ""}
            onChange={(e) =>
              setNivel({
                ...nivel,
                maxCompra: e.target.value ? parseInt(e.target.value) : null,
              })
            }
          />
          <TextField
            margin="dense"
            label="Descuento (%)"
            type="number"
            fullWidth
            value={nivel.descuento * 100}
            onChange={(e) =>
              setNivel({
                ...nivel,
                descuento: parseFloat(e.target.value) / 100,
              })
            }
          />
          <TextField
            margin="dense"
            label="Beneficios (separados por ';')"
            fullWidth
            multiline
            rows={3}
            value={nivel.beneficios}
            onChange={(e) =>
              setNivel({ ...nivel, beneficios: e.target.value })
            }
          />

          <Typography variant="h6" sx={{ mt: 2 }}>
            Productos
          </Typography>
          {nivel.productos.map((p) => (
            <Box key={p.idProducto} display="flex" gap={2} alignItems="center" mt={1}>
              <TextField
                label="Nombre producto"
                value={p.nombreProducto}
                onChange={(e) =>
                  handleChangeProducto(p.idProducto, "nombreProducto", e.target.value)
                }
              />
              <IconButton
                color="error"
                onClick={() => handleRemoveProducto(p.idProducto)}
              >
                <Delete />
              </IconButton>
            </Box>
          ))}
          <Button onClick={handleAddProducto} sx={{ mt: 1 }}>
            Agregar producto
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClubQFModule;