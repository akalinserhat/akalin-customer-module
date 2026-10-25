/**
 * Webakus ERP - Cari Kartı Strateji Fabrikası (CariStrategyFactory.ts)
 * 
 * Başlıca Sorumlulukları:
 * - Cari Tipi (Kurumsal = 1, Bireysel = 2) ve Cari Türü (Alıcı = 1, Satıcı = 2, Alıcı & Satıcı = 3, Personel = 4)
 *   parametrelerini değerlendirerek uygun Form Stratejisi nesnesini döndürür.
 */

import KurumsalCariStrategy from './KurumsalCariStrategy';
import BireyselCariStrategy from './BireyselCariStrategy';
import PersonelCariStrategy from './PersonelCariStrategy';

export default class CariStrategyFactory {
  /**
   * Cari Tipi ve Cari Türü'ne göre uygun form stratejisini döner.
   * @param tipi 1: Kurumsal, 2: Bireysel
   * @param tur 1: Alıcı, 2: Satıcı, 3: Alıcı & Satıcı, 4: Personel
   */
  static getStrategy(tipi: number | string = 1, tur: number | string = 1) {
    const numTur = parseInt(String(tur), 10) || 1;
    const numTipi = parseInt(String(tipi), 10) || 1;

    // Personel her zaman Bireysel/Personel stratejisini kullanır
    if (numTur === 4) {
      return new PersonelCariStrategy();
    }

    if (numTipi === 2) {
      return new BireyselCariStrategy(numTur);
    }

    return new KurumsalCariStrategy(numTur);
  }
}
