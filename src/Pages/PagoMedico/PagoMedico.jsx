import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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
  IconButton,
  Collapse,
  CircularProgress,
  Card,
  Grid,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import axios from "axios";
import { BASE_URL } from '../../Conf/config';
const PagoMedico = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [openRow, setOpenRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [search, setSearch] = useState("");

  const fetchData = () => {
    if (!fechaInicio || !fechaFin) return alert("Ingrese ambas fechas");
    setLoading(true);
    axios
      .get(
        `${BASE_URL}/api/Contabilidad_Convenio/Pago-Agrupadas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
      )
      .then((res) => {
        setData(res.data);
        setFilteredData(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };
const exportToExcel = () => {
  if (filteredData.length === 0) return;

  // Preparar datos para Excel
  const exportData = filteredData.map((row) => ({
    Sede: row.sede,
    Medico: row.medico,
    "Pago Turno": row.pagoTurno,
    "N° Consultas": row.totalNConsultas,
    "Cant Proc": row.totalCantProc,
    Total: row.total.toFixed(2),
    Fórmulas: row.totalFormulas,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "ReportePagoMedico");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(dataBlob, `Reporte_PagoMedico_${fechaInicio}_${fechaFin}.xlsx`);
};
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = data.filter(
      (row) =>
        row.medico.toLowerCase().includes(value) ||
        row.sede.toLowerCase().includes(value)
    );
    setFilteredData(filtered);
  };

  // Calcular métricas resumidas
  const totalConsultas = filteredData.reduce(
    (acc, curr) => acc + curr.totalNConsultas,
    0
  );
  const totalProc = filteredData.reduce(
    (acc, curr) => acc + curr.totalCantProc,
    0
  );
  const totalPagos = filteredData.reduce((acc, curr) => acc + curr.total, 0);
  const totalFormulas = filteredData.reduce(
    (acc, curr) => acc + curr.totalFormulas,
    0
  );

  return (
    <Box sx={{ p: 4, backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight="bold" mb={3} textAlign="center">
        Reporte de Consultas Médicas
      </Typography>

      {/* Filtros y busqueda */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "center",
          mb: 4,
        }}
      >
        <TextField
          label="Fecha Inicio"
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 200 }}
        />
        <TextField
          label="Fecha Fin"
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 200 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={fetchData}
          sx={{ height: 56 }}
        >
          Consultar
        </Button>
        <Button
  variant="outlined"
  color="success"
  onClick={exportToExcel}
  sx={{ height: 56 }}
>
  Descargar Excel
</Button>
        {data.length > 0 && (
          <TextField
            label="Buscar por Médico o Sede"
            variant="outlined"
            value={search}
            onChange={handleSearch}
            sx={{ minWidth: 250 }}
          />
        )}
      </Box>

      {/* Resumen de métricas */}
      {filteredData.length > 0 && (
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, textAlign: "center", boxShadow: 3 }}>
              <Typography color="text.secondary">Total Consultas</Typography>
              <Typography variant="h5" fontWeight="bold">
                {totalConsultas}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, textAlign: "center", boxShadow: 3 }}>
              <Typography color="text.secondary">Total Procedimientos</Typography>
              <Typography variant="h5" fontWeight="bold">
                {totalProc}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, textAlign: "center", boxShadow: 3 }}>
              <Typography color="text.secondary">Total Pagos</Typography>
              <Typography variant="h5" fontWeight="bold">
                {totalPagos.toFixed(2)}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, textAlign: "center", boxShadow: 3 }}>
              <Typography color="text.secondary">Total Fórmulas</Typography>
              <Typography variant="h5" fontWeight="bold">
                {totalFormulas}
              </Typography>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabla */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{ boxShadow: 3, borderRadius: 2, overflowX: "auto" }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: "#f3f4f6" }}>
              <TableRow>
                <TableCell />
                <TableCell>Sede</TableCell>
                <TableCell>Médico</TableCell>
                <TableCell>Pago Turno</TableCell>
                <TableCell>N° Consultas</TableCell>
                <TableCell>Cant Proc</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Fórmulas</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((row, index) => (
                <React.Fragment key={`${row.sede}-${row.medico}-${index}`}>
                  <TableRow hover>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() =>
                          setOpenRow(openRow === index ? null : index)
                        }
                      >
                        {openRow === index ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                      </IconButton>
                    </TableCell>
                    <TableCell>{row.sede}</TableCell>
                    <TableCell>{row.medico}</TableCell>
                    <TableCell>{row.pagoTurno}</TableCell>
                    <TableCell>{row.totalNConsultas}</TableCell>
                    <TableCell>{row.totalCantProc}</TableCell>
                    <TableCell>{row.total.toFixed(2)}</TableCell>
                    <TableCell>{row.totalFormulas}</TableCell>
                  </TableRow>

                  {/* Detalle expandible */}
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                      <Collapse in={openRow === index} timeout="auto" unmountOnExit>
                        <Box margin={2}>
                          <Typography variant="subtitle1" gutterBottom>
                            Detalle de Consultas
                          </Typography>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Turno</TableCell>
                                <TableCell>N° Consultas</TableCell>
                                <TableCell>Cant Proc</TableCell>
                                <TableCell>Total</TableCell>
                                <TableCell>Fórmulas</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {row.detalles.map((det, detIndex) => (
                                <TableRow key={detIndex}>
                                  <TableCell>
                                    {new Date(det.fecha).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>{det.turno}</TableCell>
                                  <TableCell>{det.nConsultas}</TableCell>
                                  <TableCell>{det.cantProc}</TableCell>
                                  <TableCell>{det.total.toFixed(2)}</TableCell>
                                  <TableCell>{det.formulas}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}

              {filteredData.length === 0 && data.length > 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No se encontraron resultados para la búsqueda
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default PagoMedico;