<template>
  <AppLayoutMain class="pb-6">
    <div ref="first-step" class="step-content">
      <div>
        <cy-icon-text icon="gg-menu-left-alt" text-color="fuchsia-60">
          {{ t('enchant-doll.equipment.select-type.title') }}
        </cy-icon-text>
      </div>
      <div class="mt-1 text-sm pl-4">
        {{ t('enchant-doll.equipment.select-type.caption') }}
      </div>
      <div class="py-4 pl-2 flex justify-center flex-wrap">
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
      <div class="mt-1 text-sm pl-4">
        {{ t('enchant-doll.equipment.original-potential.caption') }}
      </div>
      <div class="mt-4 flex justify-center flex-wrap">
        <cy-button-check v-model:selected="equipmentState.autoFindPotentialMinimum">
          {{ t('enchant-doll.equipment.original-potential.auto-find-minimum') }}
        </cy-button-check>
      </div>
      <div
        v-if="!equipmentState.autoFindPotentialMinimum"
        class="py-4 pl-4 flex justify-center"
      >
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
          :icon="contents.setConfig ? 'akar-icons:circle-chevron-up' : 'akar-icons:circle-chevron-down'"
          :selected="contents.setConfig"
          color="secondary"
          @click="toggle('contents/setConfig')"
        >
          {{ t('enchant-doll.equipment.set-config.title') }}
        </cy-button-plain>
      </div>
      <template v-if="contents.setConfig">
        <div class="flex justify-center pt-2">
          <cy-input-counter
            v-model:value="config.characterLevel"
            :step="10"
            main-color="blue-30"
          >
            <template #title>
              <cy-icon-text>{{ t('enchant-simulator.character-level') }}</cy-icon-text>
            </template>
          </cy-input-counter>
        </div>
        <div class="pt-2 flex justify-center">
          <cy-input-counter
            v-model:value="config.smithLevel"
            :step="10"
            main-color="blue-30"
          >
            <template #title>
              <cy-icon-text>{{ t('enchant-simulator.smith-level') }}</cy-icon-text>
            </template>
          </cy-input-counter>
        </div>
      </template>
      <div v-if="config.characterLevel < 250" class="mt-4 flex justify-center">
        <cy-icon-text color="primary-50" align-v="start" small>
          {{ t('enchant-doll.equipment.set-config.character-level-tips') }}
        </cy-icon-text>
      </div>
      <cy-transition>
        <div
          v-if="stepCounter > StepContents.Equipment"
          class="disabled-mask"
          @click="maskClick"
        />
      </cy-transition>
    </div>
    <div v-if="stepCounter > StepContents.Equipment" class="flex justify-center mb-4">
      <cy-button-action
        icon="mdi-leaf"
        color="orange"
        @click="backToStep(StepContents.Equipment)"
      >
        {{ t('enchant-doll.back-to-step') }}
      </cy-button-action>
    </div>
    <cy-transition @after-enter="stepAfterEnter">
      <div
        v-if="stepCounter >= StepContents.SelectPositiveStat"
        class="step-content"
      >
        <div>
          <cy-icon-text icon="gg-menu-left-alt" text-color="fuchsia-60">
            {{ t('enchant-doll.select-positives.title') }}
          </cy-icon-text>
        </div>
        <div class="mt-1 text-sm pl-4">
          {{ t('enchant-doll.select-positives.caption') }}
        </div>
        <div class="flex justify-center my-4">
          <div class="mt-2 border border-fuchsia-60 max-w-xs">
            <template v-if="doll.positiveStats.length !== 0">
              <cy-list-item v-for="stat in doll.positiveStats" :key="stat.statId">
                <cy-icon-text
                  :text-color="stat.value >= 0 ? 'primary-90' : 'orange-60'"
                  class="w-full"
                >
                  {{ stat.showAmount() }}
                </cy-icon-text>
                <div class="flex items-center w-full mt-1">
                  <cy-input-counter
                    v-model:value="stat.value"
                    inline
                    max-button
                    min-button
                    :range="[1, stat.limit[1]]"
                  />
                  <cy-button-icon
                    icon="jam-close-circle"
                    icon-color="gray-60"
                    class="ml-auto"
                    @click="removePositiveStat(stat)"
                  />
                </div>
              </cy-list-item>
            </template>
            <cy-default-tips
              v-else
              icon="fluent-leaf-two-16-regular"
              class="my-4 mx-6"
            >
              {{ t('enchant-doll.tips.no-stat-selected') }}
            </cy-default-tips>
          </div>
        </div>
        <div class="text-center">
          <cy-button-action
            icon="ic-round-add-circle-outline"
            @click="openSelectItem(SelectItemModes.Positive)"
          >
            {{ t('enchant-doll.select-item') }}
          </cy-button-action>
        </div>
        <div class="flex justify-center mt-4">
          <cy-button-check v-model:selected="selectPositiveStatState.autoFill">
            {{ t('enchant-doll.select-positives.auto-fill') }}
          </cy-button-check>
        </div>
        <div class="flex justify-center pt-4">
          <cy-button-plain
            :icon="contents.positiveShorthand ? 'akar-icons:circle-chevron-up' : 'akar-icons:circle-chevron-down'"
            :selected="contents.positiveShorthand"
            color="secondary"
            @click="toggle('contents/positiveShorthand')"
          >
            {{ t('enchant-doll.select-positives.use-shorthand') }}
          </cy-button-plain>
        </div>
        <div v-if="contents.positiveShorthand" class="flex justify-center">
          <div class="inline-block">
            <div class="flex items-center justify-center">
              <cy-title-input
                v-model:value="positiveStatsShorthand"
                class="max-w-sm"
                icon=ic:round-text-format
                @keyup.enter="appendPositiveShortHandStats"
              />
              <cy-button-circle
                icon="ic-round-done"
                small
                class="ml-1.5"
                :disabled="positiveStatsShorthand === ''"
                @click="appendPositiveShortHandStats"
              />
            </div>
            <div v-if="positiveShortHandStatItems.length > 0" class="text-primary-50 px-1 pt-1">
              <div v-for="{ origin, type, value } in positiveShortHandStatItems" :key="origin.statBase.statId(type)">
                {{ origin.statBase.show(type, value) }}
              </div>
            </div>
            <div v-else class="text-primary-30 text-center">
              ex: AD3CD%CDC
            </div>
          </div>
        </div>
        <cy-transition>
          <div
            v-if="stepCounter > StepContents.SelectPositiveStat"
            class="disabled-mask"
            @click="maskClick"
          />
        </cy-transition>
      </div>
    </cy-transition>
    <div v-if="stepCounter > StepContents.SelectPositiveStat" class="flex justify-center mb-4">
      <cy-button-action
        icon="mdi-leaf"
        color="orange"
        @click="backToStep(StepContents.SelectPositiveStat)"
      >
        {{ t('enchant-doll.back-to-step') }}
      </cy-button-action>
    </div>
    <cy-transition @after-enter="stepAfterEnter">
      <div
        v-if="stepCounter >= StepContents.SelectNegativeStat"
        class="step-content"
      >
        <div>
          <cy-icon-text icon="gg-menu-left-alt" text-color="fuchsia-60">
            {{ t('enchant-doll.select-negatives.title') }}
          </cy-icon-text>
        </div>
        <div class="mt-1 text-sm pl-4 pb-2">
          {{ t('enchant-doll.select-negatives.caption') }}
        </div>
        <div class="mt-1 ml-4 mr-2">
          <cy-icon-text
            icon="ic-outline-info"
            small
            text-color="blue-60"
            icon-color="blue-30"
          >
            {{ t('enchant-doll.tips.performance.auto-find-negatives') }}
          </cy-icon-text>
        </div>
        <div v-if="currentEquipmentType !== 1" class="mt-1 ml-4 mr-2">
          <cy-icon-text
            icon="ic-outline-info"
            small
            text-color="blue-60"
            icon-color="blue-30"
          >
            {{ t('enchant-doll.select-negatives.tips-1') }}
          </cy-icon-text>
        </div>
        <div v-if="equipmentState.autoFindPotentialMinimum" class="mt-1 ml-4 mr-2">
          <cy-icon-text
            icon="ic-outline-info"
            small
            text-color="blue-60"
            icon-color="blue-30"
          >
            {{ t('enchant-doll.tips.performance.auto-find-original-potential-minimum-and-auto-find-negatives') }}
          </cy-icon-text>
        </div>
        <div class="mt-4 mb-6 flex flex-col items-center">
          <div>
            <cy-button-check v-model:selected="selectNegativeStatState.auto">
              {{ t('enchant-doll.select-negatives.auto-select') }}
            </cy-button-check>
          </div>
          <div>
            <cy-button-toggle
              v-if="currentEquipmentType !== 1"
              v-model:selected="doll.config.containsNaturalMpRegenConstant"
            >
              <span class="text-primary-30">
                {{ t('enchant-doll.select-negatives.contains-natural-mp-regen-constant') }}
              </span>
            </cy-button-toggle>
          </div>
        </div>
        <template v-if="selectNegativeStatState.auto">
          <template v-if="currentEquipmentType === 1">
            <div>
              <cy-icon-text icon="gg-menu-left-alt" text-color="fuchsia-60">
                {{ t('enchant-doll.select-negatives.select-config.base-type.title') }}
              </cy-icon-text>
            </div>
            <div class="mt-1 text-sm pl-4">
              {{ t('enchant-doll.select-negatives.select-config.base-type.caption') }}
            </div>
            <div class="py-4 pl-2 flex justify-center flex-wrap">
              <cy-button-radio
                v-for="option in dollConfigOptions.baseType"
                :key="option"
                :selected="doll.config.baseType === option"
                @click="doll.config.baseType = option"
              >
                {{ t('enchant-doll.select-negatives.select-config.base-type.option-texts.' + option) }}
              </cy-button-radio>
            </div>
          </template>
          <div>
            <cy-icon-text icon="gg-menu-left-alt" text-color="fuchsia-60">
              {{ t('enchant-doll.select-negatives.select-config.auto-find-negatives.title') }}
            </cy-icon-text>
          </div>
          <div class="mt-1 text-sm pl-4">
            {{ t('enchant-doll.select-negatives.select-config.auto-find-negatives.caption') }}
          </div>
          <div class="py-4 pl-2 flex justify-center flex-wrap">
            <cy-button-radio
              v-for="option in dollConfigOptions.autoFindNegaitveStatsType"
              :key="option"
              :selected="doll.config.autoFindNegaitveStatsType === option"
              @click="doll.config.autoFindNegaitveStatsType = option"
            >
              {{ t('enchant-doll.select-negatives.select-config.auto-find-negatives.option-texts.' + option) }}
            </cy-button-radio>
          </div>
        </template>
        <div
          v-if="selectNegativeStatState.auto && autoNegativeStats.length < doll.numNegativeStats"
          class="flex justify-center mt-4"
        >
          <div>
            <cy-icon-text small icon-color="blue-60" class="mr-4">
              {{ t('enchant-doll.select-negatives.auto-select') }}
            </cy-icon-text>
            <cy-icon-text small>
              {{ t('enchant-doll.select-negatives.manually-selected') }}
            </cy-icon-text>
          </div>
        </div>
        <div class="flex justify-center mb-4">
          <div class="mt-2 border border-fuchsia-60 max-w-xs">
            <template v-if="negativeStats.length !== 0">
              <cy-list-item v-for="stat in negativeStats" :key="stat.statId">
                <cy-icon-text
                  :text-color="stat.value >= 0 ? 'primary-90' : 'orange-60'"
                  :icon-color="autoNegativeStats.includes(stat) ? 'blue-60' : 'primary-30'"
                  class="w-full"
                >
                  {{ stat.showAmount() }}
                </cy-icon-text>
                <div class="flex items-center flex-wrap w-full mt-1">
                  <cy-input-counter
                    v-model:value="stat.value"
                    :disabled="autoNegativeStats.includes(stat)"
                    inline
                    max-button
                    min-button
                    :range="[stat.limit[0], -1]"
                  />
                  <cy-button-icon
                    :disabled="autoNegativeStats.includes(stat)"
                    icon="jam-close-circle"
                    color="gray"
                    class="ml-auto"
                    @click="removeNegativeStat(stat)"
                  />
                </div>
              </cy-list-item>
            </template>
            <cy-default-tips
              v-else
              icon="fluent-leaf-two-16-regular"
              class="my-4 mx-6"
            >
              {{ t('enchant-doll.tips.no-stat-selected') }}
            </cy-default-tips>
          </div>
        </div>
        <div
          v-if="!selectNegativeStatState.auto || negativeStats.length < doll.numNegativeStats"
          class="text-center"
        >
          <cy-button-action
            icon="ic-round-add-circle-outline"
            @click="openSelectItem(SelectItemModes.Negative)"
          >
            {{ t('enchant-doll.select-item') }}
          </cy-button-action>
          <div v-if="selectNegativeStatState.auto && autoNegativeStats.length < doll.numNegativeStats" class="mt-2">
            <div>
              <cy-icon-text
                icon="ic-outline-info"
                small
                text-color="blue-60"
                icon-color="blue-30"
              >
                {{ t('enchant-doll.select-negatives.stats-from-auto-not-enough.0') }}
              </cy-icon-text>
            </div>
            <div class="text-blue-60 text-sm">
              {{ t('enchant-doll.select-negatives.stats-from-auto-not-enough.1') }}
            </div>
          </div>
        </div>
        <cy-transition>
          <div
            v-if="stepCounter > StepContents.SelectNegativeStat"
            class="disabled-mask"
            @click="maskClick"
          />
        </cy-transition>
      </div>
    </cy-transition>
    <div v-if="stepCounter > StepContents.SelectNegativeStat" class="flex justify-center mb-4">
      <cy-button-action
        icon="mdi-leaf"
        color="orange"
        @click="backToStep(StepContents.SelectNegativeStat)"
      >
        {{ t('enchant-doll.back-to-step') }}
      </cy-button-action>
    </div>
    <cy-transition @after-enter="stepAfterEnter">
      <div
        v-if="stepCounter >= StepContents.Result && resultEquipment"
        class="step-content"
      >
        <div>
          <cy-icon-text icon="gg-menu-left-alt" text-color="fuchsia-60">
            {{ t('enchant-doll.result.title') }}
          </cy-icon-text>
        </div>
        <div class="mt-1 text-sm pl-4">
          {{ t('enchant-doll.result.caption') }}
        </div>
        <div
          v-if="equipmentState.autoFindPotentialMinimum"
          class="mt-6 flex justify-center items-center"
        >
          <cy-icon-text icon="bx-bx-star" class="mr-3">
            {{ t('enchant-doll.result.current-potential-is') }}
          </cy-icon-text>
          <span class="text-fuchsia-60">
            {{ currentEquipment.originalPotential }}
          </span>
        </div>
        <div
          v-if="equipmentState.autoFindPotentialMinimum &&
            resultEquipment.originalPotential === 99 &&
            resultEquipment.realSuccessRate < 100"
          class="mt-2 flex justify-center"
        >
          <cy-icon-text
            icon="ic-outline-info"
            small
            text-color="blue-60"
            icon-color="blue-30"
          >
            {{ t('enchant-doll.tips.cannot-auto-find-original-potential-minimum') }}
          </cy-icon-text>
        </div>
        <div class="mt-6 mb-4 flex justify-center">
          <div class="border-1 border-fuchsia-60 rounded-lg pt-3 pb-5 pl-4 pr-6 bg-white">
            <EnchantResult :equipment="resultEquipment" />
          </div>
        </div>
        <div class="mt-6">
          <cy-icon-text icon="gg-menu-left-alt" text-color="fuchsia-60">
            {{ t('enchant-doll.export-result.title') }}
          </cy-icon-text>
        </div>
        <div class="mt-1 text-sm pl-4">
          {{ t('enchant-doll.export-result.caption') }}
        </div>
        <div class="mt-4 flex justify-center">
          <cy-title-input
            v-if="!exportState.hasExport"
            v-model:value="exportState.name"
            class="max-w-sm"
          />
        </div>
        <div class="my-2 flex justify-center">
          <cy-button-action
            v-if="!exportState.hasExport"
            icon="ic-outline-save"
            color="cyan"
            @click="exportResult"
          >
            {{ t('global.export') }}
          </cy-button-action>
          <cy-button-action
            v-else
            icon="ic-round-open-in-new"
            color="cyan"
            @click="$router.replace('/enchant')"
          >
            {{ t('enchant-doll.export-result.redirect-to-enchant-simulator') }}
          </cy-button-action>
        </div>
        <template v-if="doll.lastResults.length > 1 && mainStore.devMode">
          <div class="flex justify-center pt-4">
            <cy-button-plain
              :icon="contents.selectOtherResults ? 'akar-icons:circle-chevron-up' : 'akar-icons:circle-chevron-down'"
              :selected="contents.selectOtherResults"
              color="secondary"
              @click="toggle('contents/selectOtherResults')"
            >
              {{ t('enchant-doll.result.select-other-result') }}
            </cy-button-plain>
          </div>
          <div v-if="contents.selectOtherResults" class="divide-y divide-light px-0.5">
            <div v-for="(result, idx) in doll.lastResults" :key="idx">
              <EnchantDollResultItem
                :result="result"
                :is-current="result === resultEquipment"
                @select-result="resultEquipment = $event"
              />
            </div>
          </div>
        </template>
      </div>
    </cy-transition>
    <div class="flex items-center justify-center border-t border-fuchsia-60 mt-12 pt-4 relative">
      <cy-button-action
        v-if="stepCounter !== 3"
        icon="mdi-leaf"
        :disabled="nextStepDisabled"
        color="orange"
        @click="nextStep"
      >
        {{ t('enchant-doll.next-step') }}
      </cy-button-action>
      <span :class="{ 'absolute': stepCounter !== 3, 'right-0': stepCounter !== 3 }">
        <cy-button-action
          icon="bx-bx-reset"
          color="gray"
          @click="reset"
        >
          {{ t('global.reset') }}
        </cy-button-action>
      </span>
    </div>
    <div
      v-if="equipmentState.autoFindPotentialMinimum && stepCounter === StepContents.SelectNegativeStat"
      class="my-2 flex justify-center"
    >
      <cy-icon-text
        icon="ic-outline-info"
        small
        text-color="blue-60"
        icon-color="blue-30"
      >
        {{ t('enchant-doll.tips.performance.auto-find-original-potential-minimum') }}
      </cy-icon-text>
    </div>
    <div
      v-if="stepCounter === StepContents.Equipment"
      ref="top"
      class="text-primary-50 text-sm text-center px-8 py-8 space-y-2"
    >
      <div>{{ t('enchant-doll.top-caption.0') }}</div>
      <div>{{ t('enchant-doll.top-caption.1') }}</div>
    </div>
    <EnchantSelectItem
      :visible="windows.selectItem"
      :is-weapon="equipmentIsWeapon"
      :for-positive="stepCounter === StepContents.SelectPositiveStat"
      :default-negative="stepCounter === StepContents.SelectNegativeStat"
      :selected-items="selectedItems"
      :disabled-items="disabledItems"
      @select-item="selectItem"
      @close="toggle('windows/selectItem', false)"
    />
  </AppLayoutMain>
</template>

<script lang="ts">
export default {
  name: 'EnchantDollView',
}
</script>

<script lang="ts" setup>
import { computed, nextTick, reactive, ref, Ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

import { useEnchantStore } from '@/stores/views/enchant'
import { useMainStore } from '@/stores/app/main'

import Grimoire from '@/shared/Grimoire'

import { EnchantBuild, EnchantEquipment, EnchantStat } from '@/lib/Enchant/Enchant'
import EnchantDoll from '@/lib/Enchant/Enchant/doll'
import { EnchantEquipmentTypes } from '@/lib/Enchant/Enchant/enums'
import { AutoFindNegaitveStatsTypes, EnchantDollBaseTypes } from '@/lib/Enchant/Enchant/doll/enums'

import ToggleService from '@/setup/ToggleService'
import Notify from '@/setup/Notify'
import Confirm from '@/setup/Confirm'
import AutoSave from '@/setup/AutoSave'

import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'

import EnchantResult from '../EnchantSimulator/enchant-result.vue'
import EnchantSelectItem from '../EnchantSimulator/enchant-select-item.vue'
import EnchantDollResultItem from './enchant-doll-result-item.vue'

import { EnchantStatOptionBase } from '../EnchantSimulator/setup'
import { setupParseEnchantShorthand } from './setup'


const { windows, contents, toggle } = ToggleService({
  windows: ['selectItem'] as const,
  contents: ['setConfig', 'positiveShorthand', 'selectOtherResults'] as const,
})
const store = useEnchantStore()
const { t } = useI18n()
const { notify, loading } = Notify()
const { confirm } = Confirm()
const mainStore = useMainStore()

const { config } = storeToRefs(store)

AutoSave({
  save: () => store.save(),
  loadFirst: () => store.init(),
})

const enum StepContents {
  Equipment = 0,
  SelectPositiveStat = 1,
  SelectNegativeStat = 2,
  Result = 3,
}

const enum SelectItemModes {
  Positive = 'positive',
  Negative = 'negative',
  None = 'none',
}

const doll = ref(new EnchantDoll()) as Ref<EnchantDoll>
const stepCounter = ref(StepContents.Equipment)
const selectItemMode: Ref<SelectItemModes> = ref(SelectItemModes.None)
const autoNegativeStatsData: Ref<ReturnType<EnchantDoll['autoFindNegaitveStats']> | null> = ref(null)
const resultEquipment: Ref<EnchantEquipment | null> = ref(null)
const positiveStatsShorthand = ref('')

const consts = {
  autoFindPotentialMinimumLimit: 99,
}

const equipmentState = reactive({
  autoFindPotentialMinimum: false,
})

const exportState = reactive({
  hasExport: false,
  name: t('enchant-doll.export-result.build-default-name'),
})

const selectPositiveStatState = reactive({
  autoFill: true,
})

const selectNegativeStatState = reactive({
  auto: false,
  manually: [],
}) as {
  auto: boolean;
  manually: EnchantStat[];
}

const dollConfigOptions = {
  baseType: [
    EnchantDollBaseTypes.Physical,
    EnchantDollBaseTypes.Magic,
    EnchantDollBaseTypes.None,
  ],
  autoFindNegaitveStatsType: [
    AutoFindNegaitveStatsTypes.SuccessRate,
    AutoFindNegaitveStatsTypes.Material,
  ],
}

const equipmentTypeOptions = [{
  id: 0,
  text: t('enchant-simulator.equipment-types.main-weapon'),
  type: EnchantEquipmentTypes.MainWeapon,
  isOriginalElement: false,
}, {
  id: 1,
  text: t('enchant-simulator.equipment-types.body-armor'),
  type: EnchantEquipmentTypes.BodyArmor,
  isOriginalElement: false,
}, {
  id: 2,
  text: t('enchant-simulator.equipment-types.main-weapon_original-element'),
  type: EnchantEquipmentTypes.MainWeapon,
  isOriginalElement: true,
}]

const currentEquipment = computed(() => doll.value.build.equipment)

const equipmentIsWeapon = computed(() => currentEquipment.value.fieldType === EnchantEquipmentTypes.MainWeapon)

const autoNegativeStats = computed(() => autoNegativeStatsData.value ? autoNegativeStatsData.value.stats : [])

const { enchantShortHandStatItems: positiveShortHandStatItems } = setupParseEnchantShorthand(positiveStatsShorthand)
const appendPositiveShortHandStats = () => {
  positiveShortHandStatItems.value.forEach(({ origin, type, value }) => {
    if (doll.value.hasPositiveStat(origin, type)) {
      return
    }
    const _value = value === null ? origin.getLimit(type)[1] : value
    doll.value.appendPositiveStat(origin, type, _value) // ignore failed
  })
  positiveStatsShorthand.value = ''
}

const negativeStats = computed(() => {
  if (selectNegativeStatState.auto) {
    return autoNegativeStats.value
  }
  return selectNegativeStatState.manually
})

const nextStepDisabled = computed(() => {
  if (stepCounter.value === StepContents.SelectNegativeStat) {
    return negativeStats.value.length === 0
  }
  if (stepCounter.value === StepContents.SelectPositiveStat) {
    return doll.value.positiveStats.length === 0
  }
  return false
})

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

const toItem = (stat: EnchantStat) => ({ origin: stat.itemBase, type: stat.type })

const selectedItems = computed(() => {
  const posItems = doll.value.positiveStats.map(toItem)
  const negItems = selectNegativeStatState.auto ? [] :
    selectNegativeStatState.manually.map(toItem)
  return [...posItems, ...negItems] as EnchantStatOptionBase[]
})

const disabledItems = computed(() => {
  if (stepCounter.value === StepContents.SelectNegativeStat) {
    return doll.value.positiveStats.map(toItem)
  }
  return []
})

const autoFindNegaitveStats = async (manuallyStats: EnchantStat[], originalPotentialUnknow = false) => {
  autoNegativeStatsData.value = null
  loading.show()
  await nextTick()
  setTimeout(() => {
    try {
      if (originalPotentialUnknow) {
        autoNegativeStatsData.value = doll.value.autoFindNegaitveStats(manuallyStats, 99)
        // if (this.autoNegativeStatsData.realSuccessRate >= 100) {
        //   this.autoFindPotentialMinimumEquipment();
        //   this.autoNegativeStatsData = doll.value.autoFindNegaitveStats(manuallyStats);
        // }
      } else {
        autoNegativeStatsData.value = doll.value.autoFindNegaitveStats(manuallyStats)
      }
    } catch (err) {
      console.warn('[enchant-doll] unknown error when auto find negative stats')
      console.log(err)
      notify(t('enchant-doll.tips.unknown-error-when-calc'))
    } finally {
      nextTick(() => loading.hide())
    }
  }, 50)
}

const updateAutoFindNegativeStats = (value: boolean) => {
  if (value) {
    const manuallyStats = selectNegativeStatState.manually
    if (equipmentState.autoFindPotentialMinimum) {
      autoFindNegaitveStats(manuallyStats, true)
      return
    }
    autoFindNegaitveStats(manuallyStats)
  } else {
    autoNegativeStatsData.value = null
  }
}

const maskClick = () => {
  notify(t('enchant-doll.tips.cannot-directly-modify-previous-step'))
}

const autoFindPotentialMinimumEquipment = () => {
  if (autoNegativeStatsData.value?.equipment) {
    const data = autoNegativeStatsData.value
    if (data.realSuccessRate < 100) {
      currentEquipment.value.originalPotential = consts.autoFindPotentialMinimumLimit
      return data.equipment
    }
  }
  let left = 1,
    right = consts.autoFindPotentialMinimumLimit,
    mid = Math.floor((left + right) / 2)
  let cur = doll.value.calc(negativeStats.value, mid)!
  while (right - left > 1) {
    if (cur.realSuccessRate <= 100) {
      left = mid
    } else {
      right = mid
    }
    mid = Math.floor((left + right) / 2)
    cur = doll.value.calc(negativeStats.value, mid)!
  }
  if (cur.realSuccessRate < 100) {
    cur = doll.value.calc(negativeStats.value, right)!
  }
  currentEquipment.value.originalPotential = cur.originalPotential
  return cur
}

const exportResult = () => {
  if (!resultEquipment.value) {
    return
  }
  const build = new EnchantBuild(exportState.name, resultEquipment.value.clone(Grimoire.Enchant.categorys))
  store.exportDollBuild(build)
  exportState.hasExport = true
}

const reset = async () => {
  if (await confirm(t('enchant-doll.tips.reset-confirm'))) {
    doll.value = new EnchantDoll()
    stepCounter.value = 0
    selectNegativeStatState.manually = []
    exportState.hasExport = false
    selectNegativeStatState.auto = false
  }
}

const removePositiveStat = (stat: EnchantStat) => {
  if (stepCounter.value !== StepContents.SelectPositiveStat && doll.value.positiveStats.length === 1) {
    notify(t('enchant-doll.tips.at-least-one-positive'))
    return
  }
  doll.value.removePositiveStat(stat)
}

const removeNegativeStat = (stat: EnchantStat) => {
  const manually = selectNegativeStatState.manually
  const index = manually.indexOf(stat)
  manually.splice(index, 1)
}

const backToStep = (id: StepContents) => {
  stepCounter.value = id
  exportState.hasExport = false
  resultEquipment.value = null
  if (stepCounter.value < StepContents.SelectNegativeStat) {
    selectNegativeStatState.auto = false
  }
  if (id < StepContents.SelectNegativeStat) {
    selectNegativeStatState.manually = []
  }
}

const nextStep = async () => {
  if (stepCounter.value === StepContents.SelectPositiveStat) {
    const physicals = ['atk', 'physical_pierce']
    const magic = ['matk', 'magic_pierce']
    let current = EnchantDollBaseTypes.None
    if (doll.value.positiveStats.find(stat => physicals.includes(stat.baseId))) {
      current = EnchantDollBaseTypes.Physical
    }
    if (doll.value.positiveStats.find(stat => magic.includes(stat.baseId))) {
      current = current === EnchantDollBaseTypes.Physical ? EnchantDollBaseTypes.None : EnchantDollBaseTypes.Magic
    }
    doll.value.config.baseType = current
  } else if (stepCounter.value === StepContents.SelectNegativeStat) {
    loading.show()
    await nextTick()
    setTimeout(async () => {
      try {
        if (equipmentState.autoFindPotentialMinimum) {
          resultEquipment.value = autoFindPotentialMinimumEquipment()
        } else {
          resultEquipment.value = doll.value.calc(negativeStats.value)
        }
        doll.value.optimizeResults()
        await nextTick()
        stepCounter.value += 1
      } catch(err) {
        console.warn('[enchant-doll] some error when auto find potential minimum')
        console.log(err)
        notify(t('enchant-doll.tips.unknown-error-when-calc'))
      } finally {
        await nextTick()
        loading.hide()
      }
    }, 50)
    return
  }
  stepCounter.value += 1
}

const stepAfterEnter = async (el: Element) => {
  await nextTick()
  el.scrollIntoView({ behavior: 'smooth' })
}

const openSelectItem = (mode: SelectItemModes) => {
  selectItemMode.value = mode
  toggle('windows/selectItem', true)
}

const selectItem = (item: EnchantStatOptionBase) => {
  const mode = selectItemMode.value
  if (mode === SelectItemModes.Positive) {
    const findPosStat = doll.value.getPositiveStat(item.origin, item.type)
    if (findPosStat) {
      doll.value.removePositiveStat(findPosStat)
      return
    }
    const value = selectPositiveStatState.autoFill ? item.origin.getLimit(item.type)[1] : 1
    if (!doll.value.appendPositiveStat(item.origin, item.type, value)) {
      notify(t('enchant-doll.tips.stats-reached-upper-limit'))
    }
  } else {
    const nstats = negativeStats.value
    if (doll.value.hasPositiveStat(item.origin, item.type)) {
      notify(t('enchant-doll.tips.stat-repeated'))
      return
    }
    const findNegStat = nstats.find(stat => stat.itemBase === item.origin && stat.type === item.type)
    if (findNegStat) {
      removeNegativeStat(findNegStat)
      return
    }
    if (nstats.length >= doll.value.numNegativeStats) {
      notify(t('enchant-doll.tips.stats-reached-upper-limit'))
      return
    }
    selectNegativeStatState.manually.push(new EnchantStat(item.origin, item.type, item.origin.getLimit(item.type)[0]))
  }
}

watch(computed(() => selectNegativeStatState.auto), newv => {
  updateAutoFindNegativeStats(newv)
})
watch(computed(() => doll.value.config.containsNaturalMpRegenConstant), newv => {
  updateAutoFindNegativeStats(selectNegativeStatState.auto)
})
watch(computed(() => doll.value.config.baseType), () => {
  updateAutoFindNegativeStats(selectNegativeStatState.auto)
})
</script>

<style lang="postcss" scoped>
.step-content {
  padding: 2rem 1rem;
  min-height: 70vh;
  position: relative;

  & + .step-content {
    border-top: 1px solid var(--app-fuchsia-60);
  }

  & > .disabled-mask {
    @apply absolute w-full h-full z-5 cursor-not-allowed top-0 left-0;

    background-color: rgba(var(--rgb-app-white), 0.6);
  }
}
</style>
