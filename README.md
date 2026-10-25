# @akalin/customer_module

Webakus ERP ekosistemi için bağımsız, yeniden kullanılabilir ve `@akalin/module_core` (`IModuleDefinition` / `ModuleRegistry`) ile tam uyumlu Cari, Müşteri ve Tedarikçi Yönetimi Modülü.

## Özellikler
- **Cari Kart Yönetimi**: Bireysel, Kurumsal ve Personel cari hesap kartları için zengin form stratejileri (`BireyselCariStrategy`, `KurumsalCariStrategy`, `PersonelCariStrategy`).
- **Cari Adres Yönetimi**: Çoklu adres, teslimat/fatura adresleri ve merkezi adres entegrasyonu (`CariAdresForm`).
- **Avatar & Logo Yönetimi**: Cari fotoğraf/logo yükleme ve görsel profil desteği (`CariAvatarUploader`, `CariAvatar`).
- **Merkezi Seçici Modal**: Hızlı arama, klavye gezinimi ve filtreleme özellikli `CariSeciciList` / `CariSeciciModal`.
- **Sektörel Modül Ayarları**: Kök sıralama ve unvan şablonları tercihlerini yöneten `CariModulAyarlari`.
- **Adapter Mimarisi**: API ve veri erişimi `CustomerServiceContext` ve `ICustomerServiceAdapter` üzerinden soyutlanmıştır.

## Kurulum
```bash
npm install github:akalinserhat/akalin-customer-module#main
```

## Kullanım
```tsx
import { createCustomerModule } from '@akalin/customer_module';
import { ModuleRegistry } from '@akalin/module_core';

const customerModule = createCustomerModule();
ModuleRegistry.register(customerModule);
```
