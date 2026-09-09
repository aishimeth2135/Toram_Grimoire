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
  position: fixed;
  top: --spacing(0);
  left: --spacing(0);
  opacity: 100%;
  z-index: 50;
  background-color: var(--app-body-bg-color);
  padding-left: calc((100% - var(--app-screen-max-width)) / 2);
  width: calc((100% - var(--app-screen-max-width)) / 2 + var(--app-side-menu-width));
  height: 100%;
  overflow-x: hidden;

  & > .content-container {
    border-right-width: 1px;
    border-color: var(--color-primary-10);
    width: var(--app-side-menu-width);
    height: 100%;
  }
}

@media (min-width: 1376px) {
  .app-left-menu--wrapper.wrapper-minimize {
    transition-duration: 300ms;
    border-right-width: 1px;
    border-color: var(--color-primary-10);
    padding-right: 0;
    padding-left: 0;
    width: --spacing(14);

    &:hover {
      border-color: var(--color-primary-30);
      width: var(--app-side-menu-width);
    }

    & > .content-container {
      border-style: none;
    }
  }
}

@media (min-width: 880px) and (max-width: 1376px) {
  .app-left-menu--wrapper {
    transition-duration: 300ms;
    border-right-width: 1px;
    border-color: var(--color-primary-10);
    padding-right: 0;
    padding-left: 0;
    width: --spacing(14);

    &:hover {
      border-color: var(--color-primary-30);
      width: var(--app-side-menu-width);
    }

    & > .content-container {
      border-style: none;
    }
  }
}

@media (max-width: 880px) {
  .app-left-menu--wrapper {
    display: none;
  }
}
</style>
