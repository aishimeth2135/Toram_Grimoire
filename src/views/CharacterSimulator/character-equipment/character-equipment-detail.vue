<template>
  <div class="cursor-auto space-y-1.5">
    <div v-if="!innerItem" class="flex items-center pt-0.5">
      <EquipmentTitle
        :equipment="equipment"
        text-color="primary-70"
        :small="innerItem"
      />
      <div class="ml-3 text-sm text-primary-50">
        {{ t('common.Equipment.category.' + equipment.type) }}
      </div>
      <div class="ml-auto flex">
        <cy-button-icon
          icon="ic:round-mode-edit"
          color="orange"
          @click="editBasic(equipment)"
        />
      </div>
    </div>
    <div
      v-if="
        equipment.is(EquipmentKinds.Weapon) ||
        equipment.is(EquipmentKinds.Armor)
      "
      class="flex items-center pt-0.5"
    >
      <cy-popover>
        <CharacterEquipmentEditMask>
          <div
            class="flex w-72 items-center rounded-2xl border-1 border-solid border-red-20 px-3 py-0.5"
            :class="{ 'opacity-50': !baseValueValid }"
          >
            <template v-if="equipment.is(EquipmentKinds.Weapon)">
              <cy-icon-text icon="mdi-sword" color="red-20" single-color>
                ATK
              </cy-icon-text>
              <div class="ml-2 flex items-center text-red-60">
                {{ equipment.basicValue }}
                <span
                  v-if="refiningAdditionAmount > 0"
                  class="ml-1"
                  :class="!isSub ? 'text-blue-60' : 'text-emerald-60'"
                >
                  +{{ refiningAdditionAmount }}
                </span>
                <div
                  v-else-if="baseValueArrowRate"
                  class="ml-2 flex items-center"
                >
                  <cy-icon
                    icon="ic-round-close"
                    width="0.75rem"
                    color="emerald"
                  />
                  <span class="ml-1 text-emerald-60">
                    {{ baseValueArrowRate }}
                  </span>
                </div>
              </div>
              <span class="ml-auto text-primary-70">
                {{ equipment.stability }}%
              </span>
            </template>
            <template v-else-if="equipment.is(EquipmentKinds.Armor)">
              <cy-icon-text icon="mdi:shield-outline" text-color="primary-30">
                DEF
              </cy-icon-text>
              <span class="ml-2 text-red-60">{{ equipment.basicValue }}</span>
            </template>
          </div>
        </CharacterEquipmentEditMask>
        <template #popper>
          <div class="space-y-1.5 p-4">
            <CharacterEquipmentBasicValue :equipment="equipment" />
            <div v-if="equipment.hasRefining">
              <cy-input-counter
                v-model:value="
                  equipment.refining /* eslint-disable-line vue/no-mutating-props */
                "
                :range="ranges.refining"
              >
                <template #title>
                  <cy-icon-text icon="mdi-cube-send">
                    {{ t('character-simulator.equipment-info.refining') }}
                  </cy-icon-text>
                </template>
              </cy-input-counter>
            </div>
            <div v-if="equipment.hasStability">
              <cy-input-counter
                v-model:value="
                  equipment.stability /* eslint-disable-line vue/no-mutating-props */
                "
                :range="ranges.stability"
              >
                <template #title>
                  <cy-icon-text icon="mdi-rhombus-outline">
                    {{ t('character-simulator.equipment-info.stability') }}
                  </cy-icon-text>
                </template>
              </cy-input-counter>
            </div>
          </div>
        </template>
      </cy-popover>
    </div>
    <div :class="{ 'opacity-50': statsDisabled }">
      <div
        v-if="equipment.stats.length > 0"
        class="relative flex flex-wrap items-center pb-1.5 pl-1.5 pr-2 pt-0.5"
      >
        <CharacterEquipmentEditMask
          v-for="stat in equipment.stats"
          :key="stat.statId"
          class="mt-0.5"
        >
          <cy-popover auto-select class="flex">
            <ShowStat :stat="stat" :negative-value="stat.value < 0" />
            <template #popper>
              <div class="flex w-full items-center p-4">
                <cy-input-counter
                  v-model:value="stat.value"
                  input-width="2.75rem"
                  :range="stat.isBoolStat ? ranges.boolStat : ranges.stat"
                />
              </div>
            </template>
          </cy-popover>
        </CharacterEquipmentEditMask>
        <CharacterEquipmentEditMask
          class="!absolute -right-2 top-0 h-full w-6 hover:bg-primary-5"
          @click="editStat(equipment)"
        />
      </div>
      <CharacterEquipmentEditMask
        v-else
        class="px-2.5 text-sm text-primary-30"
        @click="editStat(equipment)"
      >
        {{ t('character-simulator.equipment-info.stat-empty') }}
      </CharacterEquipmentEditMask>
      <div v-if="equipment.hasCrystal" class="px-1.5">
        <CharacterEquipmentEditMask
          v-if="equipment.crystals.length > 0"
          class="space-x-3 py-1"
          @click="editCrystal(equipment)"
        >
          <cy-icon-text
            v-for="crystal in equipment.crystals"
            :key="crystal.id"
            :icon="crystal.crystalIconPath"
            icon-src="image"
            text-color="cyan-60"
            small
          >
            {{ crystal.name }}
          </cy-icon-text>
        </CharacterEquipmentEditMask>
        <CharacterEquipmentEditMask
          v-else
          class="px-1 text-sm text-primary-30"
          @click="editCrystal(equipment)"
        >
          {{ t('character-simulator.equipment-info.crystal-empty') }}
        </CharacterEquipmentEditMask>
      </div>
    </div>
    <div v-if="innerItem" class="flex items-center space-x-2 py-0.5">
      <div class="flex">
        <cy-button-circle
          icon="ic:round-mode-edit"
          color="orange"
          small
          @click="editBasic(equipment)"
        />
      </div>
      <span class="text-sm text-red-60">
        {{ t('character-simulator.browse-equipments.click-edit-tips') }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  CharacterEquipment,
  SubArmor,
  SubWeapon,
} from '@/lib/Character/CharacterEquipment'
import {
  EquipmentKinds,
  EquipmentTypes,
} from '@/lib/Character/CharacterEquipment'

import EquipmentTitle from '@/components/common/equipment-title.vue'
import ShowStat from '@/components/common/show-stat.vue'

import CharacterEquipmentBasicValue from './character-equipment-basic-value.vue'
import CharacterEquipmentEditMask from './character-equipment-edit-mask.vue'

import { CharacterSimulatorInjectionKey } from '../injection-keys'

interface Props {
  equipment: CharacterEquipment
  innerItem?: boolean
  statsDisabled?: boolean
  isSub?: boolean
  mainWeapon?: CharacterEquipment | null
}

const props = withDefaults(defineProps<Props>(), {
  innerItem: false,
  statsDisabled: false,
  isSub: false,
  mainWeapon: null,
})

const { t } = useI18n()

const ranges = {
  refining: [0, 15],
  baseValue: [0, 999],
  stability: [0, 100],
  stat: [null, null],
  boolStat: [1, 1],
}

const isSub = computed(() => props.isSub)

const baseValueValid = computed(() => {
  const eq = props.equipment
  if (isSub.value) {
    if (
      eq.type === EquipmentTypes.Arrow &&
      props.mainWeapon &&
      props.mainWeapon.type !== EquipmentTypes.Bow &&
      props.mainWeapon.type !== EquipmentTypes.Bowgun
    ) {
      return false
    }
    return (
      eq instanceof SubWeapon ||
      eq instanceof SubArmor ||
      eq.type === EquipmentTypes.OneHandSword
    )
  }
  return true
})

const baseValueArrowRate = computed(() => {
  const eq = props.equipment
  if (props.mainWeapon && eq.type === EquipmentTypes.Arrow) {
    if (props.mainWeapon.type === EquipmentTypes.Bowgun) {
      return '50%'
    }
  }
  return ''
})

const refiningAdditionAmount = computed(() => {
  const eq = props.equipment
  if (isSub.value) {
    if (eq.type === EquipmentTypes.OneHandSword) {
      return (
        Math.floor((eq.basicValue * eq.refining * eq.refining) / 200) +
        eq.refining
      )
    }
    return 0
  }
  return (
    Math.floor((eq.basicValue * eq.refining * eq.refining) / 100) + eq.refining
  )
})

const { editCrystal, editStat, editBasic } = inject(
  CharacterSimulatorInjectionKey
)!
</script>
