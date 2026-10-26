/**
 * @akalin/customer_module - Tescilli Liste, Kart ve Belge Tanımları (entities.ts)
 * Modüle ait tüm listeler, kartlar ve belgeler hiyerarşik olarak bu dosyada register edilir.
 * Bu dosyada tescil edilmemiş hiçbir liste, kart veya belge menüde gösterilmez ve erişilemez.
 */

import type { IModuleEntityDefinition } from '@akalin/module_core';

export const customerLists: IModuleEntityDefinition[] = [
  {
    id: 'cari-liste',
    category: 'liste',
    titleKey: 'Cari Liste',
    title: 'Cari Liste',
    description: 'Müşteri, tedarikçi ve iş ortaklarının cari hesap listesi',
    route: '/cariler',
    listRoute: '/cariler',
    useStandardCrud: true,
    showInMenu: true,
    isRegistered: true,
    children: [
      {
        id: 'cari-kart',
        category: 'kart',
        parentId: 'cari-liste',
        titleKey: 'Cari Kartı',
        title: 'Cari Kartı',
        description: 'Müşteri ve tedarikçi cari hesap kartı',
        route: '/cariler/:id',
        formRoute: '/cariler/:id',
        useStandardCrud: true,
        showInMenu: false,
        isRegistered: true,
        customActions: [
          { action: 'bakiye-gor', labelKey: 'Bakiye Görüntüleme', description: 'Cari bakiye ve risk limitini görme' },
          { action: 'ekstre-yazdir', labelKey: 'Ekstre Yazdırma', description: 'Cari hesap ekstresi dökümü alma' }
        ]
      }
    ]
  }
];

export const customerCards: IModuleEntityDefinition[] = [
  ...customerLists[0].children!
];

export const customerDocuments: IModuleEntityDefinition[] = [];

export const customerReports: IModuleEntityDefinition[] = [];

export const customerEntities: IModuleEntityDefinition[] = [
  ...customerLists
];

export default customerEntities;
