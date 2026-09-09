<template>
  <section class="flex flex-col">
    <div class="z-5 relative my-auto space-y-3 py-2" :class="{ 'pt-8': device.isMobile }">
      <HomeLinkGroup v-for="(group, idx) in groups" v-bind="groupDatas[idx]" :key="group.id">
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
import { ROUTE_LINK_DATAS, type RouteLinkData } from '@/shared/consts/route'
import { useDevice } from '@/shared/setup/Device'

import { AppRouteNames } from '@/router/enums'

import HomeLinkButton from './home-link-button.vue'
import HomeLinkGroup from './home-link-group.vue'

const { device } = useDevice()

const columns = ROUTE_LINK_DATAS

const groups = (() => {
  const linkMap = new Map<string, RouteLinkData>()
  columns.forEach(col => linkMap.set(col.pathName, col))

  const _handle = (items: string[]) => items.map(item => linkMap.get(item)!)
  return [
    {
      id: 'main',
      links: _handle([
        AppRouteNames.CharacterSimulator,
        AppRouteNames.EnchantDoll,
        AppRouteNames.MainQuestCalc,
      ]),
    },
    {
      id: 'search',
      links: _handle([
        AppRouteNames.SkillQuery,
        AppRouteNames.ItemQuery,
        AppRouteNames.CrystalQuery,
        AppRouteNames.RegistletQuery,
        AppRouteNames.TraitQuery,
      ]),
    },
    {
      id: 'other',
      links: _handle([
        AppRouteNames.EnchantSimulator,
        AppRouteNames.GlossaryQuery,
        AppRouteNames.DamageCalculation,
      ]),
    },
  ]
})()

const groupDatas = [
  {
    icon: 'ic:round-star-outline',
    color: 'fuchsia',
  },
  {
    icon: 'ic:round-search',
    color: 'emerald',
  },
  {
    icon: 'icon-park-outline:other',
    color: 'gray',
  },
]
</script>
