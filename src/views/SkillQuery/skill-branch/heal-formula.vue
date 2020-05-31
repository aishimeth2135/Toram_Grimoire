<template>
  <div class="inline-content">
    <span class="attr-scope" v-if="showData['constant']"
      v-html="showData['constant']">
    </span>
    <cy-icon-text iconify-name="ic-round-add" v-if="showData['constant'] && showData['@extra-value-list'].length != 0" />
    <span v-for="(data, i) in showData['@extra-value-list']" class="extra-value">
      <span class="attr-scope title">{{ data.text }}</span>
      <cy-icon-text iconify-name="ic-round-close" />
      <span class="attr-scope value" v-html="data.value"></span>
      <cy-icon-text v-if="i != showData['@extra-value-list'].length - 1" iconify-name="ic-round-add" />
    </span>
  </div>
</template>
<script>
export default {
  props: ['showData']
};
</script>
<style lang="less" scoped>
.extra-value {
  display: inline-flex;
  align-items: center;
  padding: 0 0.4rem;

  > .title {
    padding-right: 0.2rem;
    padding-left: 0;
  }
  > .value {
    padding-left: 0.2rem;
    padding-right: 0;
  }
}
</style>