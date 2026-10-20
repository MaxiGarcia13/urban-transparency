<script setup lang="ts">
const searchQuery = defineModel<string>('searchQuery', { default: '' });

const metrics = [
  { id: 'spending', label: 'Gasto público', enabled: true },
  { id: 'business', label: 'Empresas', enabled: false },
  { id: 'income', label: 'Renta', enabled: false },
  { id: 'rent', label: 'Alquiler', enabled: false },
] as const;
</script>

<template>
  <aside class="flex h-full flex-col justify-between gap-8 p-6 text-zinc-100 md:p-8">
    <div class="flex flex-col gap-8">
      <p class="text-sm font-medium tracking-wide text-orange-300 uppercase">
        UrbanClarity 3D
      </p>

      <div class="flex flex-col gap-4">
        <h1 class="max-w-md text-4xl leading-tight font-semibold text-balance md:text-5xl">
          ¿Dónde va el
          <span class="text-orange-400">gasto público</span>
          de tu ciudad?
        </h1>
        <p class="max-w-md text-base leading-relaxed text-zinc-400">
          Explora adjudicaciones municipales sobre el mapa. Ahora mismo ves datos de
          prueba de Santander inspirados en PLACSP.
        </p>
      </div>

      <label class="flex flex-col gap-2">
        <span class="text-sm text-zinc-400">Busca un barrio o contrato</span>
        <input
          v-model="searchQuery"
          type="search"
          name="neighborhood-search"
          placeholder="Centro, Sardinero, Obras Norte…"
          class="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-4 text-base text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-orange-400/60"
        >
      </label>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="metric in metrics"
          :key="metric.id"
          type="button"
          class="rounded-xl px-4 py-2 text-sm"
          :class="
            metric.enabled
              ? 'bg-orange-500/20 text-orange-200 ring-1 ring-orange-400/40'
              : 'bg-zinc-900 text-zinc-500 ring-1 ring-white/5'
          "
          :disabled="!metric.enabled"
          :title="metric.enabled ? undefined : 'Próximamente'"
        >
          {{ metric.label }}
          <span v-if="!metric.enabled" class="ml-2 text-xs">Próximamente</span>
        </button>
      </div>
    </div>

    <p
      class="w-fit rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-2 text-xs tracking-wide text-zinc-400 uppercase"
    >
      Datos de prueba · inspirado en PLACSP
    </p>
  </aside>
</template>
