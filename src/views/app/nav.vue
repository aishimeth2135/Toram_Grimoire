<template>
    <nav class="border-b border-solid border-light flex items-center py-1 px-4 mb-4 bg-white">
      <app-left-menu />
      <div class="inline-flex items-center whitespace-nowrap overflow-y-auto px-2 text-sm">
        <template v-for="(item, i) in items"
          :key="item.path">
          <iconify-icon v-if="i != 0"
            class="w-5 h-5 fill-current text-light-2 mx-2"
            name="ic-round-keyboard-arrow-right" />
          <span>
            <router-link v-if="i != items.length - 1" :to="item.path"
              v-slot="{ navigate }" custom>
              <span class="cursor-pointer text-light-3 underline"
                @click="navigate"
                @keypress.enter="navigate"
                role="link">{{ item.title }}</span>
            </router-link>
            <template v-else>
              {{ item.title }}
            </template>
          </span>
        </template>
      </div>
      <span class="ml-auto">
        <app-settings />
      </span>
    </nav>
</template>

<script>
  import { mapState } from 'vuex';

  import vue_leftMenu from "./left-menu.vue";
  import vue_settings from "./settings.vue";

  export default {
    computed: {
      ...mapState('nav', ['items'])
    },
    components: {
      'app-left-menu': vue_leftMenu,
      'app-settings': vue_settings
    }
  };
</script>