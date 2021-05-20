<template>
  <div v-if="root" ref="caption"
    class="cy--sub-caption-container fixed border-1 rounded-lg border-purple p-1 bg-white hidden z-10"
    :style="captionPosition">
    <div class="py-1 px-2 flex flex-wrap w-max">
      <slot></slot>
    </div>
  </div>
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
      captionPosition: null,
      captionEl: null
    }
  },
  created() {
    this.$watch(() => this.root, el => {
      if (el) {
        el.addEventListener('mouseenter', () => this.showCaption());
        el.addEventListener('mouseleave', () => this.hideCaption());
      }
    });
  },
  // mounted() {
  //   if (this.root) {
  //     this.root.addEventListener('mouseenter', () => this.showCaption());
  //     this.root.addEventListener('mouseleave', () => this.hideCaption());
  //   }
  // },
  methods: {
    showCaption() {
      if (!this.$refs['caption']) {
        return;
      }
      if (this.captionEl) {
        document.body.removeChild(this.captionEl);
      }
      this.updateCaptionPosition();
      this.$nextTick(() => {
        const el = this.$refs['caption'].cloneNode(true);
        el.classList.add('flex');
        el.classList.remove('hidden');
        this.captionEl = el;
        document.body.append(this.captionEl);
        this.$nextTick(() => this.fixPosition(this.captionEl));
      });
    },
    hideCaption() {
      if (this.captionEl) {
        document.body.removeChild(this.captionEl);
        this.captionEl = null;
      }
    },
    updateCaptionPosition() {
      const el = this.root;
      const rect = el.getBoundingClientRect();

      const position = {};

      const wh = window.innerHeight;
      const len2bottom = wh - rect.bottom;
      if (rect.top >= len2bottom) {
        position.bottom = (wh - rect.bottom + rect.height + 2) + 'px';
      } else {
        position.top = (rect.top + rect.height) + 'px';
      }
      const len2right = window.innerWidth - rect.right;
      if (rect.left >= len2right) {
        position.right = (rect.right + 2) + 'px';
      } else {
        position.left = (rect.left + 2) + 'px';
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