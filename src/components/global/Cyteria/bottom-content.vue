<template>
  <div class="cy--bottom-content">
    <div class="default-content" v-if="$slots['default']">
      <slot></slot>
    </div>
    <div class="normal-content" v-else-if="$slots['normal-content']">
      <slot name="normal-content"></slot>
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
  margin-top: 1rem;

  > .default-content {
    border-top: 1px solid var(--primary-light-3);
    display: flex;
    align-items: center;
    padding: 0.5rem 0.4rem;
    overflow-y: auto;
  }

  > .normal-content {
    border-top: 1px solid var(--primary-light-3);
    padding: 0.4rem 0.4rem;
  }
}
</style>