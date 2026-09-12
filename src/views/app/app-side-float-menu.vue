<template>
  <transition name="slide" appear>
    <div v-if="visible" class="app--side-menu">
      <div>
        <cy-button-circle icon="akar-icons:sidebar-left" color="bright" @click="toggleMainMenu" />
      </div>
      <cy-transition>
        <div v-if="mainMenuVisible" class="app--side-menu--menu">
          <AppSideMenuContent @click="toggleMainMenu" />
        </div>
      </cy-transition>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

import { useToggle } from '@/shared/composables/State'

import AppSideMenuContent from './app-side-menu-content.vue'

interface Props {
  visible: boolean
}

const props = defineProps<Props>()

const mainMenuVisible = ref(false)

const toggleMainMenu = useToggle(mainMenuVisible)

watch(
  () => props.visible,
  value => {
    if (!value) {
      toggleMainMenu(false)
    }
  }
)
</script>

<style>
@reference "@/tailwind.css";

.app--side-menu {
  display: flex;
  position: fixed;
  top: --spacing(3);
  right: --spacing(3);
  flex-direction: column;
  align-items: flex-end;
  z-index: 40;

  @media (min-width: 880px) {
    display: none !important;
  }

  &.slide-enter-from,
  &.slide-leave-to {
    top: --spacing(-16);
  }
  &.slide-enter-active,
  &.slide-leave-active {
    transition: top 0.3s ease;
  }
  &.slide-enter-to,
  &.slide-leave-from {
    top: --spacing(3);
  }
}

.app--side-menu--menu {
  margin-top: --spacing(2);
  box-shadow: var(--shadow-sm);
  border-width: 2px;
  border-color: var(--color-primary-30);
  border-radius: var(--radius-sm);
  background-color: var(--color-white);
  min-width: 15rem;

  @media (max-width: 15rem) {
    width: 100%;
  }
}

.app--side-menu--link-button {
  cursor: pointer;
  padding-inline: --spacing(4);
  padding-block: --spacing(1.5);
  width: 100%;

  &:hover {
    background-color: --alpha(var(--color-primary-30) / 10%);
  }

  &.selected {
    background-color: --alpha(var(--color-primary-30) / 30%);
  }
}
</style>
