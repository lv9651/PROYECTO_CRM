import React from 'react';
import { Box, Typography } from '@mui/material';
const WeekView = ({ date, events }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  const currentDay = date.getDay();
  const startDate = new Date(date);
  startDate.setDate(date.getDate() - currentDay);
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    return day;
  });

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Columna de horas */}
      <Box sx={{ width: 60 }}>
        <Box sx={{ height: 40 }} /> {/* Espacio para los días */}
        {hours.map((hour) => (
          <Box key={hour} sx={{ height: 60, display: 'flex', alignItems: 'flex-start' }}>
            <Typography variant="caption" sx={{ pt: 0.5 }}>
              {hour}:00
            </Typography>
          </Box>
        ))}
      </Box>
      
      {/* Columnas de días */}
      {weekDays.map((day, dayIndex) => (
        <Box key={dayIndex} sx={{ flex: 1, borderLeft: '1px solid #eee' }}>
          {/* Encabezado del día */}
          <Box sx={{ 
            height: 40,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: day.getDate() === date.getDate() ? '#f5f5f5' : 'transparent'
          }}>
            <Typography variant="body2" fontWeight="bold">
              {days[day.getDay()]}
            </Typography>
            <Typography variant="body2">
              {day.getDate()}
            </Typography>
          </Box>
          
          {/* Celdas de horas */}
          <Box sx={{ position: 'relative' }}>
            {hours.map((hour) => (
              <Box 
                key={hour} 
                sx={{ 
                  height: 60, 
                  borderBottom: '1px solid #f0f0f0',
                  position: 'relative'
                }}
              />
            ))}
            
            {/* Eventos */}
            {events
              .filter(event => (
                event.start.getDate() === day.getDate() &&
                event.start.getMonth() === day.getMonth() &&
                event.start.getFullYear() === day.getFullYear()
              ))
              .map((event) => {
                const startHour = event.start.getHours();
                const startMinute = event.start.getMinutes();
                const duration = (event.end - event.start) / (1000 * 60 * 60);
                
                return (
                  <Box
                    key={event.id}
                    sx={{
                      position: 'absolute',
                      top: `${(startHour + startMinute / 60) * 60}px`,
                      left: 8,
                      right: 8,
                      height: `${duration * 60}px`,
                      bgcolor: event.color || '#15afc6',
                      color: 'white',
                      borderRadius: 1,
                      p: 1,
                      overflow: 'hidden',
                      boxShadow: 1,
                      '&:hover': {
                        boxShadow: 3
                      }
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {event.title}
                    </Typography>
                    <Typography variant="caption">
                      {event.start.getHours()}:{event.start.getMinutes().toString().padStart(2, '0')} -{' '}
                      {event.end.getHours()}:{event.end.getMinutes().toString().padStart(2, '0')}
                    </Typography>
                  </Box>
                );
              })}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default WeekView;