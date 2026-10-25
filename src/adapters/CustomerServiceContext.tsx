import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import axios, { type AxiosInstance } from 'axios';
import { cariService } from '../services/CariService';
import { cariAyarlarService } from '../services/CariAyarlarService';

export interface ICustomerServiceAdapter {
  cariService: typeof cariService;
  cariAyarlarService: typeof cariAyarlarService;
  uploadAvatar?: (file: File) => Promise<string>;
}

export const defaultCustomerService: ICustomerServiceAdapter = {
  cariService,
  cariAyarlarService,
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post<{ url: string }>('/api/Dosya/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data?.url;
  }
};

export const createRestCustomerAdapter = (customAxios?: AxiosInstance): ICustomerServiceAdapter => {
  return {
    ...defaultCustomerService,
    uploadAvatar: async (file: File) => {
      const client = customAxios || axios;
      const formData = new FormData();
      formData.append('file', file);
      const res = await client.post<{ url: string }>('/api/Dosya/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data?.url;
    }
  };
};

const CustomerServiceContext = createContext<ICustomerServiceAdapter>(defaultCustomerService);

export const CustomerServiceProvider: React.FC<{
  adapter?: ICustomerServiceAdapter;
  children: ReactNode;
}> = ({ adapter = defaultCustomerService, children }) => {
  const value = useMemo(() => adapter, [adapter]);
  return (
    <CustomerServiceContext.Provider value={value}>
      {children}
    </CustomerServiceContext.Provider>
  );
};

export const useCustomerService = () => {
  return useContext(CustomerServiceContext);
};

export default CustomerServiceContext;
