<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
</script>

<template>
  <Card
    class="w-full bg-card/60 py-0"
    aria-hidden="true"
  >
    <CardContent class="flex flex-col gap-2 p-4">
      <Skeleton class="h-4 w-4/5 rounded-xl" />
      <Skeleton class="h-2 w-16 rounded-xl" />
      <Skeleton class="h-4 w-3/5 rounded-xl" />
      <Skeleton class="h-4 w-2/3 rounded-xl" />
      <Skeleton class="h-2 w-24 rounded-xl" />
      <Skeleton class="h-6 w-28 rounded-xl bg-orange-950/80" />
      <Skeleton class="h-4 w-48 rounded-xl bg-orange-950/50" />
    </CardContent>
  </Card>
</template>
