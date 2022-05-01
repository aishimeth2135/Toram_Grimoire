<template>
  <div class="space-y-2">
    <div class="flex items-center space-x-3 py-0.5">
      <cy-popover class="edit-mask-content">
        <div class="flex">
          <EquipmentTitle :equipment="equipment" text-color="purple" :small="innerItem" />
        </div>
        <div class="edit-mask">
          <cy-icon-text icon="ic:round-mode-edit" icon-width="1.5rem" />
        </div>
        <template #popover>
          <div class="p-4 bg-white border border-light-2 shadow">
            <div>
              <cy-title-input
                v-model:value="equipment.name/* eslint-disable-line vue/no-mutating-props */"
                icon="mdi-clipboard-edit-outline"
              />
            </div>
          </div>
        </template>
      </cy-popover>
      <div
        v-if="equipment.customTypeList"
        class="edit-mask-content py-0.5 text-light-3 text-sm"
        @click="equipment.setCustomType()"
      >
        <span>{{ t('common.Equipment.category.' + equipment.type) }}</span>
        <div class="edit-mask">
          <cy-icon-text icon="ic:round-mode-edit" icon-width="1.5rem" />
        </div>
      </div>
      <div v-else class="text-light-3 text-sm">
        {{ t('common.Equipment.category.' + equipment.type) }}
      </div>
    </div>
    <cy-popover v-if="equipment.isWeapon() || equipment.isArmor()">
      <div class="edit-mask-content">
        <div
          class="flex items-center rounded-2xl border-1 border-solid border-light py-0.5 px-3"
          style="min-width: 18rem"
        >
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
                +{{ equipment.refiningAdditionAmount! }}</span>
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
        <div class="edit-mask">
          <cy-icon-text icon="ic:round-mode-edit" icon-width="1.5rem" />
        </div>
      </div>
      <template #popover>
        <div class="p-4 bg-white border border-light-2 space-y-1.5 shadow">
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
          <div v-if="equipment.hasRefining && equipment.refining">
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
          <div v-if="equipment.hasStability && equipment.stability">
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
      <div class="pl-1.5 pr-1">
        <cy-popover
          v-for="stat in equipment.stats"
          :key="stat.statId"
          class="edit-mask-content"
        >
          <div class="edit-mask-content">
            <ShowStat
              :stat="stat"
              :negative-value="stat.value < 0"
            />
            <div class="edit-mask">
              <cy-icon-text icon="ic:round-mode-edit" icon-width="1.5rem" />
            </div>
          </div>
          <template #popover="{ togglePopover }">
            <div class="border border-light-2 shadow bg-white p-4 flex items-center w-full">
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
                  @click="(togglePopover(), editStat(equipment))"
                />
              </div>
            </div>
          </template>
        </cy-popover>
      </div>
      <div class="px-1.5">
        <div
          v-if="equipment.hasCrystal && equipment.crystals!.length > 0"
          class="edit-mask-content py-1 space-x-3 duration-300"
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
          <div class="edit-mask">
            <cy-icon-text icon="ic:round-mode-edit" icon-width="1.5rem" />
          </div>
        </div>
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

<style lang="postcss" scoped>
.edit-mask-content {
  @apply relative inline-block cursor-pointer rounded-md;

  & > .edit-mask {
    @apply absolute top-0 left-0 flex items-center justify-center w-full h-full opacity-0 bg-opacity-0 bg-white duration-300 z-1;
  }

  &:hover > .edit-mask {
    @apply opacity-100 bg-opacity-50
  }
}
</style>
