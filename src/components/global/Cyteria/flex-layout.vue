<template>
  <div class="cy--flex-layout">
    <div v-if="$slots['right-content']" class="right-content">
      <slot name="right-content"></slot>
    </div>
  </div>
</template>
<script>
  export default {};
</script>
<style lang="less" scoped>
  .cy--flex-layout {
    display: flex;
    align-items: center;

    > .right-content {
      margin-left: auto;
      display: inline-flex;
      align-items: center;
    }
  }
</style>