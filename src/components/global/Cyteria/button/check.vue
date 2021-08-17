<template>
  <span
    class="button--main-content inline-flex items-center py-0.5 px-2 m-1"
    :class="baseClass"
    @click="handleButtonClick"
  >
    <cy-icon
      :icon="selected ? selectedIcon : icon"
      :src="selected ? selectedIconSrc : iconSrc"
    />
    <span
      v-if="$slots['default']"
      class="button--text inline-flex items-center ml-2 duration-300"
    >
      <slot />
    </span>
  </span>
</template>

<script>
import BaseButton from './base';

export default {
  mixins: [BaseButton],
  props: {
    selectedIcon: {
      type: String,
      default: 'ic-round-check-box',
    },
    selectedIconSrc: {
      type: String,
      default: 'iconify',
    },
    icon: {
      type: String,
      default: 'ic-round-check-box-outline-blank',
    },
    iconSrc: {
      type: String,
      default: 'iconify',
    },
  },
  emits: ['update:selected'],
  methods: {
    handleButtonClick(e) {
      this.$emit('update:selected', !this.selected);
      this.click(e);
    },
  },
};
</script>
