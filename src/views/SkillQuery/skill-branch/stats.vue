<template>
  <div class="mr-2">
    <div
      v-for="statText in statTexts"
      :key="statText.iid"
      class="inline-block mr-3"
    >
      <cy-icon-text icon="mdi-leaf" type="item">
        <span v-html="statText.text" />
      </cy-icon-text>
    </div>
  </div>
</template>
<script>
import DataContainer from "../utils/DataContainer.js";

export default {
  inject: ['calcValueStr', 'handleDataContainer'],
  props: ['stats'],
  computed: {
    statTexts() {
      return this.stats.map((p, i) => {
        const dc = new DataContainer(p.value);

        let v = this.calcValueStr(dc.value());
        let sign = '+';
        if (/^\(?-?[\d.]+\)?$/.test(v)) {
          v = v.replace(/\(?(-?[\d.]+)\)?/, (m, m1) => m1);
          if (v.charAt(0) == '-') {
            sign = '-';
          }
        }

        const beforeColorText = v => sign + (sign == '-' ? v.replace('-', '') : v) + sd.tail;

        const sd = p.getShowData();
        this.handleDataContainer(dc, { beforeColorText });

        return {
          text: sd.title + dc.result(),
          iid: i,
        };
      });
    },
  },
};
</script>
