<template>
  <cy-transition>
    <div class="cy--detail-window" :style="position">
      <div class="content-container">
        <div class="content">
          <div v-if="$slots['title']" class="title">
            <slot name="title" />
          </div>
          <slot />
        </div>
      </div>
    </div>
  </cy-transition>
</template>

<script>
export default {
  props: ['positionElement'],
  computed: {
    position() {
      if (!this.positionElement) {
        return { }
      }
      const rect = this.positionElement.getBoundingClientRect()

      const len2bottom = window.innerHeight - rect.bottom
      return rect.top >= len2bottom ?
        { bottom: (len2bottom + rect.height + 10) + 'px' } :
        { top: (rect.top + rect.height + 10) + 'px' }
    },
  },
}
</script>

<style lang="postcss" scoped>
.cy--detail-window {
  position: fixed;
  width: 100%;
  left: 0;
  display: flex;
  justify-content: center;
  z-index: 15;

  & > .content-container {
    background-color: rgba(var(--rgb-app-white), 0.95);
    border: 1px solid var(--app-light-2);
    border-bottom: 0;
    box-shadow: 0.1rem 0.1rem 0.6rem 0.1rem var(--app-light);
    max-width: 30rem;
    min-width: 13rem;
    max-height: calc(47vh - 3rem);
    overflow-y: auto;
    margin: 0 0.6rem;

    & > .content {
      border-bottom: 1px solid var(--app-light-2);
      padding: 1rem;
      padding-bottom: 0;

      &::after {
        content: '';
        display: block;
        position: sticky;
        height: 1rem;
        border-radius: 20% 20% 0 0;
        bottom: 0;
        background-color: rgba(var(--rgb-app-white), 0.5);
      }

      & > .title {
        margin-bottom: 0.4rem;
      }
    }
  }
}
</style>
