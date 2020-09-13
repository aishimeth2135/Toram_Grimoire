<template>
  <div class="cy--options">
    <div class="title-container"
      @click="toggleUnfold">
      <div class="title">
        <slot name="title"></slot>
      </div>
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
  data() {
    return {
      unfold: false,
      optionsPosition: {
        top: '100%'
      }
    };
  },
  methods: {
    toggleUnfold() {
      this.unfold = !this.unfold;

      if (this.unfold) {
        const rect = this.$el.getBoundingClientRect();

        const len2bottom = window.innerHeight - rect.bottom;
        this.optionsPosition = rect.top >= len2bottom ? { bottom: '0' } : { top: '100%' };
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

  > .title-container {
    border: 1px solid var(--primary-light-2);
    transition: 0.3s ease;
  }
  > .options-container {
    position: absolute;
    z-index: 20;
    left: 0;
    width: 100%;

    &::before {
      content: '';
      position: fixed;
      width: 100%;
      height: 100%;
      background-color: rgba(var(--rgb-white), 0.3);
      top: 0;
      left: 0;
    }

    > .options {
      max-height: 40vh;
      overflow-y: auto;
      // box-shadow: 0.1rem 0.1rem 0.2rem rgba(var(--rgb-primary-dark), 0.4);
      border: 1px solid var(--primary-light-2);
      border-top-width: 0;
      background-color: var(--white);
    }
  }
}
</style>