<script setup lang="ts">
import type { MetricView } from '@/config/metrics';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const view = defineModel<MetricView>('view', { required: true });
</script>

<template>
  <div
    class="pointer-events-none absolute bottom-4 left-4 z-2 flex gap-2 lg:top-4 lg:bottom-auto"
  >
    <div
      class="pointer-events-auto flex gap-2 rounded-xl border border-white/10 bg-zinc-950/90 p-2 backdrop-blur-md"
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        :aria-pressed="view === 'list'"
        :class="cn(
          'rounded-xl px-4',
          view === 'list' ? 'bg-white/10 text-foreground' : 'text-muted-foreground',
        )"
        @click="view = 'list'"
      >
        Lista
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        :aria-pressed="view === 'map'"
        :class="cn(
          'rounded-xl px-4',
          view === 'map' ? 'bg-white/10 text-foreground' : 'text-muted-foreground',
        )"
        @click="view = 'map'"
      >
        Mapa
      </Button>
    </div>
  </div>
</template>
