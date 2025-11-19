import React, { useState , useRef} from "react";
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
  TablePagination,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import axios from "axios";
import { BASE_URL } from "../../Conf/config";
import { useAuth } from "../../Compo/AuthContext";
import GenerarPago from "./GenerarPago";
import * as XLSX from 'xlsx';

const PagoMedico = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [openRow, setOpenRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [selectedRows, setSelectedRows] = useState({});
  const [loadingRows, setLoadingRows] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [selectedMedico, setSelectedMedico] = useState(null);
  const [selectedConsultas, setSelectedConsultas] = useState([]);
  const [fechasDetalleFila, setFechasDetalleFila] = useState([]);
const [sedesDetalleFila, setSedesDetalleFila] = useState("");
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

  const allSelected = filteredData.length > 0 && filteredData.every((row) => selectedRows[`${row.sede}_${row.medico}`]);
  const someSelected = Object.values(selectedRows).filter(Boolean).length > 0 && !allSelected;

  const handleOpenModal = (row) => {
    setSelectedMedico({ nombres: row.medico });
    setSelectedConsultas(row.detalles);
const sedesUnicas = [...new Set(row.detalles.map((d) => d.sede.trim()))];
setSedesDetalleFila(sedesUnicas.join(","));
    const fechasUnicas = [
      ...new Set(row.detalles.map((d) => new Date(d.fecha).toISOString().split("T")[0])),
    ];

    setFechasDetalleFila(fechasUnicas.join(","));
    setOpenModal(true);
  };
   const handleUploadExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx")) {
      alert("El archivo debe ser un Excel (.xlsx)");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await axios.post(`${BASE_URL}/api/Contabilidad_Convenio/SubirExcel-pagomedico`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(`✅ ${res.data.Mensaje}. Registros insertados: ${res.data.RegistrosInsertados}`);
      fetchData(); // recargar tabla
    } catch (err) {
      console.error(err);
      if (err.response?.data?.Errores) {
        alert("❌ Errores:\n" + err.response.data.Errores.join("\n"));
      } else {
        alert("❌ Ocurrió un error al subir el Excel");
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // reset input
    }
  };

const handleDescargarPlantilla = () => {
  // Columnas de la plantilla
  const dataPlantilla = [
    {
      Fecha: "",
      Sede: "",
      Medico: "",
      PagoTurno: "",
      Turno: "",
      NConsultas: "",
      CantProc: "",
      Total: "",
      Formulas: ""
    }
  ];

  // Crear libro Excel
  const ws = XLSX.utils.json_to_sheet(dataPlantilla);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Plantilla");

  // Descargar archivo
  XLSX.writeFile(wb, "Plantilla_PagoMedico.xlsx");
};
  // ✅ Procesar validaciones
  const handleProcesarValidaciones = async () => {
    const usuario = user?.emp_codigo || "admin";
    const now = new Date().toISOString();

    const filasAValidar = filteredData.filter((row) => selectedRows[`${row.sede}_${row.medico}`]);

    if (filasAValidar.length === 0) {
      alert("No hay filas seleccionadas para validar");
      return;
    }

    try {
      for (const fila of filasAValidar) {
        for (const detalle of fila.detalles) {
          const fecha = new Date(detalle.fecha).toISOString().split("T")[0];
          const sede = detalle.sede.trim();
          const pagoTurno = Number(detalle.pagoTurno).toFixed(2);
          const numColegiatura = detalle.numColegiatura.toString().padStart(6, "0");
          const idConcatenado = `${fecha}_${sede}_${pagoTurno}_${numColegiatura}`;

          await axios.put(`${BASE_URL}/api/Contabilidad_Convenio/validar/${idConcatenado}?usuario=${usuario}`);
          console.log("✅ Validado:", idConcatenado);
        }
      }

      alert("✅ Validaciones procesadas correctamente");
      fetchData();
    } catch (err) {
      console.error("Error al validar:", err);
      alert("❌ Ocurrió un error al validar");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
      {/*   <Button variant="contained" color="success" onClick={handleProcesarValidaciones} sx={{ height: 56 }}>
          Procesar Validaciones
        </Button> */}
         {/* Botón Subir Excel */}
         <Button
  variant="contained"
  color="warning"
  sx={{ height: 56 }}
  onClick={handleDescargarPlantilla}
>
  Descargar Plantilla
</Button>
        <input
          type="file"
          accept=".xlsx"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleUploadExcel}
        />
        <Button
          variant="contained"
          color="info"
          sx={{ height: 56 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Subiendo..." : "Subir Excel"}
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2, overflowX: "auto" }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#f3f4f6" }}>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox indeterminate={someSelected} checked={allSelected} onChange={handleSelectAll} />
                  </TableCell>
                  <TableCell />
                  <TableCell>Médico</TableCell>
                  <TableCell>Pago Turno</TableCell>
                  <TableCell>N° Consultas</TableCell>
                  <TableCell>Cant Proc</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Fórmulas</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((row, index) => {
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
                        <TableCell>{row.medico}</TableCell>
                        <TableCell>{row.pagoTurno}</TableCell>
                        <TableCell>{row.totalNConsultas}</TableCell>
                        <TableCell>{row.totalCantProc}</TableCell>
                        <TableCell>{row.total.toFixed(2)}</TableCell>
                        <TableCell>{row.totalFormulas}</TableCell>
                        <TableCell>
                          <Button variant="contained" size="small" color="secondary" onClick={() => handleOpenModal(row)}>
                            Ver Pago
                          </Button>
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell colSpan={10} style={{ paddingBottom: 0, paddingTop: 0 }}>
                          <Collapse in={openRow === index} timeout="auto" unmountOnExit>
                            <Box margin={2}>
                              <Typography variant="subtitle1" gutterBottom>
                                Detalle de Consultas
                              </Typography>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Sede</TableCell>
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
                                      <TableCell>{det.sede}</TableCell>
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

          {/* Paginación */}
          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10]}
          />
        </>
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
           modoLectura={true}
             SedesDetalleFila={sedesDetalleFila}   
        />
      )}
    </Box>
  );
};

export default PagoMedico;