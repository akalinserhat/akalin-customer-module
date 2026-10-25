/**
 * Webakus ERP - Bireysel Cari Kartı Form Stratejisi (BireyselCariStrategy.ts)
 * 
 * Başlıca Sorumlulukları:
 * - Gerçek kişi / Şahıs (Bireysel Müşteri, Şahıs Tedarikçi vb.) cari hesapları için form alan şemasını tanımlar.
 * - T.C. Kimlik No (11 hane), Ad, Orta İsim, Soyad ve Doğum Tarihi alanlarını yönetir.
 * - Cari Türü'ne (Alıcı, Satıcı, Alıcı & Satıcı) göre finansal alanları dinamik olarak uyarlar.
 */

import BaseFormStrategy from '../../forms/BaseFormStrategy';

export default class BireyselCariStrategy extends BaseFormStrategy {
    private tur: number;

    constructor(tur: number = 1) {
        super();
        this.tur = tur;
    }

    getTabs() {
        return [
            { id: 'genel', label: 'Genel Bilgiler', icon: 'User' },
            { id: 'iletisim', label: 'Adresler', icon: 'MapPin' },
            { id: 'finans', label: 'Finansal Ayarlar', icon: 'DollarSign' },
            { id: 'gostergeler', label: 'Akıllı Göstergeler', icon: 'Activity' }
        ];
    }

    getFields(tabId: string) {
        const isSatici = this.tur === 2; // Satıcı (Tedarikçi)
        const isAliciSatici = this.tur === 3; // Alıcı & Satıcı

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
                        { id: 'ad', name: 'ad', label: 'Ad', type: 'text', required: true, placeholder: 'Kişinin Adı', autoFocus: true },
                        { id: 'ortaIsim', name: 'ortaIsim', label: 'Orta İsim', type: 'text', placeholder: 'Orta İsim (Varsa)' },
                        { id: 'soyad', name: 'soyad', label: 'Soyad', type: 'text', required: true, placeholder: 'Kişinin Soyadı' }
                    ]
                },
                { id: 'tcKimlikNo', name: 'tcKimlikNo', label: 'T.C. Kimlik No', type: 'text', icon: 'CreditCard', maxLength: 11, placeholder: '11 Haneli TCKN' },
                { id: 'dogumTarihi', name: 'dogumTarihi', label: 'Doğum Tarihi', type: 'date', icon: 'Calendar' },
                { id: 'telefon', name: 'telefon', label: 'Telefon Numarası', type: 'phone', icon: 'Phone', placeholder: '0 (5XX) XXX XX XX' },
                { id: 'email', name: 'email', label: 'E-Posta Adresi', type: 'email', placeholder: 'ornek@kisi.com' },
                { id: 'etiketler', name: 'etiketler', label: 'Etiketler', type: 'text', icon: 'Tags', placeholder: 'Örn: VIP, Perakende, Sadık Müşteri (Virgülle ayırın)', gridColumn: '1 / -1' }
            ];
        }

        if (tabId === 'iletisim') {
            return [
                { id: 'adresSecici', name: 'adresSecici', label: 'Merkezi Adres Seçici', type: 'custom', gridColumn: '1 / -1' }
            ];
        }

        if (tabId === 'finans') {
            const fields: any[] = [
                { id: 'paraBirimi', name: 'paraBirimi', label: 'Para Birimi', type: 'select', icon: 'DollarSign' }
            ];

            if (isSatici) {
                fields.push(
                    { id: 'vadeGun', name: 'vadeGun', label: 'Tedarikçi Ödeme Vadesi (Gün)', type: 'number', icon: 'Calendar', placeholder: 'Örn: 30, 45, 60' },
                    { 
                        id: 'tedarikciHelper', 
                        name: 'tedarikciHelper', 
                        type: 'info-block', 
                        icon: 'User', 
                        title: 'Şahıs Tedarikçi Koşulları', 
                        text: 'Şahıs tedarikçiye yapılacak ödemelerde varsayılan vade süresi uygulanır.',
                        gridColumn: '1 / -1'
                    }
                );
            } else {
                // Alıcı (Müşteri) veya Alıcı & Satıcı
                fields.push(
                    { id: 'vadeGun', name: 'vadeGun', label: isAliciSatici ? 'Varsayılan Vade (Gün)' : 'Müşteri Satış Vadesi (Gün)', type: 'number', icon: 'Calendar', placeholder: 'Örn: 30, 60, 90' },
                    { id: 'riskLimiti', name: 'riskLimiti', label: 'Kredi / Risk Limiti (₺)', type: 'number', step: "0.01", icon: 'Shield', placeholder: '0.00' },
                    { 
                        id: 'riskHelper', 
                        name: 'riskHelper', 
                        type: 'info-block', 
                        icon: 'Shield', 
                        title: 'Kredi / Risk Limiti', 
                        text: 'Bireysel müşterinin açık hesap risk limiti belirlenen tutarı aştığında sistem uyarı verecektir.',
                        gridColumn: '1 / -1'
                    }
                );
            }

            return fields;
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
