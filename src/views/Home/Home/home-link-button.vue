<template>
  <div class="flex" :class="!device.isMobile ? 'm-4' : 'm-2'">
    <router-link v-if="!device.isMobile" v-slot="{ navigate }" :to="{ name: data.pathName }" custom>
      <div class="home-link-button-wrapper" @click="navigate">
        <div class="home-link-button-bg1" />
        <div class="home-link-button-bg2" />
        <div class="z-1 relative pl-[1.625rem] pt-[1.125rem]">
          <cy-icon :icon="data.icon" width="2.5rem" class="text-blue-20" />
        </div>
        <div class="home-link-button-title">
          {{ t('app.page-title.' + data.name) }}
        </div>
      </div>
    </router-link>
    <router-link v-else v-slot="{ navigate }" :to="{ name: data.pathName }" custom>
      <div class="home-link-button-wrapper wrapper-mobile" @click="navigate">
        <div class="home-link-button-bg1" />
        <div class="home-link-button-bg2" />
        <div class="z-1 relative pl-3 pt-2">
          <cy-icon :icon="data.icon" width="1.5rem" class="text-blue-20" />
        </div>
        <div class="home-link-button-title">
          {{ t('app.page-title.' + data.name) }}
        </div>
      </div>
    </router-link>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import { useDevice } from '@/shared/composables/Device'
import { type RouteLinkData } from '@/shared/consts/route'

interface Props {
  data: RouteLinkData
}

defineProps<Props>()

const { t } = useI18n()
const { device } = useDevice()
</script>

<style>
@reference "@/tailwind.css";

.home-link-button-wrapper {
  display: flex;
  position: relative;
  cursor: pointer;
  width: --spacing(44);
  height: --spacing(28);

  &.wrapper-mobile {
    width: --spacing(44);
    height: --spacing(16);
  }

  &:hover > .home-link-button-bg2 {
    border-color: --alpha(var(--app-primary-80) / 75%);
    background-color: var(--app-white);
  }
}

.home-link-button-title {
  position: absolute;
  right: 0;
  bottom: 0;
  padding-inline: --spacing(3);
  padding-bottom: --spacing(2);
  color: var(--app-blue-80);
  text-align: right;
}

.home-link-button-bg1 {
  position: absolute;
  top: --spacing(2.5);
  left: --spacing(2.5);
  z-index: -1;
  border-radius: var(--radius-lg);
  background-color: --alpha(var(--app-primary-30) / 20%);
  width: calc(100% - 0.25rem);
  height: calc(100% - 0.25rem);
}

.home-link-button-bg2 {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  transition: 150ms;
  border-width: 1px;
  border-style: solid;
  border-color: --alpha(var(--app-primary-80) / 30%);
  border-radius: var(--radius-lg);
  background-color: --alpha(var(--app-white) / 90%);
  width: 100%;
  height: 100%;
}
</style>
