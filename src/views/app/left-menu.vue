<template>
  <transition name="fade">
    <div
      v-show="visible"
      class="app-left-menu--wrapper"
      @click.stop="leftMenuStore.toggleVisible()"
    >
      <div class="content-container" @click.stop>
        <div class="h-full overflow-y-auto">
          <div class="mx-1 mt-6">
            <router-link
              v-for="data in viewButtons"
              :key="data.title"
              v-slot="{ navigate }"
              :to="{ name: data.pathName }"
              custom
            >
              <div
                class="app-left-menu--link-button"
                :class="{ selected: currentRoute.name === data.pathName }"
                @click="navigate"
              >
                <cy-icon-text :icon="data.icon">{{
                  t(data.title)
                }}</cy-icon-text>
              </div>
            </router-link>
          </div>
        </div>
        <div class="m-3 mt-auto flex items-end pt-2">
          <AppSettings />
          <div
            v-if="currentRoute.name !== 'Home'"
            class="ml-auto flex items-center space-x-2"
          >
            <cy-button-circle icon="bx:bx-share-alt" @click="copyCurrentUrl" />
            <router-link v-slot="{ navigate }" :to="{ name: 'Home' }" custom>
              <cy-button-circle
                icon="ant-design:home-outlined"
                @click="navigate($event), leftMenuStore.toggleVisible()"
              />
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
export default {
  name: 'AppLeftMenu',
}
</script>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useLeftMenuStore } from '@/stores/app/left-menu'

import CY from '@/shared/utils/Cyteria'

import Notify from '@/setup/Notify'

import AppSettings from './app-settings.vue'

const { currentRoute } = useRouter()
const { t } = useI18n()

const leftMenuStore = useLeftMenuStore()

const { viewButtons, visible } = storeToRefs(leftMenuStore)

const { notify } = Notify()

const copyCurrentUrl = () => {
  CY.copyToClipboard(window.location.href)
  notify(t('app.features.copy-url-to-clipboard-success-tips'))
}
</script>

<style lang="postcss" scoped>
.app-left-menu--wrapper {
  @apply fixed top-0 left-0 h-full w-64 opacity-100;

  &.fade-enter-from,
  &.fade-leave-to {
    opacity: 0;
  }

  &.fade-enter-active,
  &.fade-leave-active {
    @apply duration-200;
  }

  & > .content-container {
    @apply flex h-full w-full flex-col border-r border-primary-30;
  }
}

@media screen and (max-width: 82rem) {
  .app-left-menu--wrapper {
    @apply top-0 left-0 right-auto z-100 h-full bg-black bg-opacity-50;
    width: calc(100% + 30rem);

    &.fade-enter-from,
    &.fade-leave-to {
      @apply -left-80 opacity-100;
    }

    & > .content-container {
      @apply w-64 bg-white bg-opacity-100 pt-4;
    }

    &.content-invisible {
      display: none;
    }
  }
}

.app-left-menu--link-button {
  @apply w-full cursor-pointer bg-opacity-25 py-1.5 px-4;

  &:hover,
  &.selected {
    @apply bg-primary-30;
  }
}
</style>
