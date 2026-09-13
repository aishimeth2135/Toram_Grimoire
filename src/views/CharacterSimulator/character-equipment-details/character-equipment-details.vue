<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  CharacterEquipment,
  EquipmentKinds,
  EquipmentTypes,
} from '@/lib/Character/CharacterEquipment'

import CommonEquipmentIcon from '../common/common-equipment-icon.vue'
import CharacterEquipmentDetailsSelection from './character-equipment-details-selection.vue'
import CharacterEquipmentDetailsStat from './character-equipment-details-stat.vue'
import CharacterEquipmentLabels from './character-equipment-labels.vue'
import CharacterEquipmentTraitTitle from './character-equipment-trait-title.vue'

import { useCharacterSimulatorState } from '../setup'
import { CharacterEquipmentEditModes } from './setup'

interface Props {
  equipment: CharacterEquipment | null
  isSub?: boolean
  equipped?: boolean
  currentEditMode?: CharacterEquipmentEditModes | null
}
interface Emits {
  (evt: 'update:current-edit-mode', value: CharacterEquipmentEditModes | null): void
}

const props = withDefaults(defineProps<Props>(), {
  isSub: false,
  equipped: false,
})
const emit = defineEmits<Emits>()

const innerEditMode = computed<CharacterEquipmentEditModes | null>({
  get() {
    return props.currentEditMode ?? null
  },
  set(value) {
    emit('update:current-edit-mode', value)
  },
})
const { t } = useI18n()

const isSub = computed(() => props.isSub)

const refiningAdditionAmount = computed(() => {
  const eq = props.equipment
  if (!eq || !eq.is(EquipmentKinds.Weapon) || !eq.supportRefining || eq.refining <= 0) {
    return 0
  }
  if (isSub.value && eq.type === EquipmentTypes.OneHandSword) {
    return Math.floor((eq.basicValue * eq.refining * eq.refining) / 200) + eq.refining
  }
  return Math.floor((eq.basicValue * eq.refining * eq.refining) / 100) + eq.refining
})

const { editEquipment } = useCharacterSimulatorState()

const goEdit = (mode: CharacterEquipmentEditModes) => {
  if (props.equipment && props.currentEditMode === undefined) {
    editEquipment(props.equipment, mode)
  }
}
</script>

<template>
  <div v-if="equipment" class="relative flex w-66 shrink-0 flex-col">
    <cy-tabs
      v-model="innerEditMode"
      direction="vertical"
      plain
      class="relative z-5 w-full border border-primary-20 bg-white py-2"
    >
      <cy-icon
        v-if="equipped"
        icon="ic:round-check-circle"
        class="absolute -top-3 -right-3 bg-white text-red-60"
        width="1.5rem"
      />
      <CharacterEquipmentDetailsSelection
        :mode="CharacterEquipmentEditModes.Basic"
        class="px-2 pb-0.5"
        @edit="goEdit"
      >
        <div class="flex items-center px-2 py-1">
          <div>
            <div class="flex items-center text-primary-80">
              {{ equipment.name }}
              <span
                v-if="equipment.supportRefining && equipment.refining > 0"
                class="ml-2 text-blue-70"
              >
                {{ `+${equipment.refiningText}` }}
              </span>
            </div>
            <div class="text-sm text-primary-50">
              {{ t('common.Equipment.category.' + equipment.type) }}
            </div>
          </div>
          <div
            class="ml-auto flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-primary-10"
          >
            <CommonEquipmentIcon :equipment="equipment" width="1.5rem" />
          </div>
        </div>
        <div
          v-if="equipment.is(EquipmentKinds.Weapon) || equipment.is(EquipmentKinds.Armor)"
          class="mt-0.5 pb-1.5"
        >
          <div class="border-b border-primary-20 px-2.5">
            <div v-if="equipment.is(EquipmentKinds.Weapon)" class="text-xs text-primary-30">
              ATK
            </div>
            <div v-else class="text-xs text-primary-30">DEF</div>
            <div class="flex w-full items-center text-primary-70">
              {{ equipment.basicValue }}
              <span
                v-if="refiningAdditionAmount > 0"
                class="ml-1"
                :class="!isSub ? 'text-blue-70' : 'text-emerald-70'"
              >
                +{{ refiningAdditionAmount }}
              </span>
              <span v-if="equipment.supportStability" class="ml-auto text-sm text-cyan-70">
                {{ `${equipment.stability}%` }}
              </span>
            </div>
          </div>
        </div>
      </CharacterEquipmentDetailsSelection>
      <CharacterEquipmentDetailsSelection
        :mode="CharacterEquipmentEditModes.Stat"
        class="px-4 py-1"
        @edit="goEdit"
      >
        <div v-if="equipment.stats.length > 0" class="px-0.5">
          <CharacterEquipmentDetailsStat
            v-for="stat in equipment.stats"
            :key="stat.statId"
            :stat="stat"
          />
        </div>
        <div v-else class="pt-1 text-sm text-primary-30">
          {{ t('character-simulator.equipment-info.stat-empty') }}
        </div>
      </CharacterEquipmentDetailsSelection>
      <CharacterEquipmentDetailsSelection
        v-if="equipment.supportCrystal"
        :mode="CharacterEquipmentEditModes.Crystal"
        class="space-y-1.5 px-2 py-1.5"
        @edit="goEdit"
      >
        <template v-if="equipment.crystals.length > 0">
          <div
            v-for="crystal in equipment.crystals"
            :key="crystal.id"
            class="flex w-full items-center pl-2"
          >
            <cy-icon :icon="crystal.crystalIconPath" />
            <span class="ml-1 text-sm text-cyan-60">{{ crystal.name }}</span>
          </div>
        </template>
        <div v-else class="px-2 text-sm text-primary-30">
          {{ t('character-simulator.equipment-info.crystal-empty') }}
        </div>
      </CharacterEquipmentDetailsSelection>
      <CharacterEquipmentDetailsSelection
        v-if="equipment.supportTrait"
        :mode="CharacterEquipmentEditModes.Trait"
        class="px-4 py-1.5"
        @edit="goEdit"
      >
        <CharacterEquipmentTraitTitle v-if="equipment.trait" :equipment-trait="equipment.trait" />
        <div v-else class="text-sm text-primary-30">
          {{ t('character-simulator.equipment-info.trait-empty') }}
        </div>
      </CharacterEquipmentDetailsSelection>
      <CharacterEquipmentLabels
        :equipment="equipment"
        class="mt-0.5 w-full justify-end py-1 pr-1 pl-6"
      />
    </cy-tabs>
  </div>
  <div v-else class="flex w-66 justify-center border border-primary-10 py-8">
    <cy-icon icon="mdi:more-horiz" width="2rem" />
  </div>
</template>
