// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { cariService } from '../services/CariService';
import CariForm, { ICari } from '../components/CariForm';
import { AlertDialog, useHeaderApi } from '@akalin/ui';
import { useTranslation } from 'react-i18next';

const CariFormPage: React.FC = () => {
    const { t } = useTranslation();
    const { id: paramId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { setHeaderBreadcrumbOptions } = useHeaderApi() || {};

    const queryId = searchParams.get('id');
    const effectiveId = paramId || queryId;
    const isNew = !effectiveId || effectiveId === 'yeni';
    const stateItem = location.state?.currentFormData || location.state?.item;
    const returnTo = location.state?.returnTo || '/cariler';

    // type parameter for new additions (e.g. from /cariler menu)
    const tipiQuery = searchParams.get('tipi');
    const turQuery = searchParams.get('tur');
    const queryInitialData = (tipiQuery || turQuery) ? {
        tipi: tipiQuery ? parseInt(tipiQuery, 10) : undefined,
        tur: turQuery ? parseInt(turQuery, 10) : undefined
    } : null;

    const getInitialFormData = () => {
        if (stateItem) {
            const stateId = stateItem?.id ?? stateItem?.Id;
            if (isNew ? !stateId : (effectiveId && String(stateId) === String(effectiveId))) {
                return stateItem;
            }
        }
        try {
            const draft = sessionStorage.getItem('webakus_cari_form_draft');
            if (draft) {
                const parsed = JSON.parse(draft);
                const draftId = parsed?.id ?? parsed?.Id;
                if (isNew ? !draftId : (effectiveId && String(draftId) === String(effectiveId))) {
                    return parsed;
                } else {
                    sessionStorage.removeItem('webakus_cari_form_draft');
                }
            }
        } catch (e) {}
        return isNew ? queryInitialData : null;
    };

    const initialTitle = stateItem?.unvan || [stateItem?.ad, stateItem?.soyad].filter(Boolean).join(' ') || '';
    const [initialData, setInitialData] = useState<Partial<ICari> | null>(getInitialFormData);
    const [loading, setLoading] = useState(!isNew && !stateItem);
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [formTitle, setFormTitle] = useState(initialTitle);
    const [alertDialog, setAlertDialog] = useState({ 
        isOpen: false, 
        type: 'info', 
        title: '', 
        message: '', 
        onConfirm: null, 
        confirmText: t('Tamam') 
    });

    useEffect(() => {
        if (setHeaderBreadcrumbOptions) {
            const effectiveRecordTitle = formTitle || (!isNew ? (effectiveId ? `#${effectiveId}` : t('Cari Düzenle')) : t('Yeni Cari Kart'));
            setHeaderBreadcrumbOptions({ recordTitle: effectiveRecordTitle });
            return () => {
                setHeaderBreadcrumbOptions(null);
            };
        }
    }, [setHeaderBreadcrumbOptions, formTitle, effectiveId, isNew, t]);

    const handleFormClose = () => {
        const cleanupAndNavigate = () => {
            try {
                sessionStorage.removeItem('webakus_cari_form_draft');
            } catch (e) {}
            const targetId = effectiveId && effectiveId !== 'yeni' ? effectiveId : null;
            if (targetId) {
                try {
                    sessionStorage.setItem('webakus_active_row_' + returnTo, String(targetId));
                } catch (e) {}
            }
            navigate(returnTo, { state: { selectedId: targetId } });
        };

        if (isFormDirty) {
            setAlertDialog({
                isOpen: true,
                type: 'confirm',
                title: t('Kaydedilmemiş Değişiklikler'),
                message: t('Kaydedilmemiş değişiklikleriniz var. Çıkmak istediğinize emin misiniz?'),
                confirmText: t('Evet, Çık'),
                onConfirm: cleanupAndNavigate
            });
        } else {
            cleanupAndNavigate();
        }
    };

    useEffect(() => {
        if (!isNew && effectiveId) {
            cariService.getById(effectiveId)
                .then(data => {
                    setInitialData(data);
                    const recordTitle = data.unvan || [data.ad, data.soyad].filter(Boolean).join(' ') || (data.kod ? `${t('Cari')}: ${data.kod}` : '');
                    if (recordTitle) setFormTitle(recordTitle);
                    setLoading(false);
                })
                .catch(() => {
                    if (!stateItem) {
                        setAlertDialog({
                            isOpen: true,
                            type: 'error',
                            title: t('Hata'),
                            message: t('Cari detayları yüklenemedi.'),
                            onConfirm: () => navigate(returnTo)
                        });
                    }
                    setLoading(false);
                });
        }
    }, [effectiveId, isNew, navigate, returnTo, t, stateItem]);

    if (loading) {
        return <div className="p-24 flex justify-center text-secondary">{t('Yükleniyor...')}</div>;
    }

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <CariForm 
                initialData={initialData} 
                onSuccess={(savedId) => {
                    const finalId = savedId || effectiveId;
                    const targetId = finalId && finalId !== 'yeni' ? finalId : null;
                    if (targetId) {
                        try {
                            sessionStorage.setItem('webakus_active_row_' + returnTo, String(targetId));
                        } catch (e) {}
                    }
                    navigate(returnTo, { state: { selectedId: targetId } });
                }} 
                onCancel={handleFormClose}
                onDirtyChange={setIsFormDirty}
                onTitleChange={setFormTitle}
            />
            
            <AlertDialog 
                isOpen={alertDialog.isOpen}
                onClose={() => setAlertDialog(prev => ({ ...prev, isOpen: false }))}
                type={alertDialog.type}
                title={alertDialog.title}
                message={alertDialog.message}
                onConfirm={alertDialog.onConfirm}
                confirmText={alertDialog.confirmText}
            />
        </div>
    );
};

export default CariFormPage;
