<template>
  <section v-if="currentBuild">
    <div class="sticky top-0 border-b border-purple mb-4 z-10 bg-white">
      <div
        class="cursor-pointer px-4 py-1.5 flex items-center border-purple"
        @click="toggle('contents/top')"
      >
        <cy-icon-text icon="ant-design:build-outlined">
          {{ currentBuild.name }}
        </cy-icon-text>
        <cy-button-icon
          class="ml-auto"
          :icon="contents.top ? 'akar-icons:circle-chevron-down' : 'akar-icons:circle-chevron-up'"
          :selected="contents.top"
        />
      </div>
    </div>
    <div
      class="p-4 top-12 border-1 border-light-2 rounded-lg mx-4 mb-4 z-10 bg-white duration-300"
      :class="{ sticky: contents.top, 'border-purple': contents.top }"
    >
      <div class="flex items-center">
        <cy-title-input
          v-model:value="currentBuild.name"
          icon="ant-design:build-outlined"
          class="w-full"
        />
        <cy-options inline>
          <template #title>
            <cy-button-border icon="ant-design:build-outlined" />
          </template>
          <template #options>
            <cy-list-item
              v-for="buildData in buildDatas"
              :key="buildData.iid"
              @click="setCurrentBuild(buildData)"
            >
              <cy-icon-text icon="ant-design:build-outlined">
                {{ buildData.origin.name }}
              </cy-icon-text>
            </cy-list-item>
            <cy-list-item @click="createBuild">
              <cy-icon-text icon="ic-round-add-circle-outline" text-color="light-3">
                {{ t('enchant-simulator.append-build') }}
              </cy-icon-text>
            </cy-list-item>
          </template>
        </cy-options>
      </div>
      <div class="flex items-center flex-wrap">
        <div class="mx-2">
          <cy-button-border
            icon="bx-bx-copy"
            @click="copyBuild"
          >
            {{ t('global.copy') }}
          </cy-button-border>
          <cy-button-border
            icon="mdi-export"
            main-color="blue-green"
            @click="exportBuild"
          >
            {{ t('global.export') }}
          </cy-button-border>
          <cy-button-border
            icon="mdi-import"
            main-color="blue-green"
            @click="importBuild"
          >
            {{ t('global.import') }}
          </cy-button-border>
          <cy-button-border
            icon="ic-baseline-delete-outline"
            main-color="gray"
            @click="removeBuild"
          >
            {{ t('global.delete') }}
          </cy-button-border>
        </div>
      </div>
      <cy-icon-text size="small" text-color="purple" class="mt-4">
        {{ t('enchant-simulator.base-options') }}
      </cy-icon-text>
      <div class="flex items-center flex-wrap p-2 mr-2">
        <cy-input-counter v-model:value="currentEquipment.originalPotential">
          <template #title>
            <cy-icon-text>{{ t('enchant-simulator.equipment-original-potential') }}</cy-icon-text>
          </template>
        </cy-input-counter>
        <cy-button-icon
          icon="jam-hammer"
          class="ml-2 my-2"
          icon-color="water-blue-light"
          icon-color-hover="water-blue"
          :selected="contents.extraOptions"
          @click="toggle('contents/extraOptions')"
        />
      </div>
      <cy-transition type="fade">
        <div v-if="contents.extraOptions">
          <cy-icon-text size="small" text-color="water-blue" icon-color="water-blue" class="mt-4">
            {{ t('enchant-simulator.advanced-options') }}
          </cy-icon-text>
          <div class="p-2">
            <cy-input-counter
              v-model:value="currentEquipment.basePotential"
              main-color="water-blue-light"
            >
              <template #title>
                <cy-icon-text>{{ t('enchant-simulator.equipment-base-potential') }}</cy-icon-text>
              </template>
            </cy-input-counter>
          </div>
          <cy-icon-text size="small" text-color="water-blue" icon-color="water-blue" class="mt-4">
            {{ t('enchant-simulator.common-options') }}
          </cy-icon-text>
          <div class="p-2">
            <cy-input-counter
              v-model:value="config.characterLevel"
              :step="10"
              main-color="water-blue-light"
            >
              <template #title>
                <cy-icon-text>{{ t('enchant-simulator.common-options') }}</cy-icon-text>
              </template>
            </cy-input-counter>
            <cy-input-counter
              v-model:value="config.smithLevel"
              :step="10"
              class="mt-3"
              main-color="water-blue-light"
            >
              <template #title>
                <cy-icon-text>{{ t('enchant-simulator.smith-level') }}</cy-icon-text>
              </template>
            </cy-input-counter>
          </div>
        </div>
      </cy-transition>
      <cy-icon-text size="small" text-color="purple" class="mt-3">
        {{ t('enchant-simulator.equipment-type') }}
      </cy-icon-text>
      <div class="py-0.5 px-2">
        <cy-button-check
          v-for="option in equipmentTypeOptions"
          :key="option.id"
          :selected="currentEquipmentType === option.id"
          @click="currentEquipmentType = option.id"
        >
          {{ option.text }}
        </cy-button-check>
      </div>
    </div>
    <div class="steps-content-container">
      <div class="steps-content">
        <div
          v-for="step in currentEquipment.allSteps"
          :key="step.index"
          class="step-container"
        >
          <EnchantStepView :step="step" />
        </div>
        <cy-button
          icon="ic-round-add-circle-outline"
          class="step-container border flex items-center justify-center"
          style="--icon-width: 3.5rem; height: 12rem"
          hide-focus
          @click="appendStep"
        />
      </div>
    </div>
    <div>
      <EnchantSelectItem
        :visible="windows.selectItem"
        :once="selectItemTarget.once"
        :is-weapon="isWeapon"
        :selected-items="selectedItems"
        @close="toggle('windows/selectItem', false)"
        @select-item="selectItem"
      />
    </div>
    <div
      class="border-1 border-light-2 pt-2 pb-4 pl-2 pr-4 mx-3 mt-4 rounded-lg bg-white duration-300"
      :style="contents.result ? 'bottom: 4.25rem; max-height: calc(90vh - 6.5rem)' : 'bottom: 4.25rem'"
      :class="{
        'sticky': contents.result,
        'overflow-y-auto': contents.result,
        'animate-slide-up': contents.result,
        'border-purple': contents.result,
      }"
    >
      <EnchantResult :equipment="currentEquipment" />
    </div>
    <div class="sticky bottom-3">
      <div
        v-if="currentEquipment.allSteps.length === 0 && !contents.result"
        class="border-1 border-light-2 py-4 px-5 mx-4 mt-3 rounded-lg bg-white"
      >
        <div class="text-center">
          <cy-button-border
            icon="ic-round-add-circle-outline"
            main-color="red"
            @click="appendStep"
          >
            {{ t('enchant-simulator.append-enchant-step') }}
          </cy-button-border>
        </div>
        <div class="text-sm text-water-blue pt-1 text-center">
          {{ t('enchant-simulator.footer-guide.title-close') }}
        </div>
        <div class="pt-3">
          <cy-icon-text size="small" main-color="orange">
            {{ t('enchant-simulator.footer-guide.title') }}
          </cy-icon-text>
        </div>
        <div class="pt-1">
          <cy-icon-text
            icon="akar-icons:circle-chevron-down"
            text-color="purple"
            size="small"
            class="mr-3"
          >
            {{ t('enchant-simulator.footer-guide.toggle-result.titles.0') }}
          </cy-icon-text>
          <cy-icon-text
            icon="akar-icons:circle-chevron-up"
            text-color="purple"
            size="small"
          >
            {{ t('enchant-simulator.footer-guide.toggle-result.titles.1') }}
          </cy-icon-text>
        </div>
        <div class="pl-3 text-sm">
          {{ t('enchant-simulator.footer-guide.toggle-result.caption') }}
        </div>
        <div class="mt-3">
          <cy-icon-text
            icon="mdi-cube-outline"
            text-color="purple"
            icon-color="water-blue"
            size="small"
            class="mr-3"
          >
            {{ t('enchant-simulator.footer-guide.toggle-display-mode.titles.0') }}
          </cy-icon-text>
          <cy-icon-text
            icon="mdi-cube-off-outline"
            text-color="purple"
            icon-color="water-blue"
            size="small"
          >
            {{ t('enchant-simulator.footer-guide.toggle-display-mode.titles.1') }}
          </cy-icon-text>
        </div>
        <div class="pl-3 text-sm">
          {{ t('enchant-simulator.footer-guide.toggle-display-mode.caption') }}
        </div>
      </div>
      <div class="border-1 border-light-2 py-1 pl-4 pr-6 mx-3 mt-3 rounded-full flex items-center flex-wrap bg-white">
        <cy-button-icon
          :icon="contents.result ? 'akar-icons:circle-chevron-up' : 'akar-icons:circle-chevron-down'"
          :selected="contents.result"
          @click="toggle('contents/result')"
        />
        <cy-button-icon
          class="ml-2"
          :icon="state.statDisplayMode === 1 ? 'mdi-cube-outline' : 'mdi-cube-off-outline'"
          main-color="water-blue"
          :selected="state.statDisplayMode === 1"
          @click="state.statDisplayMode = state.statDisplayMode === 1 ? 0 : 1"
        />
        <!-- <cy-button-icon @click="optimizeSteps" /> -->
        <cy-icon-text icon="bx-bx-star" class="ml-auto mr-3">
          {{ t('enchant-simulator.success-rate') }}
        </cy-icon-text>
        <span class="text-light-4">
          {{ successRate }}
        </span>
      </div>
    </div>
  </section>
  <div v-else class="p-4">
    <div class="text-center mb-3">
      {{ t('common.tips.view-unknow-error-tips') }}
    </div>
    <div class="flex justify-center w-full">
      <cy-button-border @click="createBuild">
        {{ t('enchant-simulator.append-build') }}
      </cy-button-border>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { computed, onMounted, provide, reactive, Ref, ref } from 'vue'

import { useEnchantStore } from '@/stores/views/enchant'

import { EnchantBuild, EnchantStep } from '@/lib/Enchant/Enchant'
import { EnchantEquipmentTypes } from '@/lib/Enchant/Enchant/enums'
import { EnchantBuildSaveData } from '@/lib/Enchant/Enchant/build'

import ToggleService from '@/setup/ToggleService'
import AutoSave from '@/setup/AutoSave'
import Notify from '@/setup/Notify'
import Confirm from '@/setup/Confirm'
import ExportBuild from '@/setup/ExportBuild'

import EnchantResult from './enchant-result.vue'
import EnchantSelectItem from './enchant-select-item.vue'
import EnchantStepView from './enchant-step/index.vue'

import { EnchantStatOptionBase } from './setup'
import { EnchantSimulatorInjectionKey } from './injection-keys'

const { windows, contents, toggle } = ToggleService({
  windows: ['selectItem'] as const,
  contents: ['top', 'extraOptions', 'result'] as const,
})
const store = useEnchantStore()
const { t } = useI18n()
const { notify } = Notify()
const { confirm } = Confirm()

const { enchantBuilds, currentBuild, config } = (() => {
  const { enchantBuilds: _enchantBuilds, currentBuild: _currentBuild, config: _config } = storeToRefs(store)
  return {
    enchantBuilds: _enchantBuilds as Ref<EnchantBuild[]>,
    currentBuild: _currentBuild as Ref<EnchantBuild | null>,
    config: _config,
  }
})()

const state = reactive({
  statDisplayMode: 0,
})

const selectItemTarget = reactive({
  target: null,
  type: 'step',
  once: false,
}) as {
  target: EnchantStep | null;
  type: 'step';
  once: boolean;
}
const buildCount = ref(0)

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

AutoSave({
  save: () => store.save(),
  loadFirst: () => store.init(),
})

const buildDatas = computed(() => {
  return enchantBuilds.value.map((build, idx) => ({
    origin: build,
    iid: idx,
  }))
})

const currentEquipment = computed(() => currentBuild.value!.equipment)

const successRate = computed(() => {
  const rate = currentEquipment.value.successRate
  return rate === -1 ?
    t('enchant-simulator.success-rate-unlimited') :
    Math.floor(rate) + '%'
})

const selectedItems = computed(() => {
  return (selectItemTarget.target?.stats ?? []).map(stat => ({
    id: stat.statId,
    origin: stat.itemBase,
    type: stat.type,
  }))
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

const isWeapon = computed(() => {
  return currentEquipmentType.value !== 1
})

const setCurrentBuild = (data: (typeof buildDatas)['value'][number]) => {
  store.setCurrentBuild(data.iid)
}

const createBuild = () => {
  const name = t('enchant-simulator.build') + ' ' + (buildCount.value + 1).toString()
  const build = new EnchantBuild(name)
  store.appendBuild(build)
  buildCount.value += 1
}

const removeBuild = async () => {
  if (enchantBuilds.value.length === 1) {
    notify(t('enchant-simulator.tips.keep-at-least-one-build'))
    return
  }
  if (await confirm(t('enchant-simulator.tips.remove-build-confirm'))) {
    store.removeBuild(currentBuild.value!)
  }
}

const copyBuild = () => {
  store.copyBuild(currentBuild.value!)
  notify(t('enchant-simulator.tips.copy-build-success'))
}

const {
  exportBuild,
  importBuild,
} = ExportBuild({
  save(handler) {
    const build = currentBuild.value!
    const data = build.save()
    handler(build.name + '.txt', JSON.stringify(data))
  },
  loaded(res) {
    const saveData = JSON.parse(res) as EnchantBuildSaveData
    const build = EnchantBuild.load(saveData)
    store.appendBuild(build)
  },
})

const appendStep = () => {
  currentEquipment.value.appendStep()
}

const openSelectItem = (type: 'step', target: EnchantStep, once = false) => {
  selectItemTarget.type = type
  selectItemTarget.target = target
  selectItemTarget.once = once
  toggle('windows/selectItem', true)
}

const selectItem = (item: EnchantStatOptionBase) => {
  const { type, target } = selectItemTarget
  if (type === 'step' && target instanceof EnchantStep) {
    const matchedStat = target.stat(item.origin, item.type)
    if (matchedStat) {
      // this.$notify(this.$lang('tips/step stat repeated'));
      matchedStat.remove()
      return
    }
    const stat = target.appendStat(item.origin, item.type, 0)
    if (!stat) {
      notify(t('enchant-simulator.tips.stats-reached-upper-limit'))
      return
    }
    const eq = stat.belongEquipment
    const min = stat.limit[0]
    const pot = stat.itemBase.getPotential(stat.type, eq)
    stat.value = pot > stat.originalPotential ?
      (min - Math.min(eq.stat(stat.itemBase, stat.type, eq.lastStep!.index).value, 0)) : 0
  }
}

onMounted(() => {
  if (store.enchantBuilds.length === 0) {
    createBuild()
  }
})

provide(EnchantSimulatorInjectionKey, {
  openSelectItem,
  rootState: state,
})

// optimizeSteps() {
//   /** @type {EnchantEquipment} */
//   const eq = this.currentEquipment;
//   console.log('=====================================');
//   eq.steps(eq.lastStep.index).forEach(step => console.log(step, step.optimizeType()));
// }
</script>

<style lang="postcss" scoped>
div.steps-content-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 60vh;

  & > .steps-content {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
    width: calc(46rem + 5px);

    @media screen and (max-width: 50rem) {
     width: 100%;
    }

    & > .step-container {
      width: 22rem;
      @apply m-2 max-w-full;
    }
  }
}
</style>
