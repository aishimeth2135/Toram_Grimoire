<template>
  <div class="inline-content">
    <span class="divider border-orange" v-if="showData['extra_constant'] && showFrequency"></span>
    <span class="divider" v-if="showData['constant']"></span>
    <span class="attr-scope" v-if="showData['base']">{{ showData['base'] }}</span>
    <cy-icon-text v-if="showData['base'] && showData['constant']"
      icon="ic-round-add" />
    <span class="attr-scope" v-if="showData['constant']"
      v-html="showData['constant']">
    </span>
    <span class="divider" v-if="showData['constant']"></span>
    <cy-icon-text icon="ic-round-close" />
    <span class="attr-scope" v-html="showData['multiplier']"></span>
    <cy-icon-text v-if="showData['extra_constant']"
      icon="ic-round-add" />
    <span v-if="showData['extra_constant']"
      class="attr-scope"
      v-html="showData['extra_constant']">
    </span>
    <span v-if="showData['extra_constant'] && showFrequency"
      class="divider border-orange" />
    <cy-icon-text v-if="showFrequency && showData['frequency']"
      icon="ic-round-close" />
    <span v-if="showFrequency"
      class="attr-scope"
      v-html="showData['frequency']">
    </span>
  </div>
</template>
<script>
export default {
  props: ['showData'],
  computed: {
    showFrequency() {
      return this.showData['@parent-branch'].attrs['title'] === 'each';
    }
  }
};
</script>
<style lang="postcss" scoped>
.divider {
  @apply border-l-1 border-light-2 mx-2 h-6;
}
</style>