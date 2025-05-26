import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button,
  Box,
  Menu,
  MenuItem,
  Divider,
  Badge,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  AccountCircle, 
  Notifications, 
  ArrowDropDown,
  CalendarToday,
  People,
  MonetizationOn,
  MeetingRoom,
  Business,
  Schedule,
  CheckCircle
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';

const primaryColor = '#15afc6';

const Navbar = ({ onLogout, notificationCount = 3 }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openNotifications, setOpenNotifications] = useState(false);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  // Manejo del menú de usuario
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
    navigate('/login');
  };

  // Definir las alertas
  const alerts = [
    { icon: <Schedule />, message: 'Reunión con Clínica DermaPlus en 2 horas' },
    { icon: <CheckCircle color="success" />, message: '3 cierres exitosos esta semana' },
    { icon: <People />, message: '5 nuevos clientes registrados esta semana' },
    { icon: <MeetingRoom />, message: 'Reunión programada con Piel Sana mañana' },
    { icon: <MonetizationOn />, message: 'Alza en oportunidades esta semana' },
  ];

  // Manejo del Drawer de notificaciones
  const handleNotificationDrawer = () => {
    setOpenNotifications(!openNotifications);
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backgroundColor: primaryColor,
        boxShadow: 'none',
        zIndex: (theme) => theme.zIndex.drawer + 1 
      }}
    >
      <Toolbar>
        {/* Logo o nombre de la aplicación */}
        <Typography 
          variant="h6" 
          component={Link}
          to="/dashboard"
          sx={{ 
            flexGrow: 1, 
            fontWeight: 'bold',
            color: 'inherit',
            textDecoration: 'none'
          }}
        >
          CRM QF
        </Typography>

        {/* Menú principal horizontal */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          <Button 
            color="inherit" 
            component={Link}
            to="/accounts"
            startIcon={<Business />}
            sx={{ textTransform: 'none' }}
          >
            Cuentas
          </Button>
          <Button 
            color="inherit" 
            component={Link}
            to="/opportunities"
            startIcon={<MonetizationOn />}
            sx={{ textTransform: 'none' }}
          >
            Oportunidades
          </Button>
          <Button 
            color="inherit" 
            component={Link}
            to="/calendar"
            startIcon={<CalendarToday />}
            sx={{ textTransform: 'none' }}
          >
            Calendario
          </Button>
          <Button 
            color="inherit" 
            component={Link}
            to="/meetings"
            startIcon={<MeetingRoom />}
            sx={{ textTransform: 'none' }}
          >
            Reuniones
          </Button>
          <Button 
            color="inherit" 
            component={Link}
            to="/clients"
            startIcon={<People />}
            sx={{ textTransform: 'none' }}
          >
            Clientes
          </Button>
        </Box>

        {/* Iconos de usuario y notificaciones */}
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
          <IconButton 
            color="inherit"
            onClick={handleNotificationDrawer}
          >
            <Badge badgeContent={notificationCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          <Button
            color="inherit"
            onClick={handleMenu}
            startIcon={<AccountCircle />}
            endIcon={<ArrowDropDown />}
            sx={{ textTransform: 'none' }}
          >
            Mi Cuenta
          </Button>
          
          {/* Menú de usuario */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
              Perfil
            </MenuItem>
            <MenuItem onClick={() => { handleClose(); navigate('/settings'); }}>
              Configuración
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      {/* Drawer para mostrar las alertas */}
      <Drawer
        anchor="right"
        open={openNotifications}
        onClose={handleNotificationDrawer}
      >
        <Box
          sx={{ width: 300, padding: 2 }}
        >
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            Alertas
          </Typography>
          <List>
            {alerts.map((alert, index) => (
              <ListItem button key={index}>
                <ListItemIcon>{alert.icon}</ListItemIcon>
                <ListItemText primary={alert.message} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;