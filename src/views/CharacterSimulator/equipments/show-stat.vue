<template>
  <div class="stat-scope" :class="{ 'stat-invalid': !statValid }">
    <cy-icon-text v-if="type != 'custom'" iconify-name="mdi-leaf"
      :text-color="negativeValue ? 'red' : 'dark'">
      <span v-for="text in restrictionTexts"
        class="restriction" :key="text">{{ text }}</span><span>{{ stat.show() }}</span>
    </cy-icon-text>
    <cy-icon-text v-else iconify-name="mdi-leaf"
      :text-color="negativeValue ? 'red' : 'dark'">
      <slot></slot>
    </cy-icon-text>
  </div>
</template>
<script>
export default {
  props: ['stat', 'type', 'negativeValue'],
  inject: ['langText', 'checkStatRestriction'],
  computed: {
    restrictionTexts() {
      const res = [];
      const r = this.stat.restriction;
      r && ['main', 'sub', 'body']
        .forEach(p => {
          if (!r[p])
            return;
          let [instance, type] = r[p].description.split('|');
          if (!type)
            type = instance;
          const t = this.langText('stat restriction text/' + (p == 'main' ? '' : p + '/') + type);
          r[p] && res.push(t);
        });
      return res;
    },
    statValid() {
      // this.stat may be undefined when this.type is "custom"
      return  !this.stat || this.checkStatRestriction(this.stat);
    }
  }
};
</script>
<style lang="less" scoped>
@deep: ~'>>>';

.stat-scope {
  display: inline-block;
  margin-right: 0.6rem;

  @{deep} svg {
    width: 0.8rem;
    height: 0.8rem;
    align-self: flex-end;
  }
  @{deep} .text {
    margin-left: 0.2rem!important;
    align-items: flex-end!important;
  }
}

.stat-invalid {
  opacity: 0.6;
}

.restriction {
  color: var(--primary-water-blue);
  font-size: 0.9rem;
  margin-right: 0.3rem;
}
</style>