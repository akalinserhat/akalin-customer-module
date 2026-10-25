/**
 * Webakus - Cari Yönetimi / Cari Adres Formu Doğrulama Kuralları (CariAdresValidation.ts)
 * 
 * Başlıca Sorumlulukları:
 * - Cari adres ekleme ve düzenleme formu için alan bazlı ve form geneli doğrulama kurallarını yönetmek.
 * - Teslimat Yetkilisi (İsim Soyisim), Telefon, Adres Başlığı, İl, İlçe, Açık Adres ve Kurumsal Fatura alanlarının geçerliliğini denetlemek.
 */

export interface CariAdresFormData {
  isimSoyisim?: string | null;
  telefon?: string | null;
  adresBaslik?: string | null;
  adresIl?: string | null;
  adresIlce?: string | null;
  acikAdres?: string | null;
  faturaTipi?: number;
  firmaAdi?: string | null;
  vergiDairesi?: string | null;
  vergiNo?: string | null;
  [key: string]: any;
}

/**
 * Tekil alan doğrulaması (onBlur veya anlık denetim için).
 */
export const validateCariAdresField = (
  name: string,
  value: any,
  formData: CariAdresFormData,
  t: (key: string) => string = (k) => k
): string | null => {
  const strVal = value != null ? value.toString().trim() : '';

  switch (name) {
    case 'isimSoyisim':
      if (!strVal) return t('Teslim alacak kişi / firma adı zorunludur');
      break;

    case 'telefon': {
      if (!strVal) return t('Telefon numarası zorunludur');
      const digitsOnly = strVal.replace(/\D/g, '');
      if (digitsOnly.length < 10) {
        return t('Lütfen geçerli bir telefon numarası giriniz (en az 10 hane)');
      }
      break;
    }

    case 'adresBaslik':
      if (!strVal) return t('Adres Başlığı zorunludur');
      break;

    case 'adresIl':
      if (!strVal) return t('İl seçimi veya girişi zorunludur');
      break;

    case 'adresIlce':
      if (!strVal) return t('İlçe seçimi veya girişi zorunludur');
      break;

    case 'acikAdres':
      if (!strVal) return t('Açık Adres alanı zorunludur');
      break;

    case 'firmaAdi':
      if (formData.faturaTipi === 2 && !strVal) {
        return t('Kurumsal fatura için Firma Ünvanı zorunludur');
      }
      break;

    case 'vergiDairesi':
      if (formData.faturaTipi === 2 && !strVal) {
        return t('Kurumsal fatura için Vergi Dairesi zorunludur');
      }
      break;

    case 'vergiNo':
      if (formData.faturaTipi === 2) {
        if (!strVal) return t('Kurumsal fatura için Vergi Numarası zorunludur');
        if (!/^[0-9]{10}$/.test(strVal) && !/^[1-9][0-9]{10}$/.test(strVal)) {
          return t('Geçerli bir Vergi Numarası (10 hane) veya TCKN (11 hane) giriniz');
        }
      }
      break;

    default:
      break;
  }

  return null;
};

/**
 * Cari adres formunun toplu validasyonu (Kaydetme anı için).
 */
export const validateCariAdresForm = (
  formData: CariAdresFormData,
  t: (key: string) => string = (k) => k
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  const isimErr = validateCariAdresField('isimSoyisim', formData.isimSoyisim, formData, t);
  if (isimErr) errors.isimSoyisim = isimErr;

  const telErr = validateCariAdresField('telefon', formData.telefon, formData, t);
  if (telErr) errors.telefon = telErr;

  const baslikErr = validateCariAdresField('adresBaslik', formData.adresBaslik, formData, t);
  if (baslikErr) errors.adresBaslik = baslikErr;

  const ilErr = validateCariAdresField('adresIl', formData.adresIl, formData, t);
  if (ilErr) errors.adresIl = ilErr;

  const ilceErr = validateCariAdresField('adresIlce', formData.adresIlce, formData, t);
  if (ilceErr) errors.adresIlce = ilceErr;

  const acikAdresErr = validateCariAdresField('acikAdres', formData.acikAdres, formData, t);
  if (acikAdresErr) errors.acikAdres = acikAdresErr;

  if (formData.faturaTipi === 2) {
    const firmaErr = validateCariAdresField('firmaAdi', formData.firmaAdi, formData, t);
    if (firmaErr) errors.firmaAdi = firmaErr;

    const vergiDairesiErr = validateCariAdresField('vergiDairesi', formData.vergiDairesi, formData, t);
    if (vergiDairesiErr) errors.vergiDairesi = vergiDairesiErr;

    const vergiNoErr = validateCariAdresField('vergiNo', formData.vergiNo, formData, t);
    if (vergiNoErr) errors.vergiNo = vergiNoErr;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default validateCariAdresForm;
