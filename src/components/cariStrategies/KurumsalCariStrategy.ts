/**
 * Webakus ERP - Kurumsal Cari Kartı Form Stratejisi (KurumsalCariStrategy.ts)
 * 
 * Başlıca Sorumlulukları:
 * - Tüzel kişilik (Şirket, Kurum vb.) cari hesapları için form alan şemasını tanımlar.
 * - Firma Ünvanı, Vergi Dairesi ve VKN (10 hane) alanlarını yönetir.
 * - Cari Türü'ne (Alıcı, Satıcı, Alıcı & Satıcı) göre finansal alanları ve sekmeleri dinamik olarak uyarlar.
 */

import BaseFormStrategy from '../../forms/BaseFormStrategy';

export default class KurumsalCariStrategy extends BaseFormStrategy {
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
                { id: 'unvan', name: 'unvan', label: 'Firma Ünvanı', type: 'text', required: true, gridColumn: '1 / -1', placeholder: 'Tam ticari ünvanı giriniz...', autoFocus: true },
                { id: 'vergiDairesi', name: 'vergiDairesi', label: 'Vergi Dairesi', type: 'text', placeholder: 'Örn: Beyoğlu VD.' },
                { id: 'vergiNo', name: 'vergiNo', label: 'Vergi No (VKN)', type: 'text', maxLength: 10, placeholder: '10 Haneli VKN' },
                { id: 'email', name: 'email', label: 'E-Posta Adresi', type: 'email', placeholder: 'ornek@sirket.com' },
                { id: 'telefon', name: 'telefon', label: 'Telefon Numarası', type: 'phone', icon: 'Phone', placeholder: '0 (212) XXX XX XX' },
                { id: 'webSitesi', name: 'webSitesi', label: 'Web Sitesi', type: 'text', placeholder: 'https://www.sirket.com' },
                { id: 'etiketler', name: 'etiketler', label: 'Etiketler', type: 'text', icon: 'Tags', placeholder: 'Örn: VIP, Ana Tedarikçi, Toptan (Virgülle ayırın)' }
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
                        icon: 'Building', 
                        title: 'Tedarikçi Finansal Koşulları', 
                        text: 'Tedarikçiye yapılacak mal alımı ve masraf faturalarında varsayılan ödeme vadesi olarak uygulanır. Satıcı hesaplarına müşteri satış risk limiti uygulanmaz.',
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
                        title: 'Kredi / Risk Limiti Nasıl Çalışır?', 
                        text: 'Müşterinin açık hesap borcu, bekleyen siparişleri ve vadesi gelmemiş çek/senet risk toplamı belirlenen limiti aştığında sistem işlem girişinde uyarı verir veya engeller.',
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
