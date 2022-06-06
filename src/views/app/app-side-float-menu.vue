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
  visible: boolean;
}

const { toggle, contents } = ToggleService({
  contents: ['menu', 'menuLinks'] as const,
})

const props = defineProps<Props>()

watch(() => props.visible, value => {
  if (!value) {
    toggle('contents/menu', false)
  }
})
</script>

<style lang="postcss" scoped>
.app--side-menu {
  @apply fixed top-3 right-3 z-40 flex flex-col items-end;

  @media screen and (min-width: 82rem) {
    display: none !important;
  }

  &.slide-enter-from, &.slide-leave-to {
    @apply -top-16;
  }
  &.slide-enter-active, &.slide-leave-active {
    transition: top 0.3s ease;
  }
  &.slide-enter-to, &.slide-leave-from {
    @apply top-3;
  }
}

.app--side-menu--menu {
  min-width: 15rem;

  @apply border-1 border-light-2 mt-2 rounded shadow bg-white;

  @media screen and (max-width: 15rem) {
    width: 100%;
  }
}

.app--side-menu--link-button {
  @apply w-full py-1.5 px-4 cursor-pointer bg-opacity-25;

  &:hover {
    @apply bg-light bg-opacity-10;
  }

  &.selected {
    @apply bg-light bg-opacity-30;
  }
}
</style>
