<template>
  <div class="equipment-field p-3 border border-solid border-light m-2 bg-white">
    <div class="flex items-center border-b border-solid border-light pb-1 mb-3">
      <cy-icon-text icon="gg-shape-square" size="small" text-color="purple">
        {{ $globalLang('common/Equipment/field/' + field.type.description) }}
      </cy-icon-text>
      <div class="ml-auto leading-none">
        <cy-button v-if="!field.isEmpty()"
          icon="ic-round-close"
          type="icon" class="p-0"
          icon-color="red"
          @click="$emit('remove-field-equipment', field)" />
        <cy-button icon="ic-round-view-list"
          type="icon" class="p-0"
          icon-color="orange"
          @click="$emit('select-field-equipment', field)" />
      </div>
    </div>
    <equipment-info v-if="!field.isEmpty()" :equipment="field.equipment"
      :stats-disabled="field.statsDisable()" />
    <cy-default-tips v-else icon="potum" icon-src="custom">
      {{ $lang('Warn/no equipment selected') }}
    </cy-default-tips>
  </div>
</template>
<script>
import vue_equipmentInfo from "./equipment-info.vue";

export default {
  RegisterLang: 'Character Simulator',
  emits: ['remove-field-equipment', 'select-field-equipment'],
  props: ['field'],
  components: {
    'equipment-info': vue_equipmentInfo
  }
}
</script>
<style lang="less" scoped>
.equipment-field {
  width: 23rem;
}
</style>