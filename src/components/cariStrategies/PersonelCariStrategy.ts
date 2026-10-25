/**
 * Webakus ERP - Personel Cari Kartı Form Stratejisi (PersonelCariStrategy.ts)
 * 
 * Başlıca Sorumlulukları:
 * - Personel (Çalışan) cari hesapları için form sekmeleri ve alan şemasını tanımlar.
 * - Firma Ünvanı ve VKN gibi kurumsal alanları kaldırarak TCKN, Ad, Soyad, Doğum Tarihi alanlarını zorunlu kılar.
 * - Personel maaş, avans ve masraf takibine uygun sadeleştirilmiş finans sekmesi sunar.
 */

import BaseFormStrategy from '../../forms/BaseFormStrategy';

export default class PersonelCariStrategy extends BaseFormStrategy {
    getTabs() {
        return [
            { id: 'genel', label: 'Personel Bilgileri', icon: 'User' },
            { id: 'iletisim', label: 'İkametgah & Adres', icon: 'MapPin' },
            { id: 'finans', label: 'Maaş & Finans', icon: 'DollarSign' },
            { id: 'gostergeler', label: 'Akıllı Göstergeler', icon: 'Activity' }
        ];
    }

    getFields(tabId: string) {
        if (tabId === 'genel') {
            return [
                {
                    id: 'tarihVeTurRow', type: 'row', gridColumn: '1 / -1', fields: [
                        { id: 'tarih', name: 'tarih', label: 'Kayıt Tarihi', type: 'date', icon: 'Calendar' },
                        { id: 'tur', name: 'tur', label: 'Cari Türü & Tipi', type: 'custom', required: true }
                    ]
                },
                {
                    id: 'isimRow', type: 'row', gridColumn: '1 / -1', fields: [
                        { id: 'ad', name: 'ad', label: 'Ad', type: 'text', required: true, placeholder: 'Personel Adı', autoFocus: true },
                        { id: 'ortaIsim', name: 'ortaIsim', label: 'Orta İsim', type: 'text', placeholder: 'Orta İsim (Varsa)' },
                        { id: 'soyad', name: 'soyad', label: 'Soyad', type: 'text', required: true, placeholder: 'Personel Soyadı' }
                    ]
                },
                { id: 'tcKimlikNo', name: 'tcKimlikNo', label: 'T.C. Kimlik No', type: 'text', icon: 'CreditCard', maxLength: 11, placeholder: '11 Haneli TCKN', required: true },
                { id: 'dogumTarihi', name: 'dogumTarihi', label: 'Doğum Tarihi', type: 'date', icon: 'Calendar' },
                { id: 'telefon', name: 'telefon', label: 'Cep Telefonu', type: 'phone', icon: 'Phone', placeholder: '0 (5XX) XXX XX XX' },
                { id: 'email', name: 'email', label: 'E-Posta Adresi', type: 'email', placeholder: 'personel@sirket.com' },
                { id: 'etiketler', name: 'etiketler', label: 'Departman / Görev / Etiketler', type: 'text', icon: 'Tags', placeholder: 'Örn: Muhasebe, Satış Temsilcisi, Saha', gridColumn: '1 / -1' }
            ];
        }

        if (tabId === 'iletisim') {
            return [
                { id: 'adresSecici', name: 'adresSecici', label: 'İkametgah Adresi', type: 'custom', gridColumn: '1 / -1' }
            ];
        }

        if (tabId === 'finans') {
            return [
                { id: 'paraBirimi', name: 'paraBirimi', label: 'Maaş / Hesap Para Birimi', type: 'select', icon: 'DollarSign' },
                { 
                    id: 'personelHelper', 
                    name: 'personelHelper', 
                    type: 'info-block', 
                    icon: 'User', 
                    title: 'Personel Cari Hesabı Nasıl Çalışır?', 
                    text: 'Personel cari hesapları; maaş tahakkukları, avans ödemeleri, prim ve masraf fişlerinin takibinde kullanılır. Bu hesaplara ticari risk limiti veya müşteri satış vadesi uygulanmaz.',
                    gridColumn: '1 / -1'
                }
            ];
        }

        // ── Akıllı Kadran Göstergeleri (0: Kapalı, 1-10 Durum ve Renk Skalası) ──
        // Üst: Son Alışveriş (1: Çok Yeni ... 9: Eski), Alt: Taksit (10: Taksit Bitti / Satış Fırsatı)
        // Sol ve Sağ: Gelecek iş kuralları için generik rezerv alanlar.
        if (tabId === 'gostergeler') {
            return [
                {
                    id: 'gostergeRow1', type: 'row', gridColumn: '1 / -1', fields: [
                        { id: 'gostergeUst', name: 'gostergeUst', label: 'Üst Gösterge (Kuzey - Alışveriş Tazeliği)', type: 'select', icon: 'Compass' },
                        { id: 'gostergeAlt', name: 'gostergeAlt', label: 'Alt Gösterge (Güney - Taksit / Fırsat)', type: 'select', icon: 'Compass' }
                    ]
                },
                {
                    id: 'gostergeRow2', type: 'row', gridColumn: '1 / -1', fields: [
                        { id: 'gostergeSol', name: 'gostergeSol', label: 'Sol Gösterge (Batı - Rezerv)', type: 'select', icon: 'Compass' },
                        { id: 'gostergeSag', name: 'gostergeSag', label: 'Sağ Gösterge (Doğu - Rezerv)', type: 'select', icon: 'Compass' }
                    ]
                },
                {
                    id: 'gostergeHelper',
                    name: 'gostergeHelper',
                    type: 'info-block',
                    icon: 'Activity',
                    title: 'Akıllı Kadran Göstergeleri',
                    text: 'Avatar etrafındaki 4 kadranlı gösterge halkası carinin alışveriş tazeliği, taksit durumu ve rezerv alanlarına göre 0-10 arası değer alır. Değer değiştikçe sol üstteki avatar halkası canlı olarak güncellenir.',
                    gridColumn: '1 / -1'
                }
            ];
        }

        return [];
    }

    getOptions(fieldId: string) {
        if (fieldId === 'tur') {
            return [
                { value: 1, label: 'Alıcı (Müşteri)' },
                { value: 2, label: 'Satıcı (Tedarikçi)' },
                { value: 3, label: 'Alıcı & Satıcı' },
                { value: 4, label: 'Personel' }
            ];
        }
        if (fieldId === 'paraBirimi') {
            return [
                { value: 'TRY', label: 'Türk Lirası (₺)' },
                { value: 'USD', label: 'Dolar ($)' },
                { value: 'EUR', label: 'Euro (€)' }
            ];
        }
        if (['gostergeUst', 'gostergeAlt', 'gostergeSol', 'gostergeSag'].includes(fieldId)) {
            return [
                { value: 0, label: '0 - Kapalı (Görünmez)' },
                { value: 1, label: '1 - Zümrüt Yeşili (En Yeni / Çok İyi)' },
                { value: 2, label: '2 - Deniz Yeşili' },
                { value: 3, label: '3 - Açık Yeşil' },
                { value: 4, label: '4 - Lime Yeşili' },
                { value: 5, label: '5 - Kehribar Sarısı (Orta)' },
                { value: 6, label: '6 - Canlı Turuncu' },
                { value: 7, label: '7 - Turuncu Kırmızı' },
                { value: 8, label: '8 - Mercan Kırmızısı' },
                { value: 9, label: '9 - Derin Kırmızı (Eski / Kritik)' },
                { value: 10, label: '10 - Altın / Zümrüt Gradyanı (Fırsat)' }
            ];
        }
        return [];
    }
}
