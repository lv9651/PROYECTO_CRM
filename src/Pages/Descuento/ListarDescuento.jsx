import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  CircularProgress,
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
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
  Grid,
} from "@mui/material";
import { useApiData } from "./DescuentoDePacks/hooks/useApiData";
import axios from "axios";
import { API_ENDPOINTS } from "./DescuentoDePacks/constants/apiEndpoints";
import { BASE_URL } from "../../Conf/config";
import { useAuth } from "../../Compo/AuthContext";

const ListarDescuento = () => {
  const { apiData, loading, fetchHistorial } = useApiData();
  const [openModal, setOpenModal] = useState(false);
  const [selectedPack, setSelectedPack] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [productos, setProductos] = useState([]);
  const [listasPrecio, setListasPrecio] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [todasSucursales, setTodasSucursales] = useState([]);
  const { user } = useAuth();

  // 🔍 Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchHistorial(1);
    fetchSucursales();
  }, [fetchHistorial]);

  const fetchSucursales = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/Descuento/sucursalQF`);
      setTodasSucursales(response.data);
    } catch (error) {
      console.error("Error al listar sucursales:", error);
    }
  };

  const resolveEstadoFromPack = (pack) => {
    if (pack.idestado !== undefined && pack.idestado !== null) {
      return String(pack.idestado);
    }
    if (typeof pack.estado === "string") {
      const val = pack.estado.trim().toLowerCase();
      if (val === "activo" || val === "1" || val === "true") return "1";
      if (val === "inactivo" || val === "0" || val === "false") return "0";
    }
    return "";
  };

  const handleRowClick = (pack) => {
    try {
      const parsedProductos = JSON.parse(pack.idproducto || "[]");
      const parsedListas = JSON.parse(pack.idlistaprecio || "[]");
      const parsedSucursales = JSON.parse(pack.idsucursal || "[]");

      setProductos(parsedProductos);
      setListasPrecio(parsedListas);
      setSucursales(parsedSucursales.map((s) => s.idsucursal?.toString()));

      setSelectedPack({
        ...pack,
        estado: resolveEstadoFromPack(pack),
      });
    } catch (error) {
      console.error("Error al parsear datos:", error);
      setProductos([]);
      setListasPrecio([]);
      setSucursales([]);
      setSelectedPack({
        ...pack,
        estado: resolveEstadoFromPack(pack),
      });
    }

    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    setSelectedPack(null);
    setProductos([]);
    setListasPrecio([]);
    setSucursales([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedPack((prev) => ({ ...prev, [name]: value }));
  };

  const handleSucursalChange = (event) => {
    const value = event.target.value;
    setSucursales(typeof value === "string" ? value.split(",") : value);
  };

  const handleUpdate = async () => {
    try {
      if (!selectedPack) return;
      setUpdating(true);

      const sucursalesFormateadas = JSON.stringify(
        sucursales.map((id) => ({
          idsucursal: id.toString(),
          nombreSucursal:
            todasSucursales.find((s) => s.idSucursal.toString() === id)
              ?.nombreSucursal || "",
        }))
      );

      const dataToSend = {
        idDescuento: selectedPack.idDescuento,
        descripcion: selectedPack.descripcion,
        fechaInicio: selectedPack.fechaInicio,
        fechaFin: selectedPack.fechaFin,
        idestado: selectedPack.estado,
        idsucursal: sucursalesFormateadas,
        idcanalventa: selectedPack.idcanalventa,
        idlistaprecio: selectedPack.idlistaprecio,
        idproducto: selectedPack.idproducto,
        idProductoPack: selectedPack.idProductoPack || 0,
        idtipodescuento: 1,
        todocliente: true,
        usuariomanipula: user?.emp_codigo,
        idcliente: "",
        idtipoproducto: selectedPack.idtipoproducto ,
        excluiridproducto: "",
      };

      console.log("Enviando actualización:", dataToSend);

      await axios.post(`${BASE_URL}${API_ENDPOINTS.ACTUALIZAR_PACK}`, dataToSend, {
        headers: { "Content-Type": "application/json" },
      });

      setUpdating(false);
      setOpenModal(false);
      fetchHistorial(1);
    } catch (error) {
      console.error("Error al actualizar pack:", error.response?.data || error);
      setUpdating(false);
    }
  };

  // 🧮 Filtro local (por descripción y fechas)
  const filteredPacks = useMemo(() => {
    return apiData.historial.filter((pack) => {
      const descripcionMatch = pack.descripcion
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const fechaInicio = pack.fechaInicio?.split("T")[0];
      const fechaFin = pack.fechaFin?.split("T")[0];

      const startMatch = startDate ? fechaInicio >= startDate : true;
      const endMatch = endDate ? fechaFin <= endDate : true;

      return descripcionMatch && startMatch && endMatch;
    });
  }, [apiData.historial, searchTerm, startDate, endDate]);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" color="primary" gutterBottom>
        Listado de Descuentos
      </Typography>

      {/* 🔎 Filtros */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Buscar por descripción"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Desde"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Hasta"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={() => {
              setSearchTerm("");
              setStartDate("");
              setEndDate("");
            }}
          >
            Limpiar
          </Button>
        </Grid>
      </Grid>

      {loading.historial ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Descripción</strong></TableCell>
                <TableCell><strong>Fecha Inicio</strong></TableCell>
                <TableCell><strong>Fecha Fin</strong></TableCell>
               {/*<TableCell><strong>Sucursales</strong></TableCell>*/}
                <TableCell><strong>Estado</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPacks.length > 0 ? (
                filteredPacks.map((pack) => (
                  <TableRow
                    key={pack.idDescuento}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => handleRowClick(pack)}
                  >
                    <TableCell>{pack.idDescuento}</TableCell>
                    <TableCell>{pack.descripcion}</TableCell>
                    <TableCell>{pack.fechaInicio?.split("T")[0]}</TableCell>
                    <TableCell>{pack.fechaFin?.split("T")[0]}</TableCell>
                 {/*   <TableCell>
                      {(() => {
                        try {
                          const suc = JSON.parse(pack.idsucursal || "[]");
                          return suc
                            .map(
                              (s) =>
                                s.nombreSucursal || s.descripcion || s.idsucursal
                            )
                            .join(", ");
                        } catch {
                          return "—";
                        }
                      })()}
                    </TableCell>*/}
                    <TableCell>
                      {resolveEstadoFromPack(pack) === "1"
                        ? "Activo"
                        : "Inactivo"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No se encontraron resultados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* MODAL DE EDICIÓN */}
      <Dialog open={openModal} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Editar Listado</DialogTitle>
        <DialogContent dividers>
          {selectedPack && (
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
              <TextField
                label="Descripción"
                name="descripcion"
                value={selectedPack.descripcion || ""}
                onChange={handleChange}
                fullWidth
              />

              <TextField
                label="Fecha Inicio"
                name="fechaInicio"
                type="date"
                value={selectedPack.fechaInicio?.split("T")[0] || ""}
                onChange={handleChange}
                fullWidth
              />

              <TextField
                label="Fecha Fin"
                name="fechaFin"
                type="date"
                value={selectedPack.fechaFin?.split("T")[0] || ""}
                onChange={handleChange}
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel>Sucursales</InputLabel>
                <Select
                  multiple
                  value={sucursales}
                  onChange={handleSucursalChange}
                  renderValue={(selected) =>
                    selected
                      .map(
                        (id) =>
                          todasSucursales.find(
                            (s) => s.idSucursal.toString() === id
                          )?.nombreSucursal || id
                      )
                      .join(", ")
                  }
                >
                  {todasSucursales.map((suc) => (
                    <MenuItem
                      key={suc.idSucursal}
                      value={suc.idSucursal.toString()}
                    >
                      <Checkbox
                        checked={sucursales.includes(
                          suc.idSucursal.toString()
                        )}
                      />
                      <ListItemText primary={suc.nombreSucursal} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  name="estado"
                  value={selectedPack.estado || ""}
                  onChange={handleChange}
                  label="Estado"
                >
                  <MenuItem value="1">Activo</MenuItem>
                  <MenuItem value="0">Inactivo</MenuItem>
                </Select>
              </FormControl>

              {productos.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Productos del Descuento
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>ID Producto</TableCell>
                          <TableCell>Descripción</TableCell>
                          <TableCell>Descuento QF</TableCell>
                          <TableCell>Descuento Prov.</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {productos.map((prod, index) => (
                          <TableRow key={index}>
                            <TableCell>{prod.idproducto}</TableCell>
                            <TableCell>{prod.descripcion}</TableCell>
                        <TableCell>{(prod.descuentoqf * 100).toFixed(2)}</TableCell>
<TableCell>{(prod.descuentoprov * 100).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdate}
            disabled={updating}
          >
            {updating ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ListarDescuento;