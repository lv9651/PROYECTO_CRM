import React, { useState } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography,
  Collapse, Divider, IconButton, Paper, styled
} from '@mui/material';
import {
  Menu, ExpandMore, ChevronRight, Discount, FormatListBulleted, Build,
  CardGiftcard, Group, ShoppingCart
} from '@mui/icons-material';

// IMPORTA TU COMPONENTE FUNCIONAL REAL
import ListarDescuento from './ListarDescuento';
import Mantenimiento from './Mantenimiento';
import PackPromociones from './PackPromocionesModule';
import PackPromociones2 from './DescuentoDePacks/index';
import Ofertas from './Ofertas/Oferta';
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

const descuentoMenu = [
  {
    name: "Descuento",
    icon: <Discount color="primary" />,
    subItems: [
      { name: "Listar", icon: <FormatListBulleted />, tipo: "Vista", component: <ListarDescuento /> },
      { name: "Mantenimiento", icon: <Build />, tipo: "Vista", component: <Mantenimiento />},
      { name: "Productos Obsequio", icon: <CardGiftcard />, tipo: "Vista", component: <Ofertas/> },
      { name: "Pack de promociones", icon: <ShoppingCart />, tipo: "Vista", component:  <PackPromociones2 />  },
      { name: "Descuento personal", icon: <Group />, tipo: "Vista", component: <div>Descuento Personal</div> },

    ]
  }
];

const DescuentoModule = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);

  const toggleSubmenu = (menuName) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const handleSelect = (menuName, subItem) => {
    const path = `${menuName}/${subItem.name}`;
    setSelectedItem(path);
    setSelectedComponent(subItem.component);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      <Drawer
        variant="permanent"
        open={drawerOpen}
        sx={{
          width: drawerOpen ? 280 : 72,
          '& .MuiDrawer-paper': {
            width: drawerOpen ? 280 : 72,
            transition: 'width 0.3s ease',
            boxSizing: 'border-box',
            bgcolor: 'background.paper'
          }
        }}
      >
        {/* Encabezado */}
        <Box sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          minHeight: 64
        }}>
          {drawerOpen && <Typography variant="h6">Descuentos</Typography>}
          <IconButton onClick={() => setDrawerOpen(!drawerOpen)} sx={{ color: 'inherit' }}>
            <Menu />
          </IconButton>
        </Box>

        <Divider />

        {/* Menú dinámico */}
        <List>
          {descuentoMenu.map((menu) => (
            <React.Fragment key={menu.name}>
              <StyledListItem
                button
                onClick={() => toggleSubmenu(menu.name)}
                selected={selectedItem?.startsWith(menu.name)}
                sx={{ justifyContent: drawerOpen ? 'initial' : 'center', px: 2.5 }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: drawerOpen ? 3 : 'auto' }}>
                  {menu.icon}
                </ListItemIcon>
                {drawerOpen && (
                  <>
                    <ListItemText primary={menu.name} />
                    {openSubmenus[menu.name] ? <ExpandMore /> : <ChevronRight />}
                  </>
                )}
              </StyledListItem>

              <Collapse in={drawerOpen && openSubmenus[menu.name]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {menu.subItems.map((subItem) => (
                    <StyledListItem
                      button
                      key={subItem.name}
                      onClick={() => handleSelect(menu.name, subItem)}
                      selected={selectedItem === `${menu.name}/${subItem.name}`}
                      sx={{ pl: 4 }}
                    >
                      <ListItemIcon>{subItem.icon}</ListItemIcon>
                      <ListItemText primary={subItem.name} />
                    </StyledListItem>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </Drawer>

      {/* Panel principal */}
      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        {selectedComponent ? (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            {selectedComponent}
          </Paper>
        ) : (
          <Typography variant="h5" color="text.secondary" sx={{ mt: 10 }}>
            Selecciona una opción en el menú lateral
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default DescuentoModule;