<template>
  <div>
    <div>
      <AppRouterLink v-if="routeNotHome(currentRoute.name!)" :data="homeRouteData" />
      <AppRouterLink
        v-for="data in viewButtons"
        :key="data.title"
        :data="data"
      />
    </div>
    <div v-if="routeNotHome(currentRoute.name!)" class="mt-0.5 pt-0.5">
      <AppRouterLink
        v-for="data in routeLinks"
        :key="data.title"
        :data="data"
      />
      <div class="flex justify-center cursor-pointer py-0.5 hover:bg-light-0 duration-200" @click.stop="toggle('contents/menuLinks')">
        <cy-icon-text :icon="contents.menuLinks ? 'ic:round-keyboard-double-arrow-up' : 'ic:round-keyboard-double-arrow-down'" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { RouteRecordName, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useLeftMenuStore } from '@/stores/app/left-menu'

import { ROUTE_LINK_DATAS } from '@/shared/consts'

import ToggleService from '@/setup/ToggleService'

import { AppRouteNames } from '@/router/enums'

import AppRouterLink from './app-router-link.vue'

const { toggle, contents } = ToggleService({
  contents: ['menuLinks'] as const,
})

const { currentRoute } = useRouter()
const leftMenuStore = useLeftMenuStore()

const { viewButtons } = storeToRefs(leftMenuStore)

const homeRouteData = {
  title: 'app.page-title.home',
  icon: 'ant-design:home-outlined',
  pathName: AppRouteNames.Home,
}

const routeLinks = computed(() => {
  const items = contents.menuLinks ? ROUTE_LINK_DATAS : []
  return items
    .filter(item => {
      if (item.pathName === currentRoute.value.name) {
        return false
      }
      const { leftMenuViewButtons } = currentRoute.value.meta
      if (leftMenuViewButtons) {
        return leftMenuViewButtons.every(viewButton => item.pathName !== viewButton.pathName)
      }
      return true
    })
    .map(item => ({
      title: 'app.page-title.' + item.name,
      icon: item.icon,
      pathName: item.pathName,
    }))
})

const routeNotHome = (pathName: RouteRecordName) => pathName !== AppRouteNames.Home && pathName !== AppRouteNames.About
</script>
