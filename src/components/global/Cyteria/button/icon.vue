<template>
  <span
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
  </span>
</template>

<script>
import { ref } from 'vue';
import BaseButton from "./base";
import vue_subCaption from "../components/sub-caption.vue";

export default {
  components: {
    'sub-caption': vue_subCaption,
  },
  mixins: [BaseButton],
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
