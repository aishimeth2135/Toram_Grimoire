<template>
  <div
    class="overflow-auto rounded border-1 border-primary-30 bg-white shadow"
    style="max-height: calc(75vh - 4rem)"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
</script>
