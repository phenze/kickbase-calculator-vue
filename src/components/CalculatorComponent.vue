<template>
  <v-app-bar :elevation="2">
    <v-app-bar-title>Kickbase Calculator</v-app-bar-title>
    <v-spacer></v-spacer>
    <v-select class="mr-2" :items="selectionItems" density="compact" label="Liga" style="max-width: 250px;" outlined
      hide-details v-model="selectedLeague"></v-select>
    <v-btn @click="logout()" class="mr-2">Logout</v-btn>
  </v-app-bar>

  <v-row>
    <v-col cols="12">
      <template v-if="loadingLeagueDetails">
        <div class="text-center">
          <v-progress-circular :active="loadingLeagueDetails" color="deep-purple" size="80"
            indeterminate></v-progress-circular>
        </div>
      </template>
      <template v-if="!loadingLeagueDetails">
        <v-banner :elevation="2" sticky>
          <div>
            header
          </div>
        </v-banner>
        <v-data-table item-value="i" show-expand v-model:expanded="expanded" hide-default-footer items-per-page="-1"
          :items="currentSquad" :headers="visibleHeaders">
          <template v-slot:item.image="{ item }">
            <v-avatar color="grey-lighten-1">
              <v-img class="pt-2" :src="`https://cdn.kickbase.com/files/players/${item.i}/1`" height="80" width="80"
                fit></v-img>
            </v-avatar>
          </template>

          <template v-slot:item.mv="{ value }">
            <v-chip :color="'grey'">
              {{ formatCurrency(value) }}
            </v-chip>
          </template>

          <template v-slot:item.tfhmvt="{ value }">
            <v-chip :color="getColor(value)">
              {{ formatCurrency(value) }}
            </v-chip>
          </template>

          <template v-slot:item.sdmvt="{ value }">
            <v-chip :color="getColor(value)">
              {{ formatCurrency(value) }}
            </v-chip>
          </template>

          <template v-slot:expanded-row="{ columns, item }">
            <tr>
              <td :colspan="columns.length">
                <v-container fluid class="ma-0 pl-0 pr-0">
                  <v-row>
                    <v-col cols="12">
                      <v-card border="opacity-50 sm" class="mx-auto" rounded="xl" variant="text">
                        <template v-slot:title>
                          <div class="text-caption font-weight-bold">Marktwert</div>
                        </template>

                        <template v-slot:append>
                          <template v-if="item.mvgl >= 0">
                            <v-chip border="success sm opacity-100" color="green" size="small" variant="text">
                              <v-icon icon="mdi-arrow-up" start></v-icon>{{ calculatePercent(item) }}
                            </v-chip>
                          </template>
                          <template v-if="item.mvgl < 0">
                            <v-chip border="error sm opacity-100" color="red" size="small" variant="text">
                              <v-icon icon="mdi-arrow-down" start></v-icon>{{ calculatePercent(item) }}
                            </v-chip>
                          </template>
                        </template>

                        <template v-slot:text>
                          <div class="text-h6 font-weight-black">
                            {{ formatCurrency(item.mv) }}
                          </div>
                          <div class="text-disabled font-weight-black">
                            Gekauft:&nbsp;{{ formatCurrency(item.mv - item.mvgl) }}
                          </div>
                          <CurrencyComponent :value="item.tfhmvt" :description="'seit gestern'" />
                          <CurrencyComponent :value="item.sdmvt" :description="'letzte 7 Tage'" />
                          <CurrencyComponent :value="item.mvgl" :description="'seit Kauf'" />
                        </template>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-container>

              </td>
            </tr>
          </template>

        </v-data-table>
      </template>
    </v-col>

  </v-row>

</template>

<script setup lang="ts">
import { KickbaseLeague } from '@/model/KickbaseLeague';
import { KickbasePlayer } from '@/model/KickbasePlayer';
import { getSquad } from '@/service/ApiService';
import { formatCurrency } from '@/service/HelperService';
import { useAppStore } from '@/stores/app';


const appStore = useAppStore();
const selectedLeague = ref<KickbaseLeague>()
const loadingLeagueDetails = ref(false)
const currentSquad = ref<KickbasePlayer[]>();
const expanded = ref([])
const itemPlayerImageSize = 80
const screenWidth = ref<number>(window.innerWidth);


const selectionItems = computed(() =>
  appStore.leagues.map(t => ({
    title: t.n,
    value: t
  }))
)

const headers = ref([
  {
    title: '',
    key: 'image',
    sortable: false,
    width: itemPlayerImageSize,
    screenWidth: itemPlayerImageSize,
  },
  {
    title: 'Name',
    key: 'n',
    screenWidth: 250,
  },
  {
    title: 'Marktwert',
    key: 'mv',
    screenWidth: 400,
  },
  {
    title: '24 Std Trend',
    key: 'tfhmvt',
    screenWidth: 520,
  },
  {
    title: '7 Tage Trend',
    key: 'sdmvt',
    screenWidth: 650,
  },

])


// const getPosValue = (value: number) => {
//   if (value === 1) {
//     return 'TW'
//   } else if (value === 2) {
//     return 'ABW'
//   } else if (value === 3) {
//     return 'MW'
//   } else if (value === 4) {
//     return 'ANG'
//   }
// }


const calculatePercent = (player: KickbasePlayer) => {
  const buyPrice = player.mv - player.mvgl
  const percent = (player.mv - buyPrice) / player.mv * 100.0;
  return `${Math.ceil(percent)}%`;
}

const getColor = (value: string) => {
  try {
    const numberValue = parseFloat(value)
    if (isNaN(numberValue)) {
      return 'grey'
    }
    if (numberValue > 0) {
      return 'green'
    } else if (numberValue === 0) {
      return 'grey'
    }
    return 'red'
  } catch {
    return 'grey'
  }
}

const logout = () => {
  appStore.logout();
}


watch(selectionItems, () => {
  if (selectionItems.value.length > 0) {
    selectedLeague.value = selectionItems.value[0].value;
  }
})

watch(selectedLeague, async () => {
  loadingLeagueDetails.value = true
  currentSquad.value = await getSquad(selectedLeague.value!.i);
  console.log(currentSquad.value)
  loadingLeagueDetails.value = false

})


const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth;
};


onMounted(() => {
  window.addEventListener('resize', updateScreenWidth);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth);
});

// Berechnete Eigenschaft für die sichtbaren Spalten
const visibleHeaders = computed(() => {
  return headers.value.filter(header => screenWidth.value >= header.screenWidth);
});

</script>

<style scoped></style>
