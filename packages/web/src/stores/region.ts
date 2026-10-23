import { atom } from 'nanostores';
import { CANTABRIA_REGION_ID } from '@/config/regions';

export const $regionId = atom<string>(CANTABRIA_REGION_ID);
