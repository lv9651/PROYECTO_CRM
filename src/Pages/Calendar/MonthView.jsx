import React from 'react';
import { Box, Typography } from '@mui/material';
const MonthView = ({ date, events }) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const weeks = [];
    let week = [];
    
    // Días del mes anterior
    for (let i = 0; i < startDay; i++) {
      week.push(null);
    }
    
    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(date.getFullYear(), date.getMonth(), i);
      week.push(dayDate);
      
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    
    // Días del siguiente mes
    while (week.length < 7) {
      week.push(null);
    }
    if (week.length > 0) weeks.push(week);
  
    return (
      <Box>
        {/* Encabezados de días */}
        <Box sx={{ display: 'flex', borderBottom: '1px solid #eee' }}>
          {days.map((day) => (
            <Box key={day} sx={{ 
              flex: 1, 
              textAlign: 'center', 
              py: 1,
              fontWeight: 'bold'
            }}>
              {day}
            </Box>
          ))}
        </Box>
        
        {/* Semanas */}
        {weeks.map((week, weekIndex) => (
          <Box key={weekIndex} sx={{ display: 'flex', height: '16%' }}>
            {week.map((day, dayIndex) => (
              <Box 
                key={dayIndex} 
                sx={{ 
                  flex: 1, 
                  border: '1px solid #f0f0f0',
                  minHeight: 120,
                  p: 0.5,
                  bgcolor: day && day.getDate() === date.getDate() ? '#f5f5f5' : 'transparent'
                }}
              >
                {day && (
                  <>
                    <Typography variant="body2" align="right">
                      {day.getDate()}
                    </Typography>
                    
                    {/* Eventos del día */}
                    {events
                      .filter(event => (
                        event.start.getDate() === day.getDate() &&
                        event.start.getMonth() === day.getMonth() &&
                        event.start.getFullYear() === day.getFullYear()
                      ))
                      .map((event) => (
                        <Box
                          key={event.id}
                          sx={{
                            bgcolor: event.color || '#15afc6',
                            color: 'white',
                            borderRadius: 1,
                            p: 0.5,
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontSize: '0.75rem'
                          }}
                        >
                          {event.start.getHours()}:{event.start.getMinutes().toString().padStart(2, '0')} {event.title}
                        </Box>
                      ))}
                  </>
                )}
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    );
  };

  export default MonthView;