<script setup lang="ts">
import { computed } from 'vue';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const props = defineProps<{
  title: string | null;
  description: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const isOpen = computed({
  get: () => props.title != null,
  set: (open) => {
    if (!open) {
      emit('close');
    }
  },
});
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-h-[min(90vh,40rem)] gap-6 overflow-hidden sm:max-w-lg">
      <DialogHeader v-if="title">
        <DialogTitle>
          {{ title }}
        </DialogTitle>
        <DialogDescription>
          {{ description }}
        </DialogDescription>
      </DialogHeader>

      <div class="min-h-0 overflow-y-auto overscroll-contain pr-1">
        <slot />
      </div>
    </DialogContent>
  </Dialog>
</template>
