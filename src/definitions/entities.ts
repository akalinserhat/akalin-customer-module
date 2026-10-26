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
  },
  {
    id: 'cari-grubu',
    category: 'kart',
    titleKey: 'Cari Grubu ve Kategorileri',
    title: 'Cari Grubu ve Kategorileri',
    description: 'Carilerin sektör, bölge ve tip bazında sınıflandırıldığı grup tanımları',
    route: '/cariler/gruplar',
    listRoute: '/cariler/gruplar',
    formRoute: '/cariler/gruplar/:id',
    useStandardCrud: true,
    showInMenu: false,
    isRegistered: true
  },
  {
    id: 'cari-subesi',
    category: 'kart',
    titleKey: 'Cari Şubeleri',
    title: 'Cari Şubeleri',
    description: 'Kurumsal cari hesaplara ait teslimat, fatura ve operasyon şubeleri',
    route: '/cariler/:id/subeler',
    listRoute: '/cariler/:id/subeler',
    formRoute: '/cariler/:id/subeler/:subeId',
    useStandardCrud: true,
    showInMenu: false,
    isRegistered: true
  }
];

export const customerDocuments: IModuleEntityDefinition[] = [
  {
    id: 'cari-virman',
    category: 'belge',
    titleKey: 'Cari Virman Fişi',
    title: 'Cari Virman Fişi',
    description: 'İki cari hesap arasında bakiye transfer ve borç/alacak virman işlemi',
    route: '/cariler/virman',
    listRoute: '/cariler/virman',
    formRoute: '/cariler/virman/:id',
    useStandardCrud: true,
    showInMenu: true,
    isRegistered: true,
    customActions: [
      { action: 'onayla', labelKey: 'Virman Onaylama', description: 'Cari virman fişini onaylayıp bakiyelere işleme' }
    ]
  },
  {
    id: 'cari-borc-alacak-dekontu',
    category: 'belge',
    titleKey: 'Cari Borç / Alacak Dekontu',
    title: 'Cari Borç / Alacak Dekontu',
    description: 'Cari hesaplara doğrudan borç veya alacak kaydı işleyen dekont belgeleri',
    route: '/cariler/dekont',
    listRoute: '/cariler/dekont',
    formRoute: '/cariler/dekont/:id',
    useStandardCrud: true,
    showInMenu: true,
    isRegistered: true,
    customActions: [
      { action: 'onayla', labelKey: 'Dekont Onaylama', description: 'Cari dekontunu onaylayıp bakiyelere işleme' }
    ]
  },
  {
    id: 'cari-acilis-fisi',
    category: 'belge',
    titleKey: 'Cari Açılış / Devir Fişi',
    title: 'Cari Açılış / Devir Fişi',
    description: 'Dönem başı veya sistem geçişi cari borç/alacak devir ve açılış fişi',
    route: '/cariler/acilis-fisi',
    listRoute: '/cariler/acilis-fisi',
    formRoute: '/cariler/acilis-fisi/:id',
    useStandardCrud: true,
    showInMenu: true,
    isRegistered: true
  },
  {
    id: 'cari-hesap-ekstresi',
    category: 'belge',
    titleKey: 'Cari Hesap Ekstresi',
    title: 'Cari Hesap Ekstresi',
    description: 'Cari hesaba ait tüm fatura, tahsilat, ödeme ve bakiye hareketlerinin resmi dökümü',
    route: '/cariler/ekstre',
    listRoute: '/cariler/ekstre',
    formRoute: '/cariler/:id/ekstre',
    useStandardCrud: true,
    showInMenu: true,
    isRegistered: true,
    customActions: [
      { action: 'yazdir', labelKey: 'Ekstre Yazdır', description: 'Cari hesap ekstresini PDF / yazıcı çıktısı alma' },
      { action: 'disa-aktar', labelKey: 'Excel Aktarım', description: 'Ekstre hareketlerini Excel olarak dışa aktarma' }
    ]
  }
];

export const customerReports: IModuleEntityDefinition[] = [
  {
    id: 'cari-bakiye-raporu',
    category: 'rapor',
    titleKey: 'Cari Bakiye & Risk Raporu',
    title: 'Cari Bakiye & Risk Raporu',
    description: 'Tüm carilerin borç, alacak, net bakiye ve risk limit analizi',
    route: '/cariler/raporlar/bakiye',
    useStandardCrud: false,
    showInMenu: true,
    isRegistered: true
  },
  {
    id: 'cari-yaslandirma-raporu',
    category: 'rapor',
    titleKey: 'Cari Borç Yaşlandırma Raporu',
    title: 'Cari Borç Yaşlandırma Raporu',
    description: 'Vadesi geçmiş alacakların ve borçların gün aralıklarına göre yaşlandırma dökümü',
    route: '/cariler/raporlar/yaslandirma',
    useStandardCrud: false,
    showInMenu: true,
    isRegistered: true
  }
];

export const customerEntities: IModuleEntityDefinition[] = [
  ...customerCards,
  ...customerDocuments,
  ...customerReports
];

export default customerEntities;
