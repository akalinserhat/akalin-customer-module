import React, { lazy } from 'react';
import { Users } from 'lucide-react';
import { type IModuleDefinition } from '@akalin/module_core';
import { ModuleSettingsRegistry } from '@akalin/ui';
import { CustomerServiceProvider, ICustomerServiceAdapter, defaultCustomerService } from './adapters/CustomerServiceContext';
import CariModulAyarlariComponent from './components/CariModulAyarlari';
import { customerCards, customerDocuments, customerReports } from './definitions/entities';

export interface CreateCustomerModuleOptions {
  id?: string;
  title?: string;
  order?: number;
  permissionPrefix?: string;
  adapter?: ICustomerServiceAdapter;
  registerSettings?: boolean;
}

export const CarilerPage = lazy(() => import('./pages/Cariler'));
export const CariFormPage = lazy(() => import('./pages/CariFormPage'));

export function createCustomerModule(options: CreateCustomerModuleOptions = {}): IModuleDefinition {
  const {
    id = 'cari-yonetimi',
    title = 'Cari Yönetimi',
    order = 10,
    permissionPrefix = 'cari',
    adapter = defaultCustomerService,
    registerSettings = true
  } = options;

  if (registerSettings) {
    try {
      ModuleSettingsRegistry.register({
        moduleId: 'MOD_CARI',
        aliases: ['MOD_CARI_YONETIMI', 'cari-yonetimi', 'CariYonetimi'],
        title: 'Cari Yönetimi Modül Ayarları',
        description: 'Faaliyet alanına özel cari hesap davranışlarını ve form hiyerarşisini yapılandırın.',
        icon: React.createElement(Users, { size: 20 }),
        iconName: 'Users',
        component: CariModulAyarlariComponent,
        defaultValues: {
          kokSiralama: 'kurumsal_once',
          bireyselUnvanSablonu: 2
        }
      });
    } catch (e) {
      // Already registered or in test env
    }
  }

  const withProvider = (Component: React.ComponentType<any>) => {
    return (props: any) => (
      <CustomerServiceProvider adapter={adapter}>
        <Component {...props} />
      </CustomerServiceProvider>
    );
  };

  return {
    id,
    title,
    aliases: ['cari_yonetimi', 'cari-yonetimi', 'MOD_CARI', 'MOD_CARI_YONETIMI', '@akalin/customer_module'],
    permissionPrefix,
    icon: React.createElement(Users, { size: 20 }),
    iconName: 'Users',
    order,
    strictEntityRegistration: true,
    whitelistedRoutes: [
      '/cariler/excel-import',
      '/cariler/cari-secim',
      '/cariler/:id/bulut-dosyalari'
    ],
    cards: customerCards,
    documents: customerDocuments,
    reports: customerReports,
    routes: [
      {
        path: '/cariler',
        element: React.createElement(withProvider(CarilerPage)),
        title: 'Cari Liste',
        requiredPermissions: ['cari.kart.cari-hesap.goruntule']
      },
      {
        path: '/cariler/virman',
        element: React.createElement(withProvider(CarilerPage)),
        title: 'Cari Virman Fişleri'
      },
      {
        path: '/cariler/dekont',
        element: React.createElement(withProvider(CarilerPage)),
        title: 'Cari Borç / Alacak Dekontları'
      },
      {
        path: '/cariler/acilis-fisi',
        element: React.createElement(withProvider(CarilerPage)),
        title: 'Cari Açılış / Devir Fişleri'
      },
      {
        path: '/cariler/ekstre',
        element: React.createElement(withProvider(CarilerPage)),
        title: 'Cari Hesap Ekstreleri'
      },
      {
        path: '/cariler/yeni/adres',
        element: React.createElement(withProvider(CariFormPage)),
        title: 'Cari Adresleri',
        requiredPermissions: ['cari.kart.cari-hesap.olustur']
      },
      {
        path: '/cariler/yeni',
        element: React.createElement(withProvider(CariFormPage)),
        title: 'Yeni Cari Kart',
        requiredPermissions: ['cari.kart.cari-hesap.olustur']
      },
      {
        path: '/cariler/:id/adres',
        element: React.createElement(withProvider(CariFormPage)),
        title: 'Cari Adresleri',
        requiredPermissions: ['cari.kart.cari-hesap.duzenle']
      },
      {
        path: '/cariler/:id',
        element: React.createElement(withProvider(CariFormPage)),
        title: 'Cari Kart Düzenle',
        requiredPermissions: ['cari.kart.cari-hesap.duzenle']
      }
    ],
    menuItems: [
      {
        id: 'cari-group',
        label: 'Cari Yönetimi',
        icon: React.createElement(Users, { size: 20 }),
        order,
        isDropdown: true,
        children: [
          {
            id: 'cari-liste',
            label: 'Cari Liste',
            path: '/cariler',
            icon: React.createElement(Users, { size: 16 }),
            order: 1,
            requiredPermissions: ['cari.kart.cari-hesap.goruntule']
          }
        ]
      }
    ],
    components: {
      CarilerPage,
      CariFormPage,
      CariModulAyarlari: CariModulAyarlariComponent
    }
  };
}

export default createCustomerModule;
