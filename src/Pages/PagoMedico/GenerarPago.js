import React, { useState, useEffect } from "react";
import { Modal, Select, Button, Input, DatePicker, Checkbox, message } from "antd";
import axios from "axios";
import { BASE_URL } from "../../Conf/config";
import moment from "moment";
import { useAuth } from '../../Compo/AuthContext';

const { Option } = Select;

const GenerarPago = ({ consultas, medico, fechasDetalleFila,SedesDetalleFila, open, onClose, recargarHoja ,modoLectura}) => {
  // Datos bancarios
  const [banco, setBanco] = useState("");
  const [cuenta, setCuenta] = useState("");
  const [cci, setCci] = useState("");
  const [medicoRUC, setMedicoRUC] = useState("");
  const { user } = useAuth();

  // Estados de comprobantes QF y SMG
  const [qfData, setQfData] = useState({
    IdPago: null,
    tipoDoc: "RXH",
    fecha: null,
    comprobante: "",
    descripcion: "Servicios médicos",
  });
  const [smgData, setSmgData] = useState({
    IdPago: null,
    tipoDoc: "RXH",
    fecha: null,
    comprobante: "",
    descripcion: "Servicios médicos",
  });

  // Estados de detracción
  const [qfDetraccion, setQfDetraccion] = useState(false);
  const [smgDetraccion, setSmgDetraccion] = useState(false);

  // Flags
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [pagosExistentes, setPagosExistentes] = useState(false);
  const [loading, setLoading] = useState(false);

  // ---- Función para cargar datos guardados desde la API ----
  const cargarPagoGuardado = async () => {
    if (!medico || !fechasDetalleFila) return;

    try {
      setCargandoDatos(true);
      const totalPagoTurno = consultas.reduce((sum, c) => sum + (c.pagoTurno || 0), 0);

      // Corporación QF SAC
      const resQF = await axios.get(`${BASE_URL}/api/Contabilidad_Convenio/Obtener-PagoMedico`, {
        params: {
          sede: "Corporación QF SAC",
          medico: medico.nombres,
          pagoTurno: totalPagoTurno,
          fechasDetalle: fechasDetalleFila,
          SedesDetalle:SedesDetalleFila
        },
      });

      if (resQF.data && resQF.data.length > 0) {
        const pago = resQF.data[0];
        setBanco(pago.banco || "");
        setCuenta(pago.cuenta || "");
        setCci(pago.cci || "");
        setMedicoRUC(pago.medicoRUC || "");

        setQfData({
          IdPago: pago.idPago || null,
          tipoDoc: pago.tipoDoc || "RXH",
          fecha: pago.fecha || null,
          comprobante: pago.numeroComprobante || "",
          descripcion: pago.descripcion || "Servicios médicos",
        });
        setQfDetraccion(pago.aplicarDetraccion || false);
      }

      // Médicos Solidarios SMG SAC
      const resSMG = await axios.get(`${BASE_URL}/api/Contabilidad_Convenio/Obtener-PagoMedico`, {
        params: {
          sede: "Médicos Solidarios SMG SAC",
          medico: medico.nombres,
          pagoTurno: totalPagoTurno,
          fechasDetalle: fechasDetalleFila,
              SedesDetalle:SedesDetalleFila
        },
      });

      if (resSMG.data && resSMG.data.length > 0) {
        const pagoSMG = resSMG.data[0];
        setSmgData({
          IdPago: pagoSMG.idPago || null,
          tipoDoc: pagoSMG.tipoDoc || "RXH",
          fecha: pagoSMG.fecha || null,
          comprobante: pagoSMG.numeroComprobante || "",
          descripcion: pagoSMG.descripcion || "Servicios médicos",
        });
        setSmgDetraccion(pagoSMG.aplicarDetraccion || false);
      }

      setPagosExistentes(
        (resQF.data && resQF.data.length > 0) || (resSMG.data && resSMG.data.length > 0)
      );
    } catch (error) {
      console.error("Error al cargar pago guardado:", error);
    } finally {
      setCargandoDatos(false);
    }
  };

  const effectRan = React.useRef(false);

  useEffect(() => {
    if (effectRan.current === false && open) {
      cargarPagoGuardado();
    }
    return () => {
      effectRan.current = true;
    };
  }, [open, fechasDetalleFila]);

  // ---- Cálculos base ----
  const totalFormulas = consultas.reduce((sum, c) => sum + (c.formulas || 0), 0);
  const totalTurnos = consultas.reduce((sum, c) => sum + parseFloat(c.pagoTurno || 0), 0);
  const totalBruto = consultas.reduce((sum, c) => sum + (c.total || 0), 0);
  const totalProcedimientos = totalBruto * 0.4;
  const montoFormulas = totalFormulas * 10;
  const montoTurnoProc = totalTurnos + totalProcedimientos;

  // ---- Función para calcular IGV, renta y detracción ----
  const calcularTotales = (monto, tipoDoc, aplicarDetraccion = false) => {
    let igv = 0, renta = 0, detraccion = 0;
    if (tipoDoc === "RXH" && monto > 1500) renta = monto * 0.08;
    if (tipoDoc === "FACTURA") igv = monto * 0.18;
    if (aplicarDetraccion) detraccion = monto * 0.10;
    const total = monto + igv - renta - detraccion;
    return { igv, renta, detraccion, total };
  };

  const qfTotales = calcularTotales(montoFormulas, qfData.tipoDoc, qfDetraccion);
  const smgTotales = calcularTotales(montoTurnoProc, smgData.tipoDoc, smgDetraccion);

  // ---- Validar que los campos estén completos ----
  const camposCompletos =
    medicoRUC &&
    banco &&
    cuenta &&
    cci &&
    qfData.fecha &&
    qfData.comprobante &&
    smgData.fecha &&
    smgData.comprobante;

  // ---- Función para Confirmar pagos ----
  const handleConfirmar = async () => {
    if (!camposCompletos) {
      message.error("⚠️ Debe completar todos los campos antes de confirmar");
      return;
    }

    setLoading(true);
    try {
      const payload = [
        {
          MedicoNombre: medico?.nombres,
          MedicoRUC: medicoRUC,
          Banco: banco,
          Cuenta: cuenta,
          CCI: cci,
          Empresa: "Corporación QF SAC",
          TipoDoc: qfData.tipoDoc,
          Fecha: qfData.fecha,
          NumeroComprobante: qfData.comprobante,
          Descripcion: qfData.descripcion,
          MontoBase: montoFormulas,
          IGV: qfTotales.igv,
          Renta: qfTotales.renta,
          Detraccion: qfTotales.detraccion,
          Total: qfTotales.total,
          AplicarDetraccion: qfDetraccion,
          FechaRegistro: new Date(),
          FechasDetalle: fechasDetalleFila,
          idusuario: user?.emp_codigo || "",
          SedesDetalle:SedesDetalleFila
        },
        {
          MedicoNombre: medico?.nombres,
          MedicoRUC: medicoRUC,
          Banco: banco,
          Cuenta: cuenta,
          CCI: cci,
          Empresa: "Médicos Solidarios SMG SAC",
          TipoDoc: smgData.tipoDoc,
          Fecha: smgData.fecha,
          NumeroComprobante: smgData.comprobante,
          Descripcion: smgData.descripcion,
          MontoBase: montoTurnoProc,
          IGV: smgTotales.igv,
          Renta: smgTotales.renta,
          Detraccion: smgTotales.detraccion,
          Total: smgTotales.total,
          AplicarDetraccion: smgDetraccion,
          FechaRegistro: new Date(),
          FechasDetalle: fechasDetalleFila,
          idusuario: user?.emp_codigo || "",
            SedesDetalle:SedesDetalleFila
        },
      ];

      await axios.post(`${BASE_URL}/api/Contabilidad_Convenio/Guardar-PagoMedico`, payload);
      console.log("Pagos guardados correctamente");

      // Validar pagos
      for (const detalle of consultas) {
        const fecha = new Date(detalle.fecha).toISOString().split("T")[0];
        const sede = detalle.sede.trim();
        const pagoTurno = Number(detalle.pagoTurno).toFixed(2);
        const numColegiatura = detalle.numColegiatura.toString().padStart(6, "0");

        const idConcatenado = `${fecha}_${sede}_${pagoTurno}_${numColegiatura}`;
        const usuario = user?.emp_codigo || "admin";

        await axios.put(
          `${BASE_URL}/api/Contabilidad_Convenio/validar/${idConcatenado}?usuario=${usuario}`
        );

        console.log(`✅ Pago validado: ${idConcatenado}`);
      }

      if (typeof recargarHoja === "function") {
        await recargarHoja();
      }

      setPagosExistentes(true);
      onClose();
    } catch (err) {
      console.error("Error en el proceso de confirmar:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---- Función para Actualizar pagos ----
  const handleActualizar = async () => {
    if (!camposCompletos) {
      message.error("⚠️ Debe completar todos los campos antes de actualizar");
      return;
    }

    setLoading(true);
    try {
      if (qfData.IdPago) {
        await axios.put(`${BASE_URL}/api/Contabilidad_Convenio/Actualizar-PagoMedico`, {
          IdPago: qfData.IdPago,
          MedicoNombre: medico?.nombres,
          MedicoRUC: medicoRUC,
          Banco: banco,
          Cuenta: cuenta,
          CCI: cci,
          Empresa: "Corporación QF SAC",
          TipoDoc: qfData.tipoDoc,
          Fecha: qfData.fecha,
          NumeroComprobante: qfData.comprobante,
          Descripcion: qfData.descripcion,
          MontoBase: montoFormulas,
          IGV: qfTotales.igv,
          Renta: qfTotales.renta,
          Detraccion: qfTotales.detraccion,
          Total: qfTotales.total,
          AplicarDetraccion: qfDetraccion,
          FechasDetalle: fechasDetalleFila,
          idusuario: user?.emp_codigo || ""
        });
      }

      if (smgData.IdPago) {
        await axios.put(`${BASE_URL}/api/Contabilidad_Convenio/Actualizar-PagoMedico`, {
          IdPago: smgData.IdPago,
          MedicoNombre: medico?.nombres,
          MedicoRUC: medicoRUC,
          Banco: banco,
          Cuenta: cuenta,
          CCI: cci,
          Empresa: "Médicos Solidarios SMG SAC",
          TipoDoc: smgData.tipoDoc,
          Fecha: smgData.fecha,
          NumeroComprobante: smgData.comprobante,
          Descripcion: smgData.descripcion,
          MontoBase: montoTurnoProc,
          IGV: smgTotales.igv,
          Renta: smgTotales.renta,
          Detraccion: smgTotales.detraccion,
          Total: smgTotales.total,
          AplicarDetraccion: smgDetraccion,
          FechasDetalle: fechasDetalleFila,
          idusuario: user?.emp_codigo || ""
        });
      }

      console.log("Pagos actualizados correctamente");
      if (typeof recargarHoja === "function") {
        await recargarHoja();
      }
      onClose();
    } catch (err) {
      console.error("Error al actualizar pagos:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---- Loading ----
  if (cargandoDatos) {
    return (
      <Modal open={open} onCancel={onClose} footer={null} width={950}>
        <p>Cargando datos guardados...</p>
      </Modal>
    );
  }

  // ---- Render ----
  return (
    <Modal
      title={`Generar Pagos - ${medico?.nombres}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={950}
    >
      <div style={{ marginBottom: "15px" }}>
        <label>RUC:</label>
        <Input value={medicoRUC} onChange={(e) => setMedicoRUC(e.target.value)} />
      </div>

      {/* Datos bancarios */}
      <div style={{ marginBottom: "15px" }}>
        <label>Banco:</label>
        <Input value={banco} onChange={(e) => setBanco(e.target.value)} />
      </div>
      <div style={{ marginBottom: "15px" }}>
        <label>Cuenta:</label>
        <Input value={cuenta} onChange={(e) => setCuenta(e.target.value)} />
      </div>
      <div style={{ marginBottom: "15px" }}>
        <label>CCI:</label>
        <Input value={cci} onChange={(e) => setCci(e.target.value)} />
      </div>

      {/* Tabla comprobantes */}
      <h4>📑 Resumen de Comprobantes</h4>
      <table style={{ width: "100%", marginBottom: 20 }}>
        <thead>
          <tr>
            <th>Empresa</th>
            <th>Tipo Doc</th>
            <th>Fecha</th>
            <th>Comprobante</th>
            <th>Descripción</th>
            <th>Monto Base</th>
            <th>IGV</th>
            <th>Renta</th>
            <th>Detracción</th>
            <th>Total</th>
            <th>Aplicar Detracción</th>
          </tr>
        </thead>
        <tbody>
          {/* QF */}
          <tr>
            <td>Corporación QF SAC</td>
            <td>
              <Select
                value={qfData.tipoDoc}
                onChange={(val) => setQfData({ ...qfData, tipoDoc: val })}
                style={{ width: 100 }}
              >
                <Option value="RXH">RXH</Option>
                <Option value="FACTURA">Factura</Option>
              </Select>
            </td>
            <td>
              <DatePicker
                value={qfData.fecha ? moment(qfData.fecha) : null}
                onChange={(date, dateString) => setQfData({ ...qfData, fecha: dateString })}
              />
            </td>
            <td>
              <Input
                value={qfData.comprobante}
                onChange={(e) => setQfData({ ...qfData, comprobante: e.target.value })}
              />
            </td>
            <td>
              <Input
                value={qfData.descripcion}
                onChange={(e) => setQfData({ ...qfData, descripcion: e.target.value })}
              />
            </td>
            <td>S/. {montoFormulas.toFixed(2)}</td>
            <td>S/. {qfTotales.igv.toFixed(2)}</td>
            <td>S/. {qfTotales.renta.toFixed(2)}</td>
            <td>S/. {qfTotales.detraccion.toFixed(2)}</td>
            <td>
              <b>S/. {qfTotales.total.toFixed(2)}</b>
            </td>
            <td>
              <Checkbox checked={qfDetraccion} onChange={(e) => setQfDetraccion(e.target.checked)}>
                Sí
              </Checkbox>
            </td>
          </tr>

          {/* SMG */}
          <tr>
            <td>Médicos Solidarios SMG SAC</td>
            <td>
              <Select
                value={smgData.tipoDoc}
                onChange={(val) => setSmgData({ ...smgData, tipoDoc: val })}
                style={{ width: 100 }}
              >
                <Option value="RXH">RXH</Option>
                <Option value="FACTURA">Factura</Option>
              </Select>
            </td>
            <td>
              <DatePicker
                value={smgData.fecha ? moment(smgData.fecha) : null}
                onChange={(date, dateString) => setSmgData({ ...smgData, fecha: dateString })}
              />
            </td>
            <td>
              <Input
                value={smgData.comprobante}
                onChange={(e) => setSmgData({ ...smgData, comprobante: e.target.value })}
              />
            </td>
            <td>
              <Input
                value={smgData.descripcion}
                onChange={(e) => setSmgData({ ...smgData, descripcion: e.target.value })}
              />
            </td>
            <td>S/. {montoTurnoProc.toFixed(2)}</td>
            <td>S/. {smgTotales.igv.toFixed(2)}</td>
            <td>S/. {smgTotales.renta.toFixed(2)}</td>
            <td>S/. {smgTotales.detraccion.toFixed(2)}</td>
            <td>
              <b>S/. {smgTotales.total.toFixed(2)}</b>
            </td>
            <td>
              <Checkbox checked={smgDetraccion} onChange={(e) => setSmgDetraccion(e.target.checked)}>
                Sí
              </Checkbox>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Botones */}
      <div style={{ textAlign: "right" }}>
        <Button
          type="primary"
          onClick={handleConfirmar}
          disabled={pagosExistentes || !camposCompletos|| modoLectura }
          loading={loading}
        >
          Confirmar Pagos
        </Button>
        <Button
          type="default"
          onClick={handleActualizar}
          disabled={!pagosExistentes || !camposCompletos || modoLectura}
          loading={loading}
          style={{ marginLeft: 10 }}
        >
          Actualizar Pagos
        </Button>
      </div>
    </Modal>
  );
};

export default GenerarPago;