<template>
  <div class="inline-content">
    <span v-if="isSingleValue"
      style="font-size: 0.9rem; margin-right: 0.2rem; color: var(--primary-light-2);">
      {{ langText('pretext: is constant') }}
    </span>
    <span class="attr-scope" v-if="showData['constant']"
      v-html="showData['constant']">
    </span>
    <cy-icon-text iconify-name="ic-round-add" v-if="showData['constant'] && showData['@extra-value-list'].length != 0" />

    <template v-for="(data, i) in showData['@extra-value-list']">
      <span class="extra-value" :key="data.text + data.value + '-value'">
        <span class="attr-scope title">{{ data.text }}</span>
        <cy-icon-text iconify-name="ic-round-close" />
        <span class="attr-scope value" v-html="data.value"></span>
      </span>
      <cy-icon-text v-if="i != showData['@extra-value-list'].length - 1" iconify-name="ic-round-add"
        :key="data.text + data.value + '-icon'" />
    </template>
  </div>
</template>
<script>
export default {
  props: ['showData'],
  inject: ['langText'],
  computed: {
    isSingleValue() {
      return this.showData['@extra-value-list'].length == 0 &&
        this.showData['@--data-container-records'].find(p => p.key == 'constant').isNumberValue();
    }
  }
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