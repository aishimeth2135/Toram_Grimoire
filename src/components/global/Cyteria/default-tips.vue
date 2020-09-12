<template>
  <div class="cy--default-tips">
    <div class="container">
      <iconify-icon v-if="iconifyName" :name="iconifyName" />
      <svg-icon v-else-if="iconId" :icon-id="iconId" />
      <span :style="{ 'text-align': textAlign }"><slot></slot></span>
    </div>
  </div>
</template>
<script>
  export default {
    props: {
      'iconifyName': String,
      'icon-id': String,
      'textAlign': {
        type: String,
        default: 'center'
      }
    }
  }
</script>
<style lang="less" scoped>
  .cy--default-tips {
    padding: 1rem 0.2rem;
    display: flex;
    align-items: center;
    justify-content: center;

    > .container {
      display: flex;
      align-items: center;
      white-space: normal;

      > svg {
        color: var(--primary-light-2);
        width: 2.7rem;
        height: 2.7rem;
        margin-right: 1rem;
      }
    }
  }
</style>