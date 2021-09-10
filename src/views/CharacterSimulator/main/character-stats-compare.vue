<template>
  <div>
    <template v-if="comparedStatsDatas.length != 0">
      <div v-for="p in comparedStatsDatas" :key="p.id" class="line">
        <template v-if="!p.isBoolStat">
          <cy-icon-text size="small">
            {{ p.text }}
          </cy-icon-text>
          <span
            class="value"
            :class="{ 'negative': p.negative }"
          >{{ p.displayValue }}</span>
        </template>
        <cy-icon-text
          v-else
          size="small"
          :text-color="p.negative ? 'gray' : 'light-3'"
        >
          {{ p.text }}
        </cy-icon-text>
      </div>
    </template>
    <cy-default-tips v-else icon="mdi-ghost">
      {{ $lang('Warn/character stats compare: no result') }}
    </cy-default-tips>
  </div>
</template>
<script>
export default {
  // data create by [main.vue].methods.handleCharacterStateDatas()
  RegisterLang: 'Character Simulator',
  props: ['before', 'after'],
  computed: {
    comparedStatsDatas() {
      const before = this.before.map(p => p.stats).flat(),
        after = this.after.map(p => p.stats).flat();

      // const vFix = v => v.toString()
      //    .replace(/^(-?\d+\.)(\d{3,})$/, (m, m1, m2) => m1 + m2.slice(0, 3));
      const handle = (p, v, hidden) => {
        const isBoolStat = p.origin.isBoolStat;
        return {
          id: p.id,
          text: isBoolStat ? (v >= 0 ? '+' : '-') + p.name : p.name,
          value: v,
          displayValue: (v >= 0 ? '+' : '') + p.origin.getDisplayValue(v),
          negative: v < 0,
          isBoolStat,
          hidden,
        };
      };

      const res = after.map(p => {
        let v = p.resultValue;
        const idx = before.findIndex(a => a.id == p.id);
        let hidden = p.hidden;
        if (idx != -1) {
          const t = before[idx];
          v = v - t.resultValue;
          before.splice(idx, 1);
          hidden = p.hidden && t.hidden;
        }
        return handle(p, v, hidden);
      });

      res.push(...before.map(p => handle(p, -1 * p.value, p.hidden)));

      return res
        .filter(p => !p.hidden)
        .filter(p => p.value != 0);
    },
  },
};
</script>
<style lang="less" scoped>
.line {
  display: flex;
  align-items: center;

  > .value {
    font-size: 0.9rem;
    margin-left: 0.3rem;
    color: var(--primary-light-3);

    &.negative {
      color: var(--primary-gray);
    }
  }
}
</style>
