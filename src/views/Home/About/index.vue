<template>
  <AppLayoutMain>
    <section>
      <div
        v-for="(column, idx) in columns"
        :key="column.title"
        class="cy--about-column flex p-4 bg-white rounded-md m-4 border-1 border-transparent hover:border-light-2 duration-200 overflow-x-auto"
      >
        <router-link
          v-if="idx === 0"
          v-slot="{ navigate }"
          :to="{ name: AppRouteNames.Bubble, params: { iconName: 'potum' } }"
          custom
        >
          <div class="flex-shrink-0 rounded-full mr-3 mb-4" @click="navigate">
            <div class="text-dark-light px-4">{{ t(`app.about.${column.title}.title`) }}</div>
            <div class="h-1 rounded-full bg-light mt-0 5" />
          </div>
        </router-link>
        <div v-else class="flex-shrink-0 rounded-full mr-3 mb-4">
          <div class="text-dark-light px-4">{{ t(`app.about.${column.title}.title`) }}</div>
          <div class="h-1 rounded-full bg-light mt-0 5" />
        </div>
        <div class="pl-3 mt-2">
          <template v-if="column.title !== 'partnership'">
            <div class="text-sm text-purple mb-3">
              <div>{{ t(`app.about.${column.title}.sub-title`) }}</div>
            </div>
            <div v-for="item in column.list" :key="item.title" class="mx-3">
              <div
                v-if="!item.title.startsWith('@')"
                class="text-sm text-light-3"
              >
                {{ t(`app.about.${column.title}.${item.title}`) }}
              </div>
              <div class="py-2 pl-4">
                <template
                  v-for="value in item.list"
                  :key="typeof value === 'object' ? `${value.main}|${value.sub}` : value"
                >
                  <template v-if="(typeof value === 'string') && value.startsWith('@')">
                    <div v-if="value === '@line'" class="my-2.5" />
                    <div v-if="value === '@end'" class="mb-3" />
                  </template>
                  <span
                    v-else
                    class="inline-flex pr-3 relative pl-4"
                  >
                    <div class="absolute left-0 top-1 w-2 h-2 bg-light rounded-full" />
                    <span v-if="(typeof value === 'string')">{{ value }}</span>
                    <span v-else class="inline-flex items-center flex-wrap">
                      <span>{{ value.main }}</span>
                      <span class="px-2 ml-2 text-water-blue border-l border-r border-solid border-water-blue">{{ value.sub }}</span>
                    </span>
                  </span>
                </template>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="relative rounded-b-lg w-96 shadow-lg">
              <div
                class="h-28 bg-cover bg-no-repeat bg-center"
                :style="{
                  backgroundImage: `url('${discordGroupData.splashUrl}')`,
                }"
              />
              <cy-icon-text icon="mdi:discord" class="absolute top-2 right-2" icon-width="2rem" />
              <div class="w-full bg-light flex items-center py-2.5 px-4 rounded-b-lg">
                <div class="rounded overflow-hidden">
                  <img :src="discordGroupData.iconUrl" alt="#" width="50" height="50">
                </div>
                <div class="pl-4">
                  <div class="text-xl text-dark">Toram's Pelulu</div>
                  <div>
                    <cy-icon-text icon="ic:baseline-person" small text-color="purple" icon-color="purple-light">
                      {{ discordGroupData.memberNumbers }}
                    </cy-icon-text>
                  </div>
                </div>
                <cy-button-action link href="https://discord.com/invite/FKG6RVT975" target="_blank" class="ml-auto">
                  {{ t('app.about.partnership.join') }}
                </cy-button-action>
              </div>
            </div>
          </template>
        </div>
      </div>
    </section>
    <section class="pt-5 pb-12 px-5">
      <div class="content" v-html="disclaimer">
      </div>
    </section>
  </AppLayoutMain>
</template>

<script lang="ts">
export default {
  name: 'AppAbout',
}
</script>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'

import { AppRouteNames } from '@/router/enums'
import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'

const { t } = useI18n()

const columns: {
  title: string;
  list: {
    title: string;
    list: (string | { main: string; sub: string })[];
  }[];
}[] = [{
  title: 'author',
  list: [{
    title: 'toram-id',
    list: ['Cyteria'],
  }],
}, {
  title: 'team',
  list: [{
    title: 'skill-data',
    list: ['緋月音', '(Discord) Phantom\'s Library'],
  }, {
    title: 'equipment-data',
    list: ['緋月音', '真白', '萌月'],
  }, {
    title: 'other',
    list: ['萌月', '太極魚'],
  }],
}, {
  title: 'partnership',
  list: [],
}, {
  title: 'sponsor',
  list: [{
    title: 'group',
    list: [{
      main: '曼珠沙華',
      sub: '眾神幣',
    }, '@line', {
      main: '被世人遺忘的角落',
      sub: '眾神幣',
    }, '@line', {
      main: '奇鴉譜月',
      sub: '眾神幣',
    }, '@end'],
  }, {
    title: 'personal',
    list: [{
      main: '繆絢ゞ',
      sub: '眾神幣',
    }, {
      main: '憂子迷',
      sub: '眾神幣',
    }, {
      main: 'Miriam魚蔥',
      sub: '眾神幣',
    }, '@line', {
      main: '溫柔善良大方得體的匿名者',
      sub: '單手劍穿孔0~2',
    }, '@line', {
      main: '律',
      sub: '眾神幣',
    }, '@line', {
      main: '曄痕/櫻雨痕',
      sub: '眾神幣',
    }, {
      main: '夜神散華 禮彌/（曄之妹）',
      sub: '眾神幣',
    }, '@line', {
      main: '✩cuxin',
      sub: '眾神幣',
    }, {
      main: '紺野木綿季、優紀',
      sub: '眾神幣',
    }, '@end'],
  }],
}, {
  title: 'words',
  list: [{
    title: '@1',
    list: [t('app.about.words.contents.0')],
  }, {
    title: '@2',
    list: [t('app.about.words.contents.1')],
  }, {
    title: '@3',
    list: [t('app.about.words.contents.2')],
  }],
}]

const disclaimer = t('app.about.disclaimer', {
  link: '<a class="text-light-3 underline" href="https://asobimo.com/" target="_blank">アソビモ株式会社（ASOBIMO,Inc.）</a>',
})

const discordGroupData = ref({
  name: 'Toram\'s Pelulu',
  memberNumbers: '',
  iconUrl: '#',
  splashUrl: '#',
  loaded: false,
})

const fetchDiscordData = async () => {
  try {
    const res = await fetch('https://discord.com/api/v9/invites/FKG6RVT975?with_counts=true')
    const data = await res.json()
    const guild = data.guild
    discordGroupData.value = {
      name: guild.name,
      memberNumbers: data.approximate_member_count + '',
      iconUrl: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=64`,
      splashUrl: `https://cdn.discordapp.com/splashes/${guild.id}/${guild.splash}.jpg?size=512`,
      loaded: true,
    }
  } catch (err) {
    //
  }
}

fetchDiscordData()
</script>

<style lang="postcss" scoped>
.cy--about-column {
  @media screen and (max-width: 50rem) {
    flex-wrap: wrap;
  }
}
</style>
