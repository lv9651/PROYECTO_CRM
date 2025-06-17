import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData) => {
    const userWithProfile = {
      token: userData.token,
      username: userData.username,
      perfilCodigo: userData.perfilCodigo,
      emp_codigo:userData.emp_codigo,
      nombre:userData.nombre
    };
    localStorage.setItem('userData', JSON.stringify(userWithProfile));
    setUser(userWithProfile);
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('userData');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};