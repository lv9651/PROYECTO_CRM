import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Typography,
  Box,
  TextField,
} from "@mui/material";
import { BASE_URL } from '../../../Conf/config';
const ModalHistoriaOferta = ({ open, onClose, onSelect }) => {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroDescripcion, setFiltroDescripcion] = useState("");
  const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
  const [filtroFechaFin, setFiltroFechaFin] = useState("");

  const [packsFiltrados, setPacksFiltrados] = useState([]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch(`${BASE_URL}/api/Descuento/HistorialPacks?tipoDescuento=3`)
        .then((res) => res.json())
        .then((data) => {
          setPacks(data);
          setPacksFiltrados(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error cargando historial:", err);
          setLoading(false);
        });
    }
  }, [open]);

  // Filtrar cuando cambien los filtros o los packs
  useEffect(() => {
    let filtrados = [...packs];

    if (filtroDescripcion) {
      filtrados = filtrados.filter((p) =>
        p.descripcion.toLowerCase().includes(filtroDescripcion.toLowerCase())
      );
    }

    if (filtroFechaInicio) {
      filtrados = filtrados.filter(
        (p) => new Date(p.fechaInicio) >= new Date(filtroFechaInicio)
      );
    }

    if (filtroFechaFin) {
      filtrados = filtrados.filter(
        (p) => new Date(p.fechaFin) <= new Date(filtroFechaFin)
      );
    }

    setPacksFiltrados(filtrados);
  }, [filtroDescripcion, filtroFechaInicio, filtroFechaFin, packs]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>📦 Historial de Ofertas</DialogTitle>
      <DialogContent>
        {/* FILTROS */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Descripción"
            value={filtroDescripcion}
            onChange={(e) => setFiltroDescripcion(e.target.value)}
            fullWidth
          />
          <TextField
            type="date"
            label="Fecha Inicio"
            InputLabelProps={{ shrink: true }}
            value={filtroFechaInicio}
            onChange={(e) => setFiltroFechaInicio(e.target.value)}
          />
          <TextField
            type="date"
            label="Fecha Fin"
            InputLabelProps={{ shrink: true }}
            value={filtroFechaFin}
            onChange={(e) => setFiltroFechaFin(e.target.value)}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress />
          </Box>
        ) : packsFiltrados.length > 0 ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID Descuento</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Fecha Inicio</TableCell>
                <TableCell>Fecha Fin</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {packsFiltrados.map((p) => (
                <TableRow key={p.idDescuento}>
                  <TableCell>{p.idDescuento}</TableCell>
                  <TableCell>{p.descripcion}</TableCell>
                  <TableCell>{new Date(p.fechaInicio).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(p.fechaFin).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        onSelect(p);
                        onClose();
                      }}
                    >
                      Seleccionar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography sx={{ mt: 2 }}>No se encontraron packs registrados.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalHistoriaOferta;