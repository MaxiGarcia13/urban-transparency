<script setup lang="ts">
import { ref } from 'vue';
import LandingHero from '@/components/landing-hero.vue';
import SpendingMap from '@/components/spending-map/spending-map.vue';

const searchQuery = ref('');
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-zinc-950 lg:flex-row">
    <div class="w-full shrink-0 border-b border-white/10 lg:w-md lg:border-r lg:border-b-0">
      <LandingHero v-model:search-query="searchQuery" />
    </div>
    <div class="min-h-96 flex-1 lg:min-h-dvh">
      <SpendingMap :search-query="searchQuery" />
    </div>
  </div>
</template>
