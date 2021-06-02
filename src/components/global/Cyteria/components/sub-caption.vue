<template>
  <teleport v-if="root" to="body">
    <div v-if="captionVisible"
      class="cy--sub-caption-container fixed border-1 rounded-lg border-purple p-1 bg-white flex z-10"
      :style="captionPosition">
      <div class="py-1 px-2 flex flex-wrap w-max">
        <slot></slot>
      </div>
    </div>
  </teleport>
</template>
<script>
import CY from "@utils/Cyteria";

export default {
  props: {
    root: {
      type: HTMLElement
    }
  },
  data() {
    return {
      captionVisible: false,
      captionPosition: null,
    };
  },
  created() {
    this.$watch(() => this.root, el => {
      if (el) {
        el.addEventListener('mouseenter', () => this.showCaption());
        el.addEventListener('mouseleave', () => this.hideCaption());
      }
    });
  },
  methods: {
    showCaption() {
      this.updateCaptionPosition();
      this.captionVisible = true;
    },
    hideCaption() {
      this.captionVisible = false;
    },
    updateCaptionPosition() {
      const el = this.root;
      const rect = el.getBoundingClientRect();

      const position = {};

      const margin = CY.element.convertRemToPixels(0.1);
      const wh = window.innerHeight, ww = window.innerWidth;
      const len2bottom = wh - rect.bottom;
      if (rect.top >= len2bottom) {
        position.bottom = (wh - rect.bottom + rect.height + margin) + 'px';
      } else {
        position.top = (rect.top + rect.height + margin) + 'px';
      }
      const len2right = window.innerWidth - rect.right;
      if (rect.left >= len2right) {
        position.right = (ww - rect.right + margin) + 'px';
      } else {
        position.left = (rect.left + margin) + 'px';
      }
      this.captionPosition = position;
    },
    fixPosition(el) {
      /** @type {DOMRect} */
      const rect = el.getBoundingClientRect();
      const ww = window.innerWidth;
      const pd = CY.element.convertRemToPixels(1);
      if (rect.left < pd) {
        el.style.left = pd;
        el.style.right = 'auto';
      } else if (rect.right > ww - pd) {
        el.style.right = pd;
        el.style.left = 'auto';
      }
    }
  }
}
</script>
<style scoped>
.cy--sub-caption-container {
  max-width: calc(100vw - 2rem);
}
</style>