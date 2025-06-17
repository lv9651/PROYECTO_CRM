import React, { useState } from 'react';
import {
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  Alert,
  CssBaseline
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../Conf/config'; 
import { useAuth } from '../../Compo/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  // ✅ Referencia a la imagen desde public
  const loginImage = process.env.PUBLIC_URL + '/images/logo_login.jpeg';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Por favor ingrese email y contraseña');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/usuario/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: email,
          clave: password
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Error en el login');
      }

      const data = await response.json();

      // Guardar usuario en contexto
      login({
        token: data.token,
        username: data.userName,
        perfilCodigo: data.perfilCodigo,
        emp_codigo: data.emp_codigo,
        nombre: data.nombre
      });

    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    }
  };

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', width: '100vw' }}>
        <Box
          sx={{
            flex: 7,
            backgroundImage: `url(${loginImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: { xs: 'none', md: 'block' },
          }}
        />

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 3,
            backgroundColor: 'white',
            padding: 3,
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Iniciar Sesión
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 400 }}>
            <TextField
              fullWidth
              label="Correo electrónico"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
            />
            <Button fullWidth variant="contained" type="submit" size="large">
              Ingresar
            </Button>
          </form>
        </Box>
      </Box>
    </>
  );
};

export default Login;