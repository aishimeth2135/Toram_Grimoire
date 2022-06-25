<template>
  <div class="space-y-2 cursor-auto">
    <div class="flex items-center space-x-3 py-0.5">
      <cy-popover>
        <CharacterEquipmentEditMask>
          <div class="flex">
            <EquipmentTitle :equipment="equipment" text-color="purple" :small="innerItem" />
          </div>
        </CharacterEquipmentEditMask>
        <template #popper>
          <div class="p-4 space-y-3">
            <div>
              <cy-title-input
                v-model:value="equipment.name/* eslint-disable-line vue/no-mutating-props */"
                icon="mdi-clipboard-edit-outline"
              />
            </div>
            <div v-if="equipment.hasRefining">
              <cy-input-counter
                v-model:value="equipment.refining/* eslint-disable-line vue/no-mutating-props */"
                :range="ranges.refining"
              >
                <template #title>
                  <cy-icon-text icon="mdi-cube-send">
                    {{ t('character-simulator.equipment-info.refining') }}
                  </cy-icon-text>
                </template>
              </cy-input-counter>
            </div>
          </div>
        </template>
      </cy-popover>
      <CharacterEquipmentEditMask
        v-if="equipment.customTypeList"
        class="py-0.5 text-light-3 text-sm"
        @click="equipment.setCustomType()"
      >
        <span>{{ t('common.Equipment.category.' + equipment.type) }}</span>
      </CharacterEquipmentEditMask>
      <div v-else class="text-light-3 text-sm">
        {{ t('common.Equipment.category.' + equipment.type) }}
      </div>
    </div>
    <cy-popover v-if="equipment.isWeapon() || equipment.isArmor()">
      <CharacterEquipmentEditMask>
        <div class="flex items-center rounded-2xl border-1 border-solid border-light py-0.5 px-3" style="min-width: 18rem">
          <template v-if="equipment.isWeapon()">
            <cy-icon-text icon="mdi-sword" text-color="light-2">
              ATK
            </cy-icon-text>
            <span class="ml-2 text-purple">
              {{ equipment.atk }}
              <span
                v-if="(equipment instanceof MainWeapon) && equipment.refining > 0"
                class="ml-1 text-water-blue"
              >
                +{{ equipment.refiningAdditionAmount! }}
              </span>
            </span>
            <span class="ml-auto">{{ equipment.stability }}%</span>
          </template>
          <template v-else>
            <cy-icon-text icon="mdi-shield" text-color="light-2">
              DEF
            </cy-icon-text>
            <span class="ml-2 text-purple">{{ equipment.def }}</span>
          </template>
        </div>
      </CharacterEquipmentEditMask>
      <template #popper>
        <div class="p-4 space-y-1.5">
          <div v-if="equipment.isWeapon() || equipment.isArmor()">
            <cy-input-counter
              v-if="equipment.isWeapon()"
              v-model:value="equipment.atk/* eslint-disable-line vue/no-mutating-props */"
              :range="ranges.baseValue"
            >
              <template #title>
                <cy-icon-text icon="mdi-sword">
                  ATK
                </cy-icon-text>
              </template>
            </cy-input-counter>
            <cy-input-counter
              v-else-if="equipment.isArmor()"
              v-model:value="equipment.def/* eslint-disable-line vue/no-mutating-props */"
              :range="ranges.baseValue"
            >
              <template #title>
                <cy-icon-text icon="mdi-shield">
                  DEF
                </cy-icon-text>
              </template>
            </cy-input-counter>
          </div>
          <div v-if="equipment.hasStability">
            <cy-input-counter
              v-model:value="equipment.stability/* eslint-disable-line vue/no-mutating-props */"
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
    <div :class="{ 'opacity-50': statsDisabled }">
      <div v-if="equipment.stats.length > 0" class="pl-1.5 pr-2 pt-1 pb-1.5 flex flex-wrap items-center relative">
        <CharacterEquipmentEditMask v-for="stat in equipment.stats" :key="stat.statId" class="mt-0.5">
          <cy-popover auto-select class="flex">
            <ShowStat
              :stat="stat"
              :negative-value="stat.value < 0"
            />
            <template #popper="{ hide }">
              <div class="p-4 flex items-center w-full">
                <div class="mr-2">
                  <cy-input-counter
                    v-model:value="stat.value"
                    type="line"
                    class="set-stat-value"
                    input-width="2.6rem"
                    :range="stat.isBoolStat ? ranges.boolStat : ranges.stat"
                  />
                </div>
                <div class="ml-auto">
                  <cy-button-icon
                    icon="ic:round-mode-edit"
                    @click="(hide(), editStat(equipment))"
                  />
                </div>
              </div>
            </template>
          </cy-popover>
        </CharacterEquipmentEditMask>
        <CharacterEquipmentEditMask class="!absolute top-0 -right-2 h-full w-6 hover:bg-light-0" @click="editStat(equipment)" />
      </div>
      <CharacterEquipmentEditMask v-else class="text-light-2 text-sm px-1.5" @click="editStat(equipment)">
        {{ t('character-simulator.equipment-info.stat-empty') }}
      </CharacterEquipmentEditMask>
      <div v-if="equipment.hasCrystal" class="px-1.5">
        <CharacterEquipmentEditMask
          v-if="equipment.crystals.length > 0"
          class="py-1 space-x-3"
          @click="editCrystal(equipment)"
        >
          <cy-icon-text
            v-for="crystal in equipment.crystals"
            :key="crystal.id"
            :icon="crystal.crystalIconPath"
            icon-src="image"
            text-color="blue-green"
            small
          >
            {{ crystal.name }}
          </cy-icon-text>
        </CharacterEquipmentEditMask>
        <CharacterEquipmentEditMask v-else class="text-light-2 text-sm px-1" @click="editCrystal(equipment)">
          {{ t('character-simulator.equipment-info.crystal-empty') }}
        </CharacterEquipmentEditMask>
      </div>
    </div>
    <div v-if="innerItem" class="flex items-center space-x-2">
      <cy-icon-text icon="ic:round-mode-edit" text-color="light-2" small>
        {{ t('character-simulator.browse-equipments.click-edit-tips') }}
      </cy-icon-text>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { inject } from 'vue'

import { CharacterEquipment, MainWeapon } from '@/lib/Character/CharacterEquipment'

import EquipmentTitle from '@/components/common/equipment-title.vue'
import ShowStat from '@/components/common/show-stat.vue'

import CharacterEquipmentEditMask from './character-equipment-edit-mask.vue'

import { CharacterSimulatorInjectionKey } from '../injection-keys'

interface Props {
  equipment: CharacterEquipment;
  innerItem?: boolean;
  statsDisabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  innerItem: false,
  statsDisabled: false,
})

const { t } = useI18n()

const ranges = {
  refining: [0, 15],
  baseValue: [0, 999],
  stability: [0, 100],
  stat: [null, null],
  boolStat: [1, 1],
}

const { editCrystal, editStat } = inject(CharacterSimulatorInjectionKey)!
</script>
