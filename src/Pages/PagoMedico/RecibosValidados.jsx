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
import GenerarPago from "./GenerarPago";

const RecibosValidados = () => {
  const [data, setData] = useState([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [consultasSeleccionadas, setConsultasSeleccionadas] = useState([]);
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(null);
  const [fechasDetalleFila, setFechasDetalleFila] = useState("");
  const [SedesDetalleFila, setsedesDetalleFila] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedRows, setSelectedRows] = useState({});

  const fetchData = async () => {
    if (!fechaInicio || !fechaFin) {
      alert("Ingrese ambas fechas");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/api/Contabilidad_Convenio/Pago-Agrupadas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
      );

      // Filtrar solo los que ya están validados
      const validados = res.data.filter((row) => row.validado === true);
      setData(validados);

      // Inicializar el estado de selección
      const sel = {};
      validados.forEach((row) => {
        const key = `${row.sede}_${row.medico}`;
        sel[key] = false;
      });
      setSelectedRows(sel);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      alert("Error al obtener los datos");
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (idx) => {
    setExpandedRows((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSelectRow = (key) => {
    setSelectedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    const newSel = {};
    data.forEach((row) => {
      const key = `${row.sede}_${row.medico}`;
      newSel[key] = checked;
    });
    setSelectedRows(newSel);
  };

  const anySelected = Object.values(selectedRows).some((v) => v);
  const allSelected = data.length > 0 && Object.values(selectedRows).every((v) => v);

  // Función para abrir modal con modo lectura y datos
  const handleAbrirModal = (detallesFila, medico) => {
    setConsultasSeleccionadas(detallesFila);
    setMedicoSeleccionado(medico);


    // Obtener fechas únicas de los detalles
    const fechasUnicas = [
      ...new Set(
        detallesFila.map((d) =>
          new Date(d.fecha).toISOString().split("T")[0]
        )
      ),
    ];
 

    
const SedesUnicas = [
  ...new Set(
    detallesFila.map((d) => d.sede)  // Asumimos que `d.sede` es un string o un valor ya formateado
  ),
];

setsedesDetalleFila(SedesUnicas.join(",")); // Concatena las sedes únicas en un solo string, separado por comas
   setFechasDetalleFila(fechasUnicas.join(","));


    setOpenModal(true);
  };




  // Acción al hacer clic en “Ver Pago de seleccionados”
  const handleVerPagosSeleccionados = () => {
    const filas = data.filter((row) => {
      const key = `${row.sede}_${row.medico}`;
      return selectedRows[key];
    });
    if (filas.length === 0) {
      alert("Seleccione al menos un registro para ver su pago");
      return;
    }
    if (filas.length > 1) {
      alert("Solo puede ver un pago a la vez");
      return;
    }
    const fila = filas[0];
    handleAbrirModal(fila.detalles, { nombres: fila.medico, ruc: fila.RUC });
  };

  return (
    <Box sx={{ p: 4, minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <Typography variant="h4" fontWeight="bold" mb={3} textAlign="center">
        Recibos de Pagos Validados
      </Typography>

      {/* Filtros de fecha */}
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
        <>
          <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#f3f4f6" }}>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={anySelected && !allSelected}
                      checked={allSelected}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
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
                    <TableCell colSpan={10} align="center">
                      No hay registros validados
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row, idx) => {
                    const key = `${row.sede}_${row.medico}`;
                    return (
                      <React.Fragment key={key}>
                        <TableRow hover>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={!!selectedRows[key]}
                              onChange={() => handleSelectRow(key)}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => toggleRow(idx)}
                            >
                              {expandedRows[idx] ? (
                                <KeyboardArrowUp />
                              ) : (
                                <KeyboardArrowDown />
                              )}
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
                                handleAbrirModal(row.detalles, {
                                  nombres: row.medico,
                                  ruc: row.RUC,
                                })
                              }
                            >
                              Ver Pago
                            </Button>
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell
                            style={{ paddingBottom: 0, paddingTop: 0 }}
                            colSpan={10}
                          >
                            <Collapse
                              in={expandedRows[idx]}
                              timeout="auto"
                              unmountOnExit
                            >
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
                                        <TableCell>
                                          {d.fecha.split("T")[0]}
                                        </TableCell>
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
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box mt={3} textAlign="right">
            <Button
              variant="contained"
              color="success"
              onClick={handleVerPagosSeleccionados}
              disabled={!anySelected}
            >
              Ver Pago de seleccionados
            </Button>
          </Box>
        </>
      )}

      {openModal && (
        <GenerarPago
          consultas={consultasSeleccionadas}
          medico={medicoSeleccionado}
          fechasDetalleFila={fechasDetalleFila}
           SedesDetalleFila={SedesDetalleFila}
          open={openModal}
          onClose={() => setOpenModal(false)}
      
        />
      )}
    </Box>
  );
};



export default RecibosValidados;