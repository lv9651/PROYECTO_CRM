import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Button,
  Divider,
  Container
} from '@mui/material';
import { 
  People, 
  MonetizationOn, 
  Event, 
  TrendingUp,
  Business,
  Assignment,
  CalendarToday,
  MeetingRoom,
  Person,Addchart
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();

  const clientData = [
    { name: 'Ene', clientes: 15 },
    { name: 'Feb', clientes: 22 },
    { name: 'Mar', clientes: 18 },
    { name: 'Abr', clientes: 25 },
    { name: 'May', clientes: 30 },
    { name: 'Jun', clientes: 28 },
    { name: 'Jul', clientes: 20 },
  ];

  const stats = [
    { title: 'Clientes', value: '124', icon: <People fontSize="medium" />, color: '#9c27b0' },
    { title: 'Oportunidades', value: '42', icon: <MonetizationOn fontSize="medium" />, color: '#2e7d32' },
    { title: 'Actividades', value: '18', icon: <Event fontSize="medium" />, color: '#ed6c02' },
    { title: 'Ventas', value: '$56,200', icon: <TrendingUp fontSize="medium" />, color: '#15afc6' },
  ];

  const modules = [
    { title: 'Cuentas', icon: <Business fontSize="large" />, color: '#15afc6', path: '/cuentas' },
    { title: 'Oportunidades', icon: <Assignment fontSize="large" />, color: '#2e7d32', path: '/Oportunidades' },
    { title: 'Calendario', icon: <CalendarToday fontSize="large" />, color: '#d32f2f', path: '/calendario' },
    { title: 'Reuniones', icon: <MeetingRoom fontSize="large" />, color: '#ed6c02', path: '/reuniones' },
    { title: 'Clientes', icon: <Person fontSize="large" />, color: '#9c27b0', path: '/clientes' },
    { title: 'BI', icon: <Addchart fontSize="large" />, color: '#799e2e', path: '/BI' },
  ];

  return (
    <Container maxWidth="xl" sx={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      py: 3
    }}>
      {/* Bienvenida */}
      <Box sx={{ 
        textAlign: 'center',
        mb: 4,
        width: '100%'
      }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ¡Bienvenido al CRM QF!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Panel de control y resumen de actividades
        </Typography>
      </Box>

      {/* Resumen General Compacto */}
      <Box sx={{ 
        width: '100%',
        maxWidth: '900px',
        mb: 4,
        textAlign: 'center'
      }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Resumen General
        </Typography>
        
        <Grid container spacing={2} justifyContent="center">
          {stats.map((stat, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Card sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                p: 2,
                boxShadow: 1
              }}>
                <Box sx={{ 
                  color: stat.color,
                  fontSize: '2rem',
                  mb: 1
                }}>
                  {stat.icon}
                </Box>
                <Typography variant="h5" component="div">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider sx={{ my: 3, width: '80%' }} />

      {/* Módulos */}
      <Box sx={{ 
        width: '100%',
        maxWidth: '1200px',
        mb: 4,
        textAlign: 'center'
      }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Acciones rápidas
        </Typography>
        
        <Grid container spacing={2} justifyContent="center">
          {modules.map((module, index) => (
            <Grid item xs={6} sm={4} md={2.4} key={index}>
              <Button 
                onClick={() => navigate(module.path)}
                fullWidth
                sx={{ 
                  height: '140px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2,
                  borderRadius: 2,
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4
                  }
                }}
              >
                <Box sx={{ 
                  color: module.color,
                  fontSize: '2.5rem',
                  mb: 1
                }}>
                  {module.icon}
                </Box>
                <Typography variant="subtitle1">
                  {module.title}
                </Typography>
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider sx={{ my: 3, width: '80%' }} />

      {/* Gráfico */}
      <Box sx={{ 
        width: '100%',
        maxWidth: '1000px',
        textAlign: 'center'
      }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Estadísticas
        </Typography>
        
        <Card sx={{ 
          p: 2,
          borderRadius: 2,
          boxShadow: 1
        }}>
          <Typography variant="h6" gutterBottom>
            Clientes por mes
          </Typography>
          
          <Box sx={{ 
            height: '300px',
            width: '100%'
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="clientes" 
                  fill="#15afc6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Card>
      </Box>
    </Container>
  );
};

export default Dashboard;