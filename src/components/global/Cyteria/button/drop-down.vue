<template>
  <div class="cy-button--drop-down py-2 px-3 m-1 bg-white">
    <div @click="titleClick"
      class="content-title button--main-content flex items-center justify-start">
      <cy-icon :icon="icon" :src="iconSrc" />
      <span v-if="$slots['default']"
        class="button--text inline-flex items-center ml-2 duration-300 whitespace-nowrap text-purple">
        <slot></slot>
      </span>
      <slot name="tail"></slot>
      <span v-if="$slots['content-right']"
        class="inline-flex items-center ml-auto">
        <slot name="content-right"></slot>
      </span>
    </div>
    <div class="menu" v-show="menuVisible">
      <slot name="menu"></slot>
    </div>
  </div>
</template>

<script>
import BaseButton from "./base";

export default {
  mixins: [BaseButton],
  props: {
    menuDefaultVisible: {
      type: Boolean,
      default: false
    },
  },
  data(){
    return {
      menuVisible: false
    };
  },
  mounted() {
    this.menuVisible = this.menuDefaultVisible;
  },
  methods: {
    titleClick() {
      this.menuVisible = !this.menuVisible;
    }
  }
};
</script>

<style lang="postcss" scoped>
.cy-button--drop-down {
  --icon-width: 1.3rem;
  border-left: 0.2rem solid var(--primary-light-2);
}
</style>