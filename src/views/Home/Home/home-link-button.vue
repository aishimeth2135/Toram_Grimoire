<template>
  <div class="flex" :class="!device.isMobile ? 'm-4' : 'm-2'">
    <router-link v-if="!device.isMobile" v-slot="{ navigate }" :to="{ name: data.pathName }" custom>
      <div class="home-link-button-wrapper" @click="navigate">
        <div class="home-link-button-bg1" />
        <div class="home-link-button-bg2" />
        <div class="relative z-1 pl-[1.625rem] pt-[1.125rem]">
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
        <div class="relative z-1 pl-3 pt-2">
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

import { type RouteLinkData } from '@/shared/consts/route'
import { useDevice } from '@/shared/setup/Device'

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
  position: relative;
  display: flex;
  height: --spacing(28);
  width: --spacing(44);
  cursor: pointer;

  &.wrapper-mobile {
    height: --spacing(16);
    width: --spacing(44);
  }

  &:hover > .home-link-button-bg2 {
    background-color: var(--app-white);
    border-color: --alpha(var(--app-primary-80) / 75%);
  }
}

.home-link-button-title {
  position: absolute;
  bottom: 0;
  right: 0;
  padding-inline: --spacing(3);
  padding-bottom: --spacing(2);
  text-align: right;
  color: var(--app-blue-80);
}

.home-link-button-bg1 {
  position: absolute;
  left: --spacing(2.5);
  top: --spacing(2.5);
  z-index: -1;
  border-radius: var(--radius-lg);
  width: calc(100% - 0.25rem);
  height: calc(100% - 0.25rem);
  background-color: --alpha(var(--app-primary-30) / 20%);
}

.home-link-button-bg2 {
  position: absolute;
  left: 0;
  top: 0;
  z-index: -1;
  height: 100%;
  width: 100%;
  border-radius: var(--radius-lg);
  transition: 150ms;
  background-color: --alpha(var(--app-white) / 90%);
  border-color: --alpha(var(--app-primary-80) / 30%);
  border-width: 1px;
  border-style: solid;
}
</style>
