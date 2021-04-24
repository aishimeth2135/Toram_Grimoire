<template>
  <div class="inline-content">
    <span class="divider c2" v-if="showData['extra_constant'] && showFrequency"></span>
    <span class="divider" v-if="showData['constant']"></span>
    <span class="attr-scope" v-if="showData['base']">{{ showData['base'] }}</span>
    <cy-icon-text icon="ic-round-add" v-if="showData['base'] && showData['constant']" />
    <span class="attr-scope" v-if="showData['constant']"
      v-html="showData['constant']">
    </span>
    <span class="divider" v-if="showData['constant']"></span>
    <cy-icon-text icon="ic-round-close" />
    <span class="attr-scope" v-html="showData['multiplier']"></span>
    <cy-icon-text icon="ic-round-add" v-if="showData['extra_constant']" />
    <span class="attr-scope" v-if="showData['extra_constant']" v-html="showData['extra_constant']"></span>
    <span class="divider c2" v-if="showData['extra_constant'] && showFrequency"></span>
    <cy-icon-text icon="ic-round-close" v-if="showData['@parent-branch'].attrs['title'] == 'each' && showData['frequency']" />
    <span class="attr-scope" v-if="showFrequency"
      v-html="showData['frequency']">
    </span>
  </div>
</template>
<script>
export default {
  props: ['showData'],
  computed: {
    showFrequency() {
      return this.showData['@parent-branch'].attrs['title'] == 'each';
    }
  }
};
</script>
<style lang="less" scoped>
.divider {
  border-left: 2px solid var(--primary-light-2);
  margin: 0 0.4rem;
  height: 1.5rem;

  &.c2 {
    border-color: var(--primary-orange);
  }
}
</style>