import React, { createContext, useContext } from 'react';

export interface AuthContextType {
  user: any;
  token?: string | null;
  [key: string]: any;
}

export const AuthContext = createContext<AuthContextType>({ user: null });

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
