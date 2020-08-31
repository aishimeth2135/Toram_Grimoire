<template>
  <div class="cy--flex-layout" :class="{ _inline: type == 'inline' }">
    <slot></slot>
    <div v-if="$slots['right-content']" class="right-content">
      <slot name="right-content"></slot>
    </div>
    <slot name="extra"></slot>
  </div>
</template>
<script>
  export default {
    props: {
      type: {
        type: String,
        default: 'normal',
        validation: v => ['normal', 'inline'].includes(v)
      }
    }
  };
</script>
<style lang="less" scoped>
  .cy--flex-layout {
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    > .right-content {
      margin-left: auto;
      display: inline-flex;
      align-items: center;
    }

    &.mt-normal {
      margin-top: 0.8rem;
    }
    &.mb-normal {
      margin-bottom: 0.8rem;
    }

    &._inline {
      display: inline-flex;
    }
  }
</style>