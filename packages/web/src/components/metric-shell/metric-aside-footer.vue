<script setup lang="ts">
import { useStore } from '@nanostores/vue';
import { PhGithubLogo, PhLightbulb } from '@phosphor-icons/vue';
import { GITHUB_ISSUES_URL, GITHUB_REPO_URL } from '@/config/product';
import { $metricAsideCollapsed } from '@/stores/metric-aside-ui';

const isAsideCollapsed = useStore($metricAsideCollapsed);
</script>

<template>
  <footer
    v-show="!isAsideCollapsed"
    class="mt-auto shrink-0 border-t border-white/10 px-4 py-2 md:px-8"
  >
    <nav
      class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground"
      aria-label="Colaborar"
    >
      <a
        :href="GITHUB_REPO_URL"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 rounded-xl transition-colors hover:text-foreground"
      >
        <PhGithubLogo
          class="size-4 shrink-0"
          aria-hidden="true"
        />
        Contribuir
      </a>
      <a
        :href="GITHUB_ISSUES_URL"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 rounded-xl transition-colors hover:text-foreground"
      >
        <PhLightbulb
          class="size-4 shrink-0"
          aria-hidden="true"
        />
        Reportar un problema o idea
      </a>
    </nav>
  </footer>
</template>
