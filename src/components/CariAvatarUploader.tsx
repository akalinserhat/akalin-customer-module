/**
 * Webakus ERP - Akıllı Cari Avatar Yükleyici ve Bulut Depolama Arabirimi (CariAvatarUploader.tsx)
 * 
 * Başlıca Sorumlulukları:
 * - Cari kartlarında avatarı 4 kadranlı gösterge halkası ile birlikte render eder.
 * - Avatarın sağ alt köşesinde '+' (veya düzenleme 'Pencil') butonu sunar.
 * - Butona tıklandığında firmanın Bulut Depolama Entegrasyonunu (Google Drive / OneDrive) anlık sorgular.
 *   - Bulut aktifse: Yerel dosya yükleme diyaloğunu açarak resmi buluta aktarır.
 *   - Bulut bağlı değilse: Kullanıcıya bilgilendirici bir uyarı göstererek sistem ayarlarına yönlendirir.
 * - Form üzerinde seçilen 0-10 kadran değerlerini (gostergeUst, gostergeAlt, gostergeSol, gostergeSag)
 *   CariAvatar bileşenine ileterek canlı önizleme sağlar.
 */

import React, { useRef, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Loader2, CloudOff, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import httpClient from '../services/httpClient';
import { AlertDialog } from '@akalin/ui';
import CariAvatar from './CariAvatar';

export interface CariAvatarUploaderProps {
  title?: string;
  tipi?: number;
  imageUrl?: string | null;
  seed?: string | number;
  size?: 'sm' | 'md' | 'lg';
  onChange: (newUrl: string | null) => void;
  disabled?: boolean;
  /** Üst Kadran: 0-10 (Son Alışveriş Tazeliği) */
  gostergeUst?: number;
  /** Alt Kadran: 0-10 (Taksit Durumu & 10: Fırsat Gradyanı) */
  gostergeAlt?: number;
  /** Sol Kadran: 0-10 (Rezerv Alan) */
  gostergeSol?: number;
  /** Sağ Kadran: 0-10 (Rezerv Alan) */
  gostergeSag?: number;
  /** Cari kayıt veya son hareket tarihi */
  tarih?: string | Date | null;
}

export const CariAvatarUploader: React.FC<CariAvatarUploaderProps> = ({
  title,
  tipi = 1,
  imageUrl,
  seed,
  size = 'md',
  onChange,
  disabled = false,
  gostergeUst = 0,
  gostergeAlt = 0,
  gostergeSol = 0,
  gostergeSag = 0,
  tarih
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [checkingCloud, setCheckingCloud] = useState(false);
  const [showCloudMissingDialog, setShowCloudMissingDialog] = useState(false);

  // Bulut Depolama Modülü ve Entegrasyon Kontrolü
  const handleActionClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || uploading || checkingCloud) return;

    setCheckingCloud(true);
    try {
      const res = await httpClient.get('/api/Storage/Entegrasyonlar');
      const integrations = res.data || [];
      const hasActiveIntegration = Array.isArray(integrations) && integrations.some((i: any) => i.aktifMi !== false);

      if (hasActiveIntegration) {
        // Bulut depolama aktif -> Dosya seçiciyi aç
        fileInputRef.current?.click();
      } else {
        // Bulut depolama eksik/bağlı değil -> Eksiklik arabirimini aç
        setShowCloudMissingDialog(true);
      }
    } catch (err) {
      console.warn('Bulut depolama kontrolü yapılamadı:', err);
      // Hata durumunda da yapılandırma arayüzüne yönlendirme seçeneği sun
      setShowCloudMissingDialog(true);
    } finally {
      setCheckingCloud(false);
    }
  }, [disabled, uploading, checkingCloud]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('Görsel boyutu en fazla 5MB olabilir.'));
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const response = await httpClient.post('/api/Cari/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.url) {
        onChange(response.data.url);
        toast.success(t('Profil görseli başarıyla yüklendi.'));
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || t('Görsel yüklenirken bir hata oluştu.');
      toast.error(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || uploading) return;
    onChange(null);
    toast.success(t('Görsel kaldırıldı.'));
  };

  const isLg = size === 'lg';

  return (
    <div className="flex items-center gap-10 relative group/uploader">
      <div className="avatar-ring-container relative">
        <CariAvatar
          title={title}
          tipi={tipi}
          imageUrl={imageUrl}
          seed={seed}
          size={size}
          showBadge={false}
          gostergeUst={gostergeUst}
          gostergeAlt={gostergeAlt}
          gostergeSol={gostergeSol}
          gostergeSag={gostergeSag}
          tarih={tarih}
        />

        {/* Sağ Alt Köşedeki Akıllı + Butonu */}
        {!disabled && (
          <button
            type="button"
            className={`avatar-action-plus-btn ${isLg ? 'lg' : ''}`}
            onClick={handleActionClick}
            title={imageUrl ? t('Fotoğrafı Değiştir') : t('Fotoğraf veya Logo Ekle')}
          >
            {checkingCloud || uploading ? (
              <Loader2 size={isLg ? 14 : 12} className="animate-spin text-white" />
            ) : imageUrl ? (
              <Pencil size={isLg ? 13 : 11} className="text-white" />
            ) : (
              <Plus size={isLg ? 15 : 13} className="text-white" />
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        className="hidden avatar-file-input"
        onChange={handleFileChange}
        disabled={disabled || uploading}
      />

      {imageUrl && !disabled && (
        <button
          type="button"
          onClick={handleRemove}
          className="btn-icon btn-sm text-secondary hover:text-danger transition-colors"
          title={t('Görseli Kaldır')}
        >
          <Trash2 size={16} />
        </button>
      )}

      {/* Bulut Depolama Modülü Eksiklik / Yapılandırma Dialogu */}
      <AlertDialog
        isOpen={showCloudMissingDialog}
        onClose={() => setShowCloudMissingDialog(false)}
        type="warning"
        title={t('Bulut Depolama Modülü Gerekli')}
        message={t('Cari profil görsellerini ve ticari belgeleri güvenle saklamak için önce Bulut Depolama entegrasyonunuzu (Google Drive / OneDrive) bağlamanız gerekmektedir.')}
        confirmText={t('Hemen Yapılandır')}
        cancelText={t('Vazgeç')}
        onConfirm={() => {
          setShowCloudMissingDialog(false);
          navigate('/ayarlar/sistem-ayarlari/UygulamaEntegrasyonlari?kategori=bulut-depolama');
        }}
      />
    </div>
  );
};

export default CariAvatarUploader;
