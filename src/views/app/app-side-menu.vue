<template>
  <div class="app-left-menu--wrapper" :class="{ 'wrapper-minimize': minimize }">
    <div class="content-container" @click.stop>
      <div class="h-full overflow-y-auto flex flex-col">
        <div class="mx-1 mt-6">
          <AppSideMenuContent is-main />
        </div>
        <div class="mt-auto mx-2 pl-2 py-4">
          <cy-button-icon
            v-if="storageAvailable"
            icon="ic-baseline-settings"
            @click="(mainStore.toggleSetting(true), leftMenuStore.toggleVisible())"
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
  @apply fixed w-64 top-0 left-0 opacity-100 h-full overflow-x-hidden z-50;
  background-color: var(--app-body-bg-color);

  & > .content-container {
    @apply h-full w-64 border-r border-primary-30;
  }
}

@media (min-width: 55rem) and (max-width: 82rem) {
  .app-left-menu--wrapper {
    @apply w-14 duration-300 border-r-1 border-transparent;

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
    @apply w-14 duration-300 border-r-1 border-transparent;

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
