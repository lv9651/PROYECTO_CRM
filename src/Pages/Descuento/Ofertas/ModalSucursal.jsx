import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Typography,
  Box,
  Divider,
  Paper,
} from "@mui/material";
import axios from "axios";
import { BASE_URL } from '../../../Conf/config';
const ModalSucursal = ({ open, onClose, onSelect, sucursalesSeleccionadas = [] }) => {
  const [sucursales, setSucursales] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      axios
        .get(`${BASE_URL}/api/Descuento/sucursalQF`)
        .then((res) => setSucursales(res.data))
        .catch(() => alert("Error al cargar sucursales"))
        .finally(() => setLoading(false));

      setSeleccionadas(sucursalesSeleccionadas.map((s) => s.idSucursal));
    }
  }, [open, sucursalesSeleccionadas]);

  const handleToggle = (id) => {
    setSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSeleccionarTodo = () => {
    if (seleccionadas.length === sucursales.length) {
      setSeleccionadas([]); // Deseleccionar todo
    } else {
      setSeleccionadas(sucursales.map((s) => s.idSucursal)); // Seleccionar todo
    }
  };

  const handleConfirmar = () => {
    const seleccionFinal = sucursales.filter((s) =>
      seleccionadas.includes(s.idSucursal)
    );
    onSelect(seleccionFinal);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 600, textAlign: "center" }}>
        Seleccionar Sucursales
      </DialogTitle>

      <Divider />

      <DialogContent dividers sx={{ backgroundColor: "#fafafa" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        ) : sucursales.length === 0 ? (
          <Typography textAlign="center" color="text.secondary">
            No hay sucursales disponibles.
          </Typography>
        ) : (
          <Box>
            {/* Encabezado */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography sx={{ fontWeight: 500 }}>
                Total: {sucursales.length} sucursales
              </Typography>
              <Button
                size="small"
                onClick={handleSeleccionarTodo}
                variant="outlined"
                color="primary"
              >
                {seleccionadas.length === sucursales.length
                  ? "Deseleccionar todo"
                  : "Seleccionar todo"}
              </Button>
            </Box>

            {/* Lista de sucursales */}
            <Paper
              variant="outlined"
              sx={{
                maxHeight: 400,
                overflowY: "auto",
                p: 1,
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#bbb",
                  borderRadius: "3px",
                },
              }}
            >
              <Box display="flex" flexDirection="column" gap={0.5}>
                {sucursales.map((s) => (
                  <FormControlLabel
                    key={s.idSucursal}
                    control={
                      <Checkbox
                        checked={seleccionadas.includes(s.idSucursal)}
                        onChange={() => handleToggle(s.idSucursal)}
                        color="primary"
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: 15 }}>
                        {s.nombreSucursal}
                      </Typography>
                    }
                    sx={{
                      borderBottom: "1px solid #eee",
                      py: 0.5,
                      px: 1,
                      "&:hover": { backgroundColor: "#f5f5f5" },
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleConfirmar}
          variant="contained"
          color="primary"
          disabled={seleccionadas.length === 0}
        >
          Confirmar ({seleccionadas.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalSucursal;