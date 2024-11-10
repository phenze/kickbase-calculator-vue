// Utilities
import { defineStore } from 'pinia'
import { KickbaseLeague } from '@/model/KickbaseLeague'

export const useAppStore = defineStore('app', {
  state: () => ({
    initDone: false,
    isLoggedIn: false,
    showErrorMessage: false,
    errorMessage: '',
    token: '',
    leagues: [] as KickbaseLeague[],
    //
  }),

  actions: {
    showError(error: string) {
      this.$state.showErrorMessage = true;
      this.$state.errorMessage = error;
      setTimeout(() => {
        this.$state.showErrorMessage = false;
      }, 3000);

    },
    setToken(token: string) {
      this.token = token
    },
    clearToken() {
      this.token = ''
    },
  },
  persist: {
    storage: localStorage,
    pick: ['token'],
  },
})
