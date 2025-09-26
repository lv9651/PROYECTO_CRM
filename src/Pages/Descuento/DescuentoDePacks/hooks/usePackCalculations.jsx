import { useCallback } from 'react';

export const usePackCalculations = () => {
  const calcularPrecioBase = useCallback((products) => {
    return products.reduce((total, product) => {
      const precioProducto = product.usarFraccion ? product.precioXFraccion : product.precioOriginal;
      return total + (precioProducto * product.cantidad);
    }, 0);
  }, []);

  const calcularPrecioConDescuento = useCallback((precioBase, descuento) => {
    return precioBase * (1 - (descuento / 100));
  }, []);

  const calcularDescuentoDesdePrecio = useCallback((precioBase, precioFinal) => {
    return precioBase > 0 ? 100 - ((precioFinal / precioBase) * 100) : 0;
  }, []);

  return {
    calcularPrecioBase,
    calcularPrecioConDescuento,
    calcularDescuentoDesdePrecio
  };
};