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
import DataContainer from "../module/DataContainer.js";

export default {
  props: ['stats'],
  inject: ['langText', 'calcValueStr', 'handleDataContainer'],
  computed: {
    statTexts() {
      return this.stats.map(p => {
        const dc = new DataContainer(p.statValue());

        let v = this.calcValueStr(dc.value());
        let sign = '+';
        if (/^\(?[\d.-]+\)?$/.test(v)) {
          v = v.replace(/\(?([\d.-]+)\)?/, (m, m1) => m1);
          if (v.charAt(0) == '-') {
            sign = '-';
          }
        }

        const beforeColorText = v => sign + (sign == '-' ? v.replace('-', '') : v) + sd.tail;

        const sd = p.getShowData();
        this.handleDataContainer(dc, { beforeColorText });

        return sd.title + dc.result();
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