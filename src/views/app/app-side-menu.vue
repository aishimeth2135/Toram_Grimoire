<template>
  <aside class="app-left-menu--wrapper" :class="{ 'wrapper-minimize': minimize }">
    <div class="content-container" @click.stop>
      <div class="flex h-full flex-col overflow-y-auto">
        <div class="mx-1 mt-6">
          <AppSideMenuContent is-main />
        </div>
        <div class="mx-2 mt-auto py-4 pl-2">
          <cy-button-icon
            v-if="storageAvailable"
            icon="ic-baseline-settings"
            @click="(mainStore.toggleSetting(true), leftMenuStore.toggleVisible())"
          />
        </div>
      </div>
    </div>
  </aside>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { useLeftMenuStore } from '@/stores/app/left-menu'
import { useMainStore } from '@/stores/app/main'

import { usePageLayout } from '@/shared/setup/Layout'
import Cyteria from '@/shared/utils/Cyteria'

import AppSideMenuContent from './app-side-menu-content.vue'

const storageAvailable = Cyteria.storageAvailable('localStorage')

const mainStore = useMainStore()
const leftMenuStore = useLeftMenuStore()

const { layout } = usePageLayout()

const minimize = computed(() => layout.twoColumns || layout.wide)
</script>

<style>
@reference "@/tailwind.css";

.app-left-menu--wrapper {
  --app-left-menu-padding-right: 32px;

  @apply fixed left-0 top-0 z-50 h-full overflow-x-hidden opacity-100;
  background-color: var(--app-body-bg-color);
  padding-left: calc((100% - var(--app-screen-max-width)) / 2);
  width: calc((100% - var(--app-screen-max-width)) / 2 + var(--app-side-menu-width));

  & > .content-container {
    @apply h-full border-r border-primary-10;
    width: var(--app-side-menu-width);
  }
}

@media (min-width: 1376px) {
  .app-left-menu--wrapper.wrapper-minimize {
    @apply w-14 border-r border-primary-10 duration-300;
    padding-left: 0;
    padding-right: 0;

    &:hover {
      @apply border-primary-30;

      width: var(--app-side-menu-width);
    }

    & > .content-container {
      @apply border-none;
    }
  }
}

@media (min-width: 880px) and (max-width: 1376px) {
  .app-left-menu--wrapper {
    @apply w-14 border-r border-primary-10 duration-300;
    padding-left: 0;
    padding-right: 0;

    &:hover {
      @apply border-primary-30;

      width: var(--app-side-menu-width);
    }

    & > .content-container {
      @apply border-none;
    }
  }
}

@media (max-width: 880px) {
  .app-left-menu--wrapper {
    @apply hidden;
  }
}
</style>
