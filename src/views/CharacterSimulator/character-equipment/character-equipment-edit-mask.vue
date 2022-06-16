<template>
  <div class="edit-mask-content">
    <slot />
    <div class="edit-mask">
      <cy-icon-text icon="ic:round-mode-edit" icon-width="1.5rem" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CharacterEquipmentEditMask',
})
</script>

<style lang="postcss" scoped>
.edit-mask-content {
  @apply relative inline-block cursor-pointer rounded-md;

  & > .edit-mask {
    @apply absolute top-0 left-0 flex items-center justify-center w-full h-full opacity-0 bg-opacity-0 bg-white duration-300 z-1;
  }

  &:hover > .edit-mask {
    @apply opacity-100 bg-opacity-50 pointer-events-none;
  }
}
</style>
