<template>
  <main class="app-layout-main">
    <slot></slot>
  </main>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({})
</script>

<style scoped>
.app-layout-main {
  min-height: 100%;
  max-width: 48rem;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
}
</style>
