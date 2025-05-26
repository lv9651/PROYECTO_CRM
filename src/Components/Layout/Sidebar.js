import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText,Toolbar  } from '@mui/material';
import { Dashboard, People, MonetizationOn, CalendarToday } from '@mui/icons-material';

const Sidebar = () => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
      }}
    >
      <Toolbar /> {/* Para que el contenido no quede detrás del AppBar */}
      <List>
        {[
          { text: 'Dashboard', icon: <Dashboard />, path: '/' },
          { text: 'Clientes', icon: <People />, path: '/clientes' },
          { text: 'Oportunidades', icon: <MonetizationOn />, path: '/oportunidades' },
          { text: 'Actividades', icon: <CalendarToday />, path: '/actividades' },
        ].map((item) => (
          <ListItem button key={item.text} component="a" href={item.path}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;