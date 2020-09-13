<template>
  <div class="cy--list-item" :class="{ 'selected': selected }"
    @click="itemClick">
    <!-- <iconify-icon v-if="selected" class="selected-icon"
      name="mdi-rhombus-medium-outline" /> -->
    <slot></slot>
    <span v-if="$slots['right-content']" class="right-content">
      <slot name="right-content"></slot>
    </span>
    <slot name="extra"></slot>
  </div>
</template>
<script>
export default {
  props: {
    selected: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    itemClick() {
      this.$emit('click');
    }
  }
};
</script>
<style lang="less" scoped>
.cy--list-item {
  display: flex;
  align-items: center;
  padding: 0.6rem 0.8rem;
  cursor: pointer;
  transition: 0.3s;
  position: relative;
  flex-wrap: wrap;

  &:hover, &.selected {
    background-color: rgba(var(--rgb-primary-light), 0.4);
  }

  &.selected {
    color: var(--primary-purple);
    border: 1px solid var(--primary-light-2);
  }

  &:not(.selected) + &:not(.selected) {
    border-top: 1px solid var(--primary-light);
  }

  > .right-content {
    display: inline-block;
    margin-left: auto;
  }

  // > .selected-icon {
  //   width: 1rem;
  //   height: 1rem;
  //   color: var(--primary-light-3);
  //   fill: currentcolor;
  //   position: absolute;

  //   top: 0;
  //   left: 0;
  //   transform: translate(-0.5rem, -0.5rem)!important;
  //   // animation: selected-icon 4s infinite;
  // }
}

// @keyframes selected-icon {
//   0% {
//     top: 0;
//     left: 0;
//   }
//   40% {
//     top: 0;
//     left: 100%;
//   }
//   50% {
//     top: 100%;
//     left: 100%;
//   }
//   90% {
//     top: 100%;
//     left: 0;
//   }
//   100% {
//     top: 0;
//     left: 0;
//   }
// }
</style>