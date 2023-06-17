<template>
  <div>
    <div>
      <AppRouterLink
        v-if="routeNotHome(currentRoute.name!)"
        :data="homeRouteData"
        :is-main="isMain"
      />
      <AppRouterLink
        v-for="data in viewButtons"
        :key="data.title"
        :data="data"
        :is-main="isMain"
      />
    </div>
    <div v-if="routeNotHome(currentRoute.name!)" class="mt-0.5 pt-0.5">
      <AppRouterLink
        v-for="data in routeLinks"
        :key="data.title"
        :data="data"
        :is-main="isMain"
      />
      <div
        class="flex cursor-pointer justify-center py-0.5 duration-200 hover:bg-primary-5"
        @click.stop="toggle('contents/menuLinks')"
      >
        <cy-icon
          :icon="
            contents.menuLinks
              ? 'ic:round-keyboard-double-arrow-up'
              : 'ic:round-keyboard-double-arrow-down'
          "
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { RouteRecordName, useRouter } from 'vue-router'

import { useLeftMenuStore } from '@/stores/app/left-menu'

import { ROUTE_LINK_DATAS } from '@/shared/consts'
import ToggleService from '@/shared/setup/ToggleService'

import { IconSrc } from '@/components/cyteria/icon/setup'
import { AppRouteNames } from '@/router/enums'

import AppRouterLink from './app-router-link.vue'

interface Props {
  isMain?: boolean
}

withDefaults(defineProps<Props>(), {
  isMain: false,
})

const { toggle, contents } = ToggleService({
  contents: ['menuLinks'] as const,
})

const { currentRoute } = useRouter()
const leftMenuStore = useLeftMenuStore()

const { viewButtons } = storeToRefs(leftMenuStore)

interface HomeRouteData {
  title: string
  icon: string
  iconSrc?: IconSrc
  pathName: AppRouteNames
}

const homeRouteData: HomeRouteData = {
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
        return leftMenuViewButtons.every(
          viewButton => item.pathName !== viewButton.pathName
        )
      }
      return true
    })
    .map(
      item =>
        ({
          title: 'app.page-title.' + item.name,
          icon: item.icon,
          pathName: item.pathName,
        } as HomeRouteData)
    )
})

const routeNotHome = (pathName: RouteRecordName) =>
  pathName !== AppRouteNames.Home && pathName !== AppRouteNames.About
</script>
