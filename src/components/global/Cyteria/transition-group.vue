<template>
  <transition-group :name="type" :appear="appear" :tag="tag">
    <slot />
  </transition-group>
</template>

<script>
// import Velocity from "velocity-animate";

export default {
  props: {
    type: {
      type: String,
      required: true,
    },
    tag: {
      type: String,
      default: 'span',
    },
    appear: {
      type: Boolean,
    },
  },
};
</script>

<style lang="less" scoped>
::v-deep(.fade-enter-from), ::v-deep(.fade-leave-to) {
  opacity: 0;
}
::v-deep(.fade-enter-active), ::v-deep(.fade-leave-active) {
  transition: 0.3s ease;
}
::v-deep(.fade-enter-to), ::v-deep(.fade-leave-from) {
  opacity: 1;
}

::v-deep(.fade-slide-right-enter-from) {
  transform: translateX(-20%);
  opacity: 0;
}
::v-deep(.fade-slide-right-enter-to) {
  transform: 0;
  opacity: 1;
}
::v-deep(.fade-slide-right-leave-to) {
  transform: translateX(20%);
  opacity: 0;
}
::v-deep(.fade-slide-right-enter-active), ::v-deep(.fade-slide-right-leave-active) {
  transition: 0.3s ease;
}

::v-deep(.fade-slide-up-enter-from) {
  transform: translateY(-20%);
  opacity: 0;
}
::v-deep(.fade-slide-up-enter-to) {
  transform: 0;
  opacity: 1;
}
::v-deep(.fade-slide-up-leave-to) {
  transform: translateY(20%);
  opacity: 0;
}
::v-deep(.fade-slide-up-enter-active), ::v-deep(.fade-slide-up-leave-active) {
  transition: 0.3s ease;
}
</style>
