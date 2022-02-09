<template>
  <div ref="rootElement" class="cy--options" :class="rootClassList">
    <div class="title-container" @click="toggleUnfold">
      <slot name="title" :unfold="unfold" />
    </div>
    <teleport to="#app-popovers">
      <cy-transition type="fade">
        <div v-if="unfold" class="cy--options-container" :style="optionsPosition" @click="toggleUnfold">
          <div class="options-items">
            <slot name="options" />
          </div>
        </div>
      </cy-transition>
    </teleport>
  </div>
</template>

<script lang="ts">
export default {
  name: 'CyOptions',
}
</script>

<script lang="ts" setup>
import { computed, CSSProperties, Ref, ref } from 'vue'

interface Props {
  inline?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  inline: false,
})

const rootElement: Ref<HTMLElement | null> = ref(null)
const unfold = ref(false)
const optionsPosition: Ref<CSSProperties> = ref({})

const rootClassList = computed(() => ({ 'cy--options-inline': props.inline }))

const toggleUnfold = () => {
  unfold.value = !unfold.value

  if (unfold.value) {
    const rect = rootElement.value!.getBoundingClientRect()

    const position = {} as CSSProperties
    const padding = 8

    const len2bottom = window.innerHeight - rect.bottom
    if (rect.top >= len2bottom) {
      position.bottom = ((window.innerHeight - rect.bottom) + rect.height + padding) + 'px'
    } else {
      position.top = (rect.top + rect.height + padding) + 'px'
    }
    const len2right = window.innerWidth - rect.right
    if (rect.left >= len2right) {
      position.right = ((window.innerWidth - rect.right) + padding) + 'px'
    } else {
      position.left = (rect.left + padding) + 'px'
    }
    optionsPosition.value = position
  }
}
</script>

<style lang="postcss" scoped>
.cy--options {
  position: relative;
  margin: 0.3rem 0.4rem;
  max-width: 20rem;
  background-color: var(--white);

  &.cy--options-inline {
    margin: 0;
    display: inline-block;
    background-color: transparent;

    & > .title-container {
      border: 0;
      display: flex;
    }
  }

  & > .title-container {
    border: 1px solid var(--primary-light-2);
    transition: 0.3s ease;
  }
}

.cy--options-container {
  position: fixed;
  z-index: 20;
  min-width: 15rem;

  &::before {
    content: '';

    @apply fixed w-full h-full bg-white bg-opacity-50 top-0 left-0 -z-1;
  }

  & > .options-items {
    max-height: 40vh;
    overflow-y: auto;
    border: 1px solid var(--primary-light-2);
    background-color: var(--white);
    z-index: 1;
  }
}
</style>
