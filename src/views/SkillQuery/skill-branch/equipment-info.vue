<template>
  <span style="display: inline-block;">
    <template v-for="(data) in equipmentData">
      <cy-icon-text v-if="(typeof data !== 'string')" class="text-small equipment-item"
        :key="data.icon + data.text + 'text'"
        :icon="data.icon">
        {{ data.text }}
      </cy-icon-text>
      <cy-icon-text v-else :key="data.icon + data.text + 'operator'"
        class="text-small equipment-operator"
        :icon="data == 'or' ? 'mdi-slash-forward' : 'ic-round-add'" />
    </template>
    <cy-icon-text v-if="equipment.none" icon="mdi-rhombus-outline" class="text-small equipment-item">
      {{ equipment.none }}
    </cy-icon-text>
  </span>
</template>
<script>
export default {
  props: ['equipment'],
  filters: {
    equipmentIcon(fieldType) {
      return {
        'main': 'mdi-sword',
        'sub': 'mdi-shield',
        'body': 'mdi-tshirt-crew'
      }[fieldType];
    }
  },
  computed: {
    equipmentData() {
      const icons = {
        'main': 'mdi-sword',
        'sub': 'mdi-shield',
        'body': 'mdi-tshirt-crew'
      };
      const t =  ['main', 'sub', 'body'].filter(name => this.equipment[name] != -1);
      const o = this.equipment.operator == 0 ? 'or' : 'and';
      const res = [];
      t.forEach((name, i) => {
        res.push({
          text: this.equipment[name],
          icon: icons[name]
        });
        i != t.length - 1 && res.push(o);
      });
      return res;
    }
  }
};
</script>
<style lang="less" scoped>
.equipment-item {
  margin-right: 0.4rem;
}
.equipment-operator {
  --icon-color: var(--primary-green);
  margin-right: 0.3rem;
}
</style>