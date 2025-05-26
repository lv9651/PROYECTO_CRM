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
  Tooltip,
  Paper,
  Typography,
  styled
} from '@mui/material';
import {
  Menu,
  ChevronRight,
  ExpandMore,
  Assessment,
  BarChart,
  PieChart,
  TableChart,
  Close,
  Fullscreen,
  FullscreenExit
} from '@mui/icons-material';

// Componente styled para el menú
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

const menuItems = [
  {
    name: "Comercial",
    icon: <Assessment color="primary" />,
    subItems: [
      {
        name: "Informes",
        subItems: [
          {
            name: "Reporte Mensual",
            url: "https://app.powerbi.com/reportEmbed?reportId=e2f8125f-fe9c-4c37-903b-ebe6e864c3eb&autoAuth=true&ctid=daaf6b5a-1f3a-4e03-a323-40dd69919b17",
            tipo: "Power BI",
            icon: <BarChart />
          },
          {
            name: "Clientes Tercero",
            url: "https://app.powerbi.com/reportEmbed?reportId=7219d061-0b80-4728-ad4c-7c07b2b89168&autoAuth=true&ctid=daaf6b5a-1f3a-4e03-a323-40dd69919b17",
            tipo: "Power BI",
            icon: <PieChart />
          }
          ,
          {
            name: "Ticket",
            url: "https://app.powerbi.com/reportEmbed?reportId=7051fb26-8e7d-4146-b249-fa4162234b9d&autoAuth=true&ctid=daaf6b5a-1f3a-4e03-a323-40dd69919b17",
            tipo: "Power BI",
            icon: <PieChart />
          }
        ]
      },
      {
        name: "Pedidos",
        subItems: [
          {
            name: "General",
            url: "https://app.powerbi.com/reportEmbed?reportId=facd4aae-f8b7-4b52-a7ed-0d1b58c9ab17&autoAuth=true&ctid=daaf6b5a-1f3a-4e03-a323-40dd69919b17",
            tipo: "Power BI",
            icon: <BarChart />
          }
        ]
      }
    ]
  },
  {
    name: "Finanzas",
    icon: <Assessment color="secondary" />,
    subItems: [
      {
        name: "Ventas",
        subItems: [
          {
            name: "Stock Crítico",
            url: "https://excel.com/reporte4",
            tipo: "Excel",
            icon: <TableChart />
          }
        ]
      }
    ]
  }
];

const BIReportsModule = () => {
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [currentReport, setCurrentReport] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const toggleSubmenu = (menuName) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const handleReportOpen = (report, path) => {
    setCurrentReport(report);
    setSelectedItem(path);
    setFullscreen(false);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      {/* Menú Lateral Mejorado */}
      <Drawer
        variant="permanent"
        open={drawerOpen}
        sx={{
          width: drawerOpen ? 280 : 72,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerOpen ? 280 : 72,
            boxSizing: 'border-box',
            transition: 'width 0.3s ease',
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider'
          },
        }}
      >
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          minHeight: 64
        }}>
          {drawerOpen && (
            <Typography variant="h6" noWrap>
              Panel de Reportes
            </Typography>
          )}
          <IconButton 
            onClick={() => setDrawerOpen(!drawerOpen)} 
            sx={{ color: 'inherit' }}
          >
            <Menu />
          </IconButton>
        </Box>
        <Divider />

        <List sx={{ py: 1 }}>
          {menuItems.map((menuItem) => (
            <React.Fragment key={menuItem.name}>
              <StyledListItem 
                button 
                onClick={() => toggleSubmenu(menuItem.name)}
                selected={selectedItem?.startsWith(menuItem.name)}
                sx={{
                  minHeight: 48,
                  justifyContent: drawerOpen ? 'initial' : 'center',
                  px: 2.5,
                  my: 0.5
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 0, 
                  mr: drawerOpen ? 3 : 'auto',
                  color: selectedItem?.startsWith(menuItem.name) ? 'primary.main' : 'inherit'
                }}>
                  {menuItem.icon}
                </ListItemIcon>
                {drawerOpen && (
                  <>
                    <ListItemText 
                      primary={menuItem.name} 
                      primaryTypographyProps={{ 
                        fontWeight: selectedItem?.startsWith(menuItem.name) ? 'medium' : 'normal'
                      }} 
                    />
                    {openSubmenus[menuItem.name] ? <ExpandMore /> : <ChevronRight />}
                  </>
                )}
              </StyledListItem>

              <Collapse in={drawerOpen && openSubmenus[menuItem.name]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ bgcolor: 'background.paper' }}>
                  {menuItem.subItems.map((subItem) => (
                    <React.Fragment key={subItem.name}>
                      <StyledListItem 
                        button 
                        onClick={() => toggleSubmenu(subItem.name)}
                        selected={selectedItem?.includes(`${menuItem.name}/${subItem.name}`)}
                        sx={{ pl: 4, py: 0.5 }}
                      >
                        <ListItemText 
                          primary={subItem.name} 
                          primaryTypographyProps={{ 
                            variant: 'subtitle2',
                            fontWeight: selectedItem?.includes(`${menuItem.name}/${subItem.name}`) ? 'medium' : 'normal'
                          }} 
                        />
                        {subItem.subItems && (
                          openSubmenus[subItem.name] ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />
                        )}
                      </StyledListItem>

                      {subItem.subItems && (
                        <Collapse in={openSubmenus[subItem.name]} timeout="auto" unmountOnExit>
                          <List component="div" disablePadding>
                            {subItem.subItems.map((report) => (
                              <StyledListItem
                                button
                                key={report.name}
                                selected={selectedItem === `${menuItem.name}/${subItem.name}/${report.name}`}
                                onClick={() => handleReportOpen(report, `${menuItem.name}/${subItem.name}/${report.name}`)}
                                sx={{ pl: 6, py: 0.5 }}
                              >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  {React.cloneElement(report.icon, {
                                    fontSize: 'small',
                                    color: selectedItem === `${menuItem.name}/${subItem.name}/${report.name}` ? 
                                      'primary' : 'inherit'
                                  })}
                                </ListItemIcon>
                                <ListItemText 
                                  primary={report.name} 
                                  primaryTypographyProps={{ variant: 'body2' }}
                                  secondary={report.tipo}
                                  secondaryTypographyProps={{ variant: 'caption' }}
                                />
                              </StyledListItem>
                            ))}
                          </List>
                        </Collapse>
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </Drawer>

      {/* Contenido Principal */}
      <Box component="main" sx={{ 
        flexGrow: 1, 
        p: 3,
        transition: 'margin 0.3s ease',
        ml: drawerOpen ? 0 : -208
      }}>
        {currentReport ? (
          <Paper sx={{ 
            height: '100%', 
            position: 'relative',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 3
          }}>
            <Box sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8, 
              zIndex: 1000,
              display: 'flex',
              gap: 1,
              bgcolor: 'background.paper',
              borderRadius: 1,
              p: 0.5,
              boxShadow: 1
            }}>
             
            </Box>
            
            <iframe
              src={currentReport.url}
              title={currentReport.name}
              width="100%"
              height="100%"
              style={{ 
                border: 'none',
                minHeight: 'calc(100vh - 64px)'
              }}
              allowFullScreen
            />
          </Paper>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: 4,
            boxShadow: 1
          }}>
            <Assessment sx={{ 
              fontSize: 80, 
              color: 'text.secondary', 
              mb: 2,
              opacity: 0.5
            }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Bienvenido al Panel BI
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
              Seleccione un reporte del menú lateral para visualizar los dashboards y análisis interactivos
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default BIReportsModule;