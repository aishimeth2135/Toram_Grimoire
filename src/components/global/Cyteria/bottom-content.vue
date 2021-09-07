<template>
  <div class="cy--bottom-content">
    <div v-if="$slots['default']" class="default-content-container">
      <div class="default-content">
        <slot />
      </div>
    </div>
    <div v-else-if="$slots['normal-content']" class="normal-content">
      <slot name="normal-content" />
    </div>
    <slot name="custom" />
  </div>
</template>
<script>
export default {};
</script>
<style lang="less" scoped>
.cy--bottom-content {
  position: sticky;
  bottom: 0;
  padding: 0.4rem 0;
  background-color: var(--white);
  margin-top: 1rem;

  > .default-content-container {
    border-top: 1px solid var(--primary-light-3);
    padding: 0 0.7rem;

    > .default-content {
      display: flex;
      align-items: center;
      padding: 0.5rem 0;
      overflow-x: auto;
    }
  }

  > .normal-content {
    border-top: 1px solid var(--primary-light-3);
    padding: 0.4rem 0.4rem;
  }
}
</style>
