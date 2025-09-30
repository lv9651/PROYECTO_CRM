import React, { useState } from "react";
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
  Checkbox,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import axios from "axios";
import { BASE_URL } from "../../Conf/config";
import { useAuth } from "../../Compo/AuthContext";
import GenerarPago from "./GenerarPago"; // 👈 Importamos el modal

const PagoMedico = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [openRow, setOpenRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [selectedRows, setSelectedRows] = useState({});
  const [loadingRows, setLoadingRows] = useState({});
  const { user } = useAuth();

  // 👉 Estado del modal
  const [openModal, setOpenModal] = useState(false);
  const [selectedMedico, setSelectedMedico] = useState(null);
  const [selectedConsultas, setSelectedConsultas] = useState([]);
  const [fechasDetalleFila, setFechasDetalleFila] = useState([]);

  const fetchData = () => {
    if (!fechaInicio || !fechaFin) return alert("Ingrese ambas fechas");
    setLoading(true);

    axios
      .get(`${BASE_URL}/api/Contabilidad_Convenio/Pago-Agrupadas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
      .then((res) => {
        setData(res.data);
        setFilteredData(res.data);

        const initialSelection = {};
        res.data.forEach((row) => {
          const key = `${row.sede}_${row.medico}`;
          initialSelection[key] = !!row.validado;
        });
        setSelectedRows(initialSelection);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleSelectRow = (key) => {
    setSelectedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    const newSelection = {};
    filteredData.forEach((row) => {
      const key = `${row.sede}_${row.medico}`;
      newSelection[key] = checked;
    });
    setSelectedRows(newSelection);
  };

  const allSelected =
    filteredData.length > 0 &&
    filteredData.every((row) => selectedRows[`${row.sede}_${row.medico}`]);

  const someSelected =
    Object.values(selectedRows).filter(Boolean).length > 0 && !allSelected;

  // 👉 Función para abrir modal con datos de la fila
const handleOpenModal = (row) => {
  setSelectedMedico({ nombres: row.medico });
  setSelectedConsultas(row.detalles);

  // Convertir las fechas a yyyy-MM-dd y quitar duplicados
  const fechasUnicas = [
    ...new Set(
      row.detalles.map(
        (d) => new Date(d.fecha).toISOString().split("T")[0]
      )
    ),
  ];

  // Convertir a string separado por comas
  const fechasComas = fechasUnicas.join(",");

  setFechasDetalleFila(fechasComas);
  setOpenModal(true);
};

  return (
    <Box sx={{ p: 4, backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight="bold" mb={3} textAlign="center">
        Reporte de Consultas Médicas
      </Typography>

      {/* Filtros */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center", mb: 4 }}>
        <TextField label="Fecha Inicio" type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 200 }} />
        <TextField label="Fecha Fin" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 200 }} />
        <Button variant="contained" color="primary" onClick={fetchData} sx={{ height: 56 }}>
          Consultar
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2, overflowX: "auto" }}>
          <Table>
            <TableHead sx={{ backgroundColor: "#f3f4f6" }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox indeterminate={someSelected} checked={allSelected} onChange={handleSelectAll} />
                </TableCell>
                <TableCell />
                <TableCell>Sede</TableCell>
                <TableCell>Médico</TableCell>
                <TableCell>Pago Turno</TableCell>
                <TableCell>N° Consultas</TableCell>
                <TableCell>Cant Proc</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Fórmulas</TableCell>
                <TableCell>Acciones</TableCell> {/* 👈 Nueva columna */}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((row, index) => {
                const key = `${row.sede}_${row.medico}`;
                return (
                  <React.Fragment key={key}>
                    <TableRow hover>
                      <TableCell padding="checkbox">
                        {loadingRows[key] ? (
                          <CircularProgress size={24} />
                        ) : (
                          <Checkbox
                            checked={!!selectedRows[key]}
                            onChange={() => handleSelectRow(key)}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => setOpenRow(openRow === index ? null : index)}>
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
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          color="secondary"
                          onClick={() => handleOpenModal(row)}
                        >
                          Generar Pago
                        </Button>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
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
                                    <TableCell>{new Date(det.fecha).toLocaleDateString()}</TableCell>
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
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal GenerarPago */}
      {openModal && (
        <GenerarPago
          open={openModal}
          onClose={() => setOpenModal(false)}
          medico={selectedMedico}
          consultas={selectedConsultas}
          fechasDetalleFila={fechasDetalleFila}
            recargarHoja={fetchData} 
        />
      )}
    </Box>
  );
};

export default PagoMedico;