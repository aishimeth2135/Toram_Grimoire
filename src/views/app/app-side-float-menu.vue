<template>
  <transition name="slide" appear>
    <div v-if="visible" class="app--side-menu">
      <div>
        <cy-button-circle
          icon="akar-icons:sidebar-left"
          color="bright"
          @click="toggle('contents/menu')"
        />
      </div>
      <cy-transition>
        <div v-if="contents.menu" class="app--side-menu--menu">
          <AppSideMenuContent @click="toggle('contents/menu')" />
        </div>
      </cy-transition>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { watch } from 'vue'

import ToggleService from '@/setup/ToggleService'

import AppSideMenuContent from './app-side-menu-content.vue'

interface Props {
  visible: boolean
}

const { toggle, contents } = ToggleService({
  contents: ['menu', 'menuLinks'] as const,
})

const props = defineProps<Props>()

watch(
  () => props.visible,
  value => {
    if (!value) {
      toggle('contents/menu', false)
    }
  }
)
</script>

<style lang="postcss" scoped>
.app--side-menu {
  @apply fixed top-3 right-3 z-40 flex flex-col items-end;

  @media (min-width: 880px) {
    display: none !important;
  }

  &.slide-enter-from,
  &.slide-leave-to {
    @apply -top-16;
  }
  &.slide-enter-active,
  &.slide-leave-active {
    transition: top 0.3s ease;
  }
  &.slide-enter-to,
  &.slide-leave-from {
    @apply top-3;
  }
}

.app--side-menu--menu {
  min-width: 15rem;

  @apply mt-2 rounded border-1 border-primary-30 bg-white shadow;

  @media (max-width: 15rem) {
    width: 100%;
  }
}

.app--side-menu--link-button {
  @apply w-full cursor-pointer bg-opacity-25 py-1.5 px-4;

  &:hover {
    @apply bg-primary-30 bg-opacity-10;
  }

  &.selected {
    @apply bg-primary-30 bg-opacity-30;
  }
}
</style>
