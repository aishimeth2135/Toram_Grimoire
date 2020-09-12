<template>
  <div v-if="storageAvailable">
    <cy-default-tips iconify-name="bx-bx-message-square-dots" text-align="left">
      {{ localLangText('top caption') }}
    </cy-default-tips>
    <div>
      <cy-button type="border" iconify-name="ic-round-save"
        @click="$emit('manual-auto-save')">
        {{ localLangText('save button: title') }}
      </cy-button>
      <cy-button type="border" iconify-name="bx-bx-loader-circle"
        @click="$emit('manual-auto-load')">
        {{ localLangText('load button: title') }}
      </cy-button>
    </div>
  </div>
  <cy-default-tips v-else iconify-name="mdi-ghost">
    {{ globalLangText('global/LocalStorage is inavailable') }}
  </cy-default-tips>
</template>
<script>
import CY from "@lib/main/module/cyteria.js";

export default {
  inject: ['langText', 'globalLangText'],
  computed: {
    storageAvailable() {
      return CY.storageAvailable('localStorage');
    }
  },
  methods: {
    localLangText(v, vs) {
      return this.langText('save-load control/' + v, vs);
    }
  }
};
</script>