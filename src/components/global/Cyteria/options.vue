<template>
  <div class="cy--options" :class="rootClassList">
    <div class="title-container" @click="toggleUnfold">
      <slot name="title" :unfold="unfold"></slot>
    </div>
    <cy-transition type="fade">
      <div class="options-container" v-if="unfold" :style="optionsPosition" @click="toggleUnfold">
        <div class="options">
          <slot name="options"></slot>
        </div>
      </div>
    </cy-transition>
  </div>
</template>
<script>
export default {
  props: {
    inline: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      unfold: false,
      optionsPosition: {
        top: '100%'
      }
    };
  },
  computed: {
    rootClassList() {
      return {
        'inline': this.inline
      };
    }
  },
  methods: {
    toggleUnfold() {
      this.unfold = !this.unfold;

      if (this.unfold) {
        const rect = this.$el.getBoundingClientRect();

        const position = {};

        const len2bottom = window.innerHeight - rect.bottom;
        if (rect.top >= len2bottom) {
          position.bottom = '100%';
        } else {
          position.top = '100%';
        }
        const len2right = window.innerWidth - rect.right;
        if (rect.left >= len2right) {
          position.right = '0';
        } else {
          position.left = '0';
        }
        this.optionsPosition = position;
      }
    }
  }
}
</script>
<style lang="less" scoped>
.cy--options {
  position: relative;
  margin: 0.3rem 0.4rem;
  max-width: 20rem;
  background-color: var(--white);

  &.inline {
    margin: 0;
    display: inline-block;
    background-color: transparent;

    > .title-container {
      border: 0;
      display: flex;
    }
  }

  > .title-container {
    border: 1px solid var(--primary-light-2);
    transition: 0.3s ease;
  }
  > .options-container {
    position: absolute;
    z-index: 20;
    width: 100%;
    min-width: 15rem;

    &::before {
      content: '';
      position: fixed;
      width: 100%;
      height: 100%;
      background-color: rgba(var(--rgb-white), 0.5);
      top: 0;
      left: 0;
      z-index: -1;
    }

    > .options {
      max-height: 40vh;
      overflow-y: auto;
      // box-shadow: 0.1rem 0.1rem 0.2rem rgba(var(--rgb-primary-dark), 0.4);
      border: 1px solid var(--primary-light-2);
      background-color: var(--white);
      z-index: 1;
    }
  }
}
</style>