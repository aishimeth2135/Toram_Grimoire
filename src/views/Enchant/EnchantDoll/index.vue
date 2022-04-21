<template>
  <section class="main--enchant-doll">
    <div ref="first-step" class="step-content">
      <div>
        <cy-icon-text icon="gg-menu-left-alt" text-color="purple">
          {{ t('enchant-doll.equipment.select-type.title') }}
        </cy-icon-text>
      </div>
      <div class="mt-1 text-sm pl-4">
        {{ t('enchant-doll.equipment.select-type.caption') }}
      </div>
      <div class="py-4 pl-2 flex justify-center flex-wrap">
        <cy-button
          v-for="option in equipmentTypeOptions"
          :key="option.id"
          type="check"
          :selected="currentEquipmentType === option.id"
          @click="currentEquipmentType = option.id"
        >
          {{ option.text }}
        </cy-button>
      </div>
      <div class="mt-4">
        <cy-icon-text icon="gg-menu-left-alt" text-color="purple">
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
        <cy-button-inline
          :icon="contents.setConfig ? 'akar-icons:circle-chevron-down' : 'akar-icons:circle-chevron-up'"
          :selected="contents.setConfig"
          text-color="light-2"
          @click="toggle('contents/setConfig')"
        >
          {{ t('enchant-doll.equipment.set-config.title') }}
        </cy-button-inline>
      </div>
      <template v-if="contents.setConfig">
        <div class="flex justify-center pt-2">
          <cy-input-counter
            v-model:value="config.characterLevel"
            :step="10"
            main-color="water-blue-light"
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
            main-color="water-blue-light"
          >
            <template #title>
              <cy-icon-text>{{ t('enchant-simulator.smith-level') }}</cy-icon-text>
            </template>
          </cy-input-counter>
        </div>
      </template>
      <cy-transition type="fade">
        <div
          v-if="stepCounter > StepContents.Equipment"
          class="disabled-mask"
          @click="maskClick"
        />
      </cy-transition>
    </div>
    <div v-if="stepCounter > StepContents.Equipment" class="flex justify-center mb-4">
      <cy-button-border
        icon="mdi-leaf"
        main-color="orange"
        @click="backToStep(StepContents.Equipment)"
      >
        {{ t('enchant-doll.back-to-step') }}
      </cy-button-border>
    </div>
    <cy-transition type="fade" @after-enter="stepAfterEnter">
      <div
        v-if="stepCounter >= StepContents.SelectPositiveStat"
        class="step-content"
      >
        <div>
          <cy-icon-text icon="gg-menu-left-alt" text-color="purple">
            {{ t('enchant-doll.select-positives.title') }}
          </cy-icon-text>
        </div>
        <div class="mt-1 text-sm pl-4">
          {{ t('enchant-doll.select-positives.caption') }}
        </div>
        <div class="flex justify-center my-4">
          <div class="mt-2 border border-purple max-w-xs">
            <template v-if="doll.positiveStats.length !== 0">
              <cy-list-item v-for="stat in doll.positiveStats" :key="stat.statId">
                <cy-icon-text
                  :text-color="stat.value >= 0 ? 'dark' : 'orange'"
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
                    icon-color="gray"
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
          <cy-button-border
            icon="ic-round-add-circle-outline"
            @click="openSelectItem(SelectItemModes.Positive)"
          >
            {{ t('enchant-doll.select-item') }}
          </cy-button-border>
        </div>
        <div class="flex justify-center mt-4">
          <cy-button-check v-model:selected="selectPositiveStatState.autoFill">
            {{ t('enchant-doll.select-positives.auto-fill') }}
          </cy-button-check>
        </div>
        <cy-transition type="fade">
          <div
            v-if="stepCounter > StepContents.SelectPositiveStat"
            class="disabled-mask"
            @click="maskClick"
          />
        </cy-transition>
      </div>
    </cy-transition>
    <div v-if="stepCounter > StepContents.SelectPositiveStat" class="flex justify-center mb-4">
      <cy-button-border
        icon="mdi-leaf"
        main-color="orange"
        @click="backToStep(StepContents.SelectPositiveStat)"
      >
        {{ t('enchant-doll.back-to-step') }}
      </cy-button-border>
    </div>
    <cy-transition type="fade" @after-enter="stepAfterEnter">
      <div
        v-if="stepCounter >= StepContents.SelectNegativeStat"
        class="step-content"
      >
        <div>
          <cy-icon-text icon="gg-menu-left-alt" text-color="purple">
            {{ t('enchant-doll.select-negatives.title') }}
          </cy-icon-text>
        </div>
        <div class="mt-1 text-sm pl-4">
          {{ t('enchant-doll.select-negatives.caption') }}
        </div>
        <div class="mt-2 ml-4 mr-2">
          <cy-icon-text
            icon="ic-outline-info"
            small
            text-color="water-blue"
            icon-color="water-blue-light"
          >
            {{ t('enchant-doll.select-negatives.tips-1') }}
          </cy-icon-text>
        </div>
        <div class="mt-1 ml-4 mr-2">
          <cy-icon-text
            icon="ic-outline-info"
            small
            text-color="water-blue"
            icon-color="water-blue-light"
          >
            {{ t('enchant-doll.tips.performance.auto-find-negatives') }}
          </cy-icon-text>
        </div>
        <div v-if="equipmentState.autoFindPotentialMinimum" class="mt-1 ml-4 mr-2">
          <cy-icon-text
            icon="ic-outline-info"
            small
            text-color="water-blue"
            icon-color="water-blue-light"
          >
            {{ t('enchant-doll.tips.performance.auto-find-original-potential-minimum-and-auto-find-negatives') }}
          </cy-icon-text>
        </div>
        <div class="mt-4 mb-6 flex justify-center flex-wrap">
          <cy-button-check v-model:selected="selectNegativeStatState.auto">
            {{ t('enchant-doll.select-negatives.auto-select') }}
          </cy-button-check>
        </div>
        <template v-if="selectNegativeStatState.auto">
          <template v-if="currentEquipmentType === 1">
            <div>
              <cy-icon-text icon="gg-menu-left-alt" text-color="purple">
                {{ t('enchant-doll.select-negatives.select-config.base-type.title') }}
              </cy-icon-text>
            </div>
            <div class="mt-1 text-sm pl-4">
              {{ t('enchant-doll.select-negatives.select-config.base-type.caption') }}
            </div>
            <div class="py-4 pl-2 flex justify-center flex-wrap">
              <cy-button
                v-for="option in dollConfigOptions.baseType"
                :key="option"
                type="check"
                :selected="doll.config.baseType === option"
                @click="doll.config.baseType = option"
              >
                {{ t('enchant-doll.select-negatives.select-config.base-type.option-texts.' + option) }}
              </cy-button>
            </div>
          </template>
          <div>
            <cy-icon-text icon="gg-menu-left-alt" text-color="purple">
              {{ t('enchant-doll.select-negatives.select-config.auto-find-negatives.title') }}
            </cy-icon-text>
          </div>
          <div class="mt-1 text-sm pl-4">
            {{ t('enchant-doll.select-negatives.select-config.auto-find-negatives.caption') }}
          </div>
          <div class="py-4 pl-2 flex justify-center flex-wrap">
            <cy-button
              v-for="option in dollConfigOptions.autoFindNegaitveStatsType"
              :key="option"
              type="check"
              :selected="doll.config.autoFindNegaitveStatsType === option"
              @click="doll.config.autoFindNegaitveStatsType = option"
            >
              {{ t('enchant-doll.select-negatives.select-config.auto-find-negatives.option-texts.' + option) }}
            </cy-button>
          </div>
        </template>
        <div
          v-if="selectNegativeStatState.auto && autoNegativeStats.length < doll.numNegativeStats"
          class="flex justify-center mt-4"
        >
          <div>
            <cy-icon-text small icon-color="water-blue" class="mr-4">
              {{ t('enchant-doll.select-negatives.auto-select') }}
            </cy-icon-text>
            <cy-icon-text small>
              {{ t('enchant-doll.select-negatives.manually-selected') }}
            </cy-icon-text>
          </div>
        </div>
        <div class="flex justify-center mb-4">
          <div class="mt-2 border border-purple max-w-xs">
            <template v-if="negativeStats.length !== 0">
              <cy-list-item v-for="stat in negativeStats" :key="stat.statId">
                <cy-icon-text
                  :text-color="stat.value >= 0 ? 'dark' : 'orange'"
                  :icon-color="autoNegativeStats.includes(stat) ? 'water-blue' : 'light-2'"
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
                  <cy-button
                    :disabled="autoNegativeStats.includes(stat)"
                    type="icon"
                    icon="jam-close-circle"
                    icon-color="gray"
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
          <cy-button-border
            icon="ic-round-add-circle-outline"
            @click="openSelectItem(SelectItemModes.Negative)"
          >
            {{ t('enchant-doll.select-item') }}
          </cy-button-border>
          <div v-if="selectNegativeStatState.auto && autoNegativeStats.length < doll.numNegativeStats" class="mt-2">
            <div>
              <cy-icon-text
                icon="ic-outline-info"
                small
                text-color="water-blue"
                icon-color="water-blue-light"
              >
                {{ t('enchant-doll.select-negatives.stats-from-auto-not-enough.0') }}
              </cy-icon-text>
            </div>
            <div class="text-water-blue text-sm">
              {{ t('enchant-doll.select-negatives.stats-from-auto-not-enough.1') }}
            </div>
          </div>
        </div>
        <cy-transition type="fade">
          <div
            v-if="stepCounter > StepContents.SelectNegativeStat"
            class="disabled-mask"
            @click="maskClick"
          />
        </cy-transition>
      </div>
    </cy-transition>
    <div v-if="stepCounter > StepContents.SelectNegativeStat" class="flex justify-center mb-4">
      <cy-button-border
        icon="mdi-leaf"
        main-color="orange"
        @click="backToStep(StepContents.SelectNegativeStat)"
      >
        {{ t('enchant-doll.back-to-step') }}
      </cy-button-border>
    </div>
    <cy-transition type="fade" @after-enter="stepAfterEnter">
      <div
        v-if="stepCounter >= StepContents.Result && resultEquipment"
        class="step-content"
      >
        <div>
          <cy-icon-text icon="gg-menu-left-alt" text-color="purple">
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
          <span class="text-purple">
            {{ currentEquipment.originalPotential }}
          </span>
        </div>
        <div
          v-if="equipmentState.autoFindPotentialMinimum
            && resultEquipment.originalPotential === 99
            && resultEquipment.realSuccessRate < 100"
          class="mt-2 flex justify-center"
        >
          <cy-icon-text
            icon="ic-outline-info"
            small
            text-color="water-blue"
            icon-color="water-blue-light"
          >
            {{ t('enchant-doll.tips.cannot-auto-find-original-potential-minimum') }}
          </cy-icon-text>
        </div>
        <div class="mt-6 mb-4 flex justify-center">
          <div class="border-1 border-purple rounded-lg pt-3 pb-5 pl-4 pr-6 bg-white">
            <EnchantResult :equipment="resultEquipment" />
          </div>
        </div>
        <div class="mt-6">
          <cy-icon-text icon="gg-menu-left-alt" text-color="purple">
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
          <cy-button
            v-if="!exportState.hasExport"
            type="border"
            icon="ic-outline-save"
            main-color="blue-green"
            @click="exportResult"
          >
            {{ t('global.export') }}
          </cy-button>
          <cy-button
            v-else
            type="border"
            icon="ic-round-open-in-new"
            main-color="blue-green"
            @click="$router.replace('/enchant')"
          >
            {{ t('enchant-doll.export-result.redirect-to-enchant-simulator') }}
          </cy-button>
        </div>
      </div>
    </cy-transition>
    <div class="flex items-center justify-center border-t border-purple mt-12 pt-4 relative">
      <cy-button
        v-if="stepCounter !== 3"
        type="border"
        icon="mdi-leaf"
        :disabled="nextStepDisabled"
        main-color="orange"
        @click="nextStep"
      >
        {{ t('enchant-doll.next-step') }}
      </cy-button>
      <span :class="{ 'absolute': stepCounter !== 3, 'right-0': stepCounter !== 3 }">
        <cy-button-border
          icon="bx-bx-reset"
          main-color="gray"
          @click="reset"
        >
          {{ t('global.reset') }}
        </cy-button-border>
      </span>
    </div>
    <div
      v-if="equipmentState.autoFindPotentialMinimum && stepCounter === StepContents.SelectNegativeStat"
      class="my-2 flex justify-center"
    >
      <cy-icon-text
        icon="ic-outline-info"
        small
        text-color="water-blue"
        icon-color="water-blue-light"
      >
        {{ t('enchant-doll.tips.performance.auto-find-original-potential-minimum') }}
      </cy-icon-text>
    </div>
    <div
      v-if="stepCounter === StepContents.Equipment"
      ref="top"
      class="text-light-3 text-sm text-center px-8 py-8 space-y-2"
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
      @select-item="selectItem"
      @close="toggle('windows/selectItem', false)"
    />
  </section>
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

import Grimoire from '@/shared/Grimoire'

import { EnchantBuild, EnchantEquipment, EnchantStat } from '@/lib/Enchant/Enchant'
import EnchantDoll from '@/lib/Enchant/Enchant/doll'
import { EnchantEquipmentTypes } from '@/lib/Enchant/Enchant/enums'
import { AutoFindNegaitveStatsTypes, EnchantDollBaseTypes } from '@/lib/Enchant/Enchant/doll/enums'

import ToggleService from '@/setup/ToggleService'
import Notify from '@/setup/Notify'
import Confirm from '@/setup/Confirm'

import EnchantResult from '../EnchantSimulator/enchant-result.vue'
import EnchantSelectItem from '../EnchantSimulator/enchant-select-item.vue'

import { EnchantStatOptionBase } from '../EnchantSimulator/setup'

const { windows, contents, toggle } = ToggleService({
  windows: ['selectItem'] as const,
  contents: ['setConfig'] as const,
})
const store = useEnchantStore()
const { t } = useI18n()
const { notify, loading } = Notify()
const { confirm } = Confirm()

const { config } = storeToRefs(store)

store.init()

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

const autoNegativeStats = computed(()  => autoNegativeStatsData.value ? autoNegativeStatsData.value.stats : [])

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

const selectedItems = computed(() => {
  const toItem = (stat: EnchantStat) => ({ origin: stat.itemBase, type: stat.type })
  const posItems = doll.value.positiveStats.map(toItem)
  const negItems = selectNegativeStatState.auto ? [] :
    selectNegativeStatState.manually.map(toItem)
  return [...posItems, ...negItems] as EnchantStatOptionBase[]
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
    if (doll.value.positiveStats.find(stat => physicals.includes(stat.baseName))) {
      current = EnchantDollBaseTypes.Physical
    }
    if (doll.value.positiveStats.find(stat => magic.includes(stat.baseName))) {
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
watch(computed(() => doll.value.config.baseType), () => {
  updateAutoFindNegativeStats(selectNegativeStatState.auto)
})
</script>

<style lang="postcss" scoped>
.step-content {
  padding: 2rem 1rem;
  border-top: 1px solid var(--primary-purple);
  min-height: 70vh;
  position: relative;

  & > .disabled-mask {
    @apply absolute w-full h-full z-5 cursor-not-allowed top-0 left-0;

    background-color: rgba(var(--rgb-white), 0.6);
  }
}
</style>
