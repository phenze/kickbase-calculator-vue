<template>
  <small class="mt-2 text-caption text-medium-emphasis d-flex justify-space-between align-center">
    <div>
      <template v-if="value >= 0">
        <span class="text-green">
          <v-avatar icon="mdi-arrow-up" size="small" variant="tonal"></v-avatar>
          {{ formatCurrency(value) }}
        </span>
      </template>
      <template v-if="value < 0">
        <span class="text-red">
          <v-avatar icon="mdi-arrow-down" size="small" variant="tonal"></v-avatar>
          {{ formatCurrency(value) }}
        </span>
      </template>
      {{ description }}
    </div>
  </small>
</template>

<script setup lang="ts">

import { formatCurrency } from '@/service/HelperService';

defineProps<{
  value: number,
  description: string
}>()


</script>
