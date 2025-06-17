import React, { useState } from 'react';
import axios from 'axios';
import {
  TextField, Button, Grid, Typography, Box, Paper, Table, TableHead,
  TableBody, TableRow, TableCell, MenuItem, TableSortLabel, Card
} from '@mui/material';
import {
  CircularProgressbar,
  buildStyles
} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useAuth } from '../../Compo/AuthContext';
import { BASE_URL } from '../../Conf/config';

const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const AvanceCuota = () => {
  const { user } = useAuth();
  const [mes, setMes] = useState('');
  const [año, setAño] = useState(new Date().getFullYear());
  const [avanceData, setAvanceData] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [metaGeneral, setMetaGeneral] = useState(null);
  const [avanceTotal, setAvanceTotal] = useState(null);

  const handleSubmit = async () => {
    if (!mes || !año) {
      alert('Por favor ingrese mes y año');
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}/api/CuotaRepresentanteMedico/ObtenerAvance`, {
        params: { mes, año }
      });

      let avance = response.data;

      if (user?.perfilCodigo !== 'ADMINISTRADOR') {
        avance = avance.filter(item => item.emp_codigo === user?.emp_codigo);
      }

      setAvanceData(avance);

      const metaRes = await axios.get(`${BASE_URL}/api/CuotaRepresentanteMedicoGeneral`);
      const general = metaRes.data.find(item => item.mes === mes && Number(item.año) === Number(año));
      setMetaGeneral(general);

      if (general) {
        const totalVenta = avance.reduce((acc, item) => acc + item.venta, 0);
        const avanceCalculado = (totalVenta / general.monto) * 100;
        setAvanceTotal(avanceCalculado);
      } else {
        setAvanceTotal(null);
      }

    } catch (error) {
      console.error('Error al obtener datos:', error);
      alert('Ocurrió un error al obtener los datos.');
    }
  };

  const handleSort = (field) => {
    const isAsc = sortBy === field && sortDirection === 'asc';
    setSortBy(field);
    setSortDirection(isAsc ? 'desc' : 'asc');
  };

  const sortedData = [...avanceData].sort((a, b) => {
    if (sortBy) {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  const exportToExcel = () => {
    const dataToExport = avanceData.map(row => {
      const base = {
        Año: row.año,
        Mes: row.mes,
        Venta: row.venta.toFixed(2),
        Meta: row.meta.toFixed(2),
        'Avance (%)': (row.avance * 100).toFixed(2),
      };
      if (user?.perfilCodigo === 'ADMINISTRADOR') {
        base['Representante'] = row.repre;
      }
      return base;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Avance');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'avance_cuota.xlsx');
  };

  const formatNumber = (num) =>
    new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Avance de Cuota
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Mes"
            fullWidth
            value={mes}
            onChange={(e) => setMes(e.target.value)}
          >
            {meses.map((mesItem) => (
              <MenuItem key={mesItem} value={mesItem}>{mesItem}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Año"
            fullWidth
            type="number"
            value={año}
            onChange={(e) => setAño(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button variant="contained" onClick={handleSubmit} fullWidth>
            Consultar
          </Button>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Button variant="outlined" onClick={exportToExcel} fullWidth>
            Descargar Excel
          </Button>
        </Grid>

      {user?.perfilCodigo === 'ADMINISTRADOR' && metaGeneral && (
  <Grid item xs={6} sm={3}>
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Typography variant="body1" fontWeight="bold" gutterBottom>Avance General</Typography>
      <Box sx={{ width: 80 }}>
        <CircularProgressbar
          value={avanceTotal}
          text={`${(avanceTotal ?? 0).toFixed(0)}%`}
          styles={buildStyles({
            textColor: '#333',
            pathColor: '#1976d2',
            trailColor: '#d6d6d6'
          })}
        />
      </Box>
    </Card>
  </Grid>
)}

      </Grid>

      {avanceData.length > 0 && (
        <Paper sx={{ mb: 4, overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'año'}
                    direction={sortDirection}
                    onClick={() => handleSort('año')}
                  >
                    Año
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'mes'}
                    direction={sortDirection}
                    onClick={() => handleSort('mes')}
                  >
                    Mes
                  </TableSortLabel>
                </TableCell>
                {user?.perfilCodigo === 'ADMINISTRADOR' && (
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'repre'}
                      direction={sortDirection}
                      onClick={() => handleSort('repre')}
                    >
                      Representante
                    </TableSortLabel>
                  </TableCell>
                )}
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'venta'}
                    direction={sortDirection}
                    onClick={() => handleSort('venta')}
                  >
                    Venta
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'meta'}
                    direction={sortDirection}
                    onClick={() => handleSort('meta')}
                  >
                    Meta
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'avance'}
                    direction={sortDirection}
                    onClick={() => handleSort('avance')}
                  >
                    Avance
                  </TableSortLabel>
                </TableCell>
                <TableCell>Progreso</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.año}</TableCell>
                  <TableCell>{item.mes}</TableCell>
                  {user?.perfilCodigo === 'ADMINISTRADOR' && (
                    <TableCell>{item.repre}</TableCell>
                  )}
                  <TableCell>{formatNumber(item.venta)}</TableCell>
                  <TableCell>{formatNumber(item.meta)}</TableCell>
                  <TableCell>{(item.avance * 100).toFixed(2)}%</TableCell>
                  <TableCell>
                    <Box sx={{ width: 50 }}>
                      <CircularProgressbar
                        value={item.avance * 100}
                        text={`${(item.avance * 100).toFixed(0)}%`}
                        styles={buildStyles({
                          textColor: '#444',
                          pathColor: '#0288d1',
                          trailColor: '#eee',
                          textSize: '28px'
                        })}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};

export default AvanceCuota;