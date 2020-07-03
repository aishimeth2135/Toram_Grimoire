<template>
  <div class="cy--default-tips">
    <div class="container">
      <iconify-icon :name="iconifyName"></iconify-icon>
      <span><slot></slot></span>
    </div>
  </div>
</template>
<script>
  export default {
    props: ['iconifyName']
  }
</script>
<style lang="less" scoped>
  .cy--default-tips {
    padding: 1rem 0.2rem;
    display: flex;
    text-align: center;
    align-items: center;
    justify-content: center;

    >.container {
      display: flex;
      align-items: center;
      white-space: normal;

      >svg {
        color: var(--primary-light-2);
        width: 3rem;
        height: 3rem;
        margin-right: 1rem;
      }
    }
  }
</style>