import type { Ref } from 'vue';
import { onMounted, ref } from 'vue';

export function useClientHydrated(): Ref<boolean> {
  const hydrated = ref(false);
  onMounted(() => {
    hydrated.value = true;
  });
  return hydrated;
}
