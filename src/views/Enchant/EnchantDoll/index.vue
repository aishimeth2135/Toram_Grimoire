<template>
  <AppLayoutMain class="pb-6">
    <EnchantDollStepEquipment />
    <cy-transition @after-enter="stepAfterEnter">
      <EnchantDollStepPositiveStats
        v-if="currentStep >= StepIds.SelectPositiveStat"
      />
    </cy-transition>
    <cy-transition @after-enter="stepAfterEnter">
      <EnchantDollStepNegativeStats
        v-if="currentStep >= StepIds.SelectNegativeStat"
      />
    </cy-transition>
    <cy-transition @after-enter="stepAfterEnter">
      <EnchantDollStepResult v-if="currentStep >= StepIds.Result" />
    </cy-transition>
    <div
      class="relative mt-12 flex items-center justify-center border-t border-fuchsia-60 pt-4"
    >
      <cy-button-action
        v-if="currentStep !== StepIds.Result"
        icon="mdi-leaf"
        :disabled="nextStepDisabled"
        color="orange"
        @click="nextStep"
      >
        {{ t('enchant-doll.next-step') }}
      </cy-button-action>
      <span
        :class="{
          'absolute': currentStep !== StepIds.Result,
          'right-0': currentStep !== StepIds.Result,
        }"
      >
        <cy-button-action icon="bx-bx-reset" color="gray" @click="reset">
          {{ t('global.reset') }}
        </cy-button-action>
      </span>
    </div>
    <div
      v-if="
        equipmentState.autoFindPotentialMinimum &&
        currentStep === StepIds.SelectNegativeStat
      "
      class="my-2 flex justify-center"
    >
      <cy-icon-text
        icon="ic-outline-info"
        small
        text-color="blue-60"
        icon-color="blue-30"
      >
        <!-- prettier-ignore -->
        {{ t('enchant-doll.tips.performance.auto-find-original-potential-minimum') }}
      </cy-icon-text>
    </div>
    <div
      v-if="currentStep === StepIds.Equipment"
      ref="top"
      class="space-y-2 px-8 py-8 text-center text-sm text-primary-50"
    >
      <div>{{ t('enchant-doll.top-caption.0') }}</div>
      <div>{{ t('enchant-doll.top-caption.1') }}</div>
    </div>
    <EnchantSelectItem
      :visible="selectItemVisible"
      :is-weapon="equipmentIsWeapon"
      :for-positive="currentStep === StepIds.SelectPositiveStat"
      :default-negative="currentStep === StepIds.SelectNegativeStat"
      :selected-items="selectedItems"
      :disabled-items="disabledItems"
      @select-item="selectItem"
      @close="toggleSelectItemVisible"
    />
  </AppLayoutMain>
</template>

<script lang="ts" setup>
import {
  type Ref,
  computed,
  nextTick,
  provide,
  reactive,
  readonly,
  ref,
  watch,
} from 'vue'
import { useI18n } from 'vue-i18n'

import { useEnchantStore } from '@/stores/views/enchant'

import AutoSave from '@/shared/setup/AutoSave'
import Confirm from '@/shared/setup/Confirm'
import Notify from '@/shared/setup/Notify'
import { useToggle } from '@/shared/setup/State'

import {
  EnchantEquipment,
  EnchantEquipmentTypes,
  EnchantStat,
} from '@/lib/Enchant/Enchant'
import {
  type AutoFindNegaitveStatsResult,
  EnchantDoll,
  EnchantDollBaseTypes,
} from '@/lib/Enchant/EnchantDoll'

import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'

import EnchantSelectItem from '../EnchantSimulator/enchant-select-item.vue'
import EnchantDollStepEquipment from './enchant-doll-step-equipment.vue'
import EnchantDollStepNegativeStats from './enchant-doll-step-negative-stats.vue'
import EnchantDollStepPositiveStats from './enchant-doll-step-positive-stats.vue'
import EnchantDollStepResult from './enchant-doll-step-result.vue'

import { type EnchantStatOptionBase } from '../EnchantSimulator/setup'
import { EnchantDollInjectionKey } from './injection-keys'
import {
  AUTO_FIND_POTENTIAL_MIMUMUM_UPPER_LIMIT,
  SelectItemModes,
  StepIds,
} from './setup'

defineOptions({
  name: 'EnchantDollView',
})

const selectItemVisible = ref(false)
const toggleSelectItemVisible = useToggle(selectItemVisible)
const store = useEnchantStore()
const { t } = useI18n()
const { notify, loading } = Notify()
const { confirm } = Confirm()

AutoSave({
  save: () => store.save(),
  loadFirst: () => store.init(),
})

const doll = ref(new EnchantDoll()) as Ref<EnchantDoll>
const currentStep = ref(StepIds.Equipment)
const selectItemMode: Ref<SelectItemModes> = ref(SelectItemModes.None)
const autoNegativeStatsResult: Ref<AutoFindNegaitveStatsResult | null> =
  ref(null)
const resultEquipment: Ref<EnchantEquipment | null> = ref(null)

const equipmentState = reactive({
  autoFindPotentialMinimum: false,
})

const positiveStatsState = reactive({
  autoFill: true,
})

const negativeStatsState = reactive({
  auto: false,
  manually: [],
}) as {
  auto: boolean
  manually: EnchantStat[]
}

const currentEquipment = computed(() => doll.value.build.equipment)

const equipmentIsWeapon = computed(
  () => currentEquipment.value.fieldType === EnchantEquipmentTypes.MainWeapon
)

const autoNegativeStats = computed(() =>
  autoNegativeStatsResult.value ? autoNegativeStatsResult.value.stats : []
)

const negativeStats = computed(() => {
  if (negativeStatsState.auto) {
    return autoNegativeStats.value
  }
  return negativeStatsState.manually
})

const nextStepDisabled = computed(() => {
  if (currentStep.value === StepIds.SelectNegativeStat) {
    return negativeStats.value.length === 0
  }
  if (currentStep.value === StepIds.SelectPositiveStat) {
    return doll.value.positiveStats.length === 0
  }
  return false
})

const toItem = (stat: EnchantStat) => ({
  origin: stat.itemBase,
  type: stat.type,
})

const selectedItems = computed(() => {
  const posItems = doll.value.positiveStats.map(toItem)
  const negItems = negativeStatsState.auto
    ? []
    : negativeStatsState.manually.map(toItem)
  return [...posItems, ...negItems] as EnchantStatOptionBase[]
})

const disabledItems = computed(() => {
  if (currentStep.value === StepIds.SelectNegativeStat) {
    return doll.value.positiveStats.map(toItem)
  }
  return []
})

const autoFindNegaitveStats = async (
  manuallyStats: EnchantStat[],
  originalPotentialUnknow = false
) => {
  autoNegativeStatsResult.value = null
  loading.show()
  await nextTick()
  setTimeout(() => {
    try {
      if (originalPotentialUnknow) {
        autoNegativeStatsResult.value = doll.value.autoFindNegaitveStats(
          manuallyStats,
          100
        )
        // if (this.autoNegativeStatsData.realSuccessRate >= 100) {
        //   this.autoFindPotentialMinimumEquipment();
        //   this.autoNegativeStatsData = doll.value.autoFindNegaitveStats(manuallyStats);
        // }
      } else {
        autoNegativeStatsResult.value =
          doll.value.autoFindNegaitveStats(manuallyStats)
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
    const manuallyStats = negativeStatsState.manually
    if (equipmentState.autoFindPotentialMinimum) {
      autoFindNegaitveStats(manuallyStats, true)
      return
    }
    autoFindNegaitveStats(manuallyStats)
  } else {
    autoNegativeStatsResult.value = null
  }
}

const autoFindPotentialMinimumEquipment = () => {
  // if (autoNegativeStatsResult.value?.equipment) {
  //   const result = autoNegativeStatsResult.value
  //   if (result.realSuccessRate >= 100) {
  //     currentEquipment.value.originalPotential =
  //       result.equipment!.originalPotential
  //     return result.equipment
  //   }
  // }

  let left = 1,
    right = AUTO_FIND_POTENTIAL_MIMUMUM_UPPER_LIMIT,
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

const reset = async () => {
  if (await confirm(t('enchant-doll.tips.reset-confirm'))) {
    doll.value = new EnchantDoll()
    currentStep.value = 0
    negativeStatsState.manually = []
    negativeStatsState.auto = false
  }
}

const removeNegativeStat = (stat: EnchantStat) => {
  const manually = negativeStatsState.manually
  const index = manually.indexOf(stat)
  manually.splice(index, 1)
}

const nextStep = async () => {
  if (currentStep.value === StepIds.SelectPositiveStat) {
    const physicals = ['atk', 'physical_pierce']
    const magic = ['matk', 'magic_pierce']
    let current = EnchantDollBaseTypes.None
    if (
      doll.value.positiveStats.find(stat => physicals.includes(stat.baseId))
    ) {
      current = EnchantDollBaseTypes.Physical
    }
    if (doll.value.positiveStats.find(stat => magic.includes(stat.baseId))) {
      current =
        current === EnchantDollBaseTypes.Physical
          ? EnchantDollBaseTypes.None
          : EnchantDollBaseTypes.Magic
    }
    doll.value.config.baseType = current
  } else if (currentStep.value === StepIds.SelectNegativeStat) {
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
        currentStep.value += 1
      } catch (err) {
        console.warn(
          '[enchant-doll] some error when auto find potential minimum'
        )
        console.log(err)
        notify(t('enchant-doll.tips.unknown-error-when-calc'))
      } finally {
        await nextTick()
        loading.hide()
      }
    }, 50)
    return
  }
  currentStep.value += 1
}

const stepAfterEnter = (el: Element) => {
  nextTick(() => el.scrollIntoView({ behavior: 'smooth' }))
}

const openSelectItem = (mode: SelectItemModes) => {
  selectItemMode.value = mode
  toggleSelectItemVisible(true)
}

const selectItem = (item: EnchantStatOptionBase) => {
  const mode = selectItemMode.value
  if (mode === SelectItemModes.Positive) {
    const findPosStat = doll.value.getPositiveStat(item.origin, item.type)
    if (findPosStat) {
      doll.value.removePositiveStat(findPosStat)
      return
    }
    const value = positiveStatsState.autoFill
      ? item.origin.getLimit(item.type).max
      : 1
    if (!doll.value.appendPositiveStat(item.origin, item.type, value)) {
      notify(t('enchant-doll.tips.stats-reached-upper-limit'))
    }
  } else {
    const nstats = negativeStats.value
    if (doll.value.hasPositiveStat(item.origin, item.type)) {
      notify(t('enchant-doll.tips.stat-repeated'))
      return
    }
    const findNegStat = nstats.find(
      stat => stat.itemBase === item.origin && stat.type === item.type
    )
    if (findNegStat) {
      removeNegativeStat(findNegStat)
      return
    }
    if (nstats.length >= doll.value.numNegativeStats) {
      notify(t('enchant-doll.tips.stats-reached-upper-limit'))
      return
    }
    negativeStatsState.manually.push(
      new EnchantStat(
        item.origin,
        item.type,
        item.origin.getLimit(item.type).min
      )
    )
  }
}

const backToStep = (id: StepIds) => {
  currentStep.value = id
  resultEquipment.value = null
  if (currentStep.value < StepIds.SelectNegativeStat) {
    negativeStatsState.auto = false
  }
  if (id < StepIds.SelectNegativeStat) {
    negativeStatsState.manually = []
  }
}

watch(
  computed(() => negativeStatsState.auto),
  newv => {
    updateAutoFindNegativeStats(newv)
  }
)
watch(
  computed(() => doll.value.config.containsNaturalMpRegenConstant),
  () => {
    updateAutoFindNegativeStats(negativeStatsState.auto)
  }
)
watch(
  computed(() => doll.value.config.baseType),
  () => {
    updateAutoFindNegativeStats(negativeStatsState.auto)
  }
)

provide(EnchantDollInjectionKey, {
  currentStep: readonly(currentStep),
  doll,
  negativeStats,
  autoNegativeStats,
  resultEquipment,

  backToStep,
  openSelectItem,
  removeNegativeStat,

  equipmentState,
  positiveStatsState,
  negativeStatsState,
})
</script>
