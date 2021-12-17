<template>
  <button
    ref="rootElement"
    class="cy-button--icon button--main-content inline-flex p-1 mx-1 relative"
    :class="baseClass"
    @click="click"
  >
    <cy-icon :icon="icon" :src="iconSrc" />
    <sub-caption
      v-if="$slots['caption']"
      :root="rootElement"
    >
      <slot name="caption" />
    </sub-caption>
  </button>
</template>

<script>
import { ref } from 'vue';

import vue_subCaption from '../components/sub-caption.vue';

import ButtonBase from './base';

export default {
  components: {
    'sub-caption': vue_subCaption,
  },
  mixins: [ButtonBase],
  setup() {
    const rootElement = ref(null);
    return {
      rootElement,
    };
  },
};
</script>

<style scoped>
.cy-button--icon {
  --icon-width: 1.3rem;
}
</style>
