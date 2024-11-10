/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'
import { useAppStore } from '@/stores/app'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'
import { getLeagues } from './service/ApiService'

const app = createApp(App)

registerPlugins(app)


async function setup() {
    const appStore = useAppStore();
    appStore.isLoggedIn = appStore.token.length > 0
    if (appStore.isLoggedIn) {
        try {
            const leagues = await getLeagues();
            appStore.leagues = leagues;
        } catch {
            appStore.isLoggedIn = false;
        }
    }
    app.mount('#app')
    appStore.initDone = true

}

setup()
