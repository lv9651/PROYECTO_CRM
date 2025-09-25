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
    beneficios: [],
    productos: [],
  });

  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [productosDisponibles, setProductosDisponibles] = useState([]);

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
      let beneficiosParsed = [];

      // Parse productos
      try {
        const parsedProd = JSON.parse(item.productos || "[]");
        productosParsed = Array.isArray(parsedProd) ? parsedProd : [];
      } catch {
        productosParsed = [];
      }

      // Parse beneficios
      try {
        const parsedBen = JSON.parse(item.beneficios || "[]");
        beneficiosParsed = Array.isArray(parsedBen) ? parsedBen : [];
      } catch {
        if (typeof item.beneficios === "string") {
          beneficiosParsed = item.beneficios.split(";").map((b) => ({
            descripcion: b.trim(),
            puntaje: 0,
          }));
        } else {
          beneficiosParsed = [];
        }
      }

      setNivel({
        ...item,
        productos: productosParsed,
        beneficios: beneficiosParsed,
      });
    } else {
      setNivel({
        idNivel: 0,
        nombre: "",
        minCompra: 0,
        maxCompra: null,
        descuento: 0.0,
        beneficios: [],
        productos: [],
      });
    }
    setProductosDisponibles([]);
    setBusquedaProducto("");
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // 🔹 Guardar nivel
  const handleSave = async () => {
    try {
      const payload = {
        ...nivel,
        productos: JSON.stringify(nivel.productos),
        beneficios: JSON.stringify(nivel.beneficios),
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

  // 🔹 Manejo de productos
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

  // 🔹 Manejo de beneficios
const handleAddBeneficio = () => {
  setNivel({
    ...nivel,
    beneficios: [
      ...nivel.beneficios,
      { id: Date.now() + Math.floor(Math.random() * 1000), descripcion: "", puntaje: 0 },
    ],
  });
};

const handleChangeBeneficio = (id, field, value) => {
  setNivel({
    ...nivel,
    beneficios: nivel.beneficios.map((b) =>
      b.id === id ? { ...b, [field]: value } : b
    ),
  });
};

const handleRemoveBeneficio = (id) => {
  setNivel({
    ...nivel,
    beneficios: nivel.beneficios.filter((b) => b.id !== id),
  });
};

  // 🔹 Buscar productos externos
  const buscarProductosExternos = async () => {
    if (!busquedaProducto.trim()) {
      setProductosDisponibles([]);
      return;
    }

    try {
      const res = await axios.get(
        `${BASE_URL}/api/Contabilidad_Convenio/buscar-producto-club?busqueda=${encodeURIComponent(
          busquedaProducto.trim()
        )}`
      );
      setProductosDisponibles(res.data);
    } catch (error) {
      console.error("Error buscando productos externos", error);
      setProductosDisponibles([]);
    }
  };

  // 🔹 Agregar producto externo con puntaje
  const agregarProductoExterno = (producto) => {
    if (
      nivel.productos.findIndex((p) => p.idProducto === producto.idProducto) !==
      -1
    )
      return;

    setNivel({
      ...nivel,
      productos: [
        ...nivel.productos,
        {
          idProducto: producto.idProducto,
          nombreProducto: producto.nombre || producto.codigoproducto || "",
          puntaje: 0,
        },
      ],
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
              let beneficios = [];
              try {
                productos = JSON.parse(nivel.productos || "[]");
              } catch {
                productos = [];
              }
              try {
                beneficios = JSON.parse(nivel.beneficios || "[]");
              } catch {
                if (typeof nivel.beneficios === "string") {
                  beneficios = nivel.beneficios.split(";").map((b) => ({
                    descripcion: b.trim(),
                    puntaje: 0,
                  }));
                } else {
                  beneficios = [];
                }
              }
              if (!Array.isArray(beneficios)) beneficios = [];

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
                      {beneficios.map((b, i) => (
                        <li key={i}>
                          {b.descripcion}{" "}
                          {b.puntaje ? `(Puntaje: ${b.puntaje})` : ""}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>
                    <ul>
                      {productos.map((p) => (
                        <li key={p.idProducto}>
                          {p.idProducto} - {p.nombreProducto}{" "}
                          {p.puntaje ? `(Puntaje: ${p.puntaje})` : ""}
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

          {/* Beneficios */}
          <Typography variant="h6" sx={{ mt: 2 }}>
            Beneficios
          </Typography>
    {nivel.beneficios.map((b) => (
  <Box key={b.id} display="flex" gap={2} alignItems="center" mt={1}>
    <TextField
      label="Descripción"
      value={b.descripcion}
      onChange={(e) =>
        handleChangeBeneficio(b.id, "descripcion", e.target.value)
      }
      fullWidth
    />
    <TextField
      label="Puntaje"
      type="number"
      value={b.puntaje}
      onChange={(e) =>
        handleChangeBeneficio(b.id, "puntaje", parseInt(e.target.value))
      }
      sx={{ width: 120 }}
    />
    <IconButton color="error" onClick={() => handleRemoveBeneficio(b.id)}>
      <Delete />
    </IconButton>
  </Box>
))}
          <Button onClick={handleAddBeneficio} sx={{ mt: 1 }}>
            + Agregar beneficio
          </Button>

          {/* Productos */}
          <Typography variant="h6" sx={{ mt: 2 }}>
            Productos del Nivel
          </Typography>
          {nivel.productos.map((p) => (
            <Box
              key={p.idProducto}
              display="flex"
              gap={2}
              alignItems="center"
              mt={1}
            >
              <TextField
                label="Nombre producto"
                value={p.nombreProducto}
                disabled
                sx={{ flex: 1 }}
              />
              <TextField
                label="Puntaje"
                type="number"
                value={p.puntaje}
                onChange={(e) =>
                  handleChangeProducto(p.idProducto, "puntaje", parseInt(e.target.value))
                }
                sx={{ width: 120 }}
              />
              <IconButton
                color="error"
                onClick={() => handleRemoveProducto(p.idProducto)}
              >
                <Delete />
              </IconButton>
            </Box>
          ))}

          {/* Buscador productos externos */}
          <Box mt={4}>
            <Typography variant="h6">Buscar productos disponibles</Typography>
            <Box display="flex" gap={2} alignItems="center" mb={2}>
              <TextField
                label="Buscar producto"
                value={busquedaProducto}
                onChange={(e) => setBusquedaProducto(e.target.value)}
                fullWidth
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    buscarProductosExternos();
                  }
                }}
              />
              <Button variant="outlined" onClick={buscarProductosExternos}>
                Buscar
              </Button>
            </Box>

            <Box
              maxHeight={200}
              overflow="auto"
              border="1px solid #ccc"
              borderRadius={1}
              p={1}
            >
              {productosDisponibles.length === 0 && (
                <Typography>No hay productos</Typography>
              )}
              {productosDisponibles.map((p) => {
                const yaAgregado = nivel.productos.some(
                  (prod) => prod.idProducto === p.idProducto
                );
                return (
                  <Box
                    key={p.idProducto}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                    p={1}
                    bgcolor={yaAgregado ? "#e0e0e0" : "transparent"}
                    borderRadius={1}
                    sx={{ cursor: yaAgregado ? "default" : "pointer" }}
                    onClick={() => {
                      if (!yaAgregado) {
                        agregarProductoExterno(p);
                      }
                    }}
                  >
                    <Typography>
                      {p.nombre} ({p.idProducto})
                    </Typography>
                    {yaAgregado && (
                      <Typography color="success.main" fontWeight="bold">
                        Agregado
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
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