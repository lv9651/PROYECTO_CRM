import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Collapse,
  IconButton,
} from "@mui/material";
import { BASE_URL } from "../../Conf/config";
import GenerarPago from "./GenerarPago";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

const RecibosValidados = () => {
  const [data, setData] = useState([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [consultasSeleccionadas, setConsultasSeleccionadas] = useState([]);
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(null);
  const [fechasDetalleFila, setFechasDetalleFila] = useState("");
  const [expandedRows, setExpandedRows] = useState({});

  // 🔹 Obtener datos validados
  const fetchData = async () => {
    if (!fechaInicio || !fechaFin) return alert("Ingrese ambas fechas");
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/api/Contabilidad_Convenio/Pago-Agrupadas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
      );

      // Filtrar solo validados
      const validados = res.data.filter((row) => row.validado === true);

      setData(validados);
    } catch (error) {
      console.error(error);
      alert("Error al obtener los datos");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Abrir modal enviando todos los detalles
// 🔹 Abrir modal enviando todos los detalles

const handleAbrirModal = (detallesFila, medico) => {
  setConsultasSeleccionadas(detallesFila);
  setMedicoSeleccionado(medico);

  // Tomar solo la primera fecha del detalle
  const fechaUnica = detallesFila[0]?.fecha
    ? detallesFila[0].fecha.split("T")[0]
    : "";

  setFechasDetalleFila(fechaUnica); // enviar solo una fecha

  setOpenModal(true);
};

  const toggleRow = (idx) => {
    setExpandedRows((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <Box sx={{ p: 4, minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <Typography variant="h4" fontWeight="bold" mb={3} textAlign="center">
        Recibos de Pagos Validados
      </Typography>

      {/* Filtros */}
      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
        <TextField
          label="Fecha Inicio"
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Fecha Fin"
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" color="primary" onClick={fetchData}>
          Consultar
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ backgroundColor: "#f3f4f6" }}>
              <TableRow>
                <TableCell />
                <TableCell>Sede</TableCell>
                <TableCell>Médico</TableCell>
                <TableCell>Pago Turno</TableCell>
                <TableCell>N° Consultas</TableCell>
                <TableCell>Cant Proc</TableCell>
                <TableCell>S/ Proced.</TableCell>
                <TableCell>Fórmulas</TableCell>
                <TableCell>Acción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No hay registros
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, idx) => (
                  <React.Fragment key={idx}>
                    <TableRow>
                      <TableCell>
                        <IconButton size="small" onClick={() => toggleRow(idx)}>
                          {expandedRows[idx] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </IconButton>
                      </TableCell>
                      <TableCell>{row.sede}</TableCell>
                      <TableCell>{row.medico}</TableCell>
                      <TableCell>{row.pagoTurno}</TableCell>
                      <TableCell>{row.totalNConsultas}</TableCell>
                      <TableCell>{row.totalCantProc}</TableCell>
                      <TableCell>{row.total?.toFixed(2)}</TableCell>
                      <TableCell>{row.totalFormulas}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() =>
                            handleAbrirModal(row.detalles, { nombres: row.medico, ruc: row.RUC })
                          }
                        >
                          Generar Pago
                        </Button>
                      </TableCell>
                    </TableRow>

                    {/* Detalle expandible */}
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                        <Collapse in={expandedRows[idx]} timeout="auto" unmountOnExit>
                          <Box margin={1}>
                            <Typography variant="subtitle2" gutterBottom>
                              Detalles
                            </Typography>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Fecha</TableCell>
                                  <TableCell>Sede</TableCell>
                                       <TableCell>Pago Turno</TableCell>
                                       <TableCell>Consulta</TableCell>
                                  <TableCell>Procedimiento</TableCell>
                                <TableCell>Total Proc.</TableCell>
                                  <TableCell>Formula</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {row.detalles.map((d, i) => (
                                  <TableRow key={i}>
                                    <TableCell>{d.fecha.split("T")[0]}</TableCell>
                                    <TableCell>{d.sede}</TableCell>
                                         <TableCell>{d.pagoTurno}</TableCell>
                                           <TableCell>{d.nConsultas}</TableCell>
                                    <TableCell>{d.cantProc}</TableCell>
                               <TableCell>{d.total}</TableCell>
                                    <TableCell>{d.formulas}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {openModal && (
        <GenerarPago
          consultas={consultasSeleccionadas}
          medico={medicoSeleccionado}
          fechasDetalleFila={fechasDetalleFila}
          open={openModal}
          onClose={() => setOpenModal(false)}
              modoLectura={true} // <-- Solo lectura
        />
      )}
    </Box>
  );
};

export default RecibosValidados;