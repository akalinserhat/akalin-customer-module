/**
 * Webakus ERP - Cari Formu Varsayılan Değerleri (cariFormDefaultValue.ts)
 * 
 * Başlıca Sorumlulukları:
 * - Yeni cari kartı açılışında form alanlarının başlangıç değerlerini ve sektörel Cari Türü sıralamasına
 *   göre varsayılan Tipi (Kurumsal/Bireysel) ve Türü (Alıcı/Satıcı/Personel vb.) belirler.
 */

import { buildCariTuruTreeData, CariTuruYapilandirma } from '@akalin/ui';

export interface CariDefaultValuesOptions {
  cariConfig?: CariTuruYapilandirma | string | null;
  initialData?: any;
}

export function getCariFormDefaultValues(options: CariDefaultValuesOptions = {}) {
  const { cariConfig, initialData } = options;

  let defaultTipi = 1;
  let defaultTur = 1;

  if (initialData?.tipi && initialData?.tur) {
    defaultTipi = initialData.tipi;
    defaultTur = initialData.tur;
  } else {
    try {
      const tree = buildCariTuruTreeData(cariConfig);
      const firstGroup = tree[0];
      const firstLeaf = firstGroup?.children?.[0];

      if (firstLeaf?.rawValue) {
        defaultTipi = firstLeaf.rawValue.tipi ?? (firstGroup?.id === 'bireysel' ? 2 : 1);
        defaultTur = firstLeaf.rawValue.tur ?? 1;
      } else if (cariConfig) {
        let parsed: any = cariConfig;
        if (typeof parsed === 'string') {
          try {
            parsed = JSON.parse(parsed);
            if (typeof parsed === 'string') parsed = JSON.parse(parsed);
          } catch (err) {}
        }
        const siralama = parsed?.kokSiralama || parsed?.KokSiralama;
        if (siralama === 'bireysel_once' || siralama === 'bireysel') {
          defaultTipi = 2;
        }
      }

      if (cariConfig) {
        let parsed: any = cariConfig;
        if (typeof parsed === 'string') {
          try {
            parsed = JSON.parse(parsed);
            if (typeof parsed === 'string') parsed = JSON.parse(parsed);
          } catch (err) {}
        }
        const varsayilanTur = parsed?.varsayilanTur || parsed?.VarsayilanTur;
        if (varsayilanTur && typeof varsayilanTur === 'string') {
          const parts = varsayilanTur.split('_');
          defaultTipi = parseInt(parts[0], 10) || defaultTipi;
          defaultTur = parseInt(parts[1], 10) || defaultTur;
        }
      }
    } catch (e) {
      console.error('Cari form varsayılan değerler hesaplama hatası:', e);
    }
  }

  let defaultAd = initialData?.ad || '';
  let defaultSoyad = initialData?.soyad || '';
  let defaultUnvan = initialData?.unvan || '';

  const resolvedTipi = initialData?.tipi || defaultTipi;
  const resolvedTur = initialData?.tur || defaultTur;

  // Eğer Bireysel (tipi === 2) veya Personel (tur === 4) ise ve Ad/Soyad boş ama Unvan doluysa, unvan'dan Ad ve Soyad türet
  if ((resolvedTipi === 2 || resolvedTur === 4) && !defaultAd && !defaultSoyad && defaultUnvan) {
    const trimmed = defaultUnvan.trim();
    if (trimmed.includes(',')) {
      const parts = trimmed.split(',');
      defaultSoyad = parts[0]?.trim() || '';
      defaultAd = parts.slice(1).join(' ').trim() || '';
    } else if (trimmed.includes(' ')) {
      const lastSpaceIdx = trimmed.lastIndexOf(' ');
      defaultAd = trimmed.substring(0, lastSpaceIdx).trim();
      defaultSoyad = trimmed.substring(lastSpaceIdx + 1).trim();
    } else {
      defaultAd = trimmed;
    }
  }

  return {
    ...(initialData || {}),
    id: initialData?.id ?? initialData?.Id,
    kod: initialData?.kod || '????',
    tipi: resolvedTipi,
    tur: resolvedTur,
    unvan: defaultUnvan,
    ad: defaultAd,
    soyad: defaultSoyad,
    tcKimlikNo: initialData?.tcKimlikNo || '',
    vergiDairesi: initialData?.vergiDairesi || '',
    vergiNo: initialData?.vergiNo || '',
    email: initialData?.email || '',
    telefon: initialData?.telefon || '',
    webSitesi: initialData?.webSitesi || '',
    paraBirimi: initialData?.paraBirimi || 'TRY',
    vadeGun: initialData?.vadeGun || '',
    riskLimiti: initialData?.riskLimiti || 0,
    etiketler: initialData?.etiketler || '',
    adresler: initialData?.adresler || [],
    yetkililer: initialData?.yetkililer || [],
    profilResmiUrl: initialData?.profilResmiUrl || null,
    // Akıllı Kadran Göstergeleri (0: Kapalı, 1-10: Durum Kodu)
    gostergeUst: initialData?.gostergeUst ?? 0, // Kuzey: Son Alışveriş Tazeliği (1: Çok Yeni ... 9: Eski Cari)
    gostergeAlt: initialData?.gostergeAlt ?? 0, // Güney: Taksit Durumu (10: Taksiti Bitmiş Satış Fırsatı Gradyanı)
    gostergeSol: initialData?.gostergeSol ?? 0, // Batı: Rezerv Alan
    gostergeSag: initialData?.gostergeSag ?? 0, // Doğu: Rezerv Alan
    tarih: initialData?.tarih ? initialData.tarih.split('T')[0] : new Date().toISOString().split('T')[0]
  };
}
