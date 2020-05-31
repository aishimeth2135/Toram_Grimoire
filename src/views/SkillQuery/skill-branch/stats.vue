<template>
  <div class="main--">
    <div class="stat" v-for="(statText, i) in statTexts">
      <cy-icon-text iconify-name="mdi-leaf">
        <span v-html="statText"></span>
      </cy-icon-text>
    </div>
  </div>
</template>
<script>
export default {
  props: ['stats'],
  inject: ['langText', 'calcValueStr', 'highlightValueStr'],
  computed: {
    statTexts() {
      return this.stats.map(p => {
        const q = p.copy();
        q.statValue(this.calcValueStr(q.statValue()));
        return this.highlightValueStr(q.show(), p.statValue(), { base: '' });
      });
    }
  }
};
</script>
<style lang="less" scoped>
@deep-operator: ~'>>>';

.main-- {
  margin-left: 0.4rem;
}

div.stat {
  display: inline-block;
  margin-right: 0.6rem;

  @{deep-operator} svg {
    width: 0.8rem;
    height: 0.8rem;
    align-self: flex-end;
  }
  @{deep-operator} .text {
    margin-left: 0.2rem;
  }
}

</style>