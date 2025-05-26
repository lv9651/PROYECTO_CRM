import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, Box } from '@mui/material';
import theme from './theme';
import Navbar from './Components/Layout/Navbar';
import Login from './Pages/Auth/Login';
import Dashboard from './Pages/Dashboard/Dashboard';

import Calendar from './Pages/Calendar';
import Clientes from './Pages/Clientes/Clientes';
import Cuentas from './Pages/Cuentas/Cuentas';
import Oportunidades from './Pages/Oportunidades/Oportunidades';
import Reuniones from './Pages/Reuniones/Reuniones';
import BI from './Pages/BI/BI';

// Componente para rutas privadas
const PrivateRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    // Aquí puedes agregar limpieza de localStorage u otras acciones
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {isAuthenticated && <Navbar onLogout={handleLogout} />}
        <Box component="main" sx={{ pt: isAuthenticated ? '64px' : 0, minHeight: '100vh' }}>
          <Routes>
            {/* Ruta pública */}
            <Route 
              path="/login" 
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              } 
            />
            
            {/* Rutas protegidas */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <Dashboard />
                </PrivateRoute>
              }
            />
           
           
            <Route
              path="/calendario"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <Calendar />
                </PrivateRoute>
              }
            />

<Route
              path="/Oportunidades"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <Oportunidades />
                </PrivateRoute>
              }
            />
          <Route
              path="/reuniones"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <Reuniones />
                </PrivateRoute>
              }
            />

<Route
              path="/BI"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <BI />
                </PrivateRoute>
              }
            />

<Route
              path="/cuentas"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <Cuentas />
                </PrivateRoute>
              }
            />

<Route
              path="/clientes"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <Clientes />
                </PrivateRoute>
              }
            />
                      
            {/* Redirecciones */}
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="*"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;