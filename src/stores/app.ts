// Utilities
import { defineStore } from 'pinia'
import { KickbaseLeague } from '@/model/KickbaseLeague'
import { getLeagues } from '@/service/ApiService';

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

    logout() {
      this.token = ''
      this.isLoggedIn = false;
      this.leagues = []
    },

    async login(token: string) {
      this.token = token
      this.isLoggedIn = true;
      try {
        const leagues = await getLeagues();
        this.leagues = leagues;
      } catch {
        this.isLoggedIn = false;
        this.leagues = []
      }
    }
  },
  persist: {
    storage: localStorage,
    pick: ['token'],
  },
})
