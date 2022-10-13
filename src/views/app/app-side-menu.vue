<template>
  <div class="app-left-menu--wrapper" :class="{ 'wrapper-minimize': minimize }">
    <div class="content-container" @click.stop>
      <div class="flex h-full flex-col overflow-y-auto">
        <div class="mx-1 mt-6">
          <AppSideMenuContent is-main />
        </div>
        <div class="mx-2 mt-auto py-4 pl-2">
          <cy-button-icon
            v-if="storageAvailable"
            icon="ic-baseline-settings"
            @click="
              mainStore.toggleSetting(true), leftMenuStore.toggleVisible()
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'AppLeftMenu',
}
</script>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useLeftMenuStore } from '@/stores/app/left-menu'
import { useMainStore } from '@/stores/app/main'

import Cyteria from '@/shared/utils/Cyteria'

import AppSideMenuContent from './app-side-menu-content.vue'

const storageAvailable = Cyteria.storageAvailable('localStorage')

const currentRoute = useRoute()
const mainStore = useMainStore()
const leftMenuStore = useLeftMenuStore()

const minimize = computed(() => currentRoute.meta.twoColumnsLayout === true)
</script>

<style lang="postcss" scoped>
/**
 * app-layout-main: 48rem
 * app-side-menu: 16rem
 * app-side-menu(minimize): 3.5rem
 *
 * 82rem = 48rem + 16rem * 2
 * 55rem = 48rem + 3.5rem * 2
 */

.app-left-menu--wrapper {
  @apply fixed top-0 left-0 z-50 h-full w-64 overflow-x-hidden opacity-100;
  background-color: var(--app-body-bg-color);

  & > .content-container {
    @apply h-full w-64 border-r border-primary-30;
  }
}

@media (min-width: 55rem) and (max-width: 82rem) {
  .app-left-menu--wrapper {
    @apply w-14 border-r-1 border-transparent duration-300;

    &:hover {
      @apply w-64 border-primary-30;
    }

    & > .content-container {
      @apply border-none;
    }
  }
}

@media (min-width: 82rem) {
  .app-left-menu--wrapper.wrapper-minimize {
    @apply w-14 border-r-1 border-transparent duration-300;

    &:hover {
      @apply w-64 border-primary-30;
    }

    & > .content-container {
      @apply border-none;
    }
  }
}

@media (max-width: 55rem) {
  .app-left-menu--wrapper {
    @apply hidden;
  }
}
</style>
