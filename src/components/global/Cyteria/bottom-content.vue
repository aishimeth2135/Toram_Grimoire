<template>
  <div class="cy--bottom-content">
    <div class="default-content" v-if="$slots['default']">
      <slot name="default-content"></slot>
    </div>
    <slot name="custom"></slot>
  </div>
</template>
<script>
export default {}
</script>
<style lang="less" scoped>
.cy--bottom-content {
  position: sticky;
  bottom: 0;
  padding: 0.4rem 0;
  background-color: var(--white);

  > .default-content {
    border-top: 1px solid var(--primary-light-3);
    display: flex;
    align-items: center;
    padding: 0.4rem 0.4rem;
  }
}
</style>