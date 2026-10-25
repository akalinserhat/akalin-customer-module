/**
 * Webakus ERP - Cari Hesap Kartı Formu (CariForm.tsx)
 * 
 * Başlıca Sorumlulukları:
 * - Cari kartlarının (Müşteri, Tedarikçi, Alıcı & Satıcı, Personel) oluşturulması ve düzenlenmesini yönetir.
 * - Cari Türü ve Tipi'ni (Kurumsal/Bireysel -> Alıcı/Satıcı/Personel) TreeView açılır seçici (CariTuruSeciciInput)
 *   ile yöneterek form şemasını ve alanlarını Strategy Pattern (CariStrategyFactory) üzerinden dinamik olarak özelleştirir.
 * - Personel seçildiğinde kurumsal alanları gizleyip TCKN, ad, soyad ve personele özel alanları devreye sokar.
 * - Merkezi Adres Mimarisi (GenelAdres) ile tam entegre çalışır.
 */

// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { validateCariField, validateCariForm } from '../validators/cariFormValidation';
import httpClient from '../services/httpClient';
import { cariService } from '../services/CariService';
import { Building, User, Shield, MapPin, Plus, CheckCircle2, Trash2, Pencil, CreditCard, Package, Layers } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { BaseCardPage, CariTuruSeciciInput, TabLayout, CardList, AdresCard, EkleFloatCircleButton, formatAdres } from '@akalin/ui';
import DynamicFormRenderer, { getIcon } from '../forms/DynamicFormRenderer';
import CariStrategyFactory from './cariStrategies/CariStrategyFactory';
import CariAdresForm from './CariAdresForm';
import CariAvatarUploader from './CariAvatarUploader';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { getCariFormDefaultValues } from '../defaults/cariFormDefaultValue';

export interface ICariAdres {
  id?: number | string;
  adresTipi?: number;
  [key: string]: any;
}

export interface ICariYetkili {
  id?: number | string;
  [key: string]: any;
}

export interface ICari {
  id?: number | string;
  kod: string;
  tipi: number; // 1: Kurumsal, 2: Bireysel
  tur: number; // 1: Alici, 2: Satici, 3: AliciSatici, 4: Personel, 5: Ortak, 99: Diger
  unvan: string;
  ad: string;
  soyad: string;
  tcKimlikNo: string;
  vergiDairesi: string;
  vergiNo: string;
  email: string;
  telefon: string;
  webSitesi: string;
  paraBirimi: string;
  vadeGun: string | number;
  riskLimiti: number;
  etiketler: string;
  adresler: ICariAdres[];
  yetkililer: ICariYetkili[];
  /** Cari profil görseli veya şirket logosu (Bulut depolama URL'si) */
  profilResmiUrl?: string | null;
  /** Akıllı Kadran Üst (Kuzey Yayı): 0-10 (Son Alışveriş Tazeliği; 1: Çok Yeni ... 9: Eski Cari, 0: Kapalı) */
  gostergeUst?: number;
  /** Akıllı Kadran Alt (Güney Yayı): 0-10 (Taksit Durumu & Fırsat; 10: Taksiti Bitmiş Satış Fırsatı Gradyanı, 0: Kapalı) */
  gostergeAlt?: number;
  /** Akıllı Kadran Sol (Batı Yayı): 0-10 (Rezerv Alan; İleride eklenecek kurallar için) */
  gostergeSol?: number;
  /** Akıllı Kadran Sağ (Doğu Yayı): 0-10 (Rezerv Alan; İleride eklenecek kurallar için) */
  gostergeSag?: number;
  tarih: string;
  [key: string]: any;
}

export interface CariFormProps {
  initialData?: ICari;
  onSuccess?: (id?: number | string) => void;
  onCancel?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  onTitleChange?: (title: string) => void;
}

const CariForm: React.FC<CariFormProps> = ({ initialData, onSuccess, onCancel, onDirtyChange, onTitleChange }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isAdresRoute = location.pathname.endsWith('/adres');
  const hasRestoredStateRef = useRef(false);

  const cariConfig = user?.cariTuruYapilandirmaJson ?? user?.CariTuruYapilandirmaJson ?? user?.cariTuruYapilandirma ?? user?.CariTuruYapilandirma ?? null;

  // Sektörel konfigürasyondan ve sıralama türünden varsayılan başlangıç değerlerini türet
  const defaultValues = React.useMemo(() => {
    return getCariFormDefaultValues({ cariConfig, initialData });
  }, [initialData, cariConfig]);

  const targetCariId = initialData?.id ?? initialData?.Id;

  const [formData, setFormData] = useState(() => {
    if (location.state?.currentFormData) {
      const stateFormData = location.state.currentFormData;
      const stateId = stateFormData?.id ?? stateFormData?.Id;
      if ((!targetCariId && !stateId) || (targetCariId && String(targetCariId) === String(stateId))) {
        hasRestoredStateRef.current = true;
        return stateFormData;
      }
    }
    try {
      const draft = sessionStorage.getItem('webakus_cari_form_draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        const draftId = parsed?.id ?? parsed?.Id;
        if ((!targetCariId && !draftId) || (targetCariId && String(targetCariId) === String(draftId))) {
          hasRestoredStateRef.current = true;
          return parsed;
        } else {
          sessionStorage.removeItem('webakus_cari_form_draft');
        }
      }
    } catch (e) {}
    return getCariFormDefaultValues({ cariConfig, initialData });
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeAdresTipi, setActiveAdresTipi] = useState(2); // 2: Nakliye, 1: Fatura
  const [ayar, setAyar] = useState(null);

  const cariId = initialData?.id ?? initialData?.Id ?? formData?.id ?? formData?.Id;
  const isEditMode = Boolean(cariId);
  const cariRecordTitle = formData.unvan || [formData.ad, formData.soyad].filter(Boolean).join(' ') || (isEditMode ? t('Cari Düzenle') : t('Yeni Cari'));

  // Stratejiyi hem tipi hem tur değerine göre dinamik türet
  const strategy = CariStrategyFactory.getStrategy(formData.tipi, formData.tur);
  const rawTabs = strategy.getTabs();
  const [activeTabId, setActiveTabId] = useState(() => {
    const requested = location.state?.activeTabId;
    if (requested && rawTabs.some(t => t.id === requested)) {
      return requested;
    }
    if (requested === 'adresler' && rawTabs.some(t => t.id === 'iletisim')) {
      return 'iletisim';
    }
    return rawTabs[0]?.id;
  });

  // location.state değiştiğinde form ve sekme durumunu senkronize et
  useEffect(() => {
    if (location.state?.activeTabId) {
      const requested = location.state.activeTabId;
      if (rawTabs.some(t => t.id === requested)) {
        setActiveTabId(requested);
      } else if (requested === 'adresler' && rawTabs.some(t => t.id === 'iletisim')) {
        setActiveTabId('iletisim');
      }
    }
    if (location.state?.activeAdresTipi) {
      setActiveAdresTipi(location.state.activeAdresTipi);
    }
    if (location.state?.currentFormData) {
      const stateFormData = location.state.currentFormData;
      const stateId = stateFormData?.id ?? stateFormData?.Id;
      const rawId = initialData?.id ?? initialData?.Id;
      if ((!rawId && !stateId) || (rawId && String(rawId) === String(stateId))) {
        setFormData(stateFormData);
        hasRestoredStateRef.current = true;
      }
    }
  }, [location.state, rawTabs, initialData]);

  // Tipi veya Tür değiştiğinde veya geçersiz sekme durumunda sekmelerin geçerliliğini koru
  useEffect(() => {
    if (rawTabs.length > 0 && !rawTabs.some(t => t.id === activeTabId)) {
      if (activeTabId === 'adresler' && rawTabs.some(t => t.id === 'iletisim')) {
        setActiveTabId('iletisim');
      } else {
        setActiveTabId(rawTabs[0].id);
      }
    }
  }, [rawTabs, activeTabId]);

  // Cari Ayarlarını Yükle
  useEffect(() => {
    const fetchAyarlar = async () => {
      try {
        const res = await httpClient.get('/api/CariAyarlar');
        if (res.data && res.data.ayar) {
          setAyar(res.data.ayar);
        }
      } catch (err) {
        console.error('Ayarlar yüklenemedi:', err);
      }
    };
    fetchAyarlar();
  }, []);

  // initialData veya varsayılan değerler yüklendiğinde state'i güncelle (eğer restore edilmediyse veya farklı kayıt geldiyse)
  useEffect(() => {
    if (!initialData) return;
    const rawId = initialData?.id ?? initialData?.Id;

    if (hasRestoredStateRef.current) {
      const currentFormId = formData?.id ?? formData?.Id;
      if ((!rawId && !currentFormId) || (rawId && String(rawId) === String(currentFormId))) {
        return;
      }
      hasRestoredStateRef.current = false;
    }

    if (rawId) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        id: rawId,
        tipi: initialData.tipi || 1,
        tur: initialData.tur || 1,
        vadeGun: initialData.vadeGun || '',
        tarih: initialData.tarih ? initialData.tarih.split('T')[0] : '',
        dogumTarihi: initialData.dogumTarihi ? initialData.dogumTarihi.split('T')[0] : '',
        profilResmiUrl: initialData.profilResmiUrl || null,
        gostergeUst: initialData.gostergeUst ?? 0,
        gostergeAlt: initialData.gostergeAlt ?? 0,
        gostergeSol: initialData.gostergeSol ?? 0,
        gostergeSag: initialData.gostergeSag ?? 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        tipi: initialData?.tipi || defaultValues.tipi,
        tur: initialData?.tur || defaultValues.tur,
        kod: prev.kod || '????',
        profilResmiUrl: initialData?.profilResmiUrl || null,
        gostergeUst: initialData?.gostergeUst ?? defaultValues.gostergeUst ?? 0,
        gostergeAlt: initialData?.gostergeAlt ?? defaultValues.gostergeAlt ?? 0,
        gostergeSol: initialData?.gostergeSol ?? defaultValues.gostergeSol ?? 0,
        gostergeSag: initialData?.gostergeSag ?? defaultValues.gostergeSag ?? 0
      }));
    }
  }, [initialData, defaultValues]);

  // Alt adres sayfasına yönlendirme (URL Senkronizasyonu & State Koruma)
  const handleOpenAdresSubPage = (index?: number | null, adresData?: any, forcedTip?: number) => {
    const currentCariId = initialData?.id ?? initialData?.Id ?? formData?.id ?? formData?.Id;
    const currentIsEdit = Boolean(currentCariId);
    const currentBasePath = currentIsEdit ? `/cariler/${currentCariId}` : '/cariler/yeni';
    const tipToUse = forcedTip || (adresData?.tipi === 3 ? (activeAdresTipi || 2) : (adresData?.tipi || activeAdresTipi || 2));

    let targetUrl = `${currentBasePath}/adres?tip=${tipToUse}`;
    if (index !== null && index !== undefined) {
      targetUrl += `&index=${index}`;
    }

    const currentTabToPreserve = activeTabId || 'iletisim';

    try {
      sessionStorage.setItem('webakus_cari_form_draft', JSON.stringify(formData));
    } catch (e) {}

    navigate(targetUrl, {
      state: {
        currentFormData: formData,
        activeTabId: currentTabToPreserve,
        activeAdresTipi: activeAdresTipi,
        adresIndex: index ?? null,
        adresData: adresData ?? null,
        tip: tipToUse
      }
    });
  };

  // Bireysel/Personel için Ünvan / Kart Başlığını Otomatik Hesapla
  useEffect(() => {
    const isPersonel = parseInt(formData.tur, 10) === 4;
    const isBireysel = parseInt(formData.tipi, 10) === 2 || isPersonel;

    if (isBireysel) {
      const a = (formData.ad || '').trim();
      const o = (formData.ortaIsim || '').trim();
      const s = (formData.soyad || '').trim();
      
      const isimPart = o ? `${a} ${o}` : a;
      let newUnvan = '';

      if (isPersonel) {
        newUnvan = isimPart ? `${isimPart} ${s}` : s;
      } else if (a || s) {
        switch (ayar?.bireyselUnvanSablonu || 2) {
          case 1:
            newUnvan = isimPart ? `${isimPart} ${s}` : s;
            break;
          case 2:
            newUnvan = isimPart ? `${s}, ${isimPart}` : s;
            break;
          case 3:
            newUnvan = isimPart ? `${s} ${isimPart}` : s;
            break;
          case 4:
            newUnvan = `${a} ${s}`;
            break;
          default:
            newUnvan = isimPart ? `${s}, ${isimPart}` : s;
            break;
        }
      }
      
      newUnvan = newUnvan.trim();
      if (newUnvan.endsWith(",")) newUnvan = newUnvan.slice(0, -1).trim();
      if (newUnvan.startsWith(",")) newUnvan = newUnvan.slice(1).trim();
      
      if (newUnvan && formData.unvan !== newUnvan) {
        setFormData(prev => ({ ...prev, unvan: newUnvan }));
      }
      
      if (onTitleChange) {
        const resolvedTitle = newUnvan || formData.unvan || (isEditMode ? cariRecordTitle : t('Yeni Cari'));
        onTitleChange(resolvedTitle);
      }
    } else {
      if (onTitleChange) {
        const resolvedTitle = formData.unvan || (isEditMode ? cariRecordTitle : t('Yeni Cari'));
        onTitleChange(resolvedTitle);
      }
    }
  }, [formData.ad, formData.ortaIsim, formData.soyad, formData.unvan, formData.tipi, formData.tur, ayar, onTitleChange, isEditMode, cariRecordTitle, t]);

  const validateField = (name, value) => validateCariField(name, value, formData, t);

  const handleBlur = (name, value) => {
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (name, value) => {
    if (name === 'turAndTipi') {
      const nextTipi = value?.tipi || 1;
      const nextTur = value?.tur || 1;

      setFormData(prev => ({
        ...prev,
        tipi: nextTipi,
        tur: nextTur
      }));

      if (errors.tur) {
        setErrors(prev => ({ ...prev, tur: null }));
      }

      if (onDirtyChange) onDirtyChange(true);
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
    
    if (onDirtyChange) onDirtyChange(true);
  };

  const handleSubmit = async (e) => {
    try {
      if (e && e.preventDefault) e.preventDefault();

      // Form Stratejisine Göre Zorunlu Alan Kontrolü
      const currentStrategy = CariStrategyFactory.getStrategy(formData.tipi, formData.tur);
      const tabs = currentStrategy.getTabs();
      let hasError = false;
      let newErrors = {};

      for (const tab of tabs) {
        const fields = currentStrategy.getFields(tab.id) || [];
        for (const field of fields) {
          if (field.type === 'row') {
             for (const sub of field.fields) {
                 if (sub.required && (!formData[sub.name] || formData[sub.name].toString().trim() === '')) {
                     newErrors[sub.name] = t('Bu alan zorunludur');
                     hasError = true;
                 }
             }
          } else if (field.required && (!formData[field.name] || formData[field.name].toString().trim() === '')) {
              newErrors[field.name] = t('Bu alan zorunludur');
              hasError = true;
          }
        }
      }

      // Genel ve Algoritmik Validasyon Kontrolleri
      const formValidation = validateCariForm(formData, t);
      if (!formValidation.isValid) {
          newErrors = { ...newErrors, ...formValidation.errors };
          hasError = true;
      }

      if (hasError) {
        setErrors(prev => ({ ...prev, ...newErrors }));
        toast.error(t('Lütfen zorunlu alanları eksiksiz doldurunuz.'));
        return;
      }

      setLoading(true);

      const isPersonel = parseInt(formData.tur, 10) === 4;
      const finalTipi = isPersonel ? 2 : parseInt(formData.tipi, 10);

      const payload = {
        ...formData,
        tipi: finalTipi,
        tur: parseInt(formData.tur, 10),
        riskLimiti: isPersonel || parseInt(formData.tur, 10) === 2 ? 0 : (parseFloat(formData.riskLimiti) || 0),
        vadeGun: formData.vadeGun ? parseInt(formData.vadeGun, 10) : null,
        tarih: formData.tarih ? formData.tarih : null,
        dogumTarihi: formData.dogumTarihi ? formData.dogumTarihi : null,
        profilResmiUrl: formData.profilResmiUrl || null,
        gostergeUst: parseInt(formData.gostergeUst, 10) || 0,
        gostergeAlt: parseInt(formData.gostergeAlt, 10) || 0,
        gostergeSol: parseInt(formData.gostergeSol, 10) || 0,
        gostergeSag: parseInt(formData.gostergeSag, 10) || 0,
        adresler: (formData.adresler || []).map(a => ({
          adresid: a.adresId || a.id,
          baslik: a.baslik,
          tipi: a.tipi,
          varsayilanMi: a.varsayilanMi || false,
          ilId: a.adresIds?.adresIlId || a.ilId,
          ilAdi: a.adresIl || a.ilAdi,
          ilceId: a.adresIds?.adresIlceId || a.ilceId,
          ilceAdi: a.adresIlce || a.ilceAdi,
          koyId: a.adresIds?.adresKoyId || a.koyId,
          koyAdi: a.koyAdi,
          mahalleId: a.adresIds?.adresMahalleId || a.mahalleId,
          mahalleAdi: a.mahalleAdi,
          caddeSokakId: a.adresIds?.adresCaddeSokakId || a.caddeSokakId,
          caddeSokakAdi: a.caddeSokakAdi,
          disKapiId: a.adresIds?.adresDisKapiId || a.disKapiId,
          disKapiAdi: a.disKapiAdi,
          icKapiId: a.adresIds?.adresIcKapiId || a.icKapiId,
          icKapiAdi: a.icKapiAdi,
          acikAdres: a.formattedAdres || a.acikAdres,
          isimSoyisim: a.isimSoyisim,
          telefon: a.telefon,
          isAdresiMi: a.isAdresiMi || false,
          kurumsalFaturaMi: a.kurumsalFaturaMi || false,
          firmaAdi: a.firmaAdi,
          vergiDairesi: a.vergiDairesi,
          vergiNo: a.vergiNo
        }))
      };

      let resultId;
      const targetId = initialData?.id ?? initialData?.Id ?? formData?.id ?? formData?.Id;
      if (targetId) {
        const result = await cariService.update(targetId, payload);
        resultId = result?.id ?? targetId;
        toast.success(t('Cari başarıyla güncellendi.'));
      } else {
        const result = await cariService.create(payload);
        resultId = result?.id;
        toast.success(t('Cari başarıyla eklendi.'));
      }

      try {
        sessionStorage.removeItem('webakus_cari_form_draft');
      } catch (e) {}

      if (onSuccess) onSuccess(resultId);
    } catch (err) {
      if (err.response) {
        toast.error(err.response?.data?.message || t('Cari kaydedilirken bir hata oluştu.'));
      } else {
        console.error("Form gönderme hatası:", err);
        toast.error(t('Beklenmeyen bir hata oluştu: ') + (err.message || t('Bilinmiyor')));
      }
    } finally {
      setLoading(false);
    }
  };

  const renderCustomField = (field, data, onFieldChange) => {
    // Cari Türü ve Tipi TreeView Seçici
    if (field.name === 'tur') {
      return (
        <div className="form-group flex-1 flex-col relative" style={{ gridColumn: field.gridColumn }} key={field.name}>
          <label>{typeof field.label === 'string' ? t(field.label) : field.label} {field.required && <span className="text-danger">*</span>}</label>
          <CariTuruSeciciInput 
            id={field.id}
            tipi={formData.tipi}
            tur={formData.tur}
            config={cariConfig}
            onChange={(selected) => {
              handleChange('turAndTipi', selected);
            }}
          />
          {errors[field.name] && <div className="error-text text-12 text-danger mt-4">{typeof errors[field.name] === 'string' ? t(errors[field.name]) : errors[field.name]}</div>}
        </div>
      );
    }

    // Merkezi Adres Seçici
    if (field.name === 'adresSecici') {
      return (
        <div className="form-group form-group-fill-height relative" style={{ gridColumn: field.gridColumn }} key={field.name}>
          {(() => {
            const renderCompactGrid = (tipi: number, color: string, bg: string) => {
              const tipAdresler = (formData.adresler || []).filter(a => a.tipi === tipi || a.tipi === 3);

              return (
                <CardList<ICariAdres>
                  items={tipAdresler}
                  minCardWidth="280px"
                  gap={16}
                  className="flex-1 h-full"
                  emptyIcon={<MapPin size={28} className="text-secondary opacity-50" />}
                  emptyMessage={t('auto_bu_kategori_icin_hen_a76c', 'Bu kategori için henüz kayıtlı adres bulunmuyor.')}
                  renderCard={(adres) => {
                    const originalIdx = formData.adresler.findIndex(a => a === adres);
                    return (
                      <AdresCard
                        key={originalIdx}
                        adres={adres}
                        accentColor={color}
                        activeBackground={bg}
                        onEdit={() => {
                          handleOpenAdresSubPage(originalIdx, adres, adres.tipi === 3 ? tipi : adres.tipi);
                        }}
                        onDelete={() => {
                          const newAdresler = formData.adresler.filter((_, i) => i !== originalIdx);
                          if (adres.varsayilanMi) {
                            const sameTypeIndex = newAdresler.findIndex(a => a.tipi === adres.tipi || (adres.tipi === 3 && (a.tipi === 1 || a.tipi === 2 || a.tipi === 3)));
                            if (sameTypeIndex !== -1) newAdresler[sameTypeIndex].varsayilanMi = true;
                          }
                          handleChange('adresler', newAdresler);
                        }}
                        onSetDefault={() => {
                          const newAdresler = formData.adresler.map((a, i) => ({
                            ...a,
                            varsayilanMi: (a.tipi === adres.tipi || a.tipi === 3 || adres.tipi === 3) ? (i === originalIdx) : a.varsayilanMi
                          }));
                          handleChange('adresler', newAdresler);
                        }}
                      />
                    );
                  }}
                />
              );
            };

            const isPersonel = parseInt(formData.tur, 10) === 4;
            const sevkAdresSayisi = (formData.adresler || []).filter(a => a.tipi === 2 || a.tipi === 3).length;
            const faturaAdresSayisi = (formData.adresler || []).filter(a => a.tipi === 1 || a.tipi === 3).length;

            const adresTabs = [
              {
                id: 2,
                label: `${isPersonel ? t('İkametgah Adresi') : t('Nakliye / Sevk Adresleri')} (${sevkAdresSayisi})`,
                icon: <Package size={18} />,
                content: renderCompactGrid(2, '#059669', '#d1fae5')
              }
            ];

            if (!isPersonel) {
              adresTabs.push({
                id: 1,
                label: `${t('Fatura Adresleri')} (${faturaAdresSayisi})`,
                icon: <CreditCard size={18} />,
                content: renderCompactGrid(1, '#d97706', '#fef3c7')
              });
            }

            return (
              <div className="form-tab-container-card relative">
                <TabLayout
                  tabs={adresTabs}
                  activeId={activeAdresTipi}
                  onChange={(id) => setActiveAdresTipi(Number(id))}
                  variant="secondary"
                  className="flex-1 flex-col h-full"
                />
                <EkleFloatCircleButton
                  onClick={() => {
                    handleOpenAdresSubPage(null, null, activeAdresTipi);
                  }}
                  position="absolute-bottom-right"
                  title={t('Yeni Adres Ekle')}
                  useShadow={true}
                />
              </div>
            );
          })()}
        </div>
      );
    }
    return null;
  };

  const tabs: any[] = rawTabs.map(tTab => {
    const rawLabel = tTab.name || tTab.label || tTab.title;
    return {
      ...tTab,
      label: typeof rawLabel === 'string' ? t(rawLabel) : rawLabel,
      icon: typeof tTab.icon === 'string' ? getIcon(tTab.icon, { size: 18 }) : tTab.icon,
      content: (
        <DynamicFormRenderer 
          strategy={strategy} 
          formData={formData} 
          onChange={handleChange}
          onBlur={handleBlur}
          errors={errors}
          renderCustomField={renderCustomField}
          hideTabs={true}
          activeTabId={tTab.id}
        />
      )
    };
  });

  if (isEditMode) {
    tabs.push({
      id: 'hareketler',
      label: t('Hareketler'),
      icon: <Layers size={18} />,
      content: (
        <div className="flex-1 flex flex-col p-24">
          <div className="text-14 text-secondary mb-16">{t('Bu cariye ait son hareketler burada listelenecektir.')}</div>
        </div>
      )
    });
  }

  if (isAdresRoute) {
    const currentCariId = initialData?.id ?? initialData?.Id ?? formData?.id ?? formData?.Id;
    const currentIsEdit = Boolean(currentCariId);
    const currentBasePath = currentIsEdit ? `/cariler/${currentCariId}` : '/cariler/yeni';

    const tipParam = searchParams.get('tip');
    const indexParam = searchParams.get('index');
    const resolvedTip = tipParam ? parseInt(tipParam, 10) : (location.state?.tip || activeAdresTipi || 2);
    const resolvedIndex = (indexParam !== null && indexParam !== undefined && indexParam !== '')
      ? parseInt(indexParam, 10)
      : (location.state?.adresIndex ?? null);

    const existingAdres = (resolvedIndex !== null && formData.adresler?.[resolvedIndex])
      ? formData.adresler[resolvedIndex]
      : (location.state?.adresData || null);

    const defaultAddressData = existingAdres || {
      isimSoyisim: (formData.tipi === 2 || parseInt(formData.tur, 10) === 4)
        ? [formData.ad, formData.ortaIsim, formData.soyad].filter(Boolean).join(' ')
        : formData.unvan || '',
      telefon: formData.telefon || ''
    };

    const returnToForm = (updatedData?: typeof formData) => {
      const dataToUse = updatedData || formData;
      const targetTab = (location.state?.activeTabId && location.state.activeTabId !== 'adresler')
        ? location.state.activeTabId
        : (activeTabId && activeTabId !== 'adresler' ? activeTabId : 'iletisim');
      const targetAdresTipi = resolvedTip || location.state?.activeAdresTipi || activeAdresTipi || 2;

      try {
        sessionStorage.setItem('webakus_cari_form_draft', JSON.stringify(dataToUse));
      } catch (e) {}
      navigate(currentBasePath, {
        state: {
          currentFormData: dataToUse,
          activeTabId: targetTab,
          activeAdresTipi: targetAdresTipi
        }
      });
    };

    return (
      <CariAdresForm
        isOpen={true}
        onClose={() => returnToForm()}
        tip={resolvedTip}
        cariUnvan={formData.unvan || [formData.ad, formData.ortaIsim, formData.soyad].filter(Boolean).join(' ') || (currentIsEdit ? t('Cari Düzenle') : t('Yeni Cari'))}
        defaultData={defaultAddressData}
        onSave={(data) => {
          const typeToUse = resolvedTip || 1;
          const isFirstOfType = !(formData.adresler || []).some(a => a.tipi === typeToUse);
          const newAdres = {
            ...data,
            adresId: null, // Yeni eklenen adres için ID null olmalıdır
            tipi: typeToUse,
            varsayilanMi: isFirstOfType,
            formattedAdres: data.formattedAdres
          };

          let newAdresler: ICariAdres[];
          if (resolvedIndex !== null && formData.adresler?.[resolvedIndex]) {
            newAdresler = [...(formData.adresler || [])];
            newAdres.adresId = newAdresler[resolvedIndex].adresId || newAdresler[resolvedIndex].id;
            newAdresler[resolvedIndex] = newAdres;
          } else {
            newAdresler = [...(formData.adresler || []), newAdres];
          }

          const updatedFormData = {
            ...formData,
            adresler: newAdresler
          };

          setFormData(updatedFormData);
          hasRestoredStateRef.current = true;
          returnToForm(updatedFormData);
        }}
      />
    );
  }

  return (
    <BaseCardPage
      id="redesignForm"
      onSubmit={handleSubmit}
      icon={
        <CariAvatarUploader
          title={formData.unvan || [formData.ad, formData.soyad].filter(Boolean).join(' ') || (isEditMode ? t('Cari Düzenle') : t('Yeni Cari'))}
          tipi={formData.tipi}
          imageUrl={formData.profilResmiUrl}
          seed={formData.id || formData.kod}
          gostergeUst={Number(formData.gostergeUst) || 0}
          gostergeAlt={Number(formData.gostergeAlt) || 0}
          gostergeSol={Number(formData.gostergeSol) || 0}
          gostergeSag={Number(formData.gostergeSag) || 0}
          tarih={formData.tarih}
          size="lg"
          onChange={(newUrl) => handleChange('profilResmiUrl', newUrl)}
        />
      }
      title={isEditMode ? cariRecordTitle : t('Yeni Cari')}
      subtitleLeft={isEditMode ? ((formData.kod || initialData?.kod) ? `${t('Cari Kodu')}: ${formData.kod || initialData?.kod}` : undefined) : t('Yeni cari kartı detaylarını yapılandırın.')}
      isSaving={loading}
      onSave={handleSubmit}
      onClose={onCancel}
      tabs={tabs}
      activeTabId={activeTabId}
      onTabChange={setActiveTabId}
    />
  );
};

export default CariForm;
