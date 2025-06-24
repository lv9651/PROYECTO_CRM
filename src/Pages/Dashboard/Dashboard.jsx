import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Grid, Card, CardContent, Typography, 
  Box, Button, Divider, Container, CircularProgress
} from '@mui/material';
import { 
  People, MonetizationOn, Event, TrendingUp,
  Business, Assignment, CalendarToday,AttachMoney,
  MeetingRoom, Person, InsertChartOutlined as ChartIcon ,
  HandshakeRounded,PrecisionManufacturingSharp
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../Compo/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirigir si no está autenticado
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Datos para gráficos
  const clientData = [
    { name: 'Ene', clientes: 15 },
    { name: 'Feb', clientes: 22 },
    // ... otros datos
  ];

  // Estadísticas
  const stats = [
    { title: 'Clientes', value: '124', icon: <People />, color: '#9c27b0' },
    // ... otras estadísticas
  ];

  // Todos los módulos disponibles con sus permisos
  const allModules = [
    { 
      title: 'Cuentas', 
      icon: <Business fontSize="large" />, 
      color: '#15afc6', 
      path: '/cuentas',
      allowedProfiles: ['ADMINISTRADOR'] // Solo admin y gerente
    },
    { 
      title: 'Oportunidades', 
      icon: <Assignment fontSize="large" />, 
      color: '#2e7d32', 
      path: '/oportunidades',
      allowedProfiles: ['ADMINISTRADOR'] // Solo admin y asesor
    },
    { 
      title: 'Calendario', 
      icon: <CalendarToday fontSize="large" />, 
      color: '#d32f2f', 
      path: '/calendario',
      allowedProfiles: ['ADMINISTRADOR'] // Todos
    },
    { 
      title: 'Reuniones', 
      icon: <MeetingRoom fontSize="large" />, 
      color: '#ed6c02', 
      path: '/reuniones',
      allowedProfiles: ['ADMINISTRADOR'] // Solo admin y gerente
    },
    { 
      title: 'Clientes', 
      icon: <Person fontSize="large" />, 
      color: '#9c27b0', 
      path: '/clientes',
      allowedProfiles: ['ADMINISTRADOR'] // Solo admin
    },
     { 
      title: 'CONVENIO', 
      icon: <HandshakeRounded fontSize="large" />, 
      color: '#ff33ff', 
      path: '/Convenio',
      allowedProfiles: ['ADMINISTRADOR','REP.MEDICO'] // Solo admin
    },

     { 
      title: 'CONVENIO', 
      icon: <HandshakeRounded fontSize="large" />, 
      color: '#ff33ff', 
      path: '/RegistroRH',
      allowedProfiles: ['CONTABILIDAD'] // Solo admin
    },

        { 
      title: 'PLANTILLAS', 
      icon: <PrecisionManufacturingSharp fontSize="large" />, 
      color: '#FFC300', 
      path: '/PlantillaGenerador',
      allowedProfiles: ['CONTABILIDAD'] // Solo admin
    },
    { 
      title: 'BI', 
      icon: <ChartIcon fontSize="large" />, 
      color: '#799e2e', 
      path: '/bi',
      allowedProfiles: ['ADMINISTRADOR'] // Solo admin
    }
    ,
    { 
      title: 'CUOTA', 
      icon: <AttachMoney fontSize="large" />, 
      color: '#799e2e', 
      path: '/Cuota',
      allowedProfiles: ['ADMINISTRADOR','REP.MEDICO'] // Solo admin
    }
  ];

  // Función para determinar si un módulo debe mostrarse
  const shouldShowModule = (module) => {
    // ADMINISTRADOR ve todo
    if (user?.perfilCodigo === 'ADMINISTRADOR') return true;
    // Otros perfiles solo ven los módulos permitidos
    return module.allowedProfiles.includes(user?.perfilCodigo);
  };

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box textAlign="center" my={4}>
        <Typography variant="h4">
          Bienvenido, {user.username} ({user.nombre})
        </Typography>
      </Box>

      {/* Módulos */}
    {/* Módulos */}
<Box sx={{ mb: 6 }}>
  <Typography variant="h5" gutterBottom align="center">
    Módulos disponibles
  </Typography>
  <Grid container spacing={3} justifyContent="center">
    {allModules.filter(shouldShowModule).map((module, index) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
        <Button
          onClick={() => navigate(module.path)}
          sx={{
            width: '100%',
            height: '160px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            borderRadius: 3,
            boxShadow: 3,
            backgroundColor: 'background.paper',
            p: 3,
            '&:hover': {
              boxShadow: 6,
              transform: 'scale(1.02)',
              transition: 'transform 0.2s ease-in-out'
            }
          }}
        >
          <Box sx={{ color: module.color, fontSize: 50, mb: 1 }}>
            {module.icon}
          </Box>
          <Typography variant="subtitle1" fontWeight="bold">
            {module.title}
          </Typography>
        </Button>
      </Grid>
    ))}
  </Grid>
</Box>
      {/* Estadísticas (solo para ADMINISTRADOR) */}
      {user?.perfilCodigo === 'ADMINISTRADOR' && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Estadísticas
          </Typography>
          <Card sx={{ p: 2, borderRadius: 2, boxShadow: 1 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={clientData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="clientes" fill="#15afc6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Box>
      )}
    </Container>
  );
};

export default Dashboard;