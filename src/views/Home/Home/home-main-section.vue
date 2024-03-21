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
import { ROUTE_LINK_DATAS } from '@/shared/consts/route'
import { useDevice } from '@/shared/setup/Device'

import { AppRouteNames } from '@/router/enums'

import HomeLinkButton from './home-link-button.vue'
import HomeLinkGroup from './home-link-group.vue'

const { device } = useDevice()

const columns = ROUTE_LINK_DATAS

const groups = (() => {
  const linkMap = new Map<AppRouteNames, (typeof ROUTE_LINK_DATAS)[number]>()
  columns.forEach(col => linkMap.set(col.pathName, col))

  const _handle = (items: AppRouteNames[]) =>
    items.map(item => linkMap.get(item)!)
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
      links: _handle([
        AppRouteNames.CharacterSimulator,
        AppRouteNames.SkillSimulator,
        AppRouteNames.DamageCalculation,
      ]),
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
