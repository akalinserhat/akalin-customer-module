/**
 * @file CariSeciciList.tsx
 * @description Webakus ERP - Cari Yönetimi Modülü Seçici Liste Bileşeni (CariSeciciList)
 * BaseSelectionList temel iskeletinden türetilmiş, zengin filtreleme, arama, klavye gezinimi ve
 * görsel standartlara (CariAvatar, status, bakiye vb.) sahip merkezi somut cari seçim ekranı.
 */

import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Building, User, Plus } from 'lucide-react';
import { BaseSelectionList, ActionMenuItem } from '@akalin/ui';
import { cariService } from '../services/CariService';
import CariAvatar from './CariAvatar';

export interface CariSeciciListProps {
    isOpen?: boolean;
    onClose?: () => void;
    onSelect: (cari: any) => void;
    isMultiSelect?: boolean;
    onMultiSelect?: (cariler: any[]) => void;
    initialSearchText?: string;
    initialSearchTerm?: string;
    title?: string;
    subtitle?: string;
    inModal?: boolean;
    onAddNew?: () => void;
    [key: string]: any;
}

// Geriye dönük uyumluluk alias'ı
export type CariSeciciModalProps = CariSeciciListProps;

const CariSeciciList: React.FC<CariSeciciListProps> = ({ 
    isOpen = true, 
    onClose, 
    onSelect, 
    isMultiSelect = false,
    onMultiSelect,
    initialSearchText = '', 
    initialSearchTerm = '',
    title,
    subtitle,
    inModal = true,
    onAddNew,
    ...restProps
}) => {
    const { t } = useTranslation();
    const effectiveSearchText = initialSearchText || initialSearchTerm;

    // Seçim işlemi
    const handleSelect = useCallback((item: any) => {
        if (!item) return;
        onSelect(item);
        if (onClose) {
            onClose();
        }
    }, [onSelect, onClose]);

    // Yeni Cari Ekleme
    const handleAddNew = useCallback(() => {
        if (onAddNew) {
            onAddNew();
        } else {
            window.open('/cariler/yeni', '_blank');
        }
    }, [onAddNew]);

    // Arama Alanları Tanımı
    const cariSearchFields = useMemo(() => [
        { id: 'Tumu', label: t('Tümünde Ara'), type: 'text', iconName: 'Search', placeholder: t('Kod, Ünvan, İsim, E-posta, Tel, Etiket...') },
        { id: 'Unvan', label: t('Ünvana Göre'), type: 'text', iconName: 'Type', placeholder: t('Ünvan veya İsim girin...') },
        { id: 'Kod', label: t('Cari Koda Göre'), type: 'text', iconName: 'Barcode', placeholder: t('Cari kodu girin...') },
        { id: 'Telefon', label: t('Telefona Göre'), customType: 'phone', iconName: 'Phone', placeholder: '0 (5XX) XXX XX XX' },
        { id: 'Email', label: t('E-Postaya Göre'), type: 'text', iconName: 'AtSign', placeholder: t('E-posta adresi girin...') },
        { id: 'Etiket', label: t('Etikete Göre'), type: 'text', iconName: 'Tag', placeholder: t('Etiket girin...') }
    ], [t]);

    // Tablo Kolonları
    const columns = useMemo(() => [
        {
            accessor: 'adUnvan',
            header: t('Ünvan / Ad Soyad'),
            sortable: true,
            render: (item: any) => (
                <div className="flex items-center gap-12 group">
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
                                {item.tipi === 1 ? item.unvan : (item.unvan || `${item.ad || ''} ${item.soyad || ''}`.trim())}
                            </div>
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
            render: (item: any) => {
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
            accessor: 'vergi',
            header: t('Vergi / TC'),
            sortable: false,
            render: (item: any) => (
                <div>
                    {(item.vergiNo || item.tcKimlikNo) && (
                        <div className="text-13 text-primary">
                            {item.vergiNo || item.tcKimlikNo}
                        </div>
                    )}
                    {item.vergiDairesi && (
                        <div className="text-12 text-secondary">
                            {item.vergiDairesi}
                        </div>
                    )}
                    {!item.vergiNo && !item.tcKimlikNo && !item.vergiDairesi && <span className="text-muted">-</span>}
                </div>
            )
        },
        {
            accessor: 'bakiye',
            header: t('Bakiye'),
            sortable: true,
            align: 'right' as const,
            render: (item: any) => (
                <div>
                    <div className={`font-semibold text-14 ${item.bakiye < 0 ? 'text-danger' : 'text-success'}`}>
                        {item.bakiye ? item.bakiye.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'} {item.paraBirimi || 'TRY'}
                    </div>
                </div>
            )
        }
    ], [t]);

    // Mobil Kart Tasarımı
    const mobileCardRender = useCallback((item: any) => (
        <div 
            className="card p-12 flex flex-col gap-10 cursor-pointer hover:border-accent-primary transition-all"
            onClick={() => handleSelect(item)}
        >
            <div className="flex items-start gap-12">
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
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-8 mb-4">
                        <div className="font-semibold text-primary text-14 truncate">
                            {item.tipi === 1 ? item.unvan : (item.unvan || `${item.ad || ''} ${item.soyad || ''}`.trim())}
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
                        <div className="flex flex-col gap-2 mt-4 text-12 text-secondary">
                            {(item.varsayilanAdresTelefon || item.telefon) && <div>{item.varsayilanAdresTelefon || item.telefon}</div>}
                            {item.email && <div>{item.email}</div>}
                            {(() => {
                                const defAdr = item.adresler?.find((a: any) => a.varsayilanMi) || item.adresler?.[0];
                                const loc = defAdr ? [defAdr.ilceAdi, defAdr.ilAdi].filter(Boolean).join(' / ') : '';
                                return loc ? <div className="text-11 text-secondary opacity-80">{loc}</div> : null;
                            })()}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex justify-between items-center border-t-glass pt-8">
                <div className="text-12 text-secondary">{t('Bakiye')}</div>
                <div className={`font-semibold text-14 ${item.bakiye < 0 ? 'text-danger' : 'text-success'}`}>
                    {item.bakiye ? item.bakiye.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'} {item.paraBirimi || 'TRY'}
                </div>
            </div>
        </div>
    ), [t, handleSelect]);

    // Header ActionMenu Aksiyonları ("Yeni Cari" varsayılan aksiyon olarak tanımlanır)
    const cariActionMenuItems: ActionMenuItem[] = useMemo(() => [
        {
            label: t('Yeni Cari'),
            icon: <Plus size={16} />,
            onClick: handleAddNew,
            default: true,
            isDefault: true
        }
    ], [handleAddNew, t]);

    // Veri Çekme Fonksiyonu
    const handleFetchData = useCallback(async (args: any) => {
        const page = args.page || 1;
        const size = args.pageSize || 50;
        const queryParams: Record<string, any> = {
            sayfa: page,
            sayfaBoyutu: size,
            page,
            pageSize: size,
            sirala: args.sortField || 'adUnvan',
            yon: args.sortOrder || 'asc'
        };

        // Arama metnini GlobalSearch'den gelen aramaData üzerinden dinamik olarak oku
        const activeSearch = (args.aramaData && args.aramaData.value !== undefined)
            ? args.aramaData.value
            : effectiveSearchText;

        if (activeSearch && typeof activeSearch === 'string' && activeSearch.trim().length > 0) {
            const cleanSearch = activeSearch.trim();
            queryParams.aramaKelimesi = cleanSearch;
            queryParams.arama = cleanSearch;
            if (args.aramaData?.type && args.aramaData.type !== 'Tumu') {
                queryParams.aramaTipi = args.aramaData.type;
                queryParams.tip = args.aramaData.type;
            }
        }

        try {
            const res: any = await cariService.getAll(queryParams);
            const items = res?.data || res?.items || res?.veriler || (Array.isArray(res) ? res : []);
            const totalCount = res?.totalCount ?? res?.total ?? res?.toplam ?? items.length;
            return { data: items, totalCount };
        } catch (err) {
            return { data: [], totalCount: 0 };
        }
    }, [effectiveSearchText]);

    if (!isOpen) return null;

    const effectiveOnRowClick = restProps.onRowClick || (!isMultiSelect ? handleSelect : undefined);

    return (
        <BaseSelectionList
            inModal={inModal}
            title={title || t('Cari Seçimi')}
            subtitle={subtitle || t('İşlem yapmak istediğiniz cari hesabı seçin.')}
            icon={<Users size={22} />}
            onClose={onClose}
            initialSearchText={effectiveSearchText}
            actionMenuItems={cariActionMenuItems}
            columns={columns}
            fetchData={handleFetchData}
            searchableFields={cariSearchFields}
            mobileCardRender={mobileCardRender}
            isMultiSelect={isMultiSelect}
            onSelect={handleSelect}
            onMultiSelect={onMultiSelect || handleSelect}
            onRowDoubleClick={handleSelect}
            onRowClick={effectiveOnRowClick}
            defaultSortField="adUnvan"
            defaultSortOrder="asc"
            emptyMessage={t('Arama kriterlerine uygun cari bulunamadı.')}
            {...restProps}
        />
    );
};

export default CariSeciciList;
export { CariSeciciList as CariSeciciModal };
