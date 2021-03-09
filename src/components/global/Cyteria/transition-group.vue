<template>
  <transition-group :name="type" :appear="appear" :tag="tag">
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
@deep: ~'>>>';
@{deep} .fade-enter, @{deep} .fade-leave-to {
  opacity: 0;
}
@{deep} .fade-enter-active, @{deep} .fade-leave-active {
  transition: 0.3s ease;
}
@{deep} .fade-enter-to, @{deep} .fade-leave {
  opacity: 1;
}

@{deep} .fade-slide-right-enter {
  transform: translateX(-20%);
  opacity: 0;
}
@{deep} .fade-slide-right-enter-to {
  transform: 0;
  opacity: 1;
}
@{deep} .fade-slide-right-leave-to {
  transform: translateX(20%);
  opacity: 0;
}
@{deep} .fade-slide-right-enter-active, @{deep} .fade-slide-right-leave-active {
  transition: 0.3s ease;
}

@{deep} .fade-slide-up-enter {
  transform: translateY(-20%);
  opacity: 0;
}
@{deep} .fade-slide-up-enter-to {
  transform: 0;
  opacity: 1;
}
@{deep} .fade-slide-up-leave-to {
  transform: translateY(20%);
  opacity: 0;
}
@{deep} .fade-slide-up-enter-active, @{deep} .fade-slide-up-leave-active {
  transition: 0.3s ease;
}
</style>