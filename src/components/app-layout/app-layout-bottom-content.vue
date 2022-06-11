<template>
  <div
    class="border-1 border-light-2 rounded bg-white overflow-auto shadow"
    style="max-height: calc(75vh - 4rem)"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
</script>
