import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, Table, TableHead, TableBody,
  TableRow, TableCell, Paper, Typography
} from '@mui/material';
import axios from 'axios';
import { BASE_URL } from '../../Conf/config';

const FiltrarPagoModal = ({ open, onClose }) => {
  const [representante, setRepresentante] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFiltrar = async () => {
    if (!representante || !periodo) {
      alert("Debe ingresar representante y periodo");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/Contabilidad_Convenio/filtrarConta`, {
        params: { representante, periodo }
      });
      setResultados(response.data);
    } catch (err) {
      console.error(err);
      alert("Error al filtrar pagos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Filtrar Pagos por Convenio</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <TextField
              label="Representante"
              value={representante}
              onChange={(e) => setRepresentante(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Periodo (YYYY-MM)"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              onClick={handleFiltrar}
              variant="contained"
              disabled={loading}
            >
              {loading ? "Buscando..." : "Filtrar"}
            </Button>
          </Grid>
        </Grid>

        {resultados.length > 0 && (
          <Paper sx={{ maxHeight: 400, overflowY: 'auto', mt: 2 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Periodo</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Documento</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resultados.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.periodo}</TableCell>
                    <TableCell>{new Date(r.fecha).toLocaleDateString()}</TableCell>
                    <TableCell>{r.nombre}</TableCell>
<TableCell>
  {r.documento ? (
    <Button
      variant="outlined"
      size="small"
      onClick={() => {
        // Documento en base64
        const base64 = r.documento;

        // Detectar el tipo MIME según el prefijo Base64
        let mime = "application/octet-stream";

        if (base64.startsWith("iVBORw0KGgo")) mime = "image/png";         // PNG
        if (base64.startsWith("/9j/")) mime = "image/jpeg";                // JPG
        if (base64.startsWith("JVBER")) mime = "application/pdf";          // PDF
        if (base64.startsWith("UEsD")) mime = "application/zip";           // DOCX o XLSX

        // Convertir Base64 → Blob
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) =>
          byteCharacters.charCodeAt(i)
        );
        const byteArray = new Uint8Array(byteNumbers);

        const blob = new Blob([byteArray], { type: mime });
        const url = URL.createObjectURL(blob);

        window.open(url, "_blank");
      }}
    >
      Ver Documento
    </Button>
  ) : (
    "Sin documento"
  )}
</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}

        {resultados.length === 0 && !loading && (
          <Typography variant="body2" sx={{ mt: 2 }}>No hay resultados</Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FiltrarPagoModal;