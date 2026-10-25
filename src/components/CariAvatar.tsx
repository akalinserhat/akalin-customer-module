/**
 * Webakus ERP - Akıllı 4 Kadranlı Cari Avatar Bileşeni (CariAvatar.tsx)
 * 
 * ════════════════════════════════════════════════════════════════════════════════
 * AKILLI KADRAN GÖSTERGE ÇEMBERİ (THE 4-QUADRANT RING / GAUGE ARCHITECTURE)
 * ════════════════════════════════════════════════════════════════════════════════
 * Avatar çevresindeki halka 4 çeyrek yaydan (Kuzey, Güney, Doğu, Batı) oluşur.
 * Her yay 0-10 arası tam sayı değeri alır:
 * 
 * ── DEĞER & RENK SKALASI (0 - 10) ─────────────────────────────────────────────
 * • 0 : Kapalı (Görünmez / Gösterge yayı çizilmez)
 * • 1 : Zümrüt Yeşili  (#10b981) - Çok Yeni / Mükemmel Durum
 * • 2 : Deniz Yeşili   (#059669) - Yeni
 * • 3 : Açık Yeşil     (#16a34a) - Güncel
 * • 4 : Lime Yeşili    (#65a30d) - Normal
 * • 5 : Kehribar Sarısı (#d97706) - Orta / Dikkat
 * • 6 : Canlı Turuncu  (#ea580c) - Hareketsizleşmeye Başlayan
 * • 7 : Turuncu Kırmızı (#f97316) - Uzun Süredir İşlem Görmeyen
 * • 8 : Mercan Kırmızı  (#ef4444) - Kayıp Riski Yüksek
 * • 9 : Derin Kırmızı  (#dc2626) - Eski Cari / Kritik Seviye / Terk
 * • 10: Altın / Zümrüt Gradyanı (#f59e0b -> #10b981) - Özel Satış Fırsatı (Nabız Animasyonlu)
 * 
 * ── KADRANLARIN ANLAMLARI VE İŞ KURALLARI ─────────────────────────────────────
 * 1. KUZEY (ÜST YAY - gostergeUst):
 *    Carinin en son ne zaman alışveriş veya ticari işlem yaptığı bilgisini (Recency) verir.
 *    - 1: 1-3 Gün (Çok Yeni)
 *    - 2: 1-2 Hafta (Yeni)
 *    - 3: 1 Ay (Güncel)
 *    - 4: 1-2 Ay (Normal)
 *    - 5: 2-3 Ay (Orta)
 *    - 6: 3-6 Ay (Uzun Süre)
 *    - 7: 6-9 Ay (Hareketsiz)
 *    - 8: 9-12 Ay (Kayıp Riski)
 *    - 9: 1+ Yıl (Eski / Terk Edilmiş Cari)
 *    - 10: Özel Kampanya / Fırsat Durumu
 * 
 * 2. GÜNEY (ALT YAY - gostergeAlt):
 *    Carinin taksitli alışveriş durumunu ve yeniden satış fırsatını gösterir.
 *    - 1-4 : Taksitleri düzenli ödenen, taksit periyodu devam eden cari.
 *    - 5-7 : Taksit ödemesi gecikmeye giren cari.
 *    - 8-9 : Taksiti kritik derecede gecikmiş / takipteki cari.
 *    - 10  : TAKSİTİ BİTTİ! Cari taksitlerini tamamladı ve borcu bittiği için 
 *            yeniden yeni bir ürün/hizmet almaya hazır durumda! (Altın-Zümrüt Gradyanı)
 * 
 * 3. BATI (SOL YAY - gostergeSol):
 *    Rezerv Alan. İleride sadakat puanı, karlılık segmenti veya e-dönüşüm durumu için
 *    kullanılmak üzere 0-10 arası generik olarak saklanır.
 * 
 * 4. DOĞU (SAĞ YAY - gostergeSag):
 *    Rezerv Alan. İleride kredi risk skoru, tedarikçi güven endeksi vb. için
 *    kullanılmak üzere 0-10 arası generik olarak saklanır.
 * ════════════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useMemo } from 'react';
import { Building, User } from 'lucide-react';

export interface CariAvatarProps {
  title?: string;
  tipi?: number;
  imageUrl?: string | null;
  seed?: string | number;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  className?: string;
  /** Üst Kadran (Kuzey): 0-10 (Son Alışveriş Tazeliği) */
  gostergeUst?: number;
  /** Alt Kadran (Güney): 0-10 (Taksit Durumu & 10: Satış Fırsatı Gradyanı) */
  gostergeAlt?: number;
  /** Sol Kadran (Batı): 0-10 (Gelecek Kullanım İçin Rezerv) */
  gostergeSol?: number;
  /** Sağ Kadran (Doğu): 0-10 (Gelecek Kullanım İçin Rezerv) */
  gostergeSag?: number;
  tooltipText?: string;
}

const GRADIENTS = [
  'avatar-grad-indigo',
  'avatar-grad-emerald',
  'avatar-grad-amber',
  'avatar-grad-rose',
  'avatar-grad-cyan',
  'avatar-grad-violet',
  'avatar-grad-teal',
  'avatar-grad-blue'
];

/**
 * İsmi veya unvanı ayrıştırarak 2 harfli estetik baş harfleri türetir.
 * Örn: "Ahmet Yılmaz" -> "AY", "Koç Holding A.Ş." -> "KH", "Trendyol" -> "TR"
 */
export function getInitials(name?: string): string {
  if (!name) return '?';

  const cleaned = name
    .trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ');

  const words = cleaned.split(' ').filter(w => w.length > 0);
  if (words.length === 0) return '?';
  
  const skipWords = new Set(['AS', 'AŞ', 'LTD', 'ŞTİ', 'STI', 'TIC', 'SAN', 'VE', 'A', 'S']);
  const meaningfulWords = words.filter((w, idx) => idx === 0 || !skipWords.has(w.toUpperCase()));

  if (meaningfulWords.length >= 2) {
    return (meaningfulWords[0][0] + meaningfulWords[1][0]).toLocaleUpperCase('tr-TR');
  } else if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toLocaleUpperCase('tr-TR');
  } else {
    return words[0].slice(0, 2).toLocaleUpperCase('tr-TR');
  }
}

/**
 * Seed değerine göre deterministik olarak gradyan sınıfı seçer.
 */
export function getDeterministikGradient(seed?: string | number): string {
  if (!seed) return GRADIENTS[0];
  const str = String(seed);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
}

/**
 * Polar koordinatları kartezyen koordinatlara çevirir
 */
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

/**
 * SVG yay (Arc) path dize üreticisi
 */
function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M', start.x, start.y, 
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(' ');
}

/**
 * Kadran değerlerinin varsayılan açıklama metinleri
 */
export function getKadranTooltipAciklamasi(ust = 0, alt = 0, sol = 0, sag = 0): string {
  const lines: string[] = [];
  
  if (ust > 0) {
    const ustLabels: Record<number, string> = {
      1: 'Son Alışveriş: Çok Yeni (1-3 Gün)',
      2: 'Son Alışveriş: Yeni (1-2 Hafta)',
      3: 'Son Alışveriş: Güncel (1 Ay)',
      4: 'Son Alışveriş: Normal (1-2 Ay)',
      5: 'Son Alışveriş: Orta / Takip (2-3 Ay)',
      6: 'Son Alışveriş: Hareketsizleşen (3-6 Ay)',
      7: 'Son Alışveriş: Uzun Süre İşlemsiz (6-9 Ay)',
      8: 'Son Alışveriş: Kayıp Riski (9-12 Ay)',
      9: 'Son Alışveriş: Eski Cari / Terk (1+ Yıl)',
      10: 'Son Alışveriş: Özel Fırsat / Kampanya'
    };
    lines.push(`▲ Üst (Alışveriş Tazeliği): ${ustLabels[ust] || `Seviye ${ust}`}`);
  }

  if (alt > 0) {
    const altLabels: Record<number, string> = {
      1: 'Taksit: Yeni Başladı (Düzenli)',
      2: 'Taksit: Düzenli Devam Ediyor',
      3: 'Taksit: Az Kalan Taksit',
      4: 'Taksit: Son Taksit Dönemi',
      5: 'Taksit: Ödeme Bekleniyor',
      6: 'Taksit: Hafif Gecikmede',
      7: 'Taksit: Orta Gecikmede',
      8: 'Taksit: Ciddi Gecikmede',
      9: 'Taksit: Kritik Risk / Takipte',
      10: 'Taksit: Bitti! Yeniden Alışverişe Hazır Fırsat 🎯'
    };
    lines.push(`▼ Alt (Taksit & Fırsat): ${altLabels[alt] || `Seviye ${alt}`}`);
  }

  if (sol > 0) lines.push(`◄ Sol (Rezerv Kadran): Seviye ${sol}`);
  if (sag > 0) lines.push(`► Sağ (Rezerv Kadran): Seviye ${sag}`);

  return lines.join('\n');
}

/**
 * Üst kadran değerini çözer. Eğer veritabanında değer yoksa (0 ise) ve cari tarihi varsa,
 * alışveriş/işlem tazeliğine göre 1-9 arası dinamik hesaplar.
 */
export function resolveGostergeUst(gostergeUst = 0, tarih?: string | Date | null): number {
  if (gostergeUst && gostergeUst > 0) return gostergeUst;
  if (!tarih) return 1; // Varsayılan: Aktif / Yeni Cari (Zümrüt Yeşili)

  try {
    const diffDays = Math.floor((Date.now() - new Date(tarih).getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 3) return 1; // 1-3 Gün (Çok Yeni)
    if (diffDays <= 14) return 2; // 1-2 Hafta (Yeni)
    if (diffDays <= 30) return 3; // 1 Ay (Güncel)
    if (diffDays <= 60) return 4; // 1-2 Ay (Normal)
    if (diffDays <= 90) return 5; // 2-3 Ay (Orta)
    if (diffDays <= 180) return 6; // 3-6 Ay (Hareketsizleşen)
    if (diffDays <= 270) return 7; // 6-9 Ay (Uzun Süre)
    if (diffDays <= 365) return 8; // 9-12 Ay (Kayıp Riski)
    return 9; // 1+ Yıl (Eski Cari)
  } catch {
    return 1;
  }
}

export interface CariAvatarProps {
  title?: string;
  tipi?: number;
  imageUrl?: string | null;
  seed?: string | number;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  className?: string;
  /** Üst Kadran (Kuzey): 0-10 (Son Alışveriş Tazeliği) */
  gostergeUst?: number;
  /** Alt Kadran (Güney): 0-10 (Taksit Durumu & 10: Satış Fırsatı Gradyanı) */
  gostergeAlt?: number;
  /** Sol Kadran (Batı): 0-10 (Gelecek Kullanım İçin Rezerv) */
  gostergeSol?: number;
  /** Sağ Kadran (Doğu): 0-10 (Gelecek Kullanım İçin Rezerv) */
  gostergeSag?: number;
  /** Cari kayıt veya son hareket tarihi (Gösterge 0 ise tazelik bu tarihten otomatik hesaplanır) */
  tarih?: string | Date | null;
  tooltipText?: string;
}

export const CariAvatar: React.FC<CariAvatarProps> = ({
  title,
  tipi = 1,
  imageUrl,
  seed,
  size = 'md',
  showBadge = true,
  className = '',
  gostergeUst = 0,
  gostergeAlt = 0,
  gostergeSol = 0,
  gostergeSag = 0,
  tarih,
  tooltipText
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  React.useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  const isKurumsal = tipi === 1;
  const hasValidImage = Boolean(imageUrl && !imageFailed);

  // Gösterge Üst: Değer girilmişse kullanılır, girilmemişse cari tarihine göre otomatik hesaplanır
  const effectiveUst = useMemo(() => {
    return resolveGostergeUst(gostergeUst, tarih);
  }, [gostergeUst, tarih]);

  const sizeClass = size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : '';
  const finalClass = `avatar-circle ${sizeClass} ${hasValidImage ? '' : (isKurumsal ? 'kurumsal' : 'bireysel')} ${className}`.trim();
  
  // İkon boyutları (Varsayılan olarak tam ortalanır)
  const centerIconSize = size === 'lg' ? 32 : size === 'sm' ? 16 : 20;
  const badgeIconSize = size === 'lg' ? 12 : 9;

  // 4 Kadran SVG Geometrisi (Tam 2px Şerit Genişliği)
  const ringDimensions = useMemo(() => {
    switch (size) {
      case 'lg':
        return { svgSize: 80, center: 40, radius: 37, strokeWidth: 2, gap: 8 };
      case 'sm':
        return { svgSize: 42, center: 21, radius: 18, strokeWidth: 2, gap: 12 };
      case 'md':
      default:
        return { svgSize: 52, center: 26, radius: 22.5, strokeWidth: 2, gap: 10 };
    }
  }, [size]);

  // 4 Kadran Açılar (Kuzey, Doğu, Güney, Batı)
  const { center, radius, strokeWidth, gap, svgSize } = ringDimensions;
  const halfGap = gap / 2;

  const arcUst = describeArc(center, center, radius, -45 + halfGap, 45 - halfGap);
  const arcSag = describeArc(center, center, radius, 45 + halfGap, 135 - halfGap);
  const arcAlt = describeArc(center, center, radius, 135 + halfGap, 225 - halfGap);
  const arcSol = describeArc(center, center, radius, 225 + halfGap, 315 - halfGap);

  const fullTooltip = useMemo(() => {
    if (tooltipText) return tooltipText;
    const desc = getKadranTooltipAciklamasi(effectiveUst, gostergeAlt, gostergeSol, gostergeSag);
    return desc ? `${title ? `${title}\n────────────────\n` : ''}${desc}` : (title || '');
  }, [tooltipText, effectiveUst, gostergeAlt, gostergeSol, gostergeSag, title]);

  return (
    <div className="avatar-ring-container" title={fullTooltip}>
      {/* 2px Genişliğinde 4 Kadran Akıllı Gösterge Çemberi (Daima Çizilir) */}
      <svg
        width={svgSize}
        height={svgSize}
        className="avatar-quadrant-svg"
        viewBox={`0 0 ${svgSize} ${svgSize}`}
      >
        <defs>
          <linearGradient id="quadrant-gold-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        {/* 2px Genişliğinde Taban Renk Şeridi (Track) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="quadrant-track"
        />

        {/* Kuzey (Üst) Kadran - Son Alışveriş Tazeliği */}
        <path
          d={arcUst}
          fill="none"
          strokeWidth={strokeWidth}
          className={`quadrant-arc quadrant-val-${effectiveUst}`}
        />

        {/* Doğu (Sağ) Kadran - Rezerv */}
        {gostergeSag > 0 && (
          <path
            d={arcSag}
            fill="none"
            strokeWidth={strokeWidth}
            className={`quadrant-arc quadrant-val-${gostergeSag}`}
          />
        )}

        {/* Güney (Alt) Kadran - Taksit Durumu & Fırsat Gradyanı */}
        {gostergeAlt > 0 && (
          <path
            d={arcAlt}
            fill="none"
            strokeWidth={strokeWidth}
            className={`quadrant-arc quadrant-val-${gostergeAlt}`}
          />
        )}

        {/* Batı (Sol) Kadran - Rezerv */}
        {gostergeSol > 0 && (
          <path
            d={arcSol}
            fill="none"
            strokeWidth={strokeWidth}
            className={`quadrant-arc quadrant-val-${gostergeSol}`}
          />
        )}
      </svg>

      {/* Avatar İç Gövdesi (Resim yoksa varsayılan ikon tam ortalanır) */}
      <div className={finalClass}>
        {hasValidImage ? (
          <img
            src={imageUrl!}
            alt={title || ''}
            className="avatar-img"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="avatar-default-icon-wrapper">
            {isKurumsal ? <Building size={centerIconSize} /> : <User size={centerIconSize} />}
          </div>
        )}

        {/* Yalnızca resim varsa sağ alttaki küçük rozet gösterilir */}
        {showBadge && hasValidImage && (
          <div className={`avatar-badge-icon ${isKurumsal ? 'text-accent-primary' : 'text-info'}`}>
            {isKurumsal ? <Building size={badgeIconSize} /> : <User size={badgeIconSize} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default CariAvatar;
