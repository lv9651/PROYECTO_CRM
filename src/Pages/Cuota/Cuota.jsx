import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  IconButton,
  Typography,
  Paper,
  styled,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu,
  ChevronRight,
  ExpandMore,
  Assessment,
  BarChart,
  PieChart
} from '@mui/icons-material';
import { useAuth } from '../../Compo/AuthContext';
import IngresoCuota from './IngresoCuota';
import CuotaGeneral from './CuotaGeneral';
import AvanceCuota from './AvanceCuota';

const StyledListItem = styled(ListItem)(({ theme }) => ({
  '&.Mui-selected, &.Mui-selected:hover': {
    backgroundColor: theme.palette.primary.light,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const BIReportsModule = () => {
  const { user } = useAuth();
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const toggleSubmenu = (menuName) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const handleItemClick = (path) => {
    setSelectedItem(path);
    if (isMobile) setMobileOpen(false);
  };

  const menuItems = [
    {
      name: "Cuotas",
      icon: <Assessment color="success" />,
      subItems: [
        ...(user?.perfilCodigo === "ADMINISTRADOR"
          ? [
              { name: "Ingreso de Cuota", icon: <BarChart /> },
              { name: "Cuota General", icon: <BarChart /> }
            ]
          : []),
        {
          name: "Detalle",
          subItems: [
            { name: "Detalle de Cuotas", icon: <PieChart /> },
            ...(user?.perfilCodigo === "ADMINISTRADOR"
              ? [{ name: "Avance de Cuota", icon: <PieChart /> }]
              : [])
          ]
        },
        
      
      ]
    }
  ];

  const renderContent = () => {
    switch (selectedItem) {
      case "Cuotas/Ingreso de Cuota":
        return <IngresoCuota />;
      case "Cuotas/Cuota General":
        return <CuotaGeneral />;
      case "Cuotas/Detalle/Detalle de Cuotas":
        return <AvanceCuota />;
      case "Cuotas/Detalle/Avance de Cuota":
        return (
          <Box sx={{ height: '80vh', width: '100%' }}>
            <iframe
              title="Avance de Cuota"
              width="100%"
              height="100%"
              src="https://app.powerbi.com/view?r=eyJrIjoiOWI5OWJiZDktNDhlNS00MDkzLTg1YzEtZmExNWQyMDdjY2JmIiwidCI6ImRhYWY2YjVhLTFmM2EtNGUwMy1hMzIzLTQwZGQ2OTkxOWIxNyIsImMiOjR9"
              frameBorder="0"
              allowFullScreen
            />
          </Box>
        );
      default:
        return (
          <Paper sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2 }}>
            <Typography variant="h6" color="text.secondary">
              Seleccionado: {selectedItem}
            </Typography>
          </Paper>
        );
    }
  };

  const drawer = (
    <Box sx={{ width: 280 }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">Módulo Cuotas</Typography>
        {isMobile && (
          <IconButton onClick={() => setMobileOpen(false)} sx={{ color: 'inherit' }}>
            <Menu />
          </IconButton>
        )}
      </Box>
      <Divider />
      <List>
        {menuItems.map(menu => (
          <React.Fragment key={menu.name}>
            <StyledListItem
              button
              onClick={() => toggleSubmenu(menu.name)}
              selected={selectedItem?.startsWith(menu.name)}
            >
              <ListItemIcon>{menu.icon}</ListItemIcon>
              <ListItemText primary={menu.name} />
              {openSubmenus[menu.name] ? <ExpandMore /> : <ChevronRight />}
            </StyledListItem>
            <Collapse in={openSubmenus[menu.name]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {menu.subItems.map(sub => (
                  <React.Fragment key={sub.name}>
                    {sub.subItems ? (
                      <>
                        <StyledListItem
                          button
                          onClick={() => toggleSubmenu(sub.name)}
                          sx={{ pl: 4 }}
                        >
                          <ListItemText primary={sub.name} />
                          {openSubmenus[sub.name] ? <ExpandMore /> : <ChevronRight />}
                        </StyledListItem>
                        <Collapse in={openSubmenus[sub.name]} timeout="auto" unmountOnExit>
                          <List component="div" disablePadding>
                            {sub.subItems.map(item => (
                              <StyledListItem
                                button
                                key={item.name}
                                onClick={() => handleItemClick(`${menu.name}/${sub.name}/${item.name}`)}
                                selected={selectedItem === `${menu.name}/${sub.name}/${item.name}`}
                                sx={{ pl: 6 }}
                              >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.name} />
                              </StyledListItem>
                            ))}
                          </List>
                        </Collapse>
                      </>
                    ) : (
                      <StyledListItem
                        button
                        onClick={() => handleItemClick(`${menu.name}/${sub.name}`)}
                        selected={selectedItem === `${menu.name}/${sub.name}`}
                        sx={{ pl: 4 }}
                      >
                        <ListItemIcon>{sub.icon}</ListItemIcon>
                        <ListItemText primary={sub.name} />
                      </StyledListItem>
                    )}
                  </React.Fragment>
                ))}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Drawer responsivo */}
      <Box
        component="nav"
        sx={{ width: { sm: 280 }, flexShrink: { sm: 0 } }}
        aria-label="menú de navegación"
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {!selectedItem ? (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: 4
          }}>
            <Assessment sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="h5" color="text.secondary">Bienvenido al Módulo de Cuotas</Typography>
            <Typography variant="body1" color="text.secondary">Seleccione una opción del menú lateral</Typography>
          </Box>
        ) : renderContent()}
      </Box>

      {/* Botón de menú flotante solo en móvil */}
 {isMobile && (
  <IconButton
    onClick={() => setMobileOpen(true)}
    sx={{
      position: 'fixed',
      top: 55,
      left: 16,
      bgcolor: 'primary.main',
      color: 'white',
      zIndex: 1300,
      boxShadow: 3,
      '&:hover': {
        bgcolor: 'primary.dark'
      }
    }}
  >
    <Menu />
  </IconButton>
)}
    </Box>
  );
};

export default BIReportsModule;