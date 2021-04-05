<template>
  <div class="equipment-field">
    <cy-flex-layout class="top">
      <cy-icon-text iconify-name="gg-shape-square" text-size="small" text-color="purple">
        {{ langText('character field names/' + field.type.description) }}
      </cy-icon-text>
      <template v-slot:right-content>
        <cy-button v-if="!field.isEmpty()"
          iconify-name="ic-round-close" type="icon-only" class="inline"
          @click="$emit('remove-field-equipment', field)" />
        <cy-button iconify-name="ic-round-view-list" type="icon-only" class="inline"
          @click="$emit('select-field-equipment', field)" />
      </template>
    </cy-flex-layout>
    <equipment-info v-if="!field.isEmpty()" :equipment="field.equipment"
      :stats-disable="field.statsDisable()" />
    <cy-default-tips v-else icon-id="potum">
      {{ langText('Warn/no equipment selected') }}
    </cy-default-tips>
  </div>
</template>
<script>
import vue_equipmentInfo from "./equipment-info.vue";

export default {
  props: ['field'],
  inject: ['langText'],
  components: {
    'equipment-info': vue_equipmentInfo
  }
}
</script>
<style lang="less" scoped>
@deep: ~'>>>';

.equipment-field {
  padding: 0.6rem;
  border: 1px solid var(--primary-light);
  margin: 0.4rem;
  width: 23rem;
  background-color: var(--white);

  > .top {
    border-bottom: 1px solid var(--primary-light);
    padding-bottom: 0.3rem;
    margin-bottom: 0.7rem;
  }
}
</style>