<template>
  <AppLayoutMain>
    <section class="space-y-4 px-3">
      <div
        v-for="column in columns"
        :key="column.title"
        class="cy--about-column flex overflow-x-auto rounded-md border-1 border-transparent bg-white p-4 duration-200 hover:border-primary-30"
      >
        <router-link
          v-if="column.title === 'author'"
          v-slot="{ navigate }"
          :to="{ name: AppRouteNames.Bubble, params: { iconName: 'potum' } }"
          custom
        >
          <div class="mb-4 mr-3 flex-shrink-0 rounded-full" @click="navigate">
            <div class="px-4 text-primary-70">
              {{ t(`app.about.${column.title}.title`) }}
            </div>
            <div class="mt-0.5 h-1 rounded-full bg-primary-30" />
          </div>
        </router-link>
        <div v-else class="mb-4 mr-3 flex-shrink-0 rounded-full">
          <div class="px-4 text-primary-70">
            {{ t(`app.about.${column.title}.title`) }}
          </div>
          <div class="mt-0.5 h-1 rounded-full bg-primary-30" />
        </div>
        <div class="pl-4 pr-2 pt-2">
          <template v-if="column.title === 'partnership'">
            <div class="relative w-96 rounded-b-lg shadow-lg">
              <div
                class="bg-no-repeat h-28 bg-cover bg-center"
                :style="{
                  backgroundImage: `url('${discordGroupData.splashUrl}')`,
                }"
              />
              <cy-icon-text
                icon="mdi:discord"
                class="absolute right-2 top-2"
                icon-width="2rem"
              />
              <div
                class="flex w-full items-center rounded-b-lg bg-primary-20 px-4 py-2.5"
              >
                <div class="overflow-hidden rounded">
                  <img
                    :src="discordGroupData.iconUrl"
                    alt="#"
                    width="50"
                    height="50"
                  />
                </div>
                <div class="pl-4">
                  <div class="text-xl text-primary-90">Toram's Pelulu</div>
                  <div>
                    <cy-icon-text
                      icon="ic:baseline-person"
                      small
                      text-color="fuchsia-80"
                      icon-color="fuchsia-50"
                    >
                      {{ discordGroupData.memberNumbers }}
                    </cy-icon-text>
                  </div>
                </div>
                <cy-button-action
                  link
                  href="https://discord.com/invite/FKG6RVT975"
                  target="_blank"
                  class="ml-auto"
                >
                  {{ t('app.about.partnership.join') }}
                </cy-button-action>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="mb-6 text-sm text-fuchsia-60">
              <div>{{ t(`app.about.${column.title}.sub-title`) }}</div>
            </div>
            <div class="space-y-2 pb-2">
              <div v-for="item in column.list" :key="item.title">
                <div
                  v-if="!item.title.startsWith('@')"
                  class="text-sm text-primary-50"
                >
                  {{ t(`app.about.${column.title}.${item.title}`) }}
                </div>
                <div class="py-2 pl-4">
                  <template
                    v-for="value in item.list"
                    :key="
                      typeof value === 'object'
                        ? `${value.main}|${value.sub}`
                        : value
                    "
                  >
                    <template
                      v-if="typeof value === 'string' && value.startsWith('@')"
                    >
                      <div v-if="value === '@line'" class="my-2.5" />
                    </template>
                    <span
                      v-else
                      class="relative inline-flex pl-4 pr-3"
                      :class="
                        typeof value === 'string' && value.endsWith('@hide')
                          ? 'opacity-0 hover:opacity-100 hover:delay-500 hover:duration-150'
                          : ''
                      "
                    >
                      <div
                        class="absolute left-0 top-1 h-2 w-2 rounded-full bg-primary-30"
                      />
                      <span v-if="typeof value === 'string'">
                        {{
                          value.endsWith('@hide') ? value.slice(0, -5) : value
                        }}
                      </span>
                      <span v-else class="inline-flex flex-wrap items-center">
                        <span>{{ value.main }}</span>
                        <span
                          class="ml-2 border-l border-r border-solid border-blue-60 px-2 text-blue-60"
                        >
                          {{ value.sub }}
                        </span>
                      </span>
                    </span>
                  </template>
                </div>
              </div>
            </div>
          </template>
          <div v-if="column.title === 'author'" class="mt-4 px-3">
            <a
              href="https://github.com/aishimeth2135/Toram_Grimoire"
              target="_blank"
            >
              <cy-icon-text
                icon="mdi:github"
                icon-color="cyan-60"
                icon-width="2rem"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
    <section class="px-5 pb-12 pt-5">
      <i18n-t
        keypath="app.about.disclaimer"
        tag="div"
        class="content"
        scope="global"
      >
        <template #link>
          <a
            class="text-primary-50 underline"
            href="https://asobimo.com/"
            target="_blank"
          >
            アソビモ株式会社（ASOBIMO,Inc.）
          </a>
        </template>
      </i18n-t>
    </section>
  </AppLayoutMain>
</template>

<script lang="ts">
export default {
  name: 'AppAbout',
}
</script>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'
import { AppRouteNames } from '@/router/enums'

const { t } = useI18n()

const columns: {
  title: string
  list: {
    title: string
    list: (string | { main: string; sub: string })[]
  }[]
}[] = [
  {
    title: 'author',
    list: [
      {
        title: 'toram-id',
        list: ['Cyteria'],
      },
    ],
  },
  {
    title: 'team',
    list: [
      {
        title: 'main',
        list: ['緋月音', '輕沂@hide'],
      },
      {
        title: 'skill-data',
        list: ["(Discord) Phantom's Library"],
      },
      {
        title: 'equipment-data',
        list: ['真白', '萌月'],
      },
    ],
  },
  {
    title: 'partnership',
    list: [],
  },
  {
    title: 'sponsor',
    list: [
      {
        title: 'group',
        list: [
          {
            main: '曼珠沙華',
            sub: '眾神幣',
          },
          '@line',
          {
            main: '被世人遺忘的角落',
            sub: '眾神幣',
          },
          '@line',
          {
            main: '奇鴉譜月',
            sub: '眾神幣',
          },
        ],
      },
      {
        title: 'personal',
        list: [
          {
            main: '繆絢ゞ',
            sub: '眾神幣',
          },
          {
            main: '憂子迷',
            sub: '眾神幣',
          },
          {
            main: 'Miriam魚蔥',
            sub: '眾神幣',
          },
          '@line',
          {
            main: '溫柔善良大方得體的匿名者',
            sub: '單手劍穿孔0~2',
          },
          '@line',
          {
            main: '律',
            sub: '眾神幣',
          },
          '@line',
          {
            main: '曄痕/櫻雨痕',
            sub: '眾神幣',
          },
          {
            main: '夜神散華 禮彌/（曄之妹）',
            sub: '眾神幣',
          },
          '@line',
          {
            main: '✩cuxin',
            sub: '眾神幣',
          },
          {
            main: '紺野木綿季、優紀',
            sub: '眾神幣',
          },
          '@line',
          {
            main: '梦月姬D、moon',
            sub: '眾神幣',
          },
        ],
      },
    ],
  },
  {
    title: 'words',
    list: [
      {
        title: '@1',
        list: [t('app.about.words.contents.0')],
      },
      {
        title: '@2',
        list: [t('app.about.words.contents.1')],
      },
      {
        title: '@3',
        list: [t('app.about.words.contents.2')],
      },
    ],
  },
]

const discordGroupData = ref({
  name: "Toram's Pelulu",
  memberNumbers: '',
  iconUrl: '#',
  splashUrl: '#',
  loaded: false,
})

const fetchDiscordData = async () => {
  try {
    const res = await fetch(
      'https://discord.com/api/v9/invites/FKG6RVT975?with_counts=true'
    )
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
