/**
 * @akalin/customer_module
 * Webakus ERP ekosistemi için bağımsız, yeniden kullanılabilir Müşteri, Tedarikçi
 * ve Cari Hesap Yönetimi Modülü.
 */

// Ana Modül Fabrikası ve Singleton Modül Tanımı
import { createCustomerModule } from './createCustomerModule';

export * from './createCustomerModule';
export { createCustomerModule } from './createCustomerModule';
export * from './definitions/entities';

export const CariYonetimiModule = createCustomerModule();
export default CariYonetimiModule;

// Adapter & Servis Context
export * from './adapters/CustomerServiceContext';

// Tipler ve DTO'lar
export * from './types';

// Servisler
export * from './services/CariService';
export * from './services/CariAyarlarService';
export { BaseService } from './services/BaseService';
export { default as httpClient } from './services/httpClient';

// Doğrulayıcılar (Validators)
export * from './validators/cariFormValidation';
export * from './validators/CariAdresValidation';

// Varsayılan Değerler (Defaults)
export * from './defaults/cariFormDefaultValue';

// Context
export * from './context/AuthContext';

// Bileşenler ve Sayfalar
export { default as CariModulAyarlari } from './components/CariModulAyarlari';
export { default as CariSeciciList, CariSeciciModal, type CariSeciciListProps, type CariSeciciModalProps } from './components/CariSeciciList';
export { default as CariForm, type CariFormProps, type ICari, type ICariAdres } from './components/CariForm';
export { default as CariAdresForm } from './components/CariAdresForm';
export { default as CariAvatar } from './components/CariAvatar';
export { default as CariAvatarUploader } from './components/CariAvatarUploader';
export { default as CariStrategyFactory } from './components/cariStrategies/CariStrategyFactory';
