import { useCallback } from 'react';
import { useAuth } from '../../../../Compo/AuthContext';
import { packFormatters } from '../utils/packFormatters';
import { packValidators } from '../utils/packValidators';
import { dateUtils } from '../utils/dateUtils';

export const usePackOperations = (packState, products, selectedSucursales, selectedCanales, selectedListasPrecio, apiData) => {
  const { user } = useAuth();

  const handleSave = useCallback(async () => {
    const errors = packValidators.validatePackData(packState, products, selectedSucursales, selectedCanales);
    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }

    const packData = {
     iddescuento: packState.idDescuento || 0,
      descripcion: packState.packName,
      fechainicio: dateUtils.formatDateForAPI(packState.fechaDesde),
      fechafin: dateUtils.formatDateForAPI(packState.fechaHasta),
      idtipodescuento: 2,
      todosucursal: selectedSucursales.length === 0,
      idsucursal: packFormatters.formatSucursalesForAPI(selectedSucursales),
      todolistaprecio: selectedListasPrecio.length === 0,
      idlistaprecio: packFormatters.formatListasPrecioForAPI(selectedListasPrecio, apiData.listasPrecio),
      todotipoproducto: false,
      descuentotodotipoproducto: 0,
      idtipoproducto: "[]",
      excluiridproducto: "[]",
      todoproducto: false,
      descuentotodoproducto: parseFloat(packState.descuento) || 0,
      idproducto: packFormatters.formatProductosForAPI(products, packState.descuento, packState.price, 
        (prods) => prods.reduce((total, p) => total + ((p.usarFraccion ? p.precioXFraccion : p.precioOriginal) * p.cantidad), 0)),
      todocliente: true,
      descuentotodocliente: 0,
      idcanalventa: packFormatters.formatCanalesForAPI(selectedCanales),
      idcliente: "[]",
      idestado: 1,
      usuariomanipula: user?.id?.toString() || "1"
    };

    return packData;
  }, [packState, products, selectedSucursales, selectedCanales, selectedListasPrecio, apiData.listasPrecio, user]);

  const handleLoadPack = useCallback((packData, setProducts, setSelectedSucursales, setSelectedCanales, setSelectedListasPrecio, loadPackData, setCurrentPackId) => {
    const productos = JSON.parse(packData.idproducto);
    const sucursales = JSON.parse(packData.idsucursal);
    const canales = JSON.parse(packData.idcanalventa);
    const listasPrecio = JSON.parse(packData.idlistaprecio);
    

    const descuentoPorcentaje = productos.summary.descuento * 100;

    loadPackData({
      packName: packData.descripcion,
      fechaDesde: packData.fechaInicio.split('T')[0],
      fechaHasta: packData.fechaFin.split('T')[0],
      descuento: descuentoPorcentaje,
      price: productos.summary.total,
      packCode: packData.idProductoPack,
       idDescuento: packData.idDescuento
    });

    const productosFormateados = productos.items.map(item => ({
      code: item.id,
      name: item.name,
      price: item.precio,
      precioOriginal: item.precio,
      precioXFraccion: item.precioXFraccion || item.precio,
      usarFraccion: Boolean(item.usarFraccion),
      cantidad: item.cantidad,
      incentivo: 0.00
    }));
    
    setProducts(productosFormateados);
    setSelectedSucursales(sucursales.map(s => parseInt(s.idsucursal)));
    setSelectedCanales(canales.map(c => parseInt(c.idcanalventa)));
    setSelectedListasPrecio(listasPrecio.map(l => parseInt(l.idListaPrecio)));
    setCurrentPackId(packData.idDescuento);
  }, []);

  return {
    handleSave,
    handleLoadPack
  };
};