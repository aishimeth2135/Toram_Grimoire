<template>
  <span ref="rootElement"
    @click="click"
    class="cy-button--icon button--main-content inline-flex p-1 mx-1 relative"
    :class="baseClass">
    <cy-icon :icon="icon" :src="iconSrc" />
    <sub-caption v-if="$slots['caption']"
      :root="rootElement">
      <slot name="caption"></slot>
    </sub-caption>
  </span>
</template>

<script>
import { ref } from 'vue';
import BaseButton from "./base";
import vue_subCaption from "../components/sub-caption.vue";

export default {
  mixins: [BaseButton],
  components: {
    'sub-caption': vue_subCaption
  },
  setup() {
    const rootElement = ref(null);
    return {
      rootElement
    };
  },
};
</script>

<style lang="postcss" scoped>
.cy-button--icon {
  --icon-width: 1.3rem;
}
</style>