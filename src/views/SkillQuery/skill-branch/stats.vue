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
import DataContainer from '../utils/DataContainer.js';

export default {
  inject: ['calcValueStr', 'handleDataContainer'],
  props: ['stats'],
  computed: {
    statTexts() {
      return this.stats.map((p, i) => {
        const dc = new DataContainer(p.value);

        let value = this.calcValueStr(dc.value());
        let sign = '+';
        if (/^\(?-?[\d.]+\)?$/.test(value)) {
          value = value.replace(/\(?(-?[\d.]+)\)?/, (m, m1) => m1);
          if (value.charAt(0) == '-') {
            sign = '-';
          }
        }

        const sd = p.getShowData();
        const beforeColorText = v => sign + (sign == '-' ? v.replace('-', '') : v) + sd.tail;
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
