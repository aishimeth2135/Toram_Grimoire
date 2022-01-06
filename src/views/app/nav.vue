<template>
  <nav class="border-b border-solid border-light flex items-center py-1 px-3 mb-4 bg-white">
    <cy-button-icon icon="ic:round-menu" @click="leftMenuStore.toggleVisible()" />
    <div class="inline-flex items-center whitespace-nowrap overflow-y-auto px-2 text-sm">
      <!-- <cy-icon-text icon="potum" icon-src="custom" class="mr-2" /> -->
      <template
        v-for="(item, idx) in navItems"
        :key="item.path"
      >
        <cy-icon-text
          v-if="idx !== 0"
          icon="ic-round-keyboard-arrow-right"
          class="mx-2"
        />
        <span>
          <router-link
            v-if="idx !== navItems.length - 1"
            v-slot="{ navigate }"
            :to="{ name: item.pathName }"
            custom
          >
            <span
              class="cursor-pointer text-light-3 underline"
              role="link"
              @click="navigate"
              @keypress.enter="navigate"
            >
              {{ t(item.title) }}
            </span>
          </router-link>
          <template v-else>
            {{ t(item.title) }}
          </template>
        </span>
      </template>
    </div>
    <span class="ml-auto">
      <AppSettings />
    </span>
  </nav>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import { useNavStore } from '@/stores/app/nav';
import { useLeftMenuStore } from '@/stores/app/left-menu';

import AppSettings from './settings.vue';

const { t } = useI18n();

const navStore = useNavStore();
const { navItems } = storeToRefs(navStore);

const leftMenuStore = useLeftMenuStore();
</script>

