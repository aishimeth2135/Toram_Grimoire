<template>
  <span class="detail-line-equipments">
    <span class="prefix">{{ langText('show character stats/equipped with: prefix text') }}</span>
    <span class="content">
      <template v-for="t in equipmentTexts">
        <cy-icon-text v-if="t.text == '+'" :key="'text-i-' + t.iid"
          iconify-name="ic-round-add" />
        <cy-icon-text v-else-if="t.text == '/'" :key="'text-i-' + t.iid"
          iconify-name="mdi-slash-forward" />
        <span v-else-if="t.text == '(' || t.text == ')'" :key="'separate-' + t.iid"
          class="separate" />
        <span class="part" v-else :key="'text-' + t.iid">
          {{ t.text }}
        </span>
      </template>
    </span>
    <span class="suffix">{{ langText('show character stats/equipped with: suffix text') }}</span>
  </span>
</template>
<script>
export default {
  props: ['equipmentTexts'],
  inject: ['langText']
}
</script>
<style lang="less" scoped>
.detail-line-equipments {
  display: inline-flex;
  align-items: center;
  > .prefix, & > .suffix {
    color: var(--primary-orange)
  }
  > .content {
    margin: 0 0.3rem;
    color: var(--primary-green);
    display: inline-flex;
    align-items: center;
  }
}
</style>