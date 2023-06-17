<template>
  <div class="edit-mask-content">
    <slot />
    <div class="edit-mask">
      <cy-icon icon="ic:round-mode-edit" width="1.5rem" />
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
    @apply absolute left-0 top-0 z-1 flex h-full w-full items-center justify-center bg-white bg-opacity-0 opacity-0 duration-300;
  }

  &:hover > .edit-mask {
    @apply pointer-events-none bg-opacity-50 opacity-100;
  }
}
</style>
