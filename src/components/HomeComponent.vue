<template>


  <v-row>
    <v-col cols="12">
      <v-img class="mb-4" height="150" src="@/assets/logo.png" />

      <div class="text-center">
        <div class="text-body-2 font-weight-light mb-n1">Willkommen beim</div>

        <h1 class="text-h2 font-weight-bold">Kickbase Calculator</h1>
      </div>

      <div class="py-4" />

    </v-col>
    <v-col cols="12">
      <v-card class="py-4" color="surface-variant" rounded="lg" variant="outlined" :loading="loginActive"
        :disabled="loginActive" subtitle="Hier kannst du dich mit deinen Kickbase Zugangsdaten einloggen">
        <template v-slot:title>
          <span class="font-weight-black">Login</span>
        </template>

        <v-form @submit.prevent ref="form">
          <v-card-item>
            <v-text-field v-model="username" :rules="[v => !!v || 'Bitte Username eingeben']"
              label="Username"></v-text-field>
            <v-text-field v-model="password" :rules="[v => !!v || 'Bitte Passwort eingeben']" label="Password"
              type="password"></v-text-field>
          </v-card-item>
          <v-card-actions>
            <v-btn color="deep-purple-lighten-2" text="Login" type="submit" block border @click="doLogin"></v-btn>
          </v-card-actions>
        </v-form>

        <template v-slot:loader="{ isActive }">
          <v-progress-linear :active="isActive" color="deep-purple" height="4" indeterminate></v-progress-linear>
        </template>
      </v-card>
    </v-col>

    <v-col cols="6">
      <v-card append-icon="mdi-open-in-new" class="py-4" color="surface-variant"
        href="https://pascalhenze.de/kickbase-doc/" prepend-icon="mdi-text-box-outline" rel="noopener noreferrer"
        rounded="lg" subtitle="Wissenswertes über den Kickbase Calculator" target="_blank" title="Dokumentation"
        variant="text">
        <v-overlay opacity=".06" scrim="primary" contained model-value persistent />
      </v-card>
    </v-col>

    <v-col cols="6">
      <v-card append-icon="mdi-open-in-new" class="py-4" color="surface-variant"
        href="https://vuetifyjs.com/introduction/why-vuetify/#feature-guides" prepend-icon="mdi-star-circle-outline"
        rel="noopener noreferrer" rounded="lg" subtitle="Wie komme ich an Zugangsdaten?" target="_blank"
        title="Zugangsdaten" variant="text">
        <v-overlay opacity=".06" scrim="primary" contained model-value persistent />
      </v-card>
    </v-col>
  </v-row>

</template>

<script setup lang="ts">
import { sendLoginRequest } from '@/service/ApiService';
import { useAppStore } from '@/stores/app';

//
const appStore = useAppStore()

const loginActive = ref(false)
const username = ref('')
const password = ref('')
const form = useTemplateRef('form')

const doLogin = async () => {
  if (form.value?.isValid) {

    loginActive.value = true

    console.log(username.value)
    console.log(password.value)

    try {
      const resrult = await sendLoginRequest(username.value, password.value);
      console.log(resrult);
      loginActive.value = false
    } catch (err: unknown) {
      console.log(`error during login`, err)
      appStore.showError('Fehler beim Login. Bitte Username und Passwort überprüfen')
      loginActive.value = false
    }
  }
}

</script>
