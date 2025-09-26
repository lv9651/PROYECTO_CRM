import { useReducer, useCallback } from 'react';
import { packReducer, initialState } from '../../reducers/packReducer';

export const usePackManagement = () => {
  const [packState, dispatch] = useReducer(packReducer, initialState);

  const updateField = useCallback((field, value) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  }, []);

  const resetPack = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const loadPackData = useCallback((packData) => {
    dispatch({ type: 'LOAD_PACK_DATA', payload: packData });
  }, []);

  return {
    packState,
    dispatch,
    updateField,
    resetPack,
    loadPackData
  };
};