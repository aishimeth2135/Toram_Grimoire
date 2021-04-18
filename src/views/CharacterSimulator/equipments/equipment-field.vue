<template>
  <div class="equipment-field p-3 border border-solid border-light m-2 bg-white">
    <div class="flex items-center border-b border-solid border-light pb-1 mb-3">
      <cy-icon-text iconify-name="gg-shape-square" text-size="small" text-color="purple">
        {{ $lang('character field names/' + field.type.description) }}
      </cy-icon-text>
      <div class="ml-auto leading-none">
        <cy-button v-if="!field.isEmpty()"
          iconify-name="ic-round-close"
          type="icon" class="p-0"
          icon-color="red"
          @click="$emit('remove-field-equipment', field)" />
        <cy-button iconify-name="ic-round-view-list"
          type="icon" class="p-0"
          icon-color="orange"
          @click="$emit('select-field-equipment', field)" />
      </div>
    </div>
    <equipment-info v-if="!field.isEmpty()" :equipment="field.equipment"
      :stats-disable="field.statsDisable()" />
    <cy-default-tips v-else icon-id="potum">
      {{ $lang('Warn/no equipment selected') }}
    </cy-default-tips>
  </div>
</template>
<script>
import vue_equipmentInfo from "./equipment-info.vue";

export default {
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