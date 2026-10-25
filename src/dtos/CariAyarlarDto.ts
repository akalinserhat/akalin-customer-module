import { BaseDto } from '../types';

export interface CariAyarlarDto extends BaseDto {
    // TODO: Add properties
}

export interface CariAyarlarCreateDto extends Omit<CariAyarlarDto, 'id' | 'olusturulmaTarihi' | 'guncellenmeTarihi' | 'silindiMi'> {
    // TODO: Add properties
}

export interface CariAyarlarUpdateDto extends Partial<CariAyarlarCreateDto> {
    id: number;
}
