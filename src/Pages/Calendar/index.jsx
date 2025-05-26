import React, { useState } from 'react';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CalendarToday,
  ViewWeek,
  CalendarViewMonth,
  Add,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import WeekView from './WeekView';
import MonthView from './MonthView';
const CalendarView = () => {
  const [view, setView] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Reunión con Cliente A',
      start: new Date(2023, 5, 15, 10, 0),
      end: new Date(2023, 5, 15, 11, 0),
      color: '#15afc6'
    },
    {
      id: 2,
      title: 'Seguimiento Oportunidad',
      start: new Date(2023, 5, 16, 14, 0),
      end: new Date(2023, 5, 16, 15, 30),
      color: '#2e7d32'
    }
  ]);

  const handleDateChange = (newDate) => {
    setCurrentDate(newDate);
  };

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header del Calendario */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Calendario
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Vista Semanal">
            <IconButton
              color={view === 'week' ? 'primary' : 'default'}
              onClick={() => setView('week')}
            >
              <ViewWeek />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Vista Mensual">
            <IconButton
              color={view === 'month' ? 'primary' : 'default'}
              onClick={() => setView('month')}
            >
              <CalendarViewMonth />
            </IconButton>
          </Tooltip>
          
          <Box sx={{ mx: 2 }}>
            <IconButton onClick={handlePrev}>
              <ChevronLeft />
            </IconButton>
            
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                views={['year', 'month', 'day']}
                value={currentDate}
                onChange={handleDateChange}
                renderInput={({ inputRef, inputProps, InputProps }) => (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      ref={inputRef}
                      {...inputProps}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        width: view === 'week' ? '180px' : '120px',
                        textAlign: 'center'
                      }}
                    />
                    {InputProps?.endAdornment}
                  </Box>
                )}
              />
            </LocalizationProvider>
            
            <IconButton onClick={handleNext}>
              <ChevronRight />
            </IconButton>
          </Box>
          
          <Tooltip title="Nuevo Evento">
            <IconButton color="primary">
              <Add />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Contenido del Calendario */}
      <Paper elevation={3} sx={{ p: 2, height: 'calc(100vh - 180px)' }}>
        {view === 'week' ? (
          <WeekView date={currentDate} events={events} />
        ) : (
          <MonthView date={currentDate} events={events} />
        )}
      </Paper>
    </Box>
  );
};

export default CalendarView;