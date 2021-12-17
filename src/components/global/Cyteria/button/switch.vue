<template>
  <button
    class="button--main-content inline-flex items-center m-1 px-1.5"
    :class="baseClass"
    @click="handleButtonClick"
  >
    <cy-icon
      :icon="selected ? 'ic:round-toggle-on' : 'ic:outline-toggle-off'"
      src="iconify"
      style="--icon-width: 2rem"
    />
    <span
      v-if="$slots['default']"
      class="button--text inline-flex items-center ml-2 duration-300"
    >
      <slot />
    </span>
  </button>
</template>

<script>
import ButtonBase from './base';

export default {
  mixins: [ButtonBase],
  emits: ['update:selected'],
  methods: {
    handleButtonClick(e) {
      if (this.disabled) {
        return;
      }
      this.$emit('update:selected', !this.selected);
      this.click(e);
    },
  },
};
</script>
