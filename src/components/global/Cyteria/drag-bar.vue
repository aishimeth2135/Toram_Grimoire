<template>
  <div v-if="type == 'normal'" class="drag-bar-layout">
    <div class="title">
      <slot name="title" />
    </div>
    <div class="content">
      <div class="content-container">
        <input
          type="range"
          class="drag-input"
          :min="range[0]"
          :max="range[1]"
          :step="step"
          :value="value"
          @input="setValue($event)"
        >
        <div class="drag-bg">
          <div class="drag-pre" :style="{ width: offset }" />
        </div>
      </div>
      <!-- <div class="drag-bar-container">
        <div class="drag-bar">
          <span :style="{left: offset}"></span>
        </div>
        <div class="mask" @mousedown.prevent="startMouseDown" @mousemove.prevent="updateValue($event)" @click.prevent="updateValue($event)" @mouseup.prevent="cancelMouseDown" @mouseleave.prevent="cancelMouseDown">
        </div>
      </div> -->
      <div class="value">
        {{ value }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: 'normal',
    },
    range: {
      type: Array,
      default () {
        return [0, 100]
      },
    },
    value: {
      type: Number,
      required: true,
    },
    step: {
      type: Number,
      default: 1,
    },
  },
  emits: ['update:value'],
  data() {
    return {
      isMouseDown: false,
    }
  },
  computed: {
    offset() {
      return Math.floor(100 * (this.value - this.range[0]) / (this.range[1] - this.range[0])) + '%'
    },
  },
  methods: {
    cancelMouseDown() {
      this.isMouseDown = false
    },
    startMouseDown() {
      this.isMouseDown = true
    },
    updateValue(e) {
      if (!this.isMouseDown && e.type != 'click')
        return
      const x = e.offsetX
      const box_w = e.target.getBoundingClientRect().width

      let v = Math.floor(this.range[1] * x / box_w + 0.5)
      v = Math.min(this.range[1], v)
      v = Math.max(this.range[0], v)

      this.$emit('update:value', v)
    },
    setValue(e) {
      const v = parseInt(e.target.value, 10)
      this.$emit('update:value', v)
    },
  },
}
</script>

<style lang="less" scoped>
.drag-bar-layout {
    padding: 0.6rem 0;

  >.title {
    font-size: 0.9rem;
    color: var(--primary-light-3);
  }

  > .content {
    display: flex;
    align-items: center;
    padding: 0 0.6rem;

    > .content-container {
      width: 85%;
      position: relative;

      > .drag-input {
        -webkit-appearance: none;
        overflow: hidden;
        width: 100%;
        height: 2rem;
        outline: none;
        background: none;

        &::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 0.8rem;
          height: 0.8rem;
          background: var(--primary-light-4);
          border-radius: 50%;
          transition: 0.2s;
        }
        &::-moz-range-thumb {
          width: 0.8rem;
          height: 0.8rem;
          background: var(--primary-light-4);
          border: none;
          border-radius: 50%;
          transition: 0.2s;
        }
        &:active::-webkit-slider-thumb, &::-moz-range-thumb:hover {
          width: 1.2rem;
          height: 1.2rem;
        }
        &::-moz-focus-outer {
          border: none;
        }
      }
      .drag-bg {
        position: absolute;
        top: 1rem;
        left: 0.4rem;
        border-radius: 0.1rem;
        height: 0.2rem;
        background-color: var(--primary-light);
        width: calc(100% - 0.8rem);
        z-index: -1;

        > .drag-pre {
          border-radius: 0.1rem;
          height: 0.2rem;
          top: 0;
          left: 0;
          background: var(--primary-light-3);
        }
      }
    }

    > .value {
      margin-left: 1rem;
    }
  }

  // >.content {
  //   display: flex;
  //   align-items: center;
  //   padding: 0 0.6rem;

  //   >.drag-bar-container {
  //     height: 2.5rem;
  //     width: 85%;
  //     display: flex;
  //     align-items: center;
  //     position: relative;
  //     padding: 0 0.2rem;

  //     >.mask {
  //       width: 100%;
  //       height: 100%;
  //       position: absolute;
  //       top: 0;
  //       left: 0;
  //       z-index: 1;
  //       cursor: pointer;
  //     }

  //     >.drag-bar {
  //       position: relative;
  //       border-radius: 0.1rem;
  //       height: 0.2rem;
  //       background-color: var(--primary-light);
  //       width: 100%;

  //       >span {
  //         position: absolute;
  //         transform: translate(-50%, calc(-50% + 0.1rem));
  //         width: 0.8rem;
  //         height: 0.8rem;
  //         border-radius: 50%;
  //         top: 0;
  //         background-color: var(--primary-light-4);
  //       }
  //     }
  //   }

  //   >.value {
  //     margin-left: 1rem;
  //   }
  // }
}
</style>
