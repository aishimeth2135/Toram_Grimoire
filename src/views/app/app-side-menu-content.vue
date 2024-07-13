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
        @click.stop="toggleLinksMenu"
      >
        <cy-icon
          :icon="
            linksMenuVisible
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
import { computed, ref } from 'vue'
import { RouteRecordName, useRouter } from 'vue-router'

import { useLeftMenuStore } from '@/stores/app/left-menu'

import { ROUTE_LINK_DATAS } from '@/shared/consts/route'
import { useToggle } from '@/shared/setup/State'

import { AppRouteNames } from '@/router/enums'

import AppRouterLink from './app-router-link.vue'

import { HomeRouteData } from './setup'

interface Props {
  isMain?: boolean
}

withDefaults(defineProps<Props>(), {
  isMain: false,
})

const linksMenuVisible = ref(false)
const toggleLinksMenu = useToggle(linksMenuVisible)

const { currentRoute } = useRouter()
const leftMenuStore = useLeftMenuStore()

const { viewButtons } = storeToRefs(leftMenuStore)

const homeRouteData: HomeRouteData = {
  title: 'app.page-title.home',
  icon: 'ant-design:home-outlined',
  pathName: AppRouteNames.Home,
}

const routeLinks = computed(() => {
  const items = linksMenuVisible.value ? ROUTE_LINK_DATAS : []
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
        }) as HomeRouteData
    )
})

const routeNotHome = (pathName: RouteRecordName) =>
  pathName !== AppRouteNames.Home && pathName !== AppRouteNames.About
</script>
