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
  inject: ['langText', 'calcValueStr', 'highlightValueStr', 'handleReplacedText', 'handleValueStr'],
  computed: {
    statTexts() {
      return this.stats.map(p => {
        const q = p.copy();
        let ov = this.calcValueStr(q.statValue());
        let v = ov, sign = '+';

        if (/^\(?[\d.-]+\)?$/.test(v)) {
          v = v.replace(/\(?([\d.-]+)\)?/, (m, m1) => m1);
          if (v.charAt(0) == '-') {
            v = -1 * v;
            sign = '-';
          }
          ov = v;
        }
        else
          v = this.handleReplacedText(v);

        q.statValue(v);

        const sd = q.getShowData();
        return sd.title + this.highlightValueStr(q.statValue(v), ov, p.statValue(), {
          extraHandle: v => sign + v + sd.tail
        });
        // let v = this.calcValueStr(q.statValue());
        // q.statValue(v);
        // if (/\(?[\d.-]+\)?/.test(v)) {
        //   v = v.replace(/\(?([\d.-]+)\)?/, (m, m1) => m1);
        //   console.log(v);
        //   return q.show();
        // }
        // return q.show({ calc: false });
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