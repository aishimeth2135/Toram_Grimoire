<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { computeFormula } from '@/shared/utils/data/parseFormula.ts'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import CommonEditModeButton from '../common/common-edit-mode-button.vue'
import CommonPropNumberInput from '../common/common-prop-number-input.vue'
import CharacterEquipmentDetailsSelectTrait from './character-equipment-details-select-trait.vue'
import CharacterEquipmentTraitCaption from './character-equipment-trait-caption.vue'
import CharacterEquipmentTraitTitle from './character-equipment-trait-title.vue'

interface Props {
  equipment: CharacterEquipment
}

const props = defineProps<Props>()

const { t } = useI18n()

const isEditing = ref(!props.equipment.trait)

const maxStack = computed(() => {
  if (!props.equipment.trait) {
    return 0
  }
  const raw = props.equipment.trait.base.getStackInfo('max')
  if (raw === '') {
    return 1
  }
  const resultMaxStack = computeFormula(raw, { Lv: props.equipment.trait.level }) as number
  if (typeof resultMaxStack === 'number') {
    return resultMaxStack
  }
  return 1
})
</script>

<template>
  <div class="flex h-full w-full flex-col py-2">
    <template v-if="equipment.supportTrait">
      <div class="mb-3 flex justify-end">
        <CommonEditModeButton v-model:is-editing="isEditing" />
      </div>
      <div v-if="!isEditing">
        <template v-if="equipment.trait">
          <div class="border-gray-20 flex w-full items-center border-b py-1">
            <CharacterEquipmentTraitTitle :equipment-trait="equipment.trait" />
            <cy-button-icon
              icon="mdi:close-circle-outline"
              color="gray"
              class="ml-auto"
              @click="equipment.removeTrait()"
            />
          </div>
          <div class="mt-2 pl-1.5">
            <CharacterEquipmentTraitCaption :trait-item="equipment.trait!.base" class="text-sm" />
          </div>
          <div class="mt-6">
            <CommonPropNumberInput
              v-model:value="equipment.trait!.level"
              :title="t('equipment-trait.trait-level')"
              :range="[1, equipment.trait!.base.maxLevel]"
            />
          </div>
          <div v-if="maxStack > 1" class="mt-4">
            <CommonPropNumberInput
              v-model:value="equipment.trait!.currentStack"
              :title="t('character-simulator.select-trait.trait-stack')"
              :range="[1, maxStack]"
              max-button
            />
          </div>
        </template>
      </div>
      <CharacterEquipmentDetailsSelectTrait v-else :equipment="equipment" />
    </template>
    <div v-else class="text-primary-60 text-sm">
      {{ t('character-simulator.select-trait.equipment-type-not-support-trait-tips') }}
    </div>
  </div>
</template>
