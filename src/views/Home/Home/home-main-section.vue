<template>
  <section class="flex flex-col">
    <div
      class="relative z-5 my-auto space-y-3 py-2"
      :class="{ 'pt-8': device.isMobile }"
    >
      <HomeLinkGroup
        v-for="(group, idx) in groups"
        v-bind="groupDatas[idx]"
        :key="group.id"
      >
        <HomeLinkButton
          v-for="data in group.links"
          :key="data.name + '|' + data.pathName"
          :data="data"
        />
      </HomeLinkGroup>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { useMainStore } from '@/stores/app/main'

import { ROUTE_LINK_DATAS, type RouteLinkData } from '@/shared/consts/route'
import { useDevice } from '@/shared/setup/Device'

import { CharacterSimulatorRouteNames } from '@/router/Character'
import { AppRouteNames } from '@/router/enums'

import HomeLinkButton from './home-link-button.vue'
import HomeLinkGroup from './home-link-group.vue'

const { device } = useDevice()

const columns = ROUTE_LINK_DATAS

const mainStore = useMainStore()

const groups = (() => {
  const linkMap = new Map<string, RouteLinkData>()
  columns.forEach(col => linkMap.set(col.pathName, col))

  const _handle = (items: string[]) => items.map(item => linkMap.get(item)!)
  return [
    {
      id: 'query',
      links: _handle([
        AppRouteNames.SkillQuery,
        AppRouteNames.ItemQuery,
        AppRouteNames.CrystalQuery,
        AppRouteNames.RegistletQuery,
      ]),
    },
    {
      id: 'character',
      links: _handle(
        mainStore.devMode
          ? [
              AppRouteNames.CharacterSimulator,
              AppRouteNames.DamageCalculation,
              CharacterSimulatorRouteNames.Skill,
              AppRouteNames.MainQuestCalc,
            ]
          : [
              AppRouteNames.CharacterSimulator,
              AppRouteNames.DamageCalculation,
              CharacterSimulatorRouteNames.Skill,
            ]
      ),
    },
    {
      id: 'enchant',
      links: _handle([
        AppRouteNames.EnchantSimulator,
        AppRouteNames.EnchantDoll,
      ]),
    },
    {
      id: 'other',
      links: _handle([AppRouteNames.GlossaryQuery]),
    },
  ]
})()

const groupDatas = [
  {
    icon: 'ic:round-search',
    color: 'emerald',
  },
  {
    icon: 'ant-design:build-outlined',
    color: 'fuchsia',
  },
  {
    icon: 'mdi-cube-scan',
    color: 'cyan',
  },
  {
    icon: 'icon-park-outline:other',
    color: 'gray',
  },
]
</script>
