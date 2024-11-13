<template>

  <v-container fluid class="pa-0">
    <template v-if="!isLoading">
      <HomeComponent v-if="!isLoggedIn" />
      <CalculatorComponent v-if="isLoggedIn" />
    </template>
    <template v-if="isLoading">
      <div class="text-center mt-10">
        <v-progress-circular v-if="isLoading" :size="100" color="primary" indeterminate></v-progress-circular>
      </div>
    </template>

    <v-snackbar v-model="showSnackbar">
      {{ snackbarText }}
    </v-snackbar>

  </v-container>
</template>

<script lang="ts" setup>

import { useAppStore } from '@/stores/app';
import { computed } from 'vue';
const appStore = useAppStore()
const isLoading = computed(() => !appStore.initDone);
const isLoggedIn = computed(() => appStore.isLoggedIn);

const showSnackbar = computed(() => appStore.showErrorMessage);
const snackbarText = computed(() => appStore.errorMessage);

</script>
