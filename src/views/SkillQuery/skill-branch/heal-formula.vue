<template>
  <div class="inline-content">
    <span
      v-if="isSingleValue"
      class="text-sm mr-1 text-light-2"
    >
      {{ $lang('pretext: is constant') }}
    </span>
    <span
      v-if="showData['constant']"
      class="attr-scope"
      v-html="showData['constant']"
    />
    <cy-icon-text
      v-if="showData['constant'] && showData['@extra-value-list'].length !== 0"
      icon="ic-round-add"
    />

    <template
      v-for="(data, i) in showData['@extra-value-list']"
      :key="data.text + data.value"
    >
      <span class="extra-value">
        <span class="attr-scope title">{{ data.text }}</span>
        <cy-icon-text icon="ic-round-close" />
        <span class="attr-scope value" v-html="data.value" />
      </span>
      <cy-icon-text
        v-if="i != showData['@extra-value-list'].length - 1"
        icon="ic-round-add"
      />
    </template>
  </div>
</template>

<script>
export default {
  RegisterLang: 'Skill Query/Branch',
  props: ['showData'],
  computed: {
    isSingleValue() {
      return this.showData['@extra-value-list'].length === 0 &&
        this.showData['@--data-container-records'].find(p => p.key === 'constant').isNumberValue();
    },
  },
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
