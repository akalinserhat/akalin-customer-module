import { BaseDto } from '../types';

export interface CariAdresDto extends BaseDto {
    tipi: number;
    adres: string;
    ulkeId?: number | null;
    sehirId?: number | null;
    ilceId?: number | null;
    mahalleId?: number | null;
    postaKodu?: string;
    varsayilanMi?: boolean;
}

export interface CariDto extends BaseDto {
    tipi: number; // 1: Kurumsal, 2: Bireysel vb.
    tur: number;  // 1: Alıcı, 2: Satıcı vb.
    kod: string;
    unvan?: string;
    ad?: string;
    ortaIsim?: string;
    soyad?: string;
    telefon?: string;
    riskLimiti?: number;
    vadeGun?: number | null;
    tarih?: string | null;
    dogumTarihi?: string | null;
    adresler?: CariAdresDto[];
    bakiye?: number;
    alacakBakiye?: number;
    borcBakiye?: number;
    // İhtiyaca göre diğer alanlar eklenebilir
}

export interface CariCreateDto extends Omit<CariDto, 'id' | 'olusturulmaTarihi' | 'guncellenmeTarihi' | 'silindiMi' | 'bakiye' | 'alacakBakiye' | 'borcBakiye'> {
    // ID oluşturulurken yoktur
}

export interface CariUpdateDto extends Partial<CariCreateDto> {
    id: number;
}
