<script setup lang="ts">
import type { MapRegion } from '@/config/regions';
import { Check, ChevronDown } from 'lucide-vue-next';
import {
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from 'reka-ui';
import { MAP_REGIONS } from '@/config/regions';
import { cn } from '@/lib/utils';

withDefaults(
  defineProps<{
    regions?: readonly MapRegion[];
  }>(),
  {
    regions: () => MAP_REGIONS,
  },
);

const regionId = defineModel<string>('regionId', { required: true });
</script>

<template>
  <SelectRoot v-model="regionId">
    <SelectTrigger
      :class="cn(
        'inline-flex items-center gap-2 align-baseline',
        'text-[length:inherit] leading-[inherit] font-semibold text-inherit',
        'underline decoration-white/30 decoration-2 underline-offset-4',
        'outline-none transition-colors hover:decoration-white/60',
        'focus-visible:decoration-orange-400',
      )"
      aria-label="Seleccionar región"
    >
      <SelectValue placeholder="Región" />
      <SelectIcon as-child>
        <ChevronDown class="size-[0.55em] shrink-0 translate-y-[0.06em] text-current" />
      </SelectIcon>
    </SelectTrigger>

    <SelectPortal>
      <SelectContent
        position="popper"
        :side-offset="8"
        :class="cn(
          'z-50 min-w-40 overflow-hidden rounded-xl border border-white/10',
          'bg-zinc-950 p-2 text-zinc-100 shadow-lg',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        )"
      >
        <SelectViewport class="flex flex-col gap-2">
          <SelectItem
            v-for="region in regions"
            :key="region.id"
            :value="region.id"
            :class="cn(
              'relative flex cursor-pointer items-center rounded-xl px-4 py-2 pr-10 text-base outline-none select-none',
              'data-[highlighted]:bg-white/10 data-[state=checked]:text-orange-400',
            )"
          >
            <SelectItemText>
              {{ region.name }}
            </SelectItemText>
            <SelectItemIndicator
              class="absolute right-2 flex size-4 items-center justify-center"
            >
              <Check class="size-4" />
            </SelectItemIndicator>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
