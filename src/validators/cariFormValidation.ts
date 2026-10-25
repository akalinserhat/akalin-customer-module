/**
 * Webakus - Cari Yönetimi / Cari Formu Doğrulama Kuralları (cariFormValidation.ts)
 * 
 * Başlıca Görevleri:
 * - T.C. Kimlik No mod-10 algoritma kontrolü ve Vergi Kimlik No (VKN) hane kontrolü
 * - Şahıs (Bireysel / Personel) ve Tüzel (Kurumsal) cari kayıtları için anlık alan ve form teslim doğrulamalarını yönetmek
 */

/**
 * T.C. Kimlik mod-10 algoritmasını doğrular.
 */
export const validateTcKimlikNo = (tc: string): boolean => {
    if (!tc) return true; // Boş bırakılabilir (zorunluluk iş kurallarına göre değişir)
    if (!/^[1-9][0-9]{10}$/.test(tc)) return false;

    const arr = tc.split('').map(Number);
    const oddSum = arr[0] + arr[2] + arr[4] + arr[6] + arr[8];
    const evenSum = arr[1] + arr[3] + arr[5] + arr[7];

    let tenth = (oddSum * 7 - evenSum) % 10;
    if (tenth < 0) tenth += 10;
    
    if (tenth !== arr[9]) return false;

    const eleventh = (arr.slice(0, 10).reduce((a, b) => a + b, 0)) % 10;
    if (eleventh !== arr[10]) return false;

    return true;
};

/**
 * Vergi Kimlik Numarası (VKN) 10 hane kontrolü.
 */
export const validateVergiKimlikNo = (vkn: string): boolean => {
    if (!vkn) return true;
    return /^[0-9]{10}$/.test(vkn);
};

/**
 * Cari kartı anlık input (onBlur veya onChange) doğrulaması.
 */
export const validateCariField = (
    name: string, 
    value: any, 
    formData: any, 
    t: (key: string) => string = (k) => k
): string | null => {
    const isPersonel = parseInt(formData.tur, 10) === 4;
    const isBireysel = parseInt(formData.tipi, 10) === 2 || isPersonel;

    if (name === 'tcKimlikNo' && isBireysel) {
        if (isPersonel && (!value || value.toString().trim() === '')) {
            return t('T.C. Kimlik Numarası zorunludur');
        }
        if (value && !validateTcKimlikNo(value)) {
            return t('Geçersiz T.C. Kimlik Numarası');
        }
    }

    if (name === 'vergiNo' && !isBireysel) {
        if (value && !validateVergiKimlikNo(value)) {
            return t('Vergi Numarası 10 haneli olmalıdır');
        }
    }

    if (name === 'unvan' && !isBireysel) {
        if (!value || value.toString().trim() === '') {
            return t('Firma Ünvanı zorunludur');
        }
    }

    if ((name === 'ad' || name === 'soyad') && isBireysel) {
        if (!value || value.toString().trim() === '') {
            return t(name === 'ad' ? 'Ad alanı zorunludur' : 'Soyad alanı zorunludur');
        }
    }

    return null;
};

/**
 * Cari formunun toplu validasyonu.
 */
export const validateCariForm = (
    formData: any, 
    t: (key: string) => string = (k) => k
): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    const isPersonel = parseInt(formData.tur, 10) === 4;
    const isBireysel = parseInt(formData.tipi, 10) === 2 || isPersonel;
    
    if (isBireysel) {
        if (!formData.ad || formData.ad.toString().trim() === '') {
            errors.ad = t('Ad alanı zorunludur');
        }
        if (!formData.soyad || formData.soyad.toString().trim() === '') {
            errors.soyad = t('Soyad alanı zorunludur');
        }
        if (isPersonel && (!formData.tcKimlikNo || formData.tcKimlikNo.toString().trim() === '')) {
            errors.tcKimlikNo = t('Personel için T.C. Kimlik Numarası zorunludur');
        }
        if (formData.tcKimlikNo && !validateTcKimlikNo(formData.tcKimlikNo)) {
            errors.tcKimlikNo = t('Geçersiz T.C. Kimlik Numarası');
        }
    } else {
        if (!formData.unvan || formData.unvan.toString().trim() === '') {
            errors.unvan = t('Firma Ünvanı zorunludur');
        }
        if (formData.vergiNo && !validateVergiKimlikNo(formData.vergiNo)) {
            errors.vergiNo = t('Vergi Numarası 10 haneli olmalıdır');
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
