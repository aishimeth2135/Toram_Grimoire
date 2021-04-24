<template>
  <span @click="click"
    class="cy-button--icon button--main-content inline-flex p-1 mx-1"
    :class="baseClass">
    <cy-icon :icon="icon" :src="iconSrc" />
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
}
</style>