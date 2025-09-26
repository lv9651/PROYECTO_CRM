export const packValidators = {
  validatePackData: (packState, products, selectedSucursales, selectedCanales) => {
    const errors = [];
    
    if (!packState.packName.trim()) {
      errors.push("El nombre del pack es requerido");
    }
    
    if (products.length === 0) {
      errors.push("Debe agregar al menos un producto al pack");
    }
    
    if (packState.descuento < 0 || packState.descuento > 100) {
      errors.push("El descuento debe estar entre 0% y 100%");
    }
    
    if (packState.fechaDesde && packState.fechaHasta) {
      const fechaDesde = new Date(packState.fechaDesde);
      const fechaHasta = new Date(packState.fechaHasta);
      
      if (fechaDesde > fechaHasta) {
        errors.push("La fecha de inicio debe ser anterior a la fecha de fin");
      }
    }
    
    if (selectedSucursales.length === 0) {
      errors.push("Debe seleccionar al menos una sucursal");
    }
    
    if (selectedCanales.length === 0) {
      errors.push("Debe seleccionar al menos un canal de venta");
    }
    
    return errors;
  },

  validateProduct: (product) => {
    const errors = [];
    
    if (product.cantidad <= 0) {
      errors.push("La cantidad debe ser mayor a 0");
    }
    
    if (product.precioOriginal <= 0) {
      errors.push("El precio debe ser mayor a 0");
    }
    
    return errors;
  }
};