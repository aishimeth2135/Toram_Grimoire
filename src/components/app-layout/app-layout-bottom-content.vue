<template>
  <div
    class="border-primary-30 overflow-auto rounded-sm border-2 bg-white shadow-sm"
    style="max-height: calc(75vh - 4rem)"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
</script>
