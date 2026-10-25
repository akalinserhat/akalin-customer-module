import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Type, Info } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BaseCardPage, IModuleSettingsProps } from '@akalin/ui';

export interface ICariModulAyarlari {
  kokSiralama?: 'kurumsal_once' | 'bireysel_once';
  bireyselUnvanSablonu?: number;
  [key: string]: any;
}

export interface CariModulAyarlariProps extends Partial<IModuleSettingsProps<ICariModulAyarlari>> {}

export const CariModulAyarlari: React.FC<CariModulAyarlariProps> = ({
  value,
  onChange,
  onSave,
  onClose,
  isSaving = false,
  readOnly = false
}) => {
  const { t } = useTranslation();
  
  // Controlled vs Standalone modu
  const isControlled = typeof onChange === 'function';

  const [localValue, setLocalValue] = useState<ICariModulAyarlari>({
    kokSiralama: 'kurumsal_once',
    bireyselUnvanSablonu: 2
  });
  const [localSaving, setLocalSaving] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (isControlled) return;

    let isMounted = true;
    axios.get('/api/CariAyarlar/yapilandirma')
      .then(res => {
        if (isMounted && res.data) {
          setLocalValue({
            kokSiralama: res.data.kokSiralama || 'kurumsal_once',
            bireyselUnvanSablonu: res.data.bireyselUnvanSablonu !== undefined ? Number(res.data.bireyselUnvanSablonu) : 2
          });
          setIsLocked(!!res.data.isLocked);
        }
      })
      .catch(err => {
        console.error('Cari ayarları yüklenemedi:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [isControlled]);

  const activeValue = isControlled ? (value || {}) : localValue;
  const currentSiralama = activeValue?.kokSiralama || 'kurumsal_once';
  const currentUnvanSablonu = activeValue?.bireyselUnvanSablonu !== undefined ? Number(activeValue.bireyselUnvanSablonu) : 2;

  const handleSiralamaChange = (siralama: 'kurumsal_once' | 'bireysel_once') => {
    if (readOnly) return;
    if (isControlled && onChange) {
      onChange({
        ...(value || {}),
        kokSiralama: siralama
      });
    } else {
      setLocalValue(prev => ({
        ...prev,
        kokSiralama: siralama
      }));
    }
  };

  const handleUnvanSablonuChange = (sablonId: number) => {
    if (readOnly) return;
    if (isControlled && onChange) {
      onChange({
        ...(value || {}),
        bireyselUnvanSablonu: sablonId
      });
    } else {
      setLocalValue(prev => ({
        ...prev,
        bireyselUnvanSablonu: sablonId
      }));
    }
  };

  const handleSave = async (e?: any) => {
    if (onSave) {
      return onSave(e);
    }

    try {
      setLocalSaving(true);
      await axios.put('/api/CariAyarlar/yapilandirma', {
        kokSiralama: activeValue.kokSiralama || 'kurumsal_once',
        bireyselUnvanSablonu: activeValue.bireyselUnvanSablonu !== undefined ? Number(activeValue.bireyselUnvanSablonu) : 2
      });
      toast.success(t('cari_modul_ayarlari_kaydedildi', 'Cari modülü ayarları başarıyla kaydedildi.'));
    } catch (err: any) {
      console.error('Cari ayarları kaydedilemedi:', err);
      const errorMsg = err?.response?.data?.mesaj || t('hata_olustu', 'İşlem sırasında bir hata oluştu.');
      toast.error(errorMsg);
    } finally {
      setLocalSaving(false);
    }
  };

  const unvanSablonlari = [
    { id: 1, label: t('unvan_sablon_1', '[İsim] [Orta İsim] [Soyisim] (Örn: Ahmet Can Yılmaz)') },
    { id: 2, label: t('unvan_sablon_2', '[Soyisim], [İsim] [Orta İsim] (Örn: Yılmaz, Ahmet Can)') },
    { id: 3, label: t('unvan_sablon_3', '[Soyisim] [İsim] [Orta İsim] (Örn: Yılmaz Ahmet Can)') },
    { id: 4, label: t('unvan_sablon_4', '[İsim] [Soyisim] (Örn: Ahmet Yılmaz)') }
  ];

  return (
    <BaseCardPage
      id="cariModulAyarlariPage"
      title={t('cari_modul_ayarlari_baslik', 'Cari Modülü Ayarları')}
      subtitleLeft={t('cari_modul_ayarlari_aciklama', 'Cari hesap yönetiminde geçerli olacak sektörel iş kurallarını yapılandırın.')}
      icon={<Users size={20} />}
      asForm={false}
      onSave={handleSave}
      isSaving={isSaving || localSaving}
      showBackButton={!!onClose}
      onClose={onClose}
    >
      <div className="flex flex-col gap-16 p-24">
        {isLocked && !isControlled && (
          <div className="card-info-box flex items-center gap-12 p-12 rounded-8">
            <Info size={18} className="text-info shrink-0" />
            <span className="text-13 text-secondary">
              {t('cari_ayarlari_kilitli_bilgi', 'Sistemde kayıtlı cari kartlar bulunmaktadır. Ünvan şablonunu değiştirdiğinizde tüm bireysel carilerin ünvanları otomatik olarak güncellenecektir.')}
            </span>
          </div>
        )}

        {/* AYAR KARTI: CARİ TÜRÜ SIRALAMASI */}
        <div className="faaliyet-setting-section">
          <div className="faaliyet-setting-section-header">
            <div className="faaliyet-setting-section-header-left">
              <div className="faaliyet-setting-section-icon">
                <Users size={20} />
              </div>
              <div>
                <h5 className="faaliyet-setting-section-title">
                  {t('cari_turu_siralama_baslik', 'Cari Türü Sıralaması')}
                </h5>
                <p className="faaliyet-setting-section-desc">
                  {t('cari_turu_siralama_aciklama', 'Cari hesap kartı açılırken ağaç seçici hiyerarşisinde hangi türün öncelikli geleceğini belirler.')}
                </p>
              </div>
            </div>

            <div className="faaliyet-setting-action-wrapper">
              <select
                id="cariTuruSiralamaSelect"
                className="form-input faaliyet-setting-select"
                value={currentSiralama}
                onChange={(e) => handleSiralamaChange(e.target.value as 'kurumsal_once' | 'bireysel_once')}
                disabled={readOnly}
              >
                <option value="kurumsal_once">{t('once_kurumsal', 'Önce Kurumsal')}</option>
                <option value="bireysel_once">{t('once_bireysel', 'Önce Bireysel')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* AYAR KARTI: BİREYSEL CARİ ÜNVAN GÖRÜNÜMÜ */}
        <div className="faaliyet-setting-section">
          <div className="faaliyet-setting-section-header">
            <div className="faaliyet-setting-section-header-left">
              <div className="faaliyet-setting-section-icon">
                <Type size={20} />
              </div>
              <div>
                <h5 className="faaliyet-setting-section-title">
                  {t('cari_unvan_gorunumu_baslik', 'Bireysel Cari Ünvan Görünümü')}
                </h5>
                <p className="faaliyet-setting-section-desc">
                  {t('cari_unvan_gorunumu_aciklama', 'Bireysel cari kayıtlarında Ad, Orta İsim ve Soyad bilgilerinin Ünvan alanında nasıl birleştirileceğini belirler.')}
                </p>
              </div>
            </div>

            <div className="faaliyet-setting-action-wrapper">
              <select
                id="bireyselUnvanSablonuSelect"
                className="form-input faaliyet-setting-select"
                value={currentUnvanSablonu}
                onChange={(e) => handleUnvanSablonuChange(Number(e.target.value))}
                disabled={readOnly}
              >
                {unvanSablonlari.map(sablon => (
                  <option key={sablon.id} value={sablon.id}>
                    {sablon.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </BaseCardPage>
  );
};

export default CariModulAyarlari;
