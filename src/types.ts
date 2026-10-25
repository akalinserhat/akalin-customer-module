/**
 * @file types.ts
 * @description @akalin/customer_module için temel veri modelleri ve tip tanımları.
 */

export interface BaseDto {
    id: number;
    olusturulmaTarihi?: string;
    guncellenmeTarihi?: string;
    silindiMi?: boolean;
}

export interface PaginatedResult<T> {
    items: T[];
    totalCount: number;
    pageIndex: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export * from './dtos/CariDto';
export * from './dtos/CariAyarlarDto';
