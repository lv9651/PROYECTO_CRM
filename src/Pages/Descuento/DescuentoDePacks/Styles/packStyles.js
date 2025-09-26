export const packStyles = {
  card: {
    mb: 4, 
    borderRadius: 2, 
    boxShadow: 3
  },
  tableHeader: {
    backgroundColor: 'primary.light'
  },
  modalContent: {
    maxHeight: 400, 
    overflow: 'auto'
  },
  loadingContainer: {
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    p: 4
  },
  actionButton: {
    flex: { xs: 1, sm: 'none' },
    py: 1.5,
    borderWidth: 2,
    '&:hover': { borderWidth: 2 }
  }
};