<template>
  <div class="cy--options">
    <div class="title-container" :class="{ 'unfold': unfold }"
      @click="toggleUnfold">
      <div class="title">
        <slot name="title"></slot>
      </div>
    </div>
    <cy-transition type="fade">
      <div class="options" v-if="unfold" @click="toggleUnfold">
        <slot name="options"></slot>
      </div>
    </cy-transition>
  </div>
</template>
<script>
export default {
  data() {
    return {
      unfold: false
    };
  },
  methods: {
    toggleUnfold() {
      this.unfold = !this.unfold;
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

    &.unfold {
      border-bottom-color: transparent;

      > .title {
        opacity: 0.7;
      }
    }
  }
  > .options {
    position: absolute;
    z-index: 20;
    top: 100%;
    left: 0;
    width: 100%;
    max-height: 20rem;
    overflow-y: auto;
    // box-shadow: 0.1rem 0.1rem 0.2rem rgba(var(--rgb-primary-dark), 0.4);
    border: 1px solid var(--primary-light-2);
    border-top-width: 0;
    background-color: var(--white);
  }
}
</style>