<template>
  <nav class="border-b border-solid border-light flex items-center py-1 px-4 mb-4 bg-white">
    <AppLeftMenu />
    <div class="inline-flex items-center whitespace-nowrap overflow-y-auto px-2 text-sm">
      <template
        v-for="(item, i) in items"
        :key="item.path"
      >
        <cy-icon-text
          v-if="i !== 0"
          icon="ic-round-keyboard-arrow-right"
          class="mx-2"
        />
        <span>
          <router-link
            v-if="i !== items.length - 1"
            v-slot="{ navigate }"
            :to="item.path"
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

<script>
import { useI18n } from 'vue-i18n';
import { mapState } from 'vuex';

import vue_leftMenu from './left-menu.vue';
import vue_settings from './settings.vue';

export default {
  setup() {
    const { t } = useI18n();
    return {
      t,
    };
  },
  computed: {
    ...mapState('nav', ['items']),
  },
  components: {
    AppLeftMenu: vue_leftMenu,
    AppSettings: vue_settings,
  },
};
</script>
