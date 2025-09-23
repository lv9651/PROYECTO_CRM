import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Grid, Card, Typography, Box, Button, Container, CircularProgress
} from '@mui/material';
import { 
  People, MonetizationOn, Event, TrendingUp,
  Business, Assignment, CalendarToday,AttachMoney,
  MeetingRoom, Person, InsertChartOutlined as ChartIcon ,
  HandshakeRounded,PrecisionManufacturingSharp,CreditCard ,Discount
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../Compo/AuthContext';

// 🔹 Relación entre path y su icono/color para mantener el diseño
const moduleConfig = {
  '/Convenio': { icon: <HandshakeRounded fontSize="large" />, color: '#ff33ff', title: 'Convenio' },
  '/RegistroRH': { icon: <HandshakeRounded fontSize="large" />, color: '#ff33ff', title: 'Registro RH' },
  '/descuento': { icon: <Discount fontSize="large" />, color: '#00bcd4', title: 'Descuento' },
  '/PlantillaGenerador': { icon: <PrecisionManufacturingSharp fontSize="large" />, color: '#FFC300', title: 'Plantillas' },
  '/bi': { icon: <ChartIcon  art fontSize="large" />, color: '#799e2e', title: 'BI' },
  '/Cuota': { icon: <AttachMoney fontSize="large" />, color: '#799e2e', title: 'Cuota' },
  '/Cupon': { icon: <CreditCard fontSize="large" />, color: '#00665b', title: 'Cupón' }
  ,'/PagoMedico': { icon: <Business fontSize="large" />, color: '#8E44AD', title: 'PagoMedico'}
   ,'/ClubQFModule': { icon: <Business fontSize="large" />, color: '#8E44AD', title: 'ClubQFModule'}
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Datos de prueba para estadísticas
  const clientData = [
    { name: 'Ene', clientes: 15 },
    { name: 'Feb', clientes: 22 },
    { name: 'Mar', clientes: 30 },
  ];

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Bienvenida */}
      <Box textAlign="center" my={4}>
        <Typography variant="h4">
          Bienvenido, {user.username} ({user.nombre})
        </Typography>
      </Box>

      {/* Módulos disponibles */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom align="center">
          Módulos disponibles
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {user.modulos?.map((mod, index) => {
            const config = moduleConfig[mod.path] || { icon: <HandshakeRounded />, color: '#ccc', title: mod.nombre };
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Button
                  onClick={() => navigate(mod.path)}
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
                  <Box sx={{ color: config.color, fontSize: 50, mb: 1 }}>
                    {config.icon}
                  </Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {config.title}
                  </Typography>
                </Button>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Estadísticas (si quieres mantenerlo solo para admins o todos) */}
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