import { BaseService } from './BaseService';
import httpClient from './httpClient';
import { CariDto, CariCreateDto, CariUpdateDto } from '../dtos/CariDto';

class CariService extends BaseService<CariDto, CariCreateDto, CariUpdateDto> {
  constructor() {
    super('/api/Cari');
  }

  // Cariye özel ekstra metotlar eklenebilir.
  // Örneğin, spesifik bir carinin bakiyesini getiren veya 
  // carilerle ilgili toplu işlem yapan bir metot:
  
  public async getBakiyeSorgula(id: number): Promise<{ bakiye: number; alacak: number; borc: number }> {
    // Örnek endpoint
    const response = await httpClient.get<{ bakiye: number; alacak: number; borc: number }>(`${this.basePath}/${id}/bakiye`);
    return response.data;
  }
}

// Singleton olarak instance oluşturup dışarı aktarıyoruz.
export const cariService = new CariService();
