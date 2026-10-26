/**
 * @akalin/customer_module - Tescilli Kart ve Belge Tanımları (entities.ts)
 * Modüle ait tüm kartlar, belgeler ve raporlar bu dosyada register edilir.
 * Bu dosyada tescil edilmemiş hiçbir kart veya belge menüde gösterilmez ve erişilemez.
 */

import type { IModuleEntityDefinition } from '@akalin/module_core';

export const customerCards: IModuleEntityDefinition[] = [
  {
    id: 'cari-hesap',
    category: 'kart',
    titleKey: 'Cari Kartı',
    title: 'Cari Kartı',
    description: 'Müşteri, tedarikçi ve iş ortaklarının cari hesap kartları',
    route: '/cariler',
    listRoute: '/cariler',
    formRoute: '/cariler/:id',
    useStandardCrud: true,
    showInMenu: true,
    isRegistered: true,
    customActions: [
      { action: 'bakiye-gor', labelKey: 'Bakiye Görüntüleme', description: 'Cari bakiye ve risk limitini görme' },
      { action: 'ekstre-yazdir', labelKey: 'Ekstre Yazdırma', description: 'Cari hesap ekstresi dökümü alma' }
    ]
  }
];

export const customerDocuments: IModuleEntityDefinition[] = [];
export const customerReports: IModuleEntityDefinition[] = [];

export const customerEntities: IModuleEntityDefinition[] = [
  ...customerCards,
  ...customerDocuments,
  ...customerReports
];

export default customerEntities;
