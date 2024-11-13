<template>
  <v-app-bar :elevation="2">
    <v-app-bar-title>Kickbase Calculator</v-app-bar-title>
    <v-spacer></v-spacer>
    <v-select class="mr-2" :items="leagueSelectionItems" density="compact" label="Liga" style="max-width: 250px;"
      outlined hide-details v-model="selectedLeague"></v-select>
    <v-btn @click="logout()" class="mr-2">Logout</v-btn>
  </v-app-bar>

  <v-row>
    <v-col cols="12">
      <template v-if="loadingLeagueDetails">
        <div class="text-center mt-10">
          <v-progress-circular :active="loadingLeagueDetails" color="deep-purple" size="80"
            indeterminate></v-progress-circular>
        </div>
      </template>
      <template v-if="!loadingLeagueDetails">
        <v-banner :elevation="2" sticky>
          <div>
            Kontostand nach Verkauf: <v-chip :color="getBalanceColor()">{{
              formatCurrency(currentBalance) }}</v-chip>
          </div>
        </v-banner>
        <v-data-table show-select v-model="playersToSellIds" item-selectable="playerSellable"
          v-on:update:modelValue="onUpdateSelectedState()" item-value="i" show-expand v-model:expanded="expanded"
          hide-default-footer items-per-page="-1" :items="currentSquad" :headers="visibleHeaders"
          :row-props="getRowProps">
          <template v-slot:item.image="{ item }">
            <v-avatar color="grey-lighten-1">
              <v-img class="pt-2" :src="`https://cdn.kickbase.com/files/players/${item.i}/1`" height="80" width="80"
                fit></v-img>
            </v-avatar>
          </template>

          <template v-slot:item.n="{ value }">
            <div>{{ value.n }}</div>
            <small>{{ formatCurrency(value.mv) }}</small>
          </template>

          <template v-slot:item.mv="{ value }">
            <v-chip :color="'grey'">
              {{ formatCurrency(value) }}
            </v-chip>
          </template>

          <template v-slot:item.playerSellStatus="{ value }">
            <template v-if="value === 1">
              <v-icon color="red-darken-2" icon="mdi-currency-usd" size="large"></v-icon>
            </template>
            <template v-if="value === 0">
              <v-icon color="green-darken-2" icon="mdi-soccer" size="large"></v-icon>
            </template>
            <template v-if="value === -1">

              <v-icon color="green-darken-2" icon="mdi-lock-outline" size="large"></v-icon>
            </template>
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
                    <v-col cols="12" sm="6">
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
                    <v-col cols="12" sm="6">
                      <v-card border="opacity-50 sm" class="mx-auto" rounded="xl" variant="text">
                        <template v-slot:title>
                          <div class="text-caption font-weight-bold">Funktionen</div>
                        </template>
                        <template v-slot:text>

                          <div class="text-disabled font-weight-black mb-2" v-if="item.playerSellStatus === 0">
                            <v-btn @click="setPlayerSellStatus(item, 1)" rounded="xs" :variant="'tonal'"
                              prepend-icon="mdi-currency-usd">Verkaufen</v-btn>
                          </div>
                          <div class="text-disabled font-weight-black mb-2" v-if="item.playerSellStatus === 1">
                            <v-btn @click="setPlayerSellStatus(item, 0)" rounded="xs" :variant="'tonal'"
                              prepend-icon="mdi-soccer">Behalten</v-btn>
                          </div>
                          <div class="text-disabled font-weight-black" v-if="item.playerSellStatus !== -1">
                            <v-btn rounded="xs" :variant="'tonal'" prepend-icon="mdi-lock-outline"
                              @click="setPlayerSellStatus(item, -1)">Unverkäuflich</v-btn>
                          </div>
                          <div class="text-disabled font-weight-black" v-if="item.playerSellStatus === -1">
                            <v-btn rounded="xs" :variant="'tonal'" prepend-icon="mdi-currency-usd"
                              @click="setPlayerSellStatus(item, 1)">Verkäuflich</v-btn>
                          </div>

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


// Variables

const appStore = useAppStore();
const selectedLeague = ref<KickbaseLeague>()
const loadingLeagueDetails = ref(false)
const currentSquad = ref<KickbasePlayer[]>();
const expanded = ref([])
const playersToSellIds = ref<string[]>([])
const itemPlayerImageSize = 80
const screenWidth = ref<number>(window.innerWidth);
const currentBalance = ref(0)
const leagueSelectionItems = computed(() =>
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
    value: (item: KickbasePlayer) => item,
    screenWidth: 250,
  },
  {
    title: 'VS',
    key: 'playerSellStatus',
    screenWidth: 250,
  },
  {
    title: 'Marktwert',
    key: 'mv',
    screenWidth: 520,
  },
  {
    title: '24 Std Trend',
    key: 'tfhmvt',
    screenWidth: 670,
  },
  {
    title: '7 Tage Trend',
    key: 'sdmvt',
    screenWidth: 790,
  },

])

const visibleHeaders = computed(() => {
  return headers.value.filter(header => screenWidth.value >= header.screenWidth);
});

// Methods

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

const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth;
};

const getBalanceColor = () => {
  if (currentBalance.value > 0) {
    return 'green'
  } else {
    return 'red'
  }
}

const setPlayerSellStatus = (player: KickbasePlayer, status: number) => {
  player.playerSellStatus = status;
  if (status === -1) {
    player.playerSellable = false
  } else {
    player.playerSellable = true
  }
  syncSelectedState()
}

const syncSelectedState = () => {
  const selection: string[] = []
  for (const player of currentSquad.value!) {
    if (player.playerSellStatus === 1) {
      selection.push(player.i)
    }
  }
  playersToSellIds.value = selection
  calculateBalance()
}

const calculateBalance = () => {
  let balanceAfterSell = 0.0
  for (const item of playersToSellIds.value) {
    const player = currentSquad.value?.find(t => t.i === item)
    if (player !== undefined && player.playerSellStatus === 1) {
      balanceAfterSell += player.mv;
    }
  }
  balanceAfterSell += selectedLeague.value!.b
  currentBalance.value = balanceAfterSell
  synchronizePersistantData()
}

const synchronizePersistantData = () => {
  const selectedLeagueId = selectedLeague.value?.i;
  if (!selectedLeagueId) return;

  // search if league is exising
  let leagueDataIndex = appStore.persistantLeagueStats.findIndex(t => t.i === selectedLeagueId);
  let leagueData = leagueDataIndex !== -1
    ? { ...appStore.persistantLeagueStats[leagueDataIndex] }
    : { i: selectedLeagueId, players: [] };

  // refresh league infos
  leagueData.players = currentSquad.value?.map(player => ({
    i: player.i,
    status: player.playerSellStatus
  })) || [];

  // update league info
  if (leagueDataIndex !== -1) {
    appStore.persistantLeagueStats.splice(leagueDataIndex, 1, leagueData);
  } else {
    appStore.persistantLeagueStats.push(leagueData);
  }
}

const getRowProps = (item: any) => {

  const player = item.item as KickbasePlayer
  return {
    class: {
      'bg-sell-valid': player.playerSellStatus === 1 && player.mv <= currentBalance.value,
      'bg-sell-invalid': player.playerSellStatus === 1 && player.mv > currentBalance.value,
    },
  };

}

// events

watch(leagueSelectionItems, () => {
  if (leagueSelectionItems.value.length > 0) {
    selectedLeague.value = leagueSelectionItems.value[0].value;
  }
})

watch(selectedLeague, async () => {
  loadingLeagueDetails.value = true
  currentSquad.value = await getSquad(selectedLeague.value!.i);
  syncSelectedState()
  loadingLeagueDetails.value = false

})

const onUpdateSelectedState = () => {
  for (const player of currentSquad.value!) {
    const selected = playersToSellIds.value.findIndex(t => t === player.i)
    if (player.playerSellStatus !== -1) {
      if (selected !== -1) {
        player.playerSellStatus = 1
      } else {
        player.playerSellStatus = 0
      }
    }
  }
  calculateBalance()
}

onMounted(() => {
  window.addEventListener('resize', updateScreenWidth);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth);
});

</script>

<style>
.bg-sell-valid {
  background-color: rgba(0, 255, 0, 0.05);
}

.bg-sell-invalid {
  background-color: rgba(255, 0, 0, 0.05);
}
</style>
