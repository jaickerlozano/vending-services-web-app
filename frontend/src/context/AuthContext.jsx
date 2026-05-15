import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('vlb_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    // Mock login logic
    // In a real app, this would verify with a backend
    if (username === 'admin' && password === 'admin') {
      const userData = { id: 1, name: 'Administrador', role: 'admin' };
      setUser(userData);
      localStorage.setItem('vlb_user', JSON.stringify(userData));
      return { success: true };
    }
    
    if (username === 'operario' && password === '1234') {
      const userData = { id: 2, name: 'Operario Campo', role: 'operator' };
      setUser(userData);
      localStorage.setItem('vlb_user', JSON.stringify(userData));
      return { success: true };
    }

    return { success: false, error: 'Credenciales inválidas' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vlb_user');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
