import { useState, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../../Conf/config';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { PACK_CONFIG } from '../constants/packConstants';

export const useApiData = () => {
  const [apiData, setApiData] = useState({
    productos: [],
    sucursales: [],
    canales: [],
    listasPrecio: [],
    historial: []
  });

  const [loading, setLoading] = useState({
    productos: false,
    sucursales: false,
    canales: false,
    listasPrecio: false,
    historial: false,
    saving: false
  });

  const fetchData = useCallback(async (endpoint, dataKey, params = {}) => {
    setLoading(prev => ({ ...prev, [dataKey]: true }));
    try {
      const { data } = await axios.get(`${BASE_URL}${endpoint}`, { params });
      setApiData(prev => ({ ...prev, [dataKey]: data }));
      return data;
    } catch (error) {
      console.error(`Error al cargar ${dataKey}:`, error);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, [dataKey]: false }));
    }
  }, []);

  const fetchSucursales = useCallback(() => 
    fetchData(API_ENDPOINTS.SUCURSALES, 'sucursales'), [fetchData]);

  const fetchCanales = useCallback(() => 
    fetchData(API_ENDPOINTS.CANALES, 'canales'), [fetchData]);

  const fetchListasPrecio = useCallback(() => 
    fetchData(API_ENDPOINTS.LISTAS_PRECIO, 'listasPrecio'), [fetchData]);

  const fetchHistorial = useCallback(() => 
    fetchData(API_ENDPOINTS.HISTORIAL, 'historial'), [fetchData]);

  const fetchProductos = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < PACK_CONFIG.MIN_SEARCH_LENGTH) {
      setApiData(prev => ({ ...prev, productos: [] }));
      return [];
    }
    return fetchData(`${API_ENDPOINTS.PRODUCTOS}${searchTerm}`, 'productos');
  }, [fetchData]);

  const savePack = useCallback(async (packData) => {
    setLoading(prev => ({ ...prev, saving: true }));
    try {
      const response = await axios.post(
        `${BASE_URL}${API_ENDPOINTS.GUARDAR_PACK}`, 
        packData, 
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    } catch (error) {
      console.error('Error al guardar pack:', error);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  }, []);

  return {
    apiData,
    loading,
    fetchSucursales,
    fetchCanales,
    fetchListasPrecio,
    fetchHistorial,
    fetchProductos,
    savePack,
    setApiData
  };
};