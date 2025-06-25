<template>
  <EnchantDollStepWrapper :step-id="StepIds.Equipment">
    <div>
      <cy-icon-text icon="gg-menu-left-alt" text-color="fuchsia-60">
        {{ t('enchant-doll.equipment.select-type.title') }}
      </cy-icon-text>
    </div>
    <div class="mt-1 pl-4 text-sm">
      {{ t('enchant-doll.equipment.select-type.caption') }}
    </div>
    <div class="flex flex-wrap justify-center py-4 pl-2">
      <cy-button-radio
        v-for="option in equipmentTypeOptions"
        :key="option.id"
        :selected="currentEquipmentType === option.id"
        @click="currentEquipmentType = option.id"
      >
        {{ option.text }}
      </cy-button-radio>
    </div>
    <div class="mt-4">
      <cy-icon-text icon="gg-menu-left-alt" text-color="fuchsia-60">
        {{ t('enchant-doll.equipment.original-potential.title') }}
      </cy-icon-text>
    </div>
    <div class="mt-1 pl-4 text-sm">
      {{ t('enchant-doll.equipment.original-potential.caption') }}
    </div>
    <div class="mt-4 flex flex-wrap justify-center">
      <cy-button-check v-model:selected="equipmentState.autoFindPotentialMinimum">
        {{ t('enchant-doll.equipment.original-potential.auto-find-minimum') }}
      </cy-button-check>
    </div>
    <div v-if="!equipmentState.autoFindPotentialMinimum" class="flex justify-center py-4 pl-4">
      <cy-input-counter
        v-model:value="currentEquipment.originalPotential"
        class="mt-2"
        :range="[1, 200]"
      >
        <template #title>
          <cy-icon-text icon="mdi-creation">
            {{ t('enchant-simulator.equipment-original-potential') }}
          </cy-icon-text>
        </template>
      </cy-input-counter>
    </div>
    <div class="flex justify-center pt-2">
      <cy-button-plain
        :icon="setConfig ? 'akar-icons:circle-chevron-up' : 'akar-icons:circle-chevron-down'"
        :selected="setConfig"
        color="secondary"
        @click="setConfig = !setConfig"
      >
        {{ t('enchant-doll.equipment.set-config.title') }}
      </cy-button-plain>
    </div>
    <div v-if="setConfig" class="flex justify-center">
      <div class="flex border border-primary-30 px-5 py-4">
        <EnchantCommonSetting />
      </div>
    </div>
    <div v-if="config.characterLevel < CHARACTER_MAX_LEVEL" class="mt-4 flex justify-center">
      <div class="text-sm text-gray-50">
        {{ t('enchant-doll.equipment.set-config.character-level-tips') }}
      </div>
    </div>
  </EnchantDollStepWrapper>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed, inject, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useEnchantStore } from '@/stores/views/enchant'

import { CHARACTER_MAX_LEVEL } from '@/lib/Character/Character'
import { EnchantEquipmentTypes } from '@/lib/Enchant/Enchant'

import EnchantCommonSetting from '../EnchantSimulator/enchant-common-setting.vue'
import EnchantDollStepWrapper from './enchant-doll-step-wrapper.vue'

import { EnchantDollInjectionKey } from './injection-keys'
import { StepIds } from './setup'

const { doll, equipmentState } = inject(EnchantDollInjectionKey)!
const { t } = useI18n()

const setConfig = ref(false)

const store = useEnchantStore()
const { config } = storeToRefs(store)

const equipmentTypeOptions = [
  {
    id: 0,
    text: t('enchant-simulator.equipment-types.main-weapon'),
    type: EnchantEquipmentTypes.MainWeapon,
    isOriginalElement: false,
  },
  {
    id: 1,
    text: t('enchant-simulator.equipment-types.body-armor'),
    type: EnchantEquipmentTypes.BodyArmor,
    isOriginalElement: false,
  },
  {
    id: 2,
    text: t('enchant-simulator.equipment-types.main-weapon_original-element'),
    type: EnchantEquipmentTypes.MainWeapon,
    isOriginalElement: true,
  },
]

const currentEquipment = computed(() => doll.value.build.equipment)

const currentEquipmentType = computed<number>({
  get() {
    const eq = currentEquipment.value
    if (eq?.fieldType === EnchantEquipmentTypes.MainWeapon) {
      return eq.isOriginalElement ? 2 : 0
    }
    return 1
  },
  set(value) {
    const item = equipmentTypeOptions[value]
    currentEquipment.value.fieldType = item.type
    currentEquipment.value.isOriginalElement = item.isOriginalElement
  },
})
</script>
