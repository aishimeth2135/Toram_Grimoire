<template>
  <fragment>
    <template v-for="(name, i) in ['main', 'sub', 'body']">
      <cy-icon-text v-if="equipment[name] != -1" class="text-small item"
        :iconify-name="name | equipmentIcon">
        {{ equipment[name] }}
      </cy-icon-text>
    </template>
    <cy-icon-text v-if="equipment.none" iconify-name="mdi-rhombus-outline" class="text-small item">
      {{ equipment.none }}
    </cy-icon-text>
  </fragment>
</template>
<script>
import { Fragment } from 'vue-fragment';

export default {
  props: ['equipment'],
  inject: ['langText'],
  filters: {
    equipmentIcon(fieldType) {
      return {
        'main': 'mdi-sword',
        'sub': 'mdi-shield',
        'body': 'mdi-tshirt-crew'
      }[fieldType];
    }
  },
  components: {
    'fragment': Fragment
  }
};
</script>
<style lang="less" scoped>
.item {
  margin-right: 0.4rem;
}
</style>