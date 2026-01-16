import { createContext, useContext, useState, useEffect } from 'react';
import { auth, user } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    if (auth.hasToken()) {
      user.getMe()
        .then(setCurrentUser)
        .catch(() => auth.clearToken())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await auth.login(email, password);
    auth.setToken(response.access_token);
    setCurrentUser(response.user);
    return response;
  };

  const signup = async (data) => {
    const response = await auth.signup(data);
    auth.setToken(response.access_token);
    setCurrentUser(response.user);
    return response;
  };

  const logout = () => {
    auth.clearToken();
    setCurrentUser(null);
  };

  const value = {
    user: currentUser,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
