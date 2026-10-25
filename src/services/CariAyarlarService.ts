import { BaseService } from './BaseService';
import httpClient from './httpClient';
import { CariAyarlarDto, CariAyarlarCreateDto, CariAyarlarUpdateDto } from '../dtos/CariAyarlarDto';

class CariAyarlarService extends BaseService<CariAyarlarDto, CariAyarlarCreateDto, CariAyarlarUpdateDto> {
  constructor() {
    super('/api/CariAyarlar');
  }
}

export const cariAyarlarService = new CariAyarlarService();
