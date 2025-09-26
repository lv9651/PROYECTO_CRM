export const packFormatters = {
  formatListasPrecioForAPI: (selectedListasPrecio, listasPrecioApi) => {
    if (selectedListasPrecio.length === 0) return "[]";
    
    return JSON.stringify(
      selectedListasPrecio.map(id => ({
        idListaPrecio: id.toString(),
        descripcion: listasPrecioApi.find(l => l.idListaPrecio === id)?.descripcion || ""
      }))
    );
  },

  formatProductosForAPI: (products, descuento, price, calcularPrecioBase) => {
    if (products.length === 0) return "[]";
    
    return JSON.stringify({
      items: products.map(p => ({
        id: p.code,
        name: p.name,
        precio: p.usarFraccion ? p.precioXFraccion : p.precioOriginal,
        usarFraccion: p.usarFraccion,
        cantidad: p.cantidad,
        total: (p.usarFraccion ? p.precioXFraccion : p.precioOriginal) * p.cantidad,
      })),
      summary: {
        subtotal: calcularPrecioBase(products),
        descuento: descuento / 100,
        total: price
      }
    });
  },

  formatSucursalesForAPI: (selectedSucursales) => {
    if (selectedSucursales.length === 0) return "[]";
    return JSON.stringify(selectedSucursales.map(id => ({ idsucursal: id.toString() })));
  },

  formatCanalesForAPI: (selectedCanales) => {
    if (selectedCanales.length === 0) return "[]";
    return JSON.stringify(selectedCanales.map(id => ({ idcanalventa: id.toString() })));
  }
};