<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import { CharacterEquipment, EquipmentKinds } from '@/lib/Character/CharacterEquipment'

import CommonPropInput from '../common/common-prop-input.vue'
import CommonPropNumberInput from '../common/common-prop-number-input.vue'
import CharacterEquipmentDetailsEditLabel from './character-equipment-details-edit-label.vue'

interface Props {
  equipment: CharacterEquipment
}

defineProps<Props>()

const { t } = useI18n()
</script>

<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="w-full space-y-6">
    <div>
      <CommonPropInput
        v-model:value="equipment.name"
        :title="t('character-simulator.equipment-basic-editor.equipment-name')"
      />
    </div>
    <div v-if="equipment.customTypeList">
      <div class="px-1.5 text-sm text-stone-60">
        {{ t('character-simulator.equipment-basic-editor.equipment-type') }}
      </div>
      <cy-button-radio-group
        v-model:value="equipment.type"
        :options="
          equipment.customTypeList.map(item => ({
            text: t('common.Equipment.category.' + item),
            value: item,
          }))
        "
        class="-mb-0.5 mt-1.5"
      />
    </div>
    <div v-if="equipment.is(EquipmentKinds.Weapon)" class="flex flex-wrap items-center">
      <CommonPropNumberInput v-model:value="equipment.basicValue" title="ATK" class="mr-8" />
      <CommonPropNumberInput
        v-if="equipment.hasStability"
        v-model:value="equipment.stability"
        :title="$t('character-simulator.equipment-info.stability')"
        unit="%"
        range="0~100"
      />
    </div>
    <div v-else-if="equipment.is(EquipmentKinds.Armor)">
      <CommonPropNumberInput v-model:value="equipment.basicValue" title="DEF" range="0~9999" />
    </div>
    <div v-if="equipment.hasRefining">
      <CommonPropNumberInput
        v-model:value="equipment.refining"
        :title="t('character-simulator.equipment-info.refining')"
        range="0~15"
      />
    </div>
    <div class="w-full max-w-[20rem]">
      <CharacterEquipmentDetailsEditLabel :equipment="equipment" />
    </div>
  </div>
</template>
