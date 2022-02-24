<template>
  <footer v-once class="border-t border-light mt-8 bg-white h-12">
    <div
      class="mx-auto text-right py-1 px-3 overflow-x-auto whitespace-nowrap flex items-center"
      style="max-width: 48rem;"
    >
      <cy-icon-text icon="uil-twitter-alt" class="ml-auto">
        <a href="https://twitter.com/Cyteria_w" target="_blank" class="text-purple mr-2">Cyteria</a>
      </cy-icon-text>
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AppFooter',
})
</script>
