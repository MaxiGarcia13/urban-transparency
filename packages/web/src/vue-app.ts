import type { App } from 'vue';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { getQueryClient } from './query-client';

export default (app: App) => {
  app.use(VueQueryPlugin, { queryClient: getQueryClient() });
};
