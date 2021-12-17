<template>
  <button
    class="button--main-content inline-flex items-center justify-center mr-2 mb-2 border-1 bg-white rounded-full"
    style="width: 2.8rem; height: 2.8rem;"
    :class="baseClass"
    @click="click"
  >
    <cy-icon :icon="icon" :src="iconSrc" />
  </button>
</template>

<script>
import ButtonBase from './base';

export default {
  mixins: [ButtonBase],
};
</script>

