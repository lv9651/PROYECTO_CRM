import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from "../../Conf/config";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ReporteContable = () => {
  const [tipoProceso, setTipoProceso] = useState('RXH');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [allData, setAllData] = useState([]); // todos los datos traídos del servidor
  const [filteredData, setFilteredData] = useState([]); // datos filtrados por buscador
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // texto del buscador

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Resetear página cuando cambian filtros o búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [tipoProceso, fechaInicio, fechaFin, searchTerm]);

  // Cuando cambian los datos o el término de búsqueda, actualizar filteredData
  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(allData);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      const filtered = allData.filter(row => 
        headers.some(header => 
          String(row[header] ?? '').toLowerCase().includes(lowerSearch)
        )
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, allData, headers]);

  const handleBuscar = async () => {
    if (!fechaInicio || !fechaFin || !tipoProceso) {
      setError('Completa todos los campos');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await axios.get(`${BASE_URL}/api/Contabilidad_Convenio/reporte_pago`, {
        params: {
          fechaInicio,
          fechaFin,
          tipoProceso
        }
      });

      setHeaders(response.data.headers || []);
      setAllData(response.data.data || []);
      setSearchTerm('');
    } catch (err) {
      console.error(err);
      setError('Error al obtener los datos');
      setAllData([]);
      setHeaders([]);
      setSearchTerm('');
    } finally {
      setLoading(false);
    }
  };

  // Paginación para filteredData
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Exportar a Excel
  const exportToExcel = () => {
    if (filteredData.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    // Convertir datos para Excel
    const worksheetData = filteredData.map(row => {
      const obj = {};
      headers.forEach(header => {
        obj[header] = row[header];
      });
      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, `reporte_contable_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📊 Reporte Contable de Pagos Médicos</h2>

      <div style={styles.form}>
        <div style={styles.inputGroup}>
          <label>Tipo Proceso:</label>
          <select
            value={tipoProceso}
            onChange={(e) => setTipoProceso(e.target.value)}
            style={styles.select}
          >
            <option value="RXH">RXH</option>
            <option value="FACTURA">FACTURA</option>
          </select>
        </div>

        <div style={styles.inputGroup}>
          <label>Fecha Inicio:</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Fecha Fin:</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            style={styles.input}
          />
        </div>

        <button onClick={handleBuscar} disabled={loading} style={styles.button}>
          {loading ? 'Buscando...' : '🔍 Buscar'}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {headers.length > 0 && (
        <>
          {/* Buscador */}
          <div style={{ marginBottom: '15px', maxWidth: '400px' }}>
            <input
              type="text"
              placeholder="Buscar registros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '8px', 
                fontSize: '16px', 
                borderRadius: '4px', 
                border: '1px solid #ccc' 
              }}
            />
          </div>

          {/* Botón Exportar Excel */}
          <button onClick={exportToExcel} style={{ ...styles.button, marginBottom: '10px', backgroundColor: '#28a745' }}>
            📥 Exportar a Excel
          </button>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {headers.map((header, index) => (
                    <th key={index} style={styles.th}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((row, idx) => (
                    <tr
                      key={idx}
                      style={idx % 2 === 0 ? styles.evenRow : styles.oddRow}
                    >
                      {headers.map((header, colIdx) => (
                        <td key={colIdx} style={styles.td}>
                          {row[header] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={headers.length} style={styles.noData}>
                      No hay datos disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {filteredData.length > rowsPerPage && (
            <div style={styles.pagination}>
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                style={styles.pageButton}
              >
                « Primero
              </button>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={styles.pageButton}
              >
                ‹ Anterior
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const show = Math.abs(pageNum - currentPage) <= 2 || pageNum === 1 || pageNum === totalPages;
                if (!show) {
                  if (
                    pageNum === 2 && currentPage > 4
                    || pageNum === totalPages - 1 && currentPage < totalPages - 3
                  ) {
                    return <span key={pageNum} style={styles.ellipsis}>...</span>;
                  }
                  return null;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    style={{
                      ...styles.pageButton,
                      ...(pageNum === currentPage ? styles.pageButtonActive : {})
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={styles.pageButton}
              >
                Siguiente ›
              </button>
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                style={styles.pageButton}
              >
                Último »
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    boxShadow: '0 3px 8px rgba(0,0,0,0.1)'
  },
  title: {
    textAlign: 'center',
    marginBottom: '25px',
    color: '#333'
  },
  form: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '20px',
    alignItems: 'flex-end'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '180px'
  },
  input: {
    padding: '8px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  select: {
    padding: '8px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    borderRadius: '5px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  error: {
    color: 'red',
    fontWeight: 'bold',
    marginTop: '10px'
  },
  tableWrapper: {
    overflowX: 'auto',
    marginTop: '20px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px',
    border: '1px solid #dee2e6',
    textAlign: 'left'
  },
  td: {
    padding: '10px',
    border: '1px solid #dee2e6',
    fontSize: '14px'
  },
  evenRow: {
    backgroundColor: '#f2f2f2'
  },
  oddRow: {
    backgroundColor: '#ffffff'
  },
  noData: {
    textAlign: 'center',
    padding: '20px',
    fontStyle: 'italic',
    color: '#666'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '5px',
    marginTop: '20px',
    flexWrap: 'wrap'
  },
  pageButton: {
    padding: '6px 12px',
    fontSize: '14px',
    borderRadius: '4px',
    border: '1px solid #007bff',
    backgroundColor: 'white',
    color: '#007bff',
    cursor: 'pointer',
    minWidth: '36px'
  },
  pageButtonActive: {
    backgroundColor: '#007bff',
    color: 'white'
  },
  ellipsis: {
    padding: '6px 12px',
    fontSize: '14px'
  }
};

export default ReporteContable;