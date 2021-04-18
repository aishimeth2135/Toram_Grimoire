<template>
  <span @click="click"
    class="cy-button--icon inline-flex p-1 mx-1"
    :class="baseClass">
    <iconify-icon v-if="iconifyName" :name="iconifyName" />
    <svg-icon v-if="iconId" :icon-id="iconId" />
    <image-icon v-if="imagePath" :image-path="imagePath" />
  </span>
</template>

<script>
import BaseButton from "./base";

export default {
  mixins: [BaseButton]
};
</script>

<style lang="postcss" scoped>
.cy-button--icon {
  --icon-width: 1.3rem;

  & > svg, & > img {
    display: block;
    flex-shrink: 0;
    fill: currentcolor;
    color: var(--icon-color);
    height: var(--icon-width);
    width: var(--icon-width);

    @apply duration-300;
  }

  &:hover, &.selected {
    @apply border-light-3;

    & > svg {
      color: var(--icon-color-hover);
    }
  }
}
</style>