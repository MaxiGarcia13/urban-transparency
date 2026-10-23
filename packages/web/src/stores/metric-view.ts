import type { MetricView } from '@/config/metrics';
import { atom } from 'nanostores';

export const $metricView = atom<MetricView>('map');
