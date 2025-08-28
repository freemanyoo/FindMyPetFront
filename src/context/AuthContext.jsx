import React, { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const storedLoggedIn = localStorage.getItem('isLoggedIn');
    return storedLoggedIn ? JSON.parse(storedLoggedIn) : false;
  });
  const [userRole, setUserRole] = useState(() => {
    const storedUserRole = localStorage.getItem('userRole');
    return storedUserRole ? storedUserRole : null;
  });
  // Add state for user object
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('userRole', userRole);
  }, [userRole]);

  // Effect for user object
  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  // Modify login to accept user object
  const login = (userData) => { // userData will be the full user object from backend
    setIsLoggedIn(true);
    setUserRole(userData.role);
    setUser(userData); // Store the full user object
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setUser(null); // Clear user object
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user'); // Clear user object from localStorage
      // 추가_CKM
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      //
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userRole, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
