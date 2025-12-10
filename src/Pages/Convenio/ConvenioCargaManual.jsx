import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TextField,
  IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { BASE_URL } from "../../Conf/config";

const ConvenioCargaManual = ({ open, onClose, tipoPago, idMedico }) => {
  const [loading, setLoading] = useState(false);
  const [medicos, setMedicos] = useState([]);
  const [periodo, setPeriodo] = useState(
    `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}`
  );

  const meses = [
    { nombre: "Enero", valor: "01" },
    { nombre: "Febrero", valor: "02" },
    { nombre: "Marzo", valor: "03" },
    { nombre: "Abril", valor: "04" },
    { nombre: "Mayo", valor: "05" },
    { nombre: "Junio", valor: "06" },
    { nombre: "Julio", valor: "07" },
    { nombre: "Agosto", valor: "08" },
    { nombre: "Septiembre", valor: "09" },
    { nombre: "Octubre", valor: "10" },
    { nombre: "Noviembre", valor: "11" },
    { nombre: "Diciembre", valor: "12" },
  ];

  // Obtener médicos desde API
  const obtenerMedicos = async () => {
    if (!tipoPago || !idMedico) return;
    setLoading(true);
    try {
      const resp = await axios.get(`${BASE_URL}/api/Contabilidad_Convenio/ObtMedic`, {
        params: { docum: tipoPago, idmedico: idMedico }
      });

      const datos = resp.data.map(m => ({
        ...m,
        unidadFm: "",
        descuento: "",
        ventas: 0,
        pagoBruto: 0,
        renta: 0,
        pagoDespues: 0,
        pagoDespuesNeto: 0,
      }));

      setMedicos(datos);
    } catch (e) {
      console.error("Error cargando médicos:", e);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar cálculos automáticos
  const actualizarCalculos = (index, campo, valor) => {
    setMedicos(prev => {
      const newData = [...prev];
      const item = { ...newData[index], [campo]: valor };

      const unidad = parseFloat(item.unidadFm) || 0;
      const descuento = parseFloat(item.descuento) || 0;
      const ventas = parseFloat(item.ventas) || 0;

      item.pagoBruto = unidad * 10;
      item.renta = item.pagoBruto * 0.08;
      item.pagoDespues = item.pagoBruto - descuento;
      item.pagoDespuesNeto = item.pagoDespues - item.renta;

      newData[index] = item;
      return newData;
    });
  };

  // Eliminar fila
  const eliminarFila = (index) => {
    setMedicos(prev => prev.filter((_, i) => i !== index));
  };

  // Guardar datos en API
const guardarDatos = async () => {
  try {
    const datosAGuardar = medicos.map(m => ({
      ...m,
      periodo,
      distrito: m.distrito || "-",           // si es null, guarda "-"
      tipoDocumento:  String(m.tipo_Documento || "-"),// si es null, guarda "-"
      DocIdentidad: m.doc_Identidad || "-",
      TipoPago: tipoPago || "-",
      CuentaCorriente: m.cuenta_Corriente || "-",
      CuentaInterbancaria: m.cuenta_Interbancaria || "-",
      descuento:parseFloat(m.descuento) || 0,
      idrepresentate:idMedico
    }));

    const resp = await axios.post(`${BASE_URL}/api/Contabilidad_Convenio/insertar-cargaManual`, datosAGuardar);
    alert(`Se guardaron ${resp.data.totalInsertados} registros correctamente.`);
  } catch (e) {
    console.error("Error al guardar:", e.response?.data || e.message);
    alert("Error al guardar los datos");
  }
};

  useEffect(() => {
    if (open) obtenerMedicos();
  }, [open, tipoPago]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle> Carga Manual – Médicos ({tipoPago}) </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            {/* SELECT PERIODO GLOBAL */}
            <TextField
              select
              label="Periodo"
              value={periodo}
              onChange={e => setPeriodo(e.target.value)}
              SelectProps={{ native: true }}
              sx={{ mb: 2, width: 200 }}
            >
              {meses.map((mes) => {
                const periodoValue = `${new Date().getFullYear()}-${mes.valor}`;
                return (
                  <option key={mes.valor} value={periodoValue}>
                    {mes.nombre}
                  </option>
                );
              })}
            </TextField>

            <Paper sx={{ maxHeight: 600, overflow: "auto" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Representante</TableCell>
                    <TableCell>Lugar</TableCell>
                    <TableCell>Distrito</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Tipo Doc.</TableCell>
                    <TableCell>Documento</TableCell>
                    <TableCell>RUC</TableCell>
                    <TableCell>Banco</TableCell>
                    <TableCell>Cuenta</TableCell>
                    <TableCell>CCI</TableCell>
                    <TableCell>Unidad FM</TableCell>
                    <TableCell>Ventas</TableCell>
                    <TableCell>Pago Bruto</TableCell>
                    <TableCell>Descuento</TableCell>
                    <TableCell>Renta</TableCell>
                    <TableCell>Pago Después</TableCell>
                    <TableCell>Pago Después Neto</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {medicos.map((m, index) => (
                    <TableRow key={index}>
                      <TableCell>{m.representante}</TableCell>
                      <TableCell>{m.lugar}</TableCell>
                <TableCell>{m.distrito || "-"}</TableCell>
                      <TableCell>{m.nombre}</TableCell>
                      <TableCell>{m.tipo_Documento}</TableCell>
                      <TableCell>{m.doc_Identidad}</TableCell>
                      <TableCell>{m.ruc}</TableCell>
                      <TableCell>{m.banco}</TableCell>
                      <TableCell>{m.cuenta_Corriente}</TableCell>
                      <TableCell>{m.cuenta_Interbancaria}</TableCell>

                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={m.unidadFm}
                          onChange={e => actualizarCalculos(index, "unidadFm", e.target.value)}
                          inputProps={{ min: 0 }}
                          sx={{ width: 120, height: 40 }} 
                        />
                      </TableCell>

                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={m.ventas}
                          onChange={e => actualizarCalculos(index, "ventas", e.target.value)}
                          inputProps={{ min: 0 }}
                          sx={{ width: 120, height: 40 }} 
                        />
                      </TableCell>

                      <TableCell>{m.pagoBruto.toFixed(2)}</TableCell>

                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={m.descuento}
                          onChange={e => actualizarCalculos(index, "descuento", e.target.value)}
                          inputProps={{ min: 0 }}
                          fullWidth
                        />
                      </TableCell>

                      <TableCell>{m.renta.toFixed(2)}</TableCell>
                      <TableCell>{m.pagoDespues.toFixed(2)}</TableCell>
                      <TableCell>{m.pagoDespuesNeto.toFixed(2)}</TableCell>

                      <TableCell>
                        <IconButton color="error" onClick={() => eliminarFila(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={guardarDatos} color="primary" variant="contained">
          Guardar
        </Button>
        <Button onClick={onClose} color="secondary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConvenioCargaManual; 