<template>
  <transition-group :name="type" :mode="mode" :appear="appear" :tag="tag">
    <slot></slot>
  </transition-group>
</template>
<script>
  // import Velocity from "velocity-animate";

  export default {
    props: {
      type: {
        type: String,
        required: true
      },
      mode: {
        type: String,
        default: ''
      },
      tag: {
        type: String,
        default: 'span'
      },
      appear: {
        type: Boolean
      }
    }
  }
</script>
<style lang="less" scoped>
@deep-operator: ~'>>>';
@{deep-operator} .fade-enter, @{deep-operator} .fade-leave-to {
  opacity: 0;
}
@{deep-operator} .fade-enter-active, @{deep-operator} .fade-leave-active {
  transition: 0.3s ease;
}
@{deep-operator} .fade-enter-to, @{deep-operator} .fade-leave {
  opacity: 1;
}
</style>