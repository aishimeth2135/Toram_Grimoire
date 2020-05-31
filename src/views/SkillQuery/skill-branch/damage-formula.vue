<template>
  <div class="inline-content">
    <span class="divider" v-if="showData['constant']"></span>
    <span class="attr-scope" v-if="showData['base']">{{ showData['base'] }}</span>
    <cy-icon-text iconify-name="ic-round-add" v-if="showData['base'] && showData['constant']" />
    <span class="attr-scope" v-if="showData['constant']"
      v-html="showData['constant']">
    </span>
    <span class="divider" v-if="showData['constant']"></span>
    <cy-icon-text iconify-name="ic-round-close" />
    <span class="attr-scope" v-html="showData['multiplier']"></span>
    <cy-icon-text iconify-name="ic-round-close" v-if="showData['frequency']" />
    <span class="attr-scope" v-if="showData['frequency']"
      v-html="showData['frequency']">
    </span>
  </div>
</template>
<script>
export default {
  props: ['showData']
};
</script>
<style lang="less" scoped>
.divider {
  border-left: 2px solid var(--primary-light-2);
  margin: 0 0.4rem;
  height: 1.5rem;
}
</style>