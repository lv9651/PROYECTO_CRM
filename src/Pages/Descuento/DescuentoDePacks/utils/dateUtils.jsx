export const dateUtils = {
  formatDateForAPI: (dateString) => {
    if (!dateString) return new Date().toISOString();
    return new Date(dateString).toISOString();
  },

  getDefaultEndDate: (startDate, daysToAdd = 30) => {
    const date = startDate ? new Date(startDate) : new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split('T')[0];
  },

  isValidDateRange: (startDate, endDate) => {
    if (!startDate || !endDate) return true;
    return new Date(startDate) <= new Date(endDate);
  }
};