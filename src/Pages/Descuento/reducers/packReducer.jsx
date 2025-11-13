export const initialState = {
  packName: '',
  packCode: '',
  packDescription: '',
 
  price: 0,
  descuento: 0,
  fechaDesde: '',
  fechaHasta: '',
  ordenamiento: 0
};

export const packReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return initialState;
    case 'LOAD_PACK_DATA':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};