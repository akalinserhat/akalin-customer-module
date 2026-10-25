// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, User, FileText, Building } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { BaseCardPage, BaseInput, PhoneInput, AdresSeciciButton, formatAdres, FieldError } from '@akalin/ui';
import { ICariAdres } from './CariForm';
import { useTranslation } from 'react-i18next';
import { validateCariAdresForm, validateCariAdresField } from '../validators/CariAdresValidation';

export interface CariAdresFormProps {
  isOpen?: boolean;
  onClose: () => void;
  onSave: (data: Partial<ICariAdres>) => void;
  tip: number; // 1: Fatura, 2: Nakliye
  defaultData?: Partial<ICariAdres>;
  cariUnvan?: string;
}

export const CariAdresForm: React.FC<CariAdresFormProps> = ({ 
  isOpen = true, 
  onClose, 
  onSave, 
  tip, 
  defaultData,
  cariUnvan
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // tip: 1 -> Fatura, 2 -> Nakliye
  const isFatura = tip === 1;

  const [activeTabId, setActiveTabId] = useState<'adres' | 'fatura'>('adres');

  // Teslim / Yetkili Kişi
  const [isimSoyisim, setIsimSoyisim] = useState('');
  const [telefon, setTelefon] = useState('');

  // Adres Bilgileri
  const [adresBaslik, setAdresBaslik] = useState('');
  const [adresIl, setAdresIl] = useState('');
  const [adresIlce, setAdresIlce] = useState('');
  const [acikAdres, setAcikAdres] = useState('');
  
  // Hata Durumu (Modül Düzeyi Validator ile Yönetilir)
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Adres Seçici IDs
  const [adresIds, setAdresIds] = useState(null);

  // Fatura Bilgileri
  const [faturaTipi, setFaturaTipi] = useState(1); // 1: Bireysel, 2: Kurumsal
  const [firmaAdi, setFirmaAdi] = useState('');
  const [vergiDairesi, setVergiDairesi] = useState('');
  const [vergiNo, setVergiNo] = useState('');

  const currentFormData = {
    isimSoyisim,
    telefon,
    adresBaslik,
    adresIl,
    adresIlce,
    acikAdres,
    faturaTipi,
    firmaAdi,
    vergiDairesi,
    vergiNo
  };

  const clearFieldError = (fieldName: string) => {
    setErrors(prev => {
      if (!prev[fieldName]) return prev;
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
  };

  const handleFieldBlur = (fieldName: string, value: any) => {
    const errorMsg = validateCariAdresField(fieldName, value, currentFormData, t);
    setErrors(prev => {
      if (errorMsg) {
        return { ...prev, [fieldName]: errorMsg };
      }
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
  };

  useEffect(() => {
    if (isOpen) {
      // Formu temizle veya default data varsa doldur
      setIsimSoyisim(defaultData?.isimSoyisim || '');
      setTelefon(defaultData?.telefon || '');
      setAdresBaslik(defaultData?.baslik || '');
      setAdresIl(defaultData?.adresIl || defaultData?.ilAdi || defaultData?.il || defaultData?.sehir || '');
      setAdresIlce(defaultData?.adresIlce || defaultData?.ilceAdi || defaultData?.ilce || '');
      setAcikAdres(defaultData?.formattedAdres || defaultData?.acikAdres || defaultData?.adres || defaultData?.adresMetni || '');
      setErrors({});
      setActiveTabId('adres');
      
      let computedAdresIds = defaultData?.adresIds;
      if (!computedAdresIds && defaultData?.ilId) {
        computedAdresIds = {
          adresIlId: defaultData?.ilId,
          adresIlceId: defaultData?.ilceId,
          adresKoyId: defaultData?.koyId,
          adresMahalleId: defaultData?.mahalleId,
          adresCaddeSokakId: defaultData?.caddeSokakId,
          adresDisKapiId: defaultData?.disKapiId,
          adresIcKapiId: defaultData?.icKapiId
        };
      }
      setAdresIds(computedAdresIds || null);
      
      setFaturaTipi(defaultData?.faturaTipi || (defaultData?.kurumsalFaturaMi ? 2 : 1));
      setFirmaAdi(defaultData?.firmaAdi || '');
      setVergiDairesi(defaultData?.vergiDairesi || '');
      setVergiNo(defaultData?.vergiNo || '');
    }
  }, [isOpen, defaultData]);

  const handleSave = () => {
    const validation = validateCariAdresForm(currentFormData, t);

    if (!validation.isValid) {
      setErrors(validation.errors);
      if (validation.errors.adresBaslik || validation.errors.adresIl || validation.errors.adresIlce || validation.errors.acikAdres) {
        setActiveTabId('adres');
      } else {
        setActiveTabId('fatura');
      }
      toast.error(t('Lütfen zorunlu alanları (*) doldurunuz.'));
      return;
    }

    const payload = {
      tipi: tip,
      baslik: adresBaslik,
      isimSoyisim,
      telefon,
      adresIl,
      adresIlce,
      acikAdres,
      formattedAdres: formatAdres({ ilAdi: adresIl, ilceAdi: adresIlce, acikAdres }),
      adresIds,
    };

    if (isFatura) {
      payload.faturaTipi = faturaTipi;
      payload.kurumsalFaturaMi = faturaTipi === 2;
      payload.firmaAdi = faturaTipi === 2 ? firmaAdi : null;
      payload.vergiDairesi = faturaTipi === 2 ? vergiDairesi : null;
      payload.vergiNo = faturaTipi === 2 ? vergiNo : null;
    }

    onSave(payload);
    onClose();
  };

  const modalTitle = isFatura 
    ? t('Fatura Adresi')
    : t('Nakliye / Sevk Adresi');

  const renderAdresTabContent = () => (
    <div className="flex-col gap-24 p-24">
      {/* Teslimat / Yetkili Kişi Bilgileri */}
      <div>
        <h4 className="m-0 mb-16 text-15 font-bold text-primary flex items-center gap-8">
          <User size={18} className="text-accent" />
          {t('Teslimat / Yetkili Kişi')}
        </h4>
        
        <div className="grid cols-1fr-1fr gap-16">
          <div className="flex-col gap-6">
            <label className="text-13 font-semibold text-secondary">{t('İsim Soyisim / Firma')}<span className="text-danger">*</span></label>
            <BaseInput 
              id="isimSoyisimInput"
              value={isimSoyisim} 
              onChange={e => {
                setIsimSoyisim(e.target.value);
                if (e.target.value.trim()) clearFieldError('isimSoyisim');
              }} 
              onBlur={() => handleFieldBlur('isimSoyisim', isimSoyisim)}
              placeholder={t('Teslim alacak kişi veya firma')} 
              error={Boolean(errors.isimSoyisim)} 
            />
            {errors.isimSoyisim && <FieldError error={errors.isimSoyisim} />}
          </div>
          <div className="flex-col gap-6">
            <label className="text-13 font-semibold text-secondary">{t('Telefon Numarası')}<span className="text-danger">*</span></label>
            <PhoneInput 
              value={telefon} 
              onChange={val => {
                setTelefon(val);
                if (val && val.trim()) clearFieldError('telefon');
              }} 
              onBlur={() => handleFieldBlur('telefon', telefon)}
              placeholder={t('0 (5XX) XXX XX XX')} 
              className={`form-input ${errors.telefon ? 'is-invalid border-danger' : ''}`} 
            />
            {errors.telefon && <FieldError error={errors.telefon} />}
          </div>
        </div>
      </div>

      <hr className="m-0 border-none border-t-glass" />

      {/* Adres Bilgileri */}
      <div>
        <div className="flex justify-between items-center mb-16">
          <h4 className="m-0 text-15 font-bold text-primary flex items-center gap-8">
            <MapPin size={18} className="text-accent" />
            {t('Adres Bilgileri')}
          </h4>
          <AdresSeciciButton 
            initialData={{
              ...defaultData,
              ...adresIds,
              il: adresIl || defaultData?.il,
              ilce: adresIlce || defaultData?.ilce,
              acikAdres: acikAdres || defaultData?.acikAdres || defaultData?.adres
            }}
            onSave={(data) => {
              setAcikAdres(data.formattedAdres);
              setAdresIl(data.parts?.il || '');
              setAdresIlce(data.parts?.ilce || '');
              setAdresIds(data.ids);
              clearFieldError('adresIl');
              clearFieldError('adresIlce');
              clearFieldError('acikAdres');
            }} 
          />
        </div>

        <div className="flex-col gap-16">
          <div className="flex-col gap-6">
            <label className="text-13 font-semibold text-secondary">{t('Adres Başlığı')}<span className="text-danger">*</span></label>
            <BaseInput 
              id="adresBaslikInput"
              value={adresBaslik} 
              onChange={e => {
                setAdresBaslik(e.target.value);
                if (e.target.value.trim()) clearFieldError('adresBaslik');
              }} 
              onBlur={() => handleFieldBlur('adresBaslik', adresBaslik)}
              placeholder={t('Örn: Merkez Depo, Fabrika, Ev Adresi...')} 
              error={Boolean(errors.adresBaslik)} 
            />
            {errors.adresBaslik && <FieldError error={errors.adresBaslik} />}
          </div>

          <div className="grid cols-1fr-1fr gap-16">
            <div className="flex-col gap-6">
              <label className="text-13 font-semibold text-secondary">{t('İl')}<span className="text-danger">*</span></label>
              <BaseInput 
                id="adresIlInput"
                value={adresIl || ''} 
                onChange={e => {
                  setAdresIl(e.target.value);
                  if (e.target.value.trim()) clearFieldError('adresIl');
                }} 
                onBlur={() => handleFieldBlur('adresIl', adresIl)}
                placeholder={t('İl')} 
                error={Boolean(errors.adresIl)} 
              />
              {errors.adresIl && <FieldError error={errors.adresIl} />}
            </div>
            <div className="flex-col gap-6">
              <label className="text-13 font-semibold text-secondary">{t('İlçe')}<span className="text-danger">*</span></label>
              <BaseInput 
                id="adresIlceInput"
                value={adresIlce || ''} 
                onChange={e => {
                  setAdresIlce(e.target.value);
                  if (e.target.value.trim()) clearFieldError('adresIlce');
                }} 
                onBlur={() => handleFieldBlur('adresIlce', adresIlce)}
                placeholder={t('İlçe')} 
                error={Boolean(errors.adresIlce)} 
              />
              {errors.adresIlce && <FieldError error={errors.adresIlce} />}
            </div>
          </div>

          <div className="flex-col gap-6">
            <label className="text-13 font-semibold text-secondary">{t('Açık Adres')}<span className="text-danger">*</span></label>
            <BaseInput 
              id="acikAdresInput"
              multiline={true}
              rows={3}
              value={acikAdres} 
              onChange={e => {
                setAcikAdres(e.target.value);
                if (e.target.value.trim()) clearFieldError('acikAdres');
              }} 
              onBlur={() => handleFieldBlur('acikAdres', acikAdres)}
              placeholder={t('Mahalle, Sokak, Kapı No vb.')} 
              error={Boolean(errors.acikAdres)} 
            />
            {errors.acikAdres && <FieldError error={errors.acikAdres} />}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFaturaTabContent = () => (
    <div className="flex-col gap-24 p-24">
      <div>
        <h4 className="m-0 mb-16 text-15 font-bold text-primary flex items-center gap-8">
          <FileText size={18} className="text-accent" />
          {t('Fatura Türü ve Bilgileri')}
        </h4>
        
        <div className="flex gap-24 mb-20">
          <label className="flex items-center gap-8 cursor-pointer text-14 font-semibold text-primary">
            <input type="radio" checked={faturaTipi === 1} onChange={() => setFaturaTipi(1)} className="radio-accent" />
            {t('Bireysel Fatura')}
          </label>
          <label className="flex items-center gap-8 cursor-pointer text-14 font-semibold text-primary">
            <input type="radio" checked={faturaTipi === 2} onChange={() => setFaturaTipi(2)} className="radio-accent" />
            {t('Kurumsal Fatura')}
          </label>
        </div>

        {faturaTipi === 2 ? (
          <div className="flex-col gap-16 bg-secondary p-16 rounded-12 border-glass">
            <div className="flex-col gap-6">
              <label className="text-13 font-semibold text-secondary">{t('Firma Adı')}<span className="text-danger">*</span></label>
              <BaseInput 
                id="firmaAdiInput"
                value={firmaAdi} 
                onChange={e => {
                  setFirmaAdi(e.target.value);
                  if (e.target.value.trim()) clearFieldError('firmaAdi');
                }} 
                onBlur={() => handleFieldBlur('firmaAdi', firmaAdi)}
                placeholder={t('Örn: ABC A.Ş.')} 
                error={Boolean(errors.firmaAdi)} 
              />
              {errors.firmaAdi && <FieldError error={errors.firmaAdi} />}
            </div>
            <div className="grid cols-1fr-1fr gap-16">
              <div className="flex-col gap-6">
                <label className="text-13 font-semibold text-secondary">{t('Vergi Dairesi')}<span className="text-danger">*</span></label>
                <BaseInput 
                  id="vergiDairesiInput"
                  value={vergiDairesi} 
                  onChange={e => {
                    setVergiDairesi(e.target.value);
                    if (e.target.value.trim()) clearFieldError('vergiDairesi');
                  }} 
                  onBlur={() => handleFieldBlur('vergiDairesi', vergiDairesi)}
                  placeholder={t('Vergi Dairesi')} 
                  error={Boolean(errors.vergiDairesi)} 
                />
                {errors.vergiDairesi && <FieldError error={errors.vergiDairesi} />}
              </div>
              <div className="flex-col gap-6">
                <label className="text-13 font-semibold text-secondary">{t('Vergi Numarası (VKN/TCKN)')}<span className="text-danger">*</span></label>
                <BaseInput 
                  id="vergiNoInput"
                  value={vergiNo} 
                  onChange={e => {
                    setVergiNo(e.target.value);
                    if (e.target.value.trim()) clearFieldError('vergiNo');
                  }} 
                  onBlur={() => handleFieldBlur('vergiNo', vergiNo)}
                  placeholder={t('10 veya 11 Hane')} 
                  error={Boolean(errors.vergiNo)} 
                />
                {errors.vergiNo && <FieldError error={errors.vergiNo} />}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-14 text-secondary p-16 bg-secondary rounded-12 border-glass">
            {t('Bireysel faturalarda teslim edilen kişinin TCKN ve isim bilgileri esas alınır.')}
          </div>
        )}
      </div>
    </div>
  );

  const tabs = [
    {
      id: 'adres',
      label: t('Adres Bilgileri'),
      icon: <MapPin size={18} />,
      content: renderAdresTabContent()
    }
  ];

  if (isFatura) {
    tabs.push({
      id: 'fatura',
      label: t('Fatura Bilgileri'),
      icon: <FileText size={18} />,
      content: renderFaturaTabContent()
    });
  }

  return (
    <BaseCardPage
      title={modalTitle}
      icon={<MapPin size={20} />}
      subtitleLeft={cariUnvan ? `${t('Cari')}: ${cariUnvan}` : undefined}
      subtitleRight={defaultData?.baslik || (defaultData?.id ? t('Adres Düzenle') : t('Yeni Adres'))}
      showBackButton={true}
      onClose={onClose}
      onSave={handleSave}
      saveButtonText={t('Adresi Kaydet')}
      asForm={false}
      tabs={tabs}
      activeTabId={activeTabId}
      onTabChange={(tabId) => setActiveTabId(tabId as any)}
      hideIfSingleTab={false}
    />
  );
};

export default CariAdresForm;
