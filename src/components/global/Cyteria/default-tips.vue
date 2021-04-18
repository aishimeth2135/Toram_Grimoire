<template>
  <div class="cy--default-tips flex items-center justify-center px-1 py-4">
    <div class="content-container flex items-center whitespace-normal">
      <iconify-icon v-if="iconifyName" :name="iconifyName" />
      <svg-icon v-else-if="iconId" :icon-id="iconId" />
      <span :style="{ 'text-align': textAlign }"><slot></slot></span>
    </div>
  </div>
</template>
<script>
  export default {
    props: {
      'iconifyName': String,
      'icon-id': String,
      'textAlign': {
        type: String,
        default: 'center'
      }
    }
  }
</script>
<style lang="postcss" scoped>
.content-container {
  & > svg {
    width: 2.7rem;
    height: 2.7rem;

    @apply mr-4 text-light-2 flex-shrink-0;
  }
}
</style>