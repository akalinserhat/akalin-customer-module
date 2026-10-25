// @ts-nocheck
import React, { useState, useCallback, useMemo } from 'react';
import { cariService } from '../services/CariService';
import { Edit2, Trash2, Building, User, Users, RotateCcw, Archive } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ActionMenu, BaseListPage } from '@akalin/ui';
import CariAvatar from '../components/CariAvatar';

const Cariler: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const cariSearchFields = useMemo(() => [
        { id: 'Tumu', label: t('Tümünde Ara'), type: 'text', iconName: 'Search', placeholder: t('Kod, Ünvan, İsim, E-posta, Tel, Etiket...') },
        { id: 'Unvan', label: t('Ünvana Göre'), type: 'text', iconName: 'Type', placeholder: t('Ünvan veya İsim girin...') },
        { id: 'Kod', label: t('Cari Koda Göre'), type: 'text', iconName: 'Barcode', placeholder: t('Cari kodu girin...') },
        { id: 'Telefon', label: t('Telefona Göre'), customType: 'phone', iconName: 'Phone', placeholder: '0 (5XX) XXX XX XX' },
        { id: 'Email', label: t('E-Postaya Göre'), type: 'text', iconName: 'AtSign', placeholder: t('E-posta adresi girin...') },
        { id: 'Etiket', label: t('Etikete Göre'), type: 'text', iconName: 'Tag', placeholder: t('Etiket girin...') }
    ], [t]);

    const handleAddNew = useCallback((isShiftClick = false) => {
        try {
            sessionStorage.removeItem('webakus_cari_form_draft');
        } catch (e) {}
        const url = '/cariler/yeni';
        if (isShiftClick) {
            window.open(url, '_blank');
        } else {
            navigate(url);
        }
    }, [navigate]);

    const handleEditPopup = useCallback((item: any) => {
        try {
            sessionStorage.removeItem('webakus_cari_form_draft');
        } catch (e) {}
        const cariId = item?.id ?? item?.Id;
        window.open(`/cariler/${cariId}`, '_blank');
    }, []);

    const onEdit = useCallback((item: any, e?: any) => {
        try {
            sessionStorage.removeItem('webakus_cari_form_draft');
        } catch (err) {}
        const cariId = item?.id ?? item?.Id;
        if (cariId) {
            try {
                sessionStorage.setItem('webakus_active_row_/cariler', String(cariId));
            } catch (err) {}
        }
        if (e && e.shiftKey) {
            handleEditPopup(item);
        } else {
            navigate(`/cariler/${cariId}`, { state: { item } });
        }
    }, [navigate, handleEditPopup]);

    const handleRestore = useCallback(async (item: any) => {
        const cariId = item?.id ?? item?.Id;
        if (!cariId) return;
        try {
            await cariService.restore(cariId);
            toast.success(t('auto_cari_geri_yuklendi', 'Cari hesap başarıyla geri yüklendi.'));
            window.dispatchEvent(new CustomEvent('refresh-list'));
        } catch (err: any) {
            toast.error(err?.response?.data?.message || t('auto_hata_olustu', 'Geri yüklenirken hata oluştu.'));
        }
    }, [t]);

    const handleArchive = useCallback(async (item: any) => {
        const cariId = item?.id ?? item?.Id;
        if (!cariId) return;
        try {
            await cariService.archive(cariId);
            toast.success(t('auto_kayit_arsivlendi', 'Cari hesap başarıyla arşive alındı.'));
            window.dispatchEvent(new CustomEvent('refresh-list'));
        } catch (err: any) {
            toast.error(err?.response?.data?.message || t('auto_hata_olustu', 'İşlem sırasında hata oluştu.'));
        }
    }, [t]);

    const handleUnarchive = useCallback(async (item: any) => {
        const cariId = item?.id ?? item?.Id;
        if (!cariId) return;
        try {
            await cariService.unarchive(cariId);
            toast.success(t('auto_kayit_arsivden_cikarildi', 'Cari hesap arşivden çıkarıldı.'));
            window.dispatchEvent(new CustomEvent('refresh-list'));
        } catch (err: any) {
            toast.error(err?.response?.data?.message || t('auto_hata_olustu', 'İşlem sırasında hata oluştu.'));
        }
    }, [t]);

    const columns = useMemo(() => [
        {
            accessor: 'adUnvan',
            header: t('Ünvan / Ad Soyad'),
            sortable: true,
            render: (item) => (
                <div 
                    className="flex items-center gap-12 group"
                >
                    <CariAvatar
                        title={item.tipi === 1 ? item.unvan : (item.unvan || `${item.ad} ${item.soyad}`)}
                        tipi={item.tipi}
                        imageUrl={item.profilResmiUrl}
                        seed={item.id ?? item.Id ?? item.kod}
                        size="md"
                        showBadge={true}
                        tarih={item.tarih}
                        gostergeUst={item.gostergeUst || 0}
                        gostergeAlt={item.gostergeAlt || 0}
                        gostergeSol={item.gostergeSol || 0}
                        gostergeSag={item.gostergeSag || 0}
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-8 mb-4">
                            <div className="font-semibold text-primary text-14 group-hover:text-accent-primary transition-colors">
                                {item.tipi === 1 ? item.unvan : (item.unvan || `${item.ad} ${item.soyad}`)}
                            </div>
                            {item.silindiMi && (
                                <span className="chip-danger text-11 font-medium">
                                    {t('auto_silindi', 'Silindi')}
                                </span>
                            )}
                            {item.arsivlendiMi && (
                                <span className="chip-warning text-11 font-medium">
                                    {t('auto_arsivlendi', 'Arşivlendi')}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-8">
                            {item.tipi === 1 ? (
                                <span className="inline-flex items-center gap-4 text-accent-primary text-11 font-medium">
                                    <Building size={12}/> {t('Kurumsal')}
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-4 text-info text-11 font-medium">
                                    <User size={12}/> {t('Bireysel')}
                                </span>
                            )}
                            <span className="text-secondary text-11">•</span>
                            <span className="code-badge">
                                {item.kod}
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            accessor: 'iletisim',
            header: t('İletişim'),
            sortable: false,
            render: (item) => {
                const telefonToShow = item.varsayilanAdresTelefon || item.telefon;
                const defaultAddress = item.adresler?.find((a: any) => a.varsayilanMi) || item.adresler?.[0];
                const locationText = defaultAddress ? [defaultAddress.ilceAdi, defaultAddress.ilAdi].filter(Boolean).join(' / ') : '';

                return (
                    <div>
                        {telefonToShow && <div className="text-13 text-primary">{telefonToShow}</div>}
                        {item.email && <div className="text-12 text-secondary">{item.email}</div>}
                        {locationText && <div className="text-11 text-secondary opacity-80 mt-2">{locationText}</div>}
                        {!telefonToShow && !item.email && !locationText && <span className="text-muted">-</span>}
                    </div>
                );
            }
        },
        {
            accessor: 'bakiye',
            header: t('Bakiye'),
            sortable: true,
            align: 'right',
            render: (item) => (
                <div>
                    <div className={`font-semibold text-14 ${item.bakiye < 0 ? 'text-danger' : 'text-success'}`}>
                        {item.bakiye ? item.bakiye.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'} {item.paraBirimi}
                    </div>
                </div>
            )
        },
        {
            id: 'actions',
            header: '',
            width: '60px',
            align: 'center' as const,
            sortable: false,
            render: (row: any, index: number, tableActions: any) => {
                if (row.silindiMi) {
                    return (
                        <ActionMenu
                            actions={[
                                {
                                    label: t('auto_geri_yukle', 'Geri Yükle'),
                                    icon: <RotateCcw size={16} />,
                                    isDefault: true,
                                    default: true,
                                    onClick: () => handleRestore(row)
                                }
                            ]}
                        />
                    );
                }

                if (row.arsivlendiMi) {
                    return (
                        <ActionMenu
                            actions={[
                                {
                                    label: t('auto_arsivden_cikar', 'Arşivden Çıkar'),
                                    icon: <RotateCcw size={16} />,
                                    isDefault: true,
                                    default: true,
                                    onClick: () => handleUnarchive(row)
                                },
                                {
                                    label: t('Sil'),
                                    icon: <Trash2 size={16} />,
                                    danger: true,
                                    onClick: () => {
                                        if (tableActions?.handleDelete) {
                                            tableActions.handleDelete(row);
                                        }
                                    }
                                }
                            ]}
                        />
                    );
                }

                return (
                    <ActionMenu
                        actions={[
                            {
                                label: t('Düzenle'),
                                icon: <Edit2 size={16} />,
                                isDefault: true,
                                default: true,
                                onClick: (e: any) => {
                                    if (e?.shiftKey) {
                                        handleEditPopup(row);
                                    } else if (tableActions?.handleEdit) {
                                        tableActions.handleEdit(row, e);
                                    } else {
                                        onEdit(row, e);
                                    }
                                }
                            },
                            {
                                label: t('auto_arsive_al', 'Arşive Al'),
                                icon: <Archive size={16} />,
                                onClick: () => handleArchive(row)
                            },
                            {
                                label: t('Sil'),
                                icon: <Trash2 size={16} />,
                                onClick: () => {
                                    if (tableActions?.handleDelete) {
                                        tableActions.handleDelete(row);
                                    }
                                },
                                danger: true
                            }
                        ]}
                    />
                );
            }
        }
    ], [t, onEdit, handleEditPopup, handleRestore, handleArchive, handleUnarchive]);

    const mobileCardRender = useCallback((item: any, index: number, { handleDelete }: any) => (
        <div className="flex-col p-12 gap-12 relative">
            <div className="flex gap-12 items-start">
                <CariAvatar
                    title={item.tipi === 1 ? item.unvan : (item.unvan || `${item.ad} ${item.soyad}`)}
                    tipi={item.tipi}
                    imageUrl={item.profilResmiUrl}
                    seed={item.id ?? item.Id ?? item.kod}
                    size="md"
                    showBadge={true}
                    tarih={item.tarih}
                    gostergeUst={item.gostergeUst || 0}
                    gostergeAlt={item.gostergeAlt || 0}
                    gostergeSol={item.gostergeSol || 0}
                    gostergeSag={item.gostergeSag || 0}
                />
                <div className="flex-1 min-w-0 flex-col gap-6">
                    <div className="flex items-start justify-between gap-8">
                        <div className="flex items-start gap-6 flex-wrap">
                            <div className="font-semibold text-primary text-15 break-word leading-1-4">
                                {item.tipi === 1 ? item.unvan : (item.unvan || `${item.ad} ${item.soyad}`)}
                            </div>
                            {item.silindiMi && (
                                <span className="chip-danger text-11 font-medium">
                                    {t('auto_silindi', 'Silindi')}
                                </span>
                            )}
                            {item.arsivlendiMi && (
                                <span className="chip-warning text-11 font-medium">
                                    {t('auto_arsivlendi', 'Arşivlendi')}
                                </span>
                            )}
                        </div>
                        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                            {item.silindiMi ? (
                                <ActionMenu 
                                    actions={[
                                        { 
                                            label: t('auto_geri_yukle', 'Geri Yükle'), 
                                            icon: <RotateCcw size={15} />, 
                                            isDefault: true,
                                            default: true,
                                            onClick: () => handleRestore(item) 
                                        }
                                    ]}
                                />
                            ) : item.arsivlendiMi ? (
                                <ActionMenu 
                                    actions={[
                                        { 
                                            label: t('auto_arsivden_cikar', 'Arşivden Çıkar'), 
                                            icon: <RotateCcw size={15} />, 
                                            isDefault: true,
                                            default: true,
                                            onClick: () => handleUnarchive(item) 
                                        },
                                        { 
                                            label: t('Sil'), 
                                            icon: <Trash2 size={15} />, 
                                            danger: true, 
                                            onClick: () => handleDelete && handleDelete(item) 
                                        }
                                    ]}
                                />
                            ) : (
                                <ActionMenu 
                                    actions={[
                                        { 
                                            label: t('Düzenle'), 
                                            icon: <Edit2 size={15} />, 
                                            isDefault: true,
                                            default: true,
                                            onClick: (e) => {
                                                 if (e.shiftKey) { handleEditPopup(item); } else { onEdit(item, e); }
                                            } 
                                        },
                                        { 
                                            label: t('auto_arsive_al', 'Arşive Al'), 
                                            icon: <Archive size={15} />, 
                                            onClick: () => handleArchive(item) 
                                        },
                                        { 
                                            label: t('Sil'), 
                                            icon: <Trash2 size={15} />, 
                                            danger: true, 
                                            onClick: () => handleDelete && handleDelete(item) 
                                        }
                                    ]}
                                />
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-6 items-center">
                        <span className="code-badge">
                            {item.kod}
                        </span>
                        {item.tipi === 1 ? (
                            <span className="inline-flex items-center gap-4 text-accent-primary text-11 font-medium">
                                <Building size={12}/> {t('Kurumsal')}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-4 text-info text-11 font-medium">
                                <User size={12}/> {t('Bireysel')}
                            </span>
                        )}
                    </div>
                    {(item.varsayilanAdresTelefon || item.telefon || item.email || (item.adresler && item.adresler.length > 0)) && (
                        <div className="flex-col gap-2 mt-2">
                            {(item.varsayilanAdresTelefon || item.telefon) && <div className="text-12 text-secondary">{item.varsayilanAdresTelefon || item.telefon}</div>}
                            {item.email && <div className="text-12 text-secondary">{item.email}</div>}
                            {(() => {
                                const defAdr = item.adresler?.find((a: any) => a.varsayilanMi) || item.adresler?.[0];
                                const loc = defAdr ? [defAdr.ilceAdi, defAdr.ilAdi].filter(Boolean).join(' / ') : '';
                                return loc ? <div className="text-11 text-secondary opacity-80">{loc}</div> : null;
                            })()}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex justify-between items-center border-t-glass pt-10">
                <div className="text-12 text-secondary">{t('Bakiye')}</div>
                <div className={`font-semibold text-15 ${item.bakiye < 0 ? 'text-danger' : 'text-success'}`}>
                    {item.bakiye ? item.bakiye.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'} {item.paraBirimi}
                </div>
            </div>
        </div>
    ), [t, handleEditPopup, onEdit, handleRestore, handleArchive, handleUnarchive]);

    const itemNameResolver = useCallback((item: any) => item.tipi === 1 ? item.unvan : (item.unvan || `${item.ad} ${item.soyad}`), []);

    return (
        <BaseListPage
            title={t('Cari Hesaplar')}
            subtitle={t('Müşterileriniz, tedarikçileriniz ve personel kayıtları.')}
            icon={<Users size={24} />}
            service={cariService}
            baseRoute="/cariler"
            addNewText={t('Yeni Cari')}
            onAddNew={handleAddNew}
            columns={columns}
            searchableFields={cariSearchFields}
            itemNameResolver={itemNameResolver}
            canDelete={(item: any) => cariService.canDelete(item.id ?? item.Id)}
            onEdit={onEdit}
            onArchive={handleArchive}
            onUnarchive={handleUnarchive}
            mobileCardRender={mobileCardRender}
            enableViewModeToggle={true}
            defaultSortField="adUnvan"
            defaultSortOrder="asc"
        />
    );
};

export default Cariler;
