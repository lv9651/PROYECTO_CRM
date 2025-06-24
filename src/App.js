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
import Cuota from './Pages/Cuota/Cuota';
import Convenio from './Pages/Convenio/Convenio';
import RegistroRH from './Pages/Convenio/RegistroRH';
import PlantillaGenerador from './Pages/Convenio/PlantillaGenerador';

import { AuthProvider, useAuth } from './Compo/AuthContext';

// Componente para rutas privadas
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

// Componente que contiene las rutas
const AppRoutes = () => {
  const { user, logout } = useAuth();
  const isAuthenticated = !!user;

  return (
    <>
      {isAuthenticated && <Navbar onLogout={logout} />}
      <Box component="main" sx={{ pt: isAuthenticated ? '64px' : 0, minHeight: '100vh' }}>
        <Routes>
          {/* Ruta pública */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login />
              )
            } 
          />

          {/* Rutas protegidas */}
          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
          <Route path="/calendario" element={
            <PrivateRoute><Calendar /></PrivateRoute>
          } />
          <Route path="/Oportunidades" element={
            <PrivateRoute><Oportunidades /></PrivateRoute>
          } />
          <Route path="/reuniones" element={
            <PrivateRoute><Reuniones /></PrivateRoute>
          } />
          <Route path="/BI" element={
            <PrivateRoute><BI /></PrivateRoute>
          } />
          <Route path="/cuentas" element={
            <PrivateRoute><Cuentas /></PrivateRoute>
          } />
          <Route path="/clientes" element={
            <PrivateRoute><Clientes /></PrivateRoute>
          } />
             <Route path="/Cuota" element={
            <PrivateRoute><Cuota /></PrivateRoute>
          } />

   <Route path="/RegistroRH" element={
            <PrivateRoute><RegistroRH /></PrivateRoute>
          } />
             <Route path="/PlantillaGenerador" element={
            <PrivateRoute><PlantillaGenerador /></PrivateRoute>
          } />
   <Route path="/Convenio" element={
            <PrivateRoute><Convenio /></PrivateRoute>
          } />
          {/* Redirecciones */}
          <Route path="/" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } />
          <Route path="*" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } />
        </Routes>
      </Box>
    </>
  );
};

// App principal
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;