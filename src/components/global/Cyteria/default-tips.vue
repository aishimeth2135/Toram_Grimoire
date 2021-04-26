<template>
  <div class="cy--default-tips flex items-center justify-center px-1 py-4">
    <div class="flex items-center whitespace-normal">
      <cy-icon-text :icon="icon" :icon-src="iconSrc"
        style="--icon-width: 2.7rem" icon-color="light-2"
        class="mr-4" />
      <span :style="{ 'text-align': textAlign }"><slot></slot></span>
    </div>
  </div>
</template>
<script>
  export default {
    props: {
      icon: {},
      iconSrc: {},
      'textAlign': {
        type: String,
        default: 'center'
      }
    }
  }
</script>