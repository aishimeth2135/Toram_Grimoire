<template>
  <AppLayoutMain v-if="currentBuild">
    <div class="steps-content-container">
      <div class="steps-content">
        <div v-for="step in currentEquipment.allSteps" :key="step.index" class="step-container">
          <EnchantStepView :step="step" />
        </div>
        <div
          class="step-container flex h-48 cursor-pointer items-center justify-center border border-primary-30 duration-200 hover:border-primary-50"
          @click="appendStep"
        >
          <cy-icon icon="ic-round-add-circle-outline" width="3.5rem" />
        </div>
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
    <AppLayoutBottom>
      <template #default>
        <div class="flex items-center justify-end px-1 py-0.5">
          <cy-icon-text icon="bx-bx-star" class="mr-3">
            {{ t('enchant-simulator.success-rate') }}
          </cy-icon-text>
          <span class="text-primary-60">
            {{ successRate }}
          </span>
        </div>
      </template>
      <template #main-end>
        <cy-button-circle
          icon="ic:round-format-list-bulleted"
          color="blue"
          float
          toggle
          :selected="contents.result"
          @click="toggle('contents/result', null, false)"
        />
      </template>
      <template #side-buttons>
        <cy-button-circle
          icon="ic:baseline-settings"
          color="bright"
          float
          toggle
          :selected="contents.top"
          @click="toggle('contents/top', null, false)"
        />
      </template>
      <template #side-contents>
        <cy-transition mode="out-in">
          <AppLayoutBottomContent v-if="contents.result" class="p-3">
            <EnchantResult :equipment="currentEquipment" />
          </AppLayoutBottomContent>
          <AppLayoutBottomContent v-else-if="contents.top" class="p-3">
            <div class="flex items-center">
              <cy-title-input
                v-model:value="currentBuild.name"
                icon="ant-design:build-outlined"
                class="w-full"
              />
              <cy-options
                :value="store.currentBuild"
                :options="
                  buildDatas.map(item => ({
                    id: item.id,
                    value: item.origin,
                  }))
                "
                addable
                @update:value="store.setCurrentBuild($event)"
                @add-item="createBuild"
              >
                <template #title>
                  <cy-button-circle icon="ant-design:build-outlined" small />
                </template>
                <template #item="{ value }">
                  <cy-icon-text icon="ant-design:build-outlined">
                    {{ value.name }}
                  </cy-icon-text>
                </template>
              </cy-options>
            </div>
            <div class="flex flex-wrap items-center">
              <div class="mx-2">
                <cy-button-action icon="bx-bx-copy" @click="copyBuild">
                  {{ t('global.copy') }}
                </cy-button-action>
                <cy-button-action icon="mdi-export" color="cyan" @click="exportBuild">
                  {{ t('global.export') }}
                </cy-button-action>
                <cy-button-action icon="mdi-import" color="cyan" @click="importBuild">
                  {{ t('global.import') }}
                </cy-button-action>
                <cy-button-action
                  icon="ic-baseline-delete-outline"
                  color="secondary"
                  @click="removeBuild"
                >
                  {{ t('global.delete') }}
                </cy-button-action>
              </div>
            </div>
            <div class="mt-4 px-2">
              <div class="text-sm text-gray-50">
                {{ t('enchant-simulator.base-options') }}
              </div>
              <div class="mr-2 flex flex-wrap items-center py-2">
                <cy-input-counter
                  v-model:value="currentEquipment.originalPotential"
                  :title="t('enchant-simulator.equipment-original-potential')"
                />
                <cy-button-icon
                  icon="jam-hammer"
                  class="my-2 ml-2"
                  icon-color="blue-30"
                  icon-color-hover="blue"
                  :selected="contents.extraOptions"
                  @click="toggle('contents/extraOptions')"
                />
              </div>
            </div>
            <cy-transition>
              <div v-if="contents.extraOptions" class="mt-2 pl-2">
                <div class="text-sm text-gray-50">
                  {{ t('enchant-simulator.advanced-options') }}
                </div>
                <div class="py-2">
                  <cy-input-counter
                    v-model:value="currentEquipment.basePotential"
                    :title="t('enchant-simulator.equipment-base-potential')"
                  />
                </div>
                <EnchantCommonSetting class="mt-2" />
              </div>
            </cy-transition>
            <cy-icon-text small text-color="fuchsia-60" class="mt-3">
              {{ t('enchant-simulator.equipment-type') }}
            </cy-icon-text>
            <div class="px-2 py-0.5">
              <cy-button-check
                v-for="option in equipmentTypeOptions"
                :key="option.id"
                :selected="currentEquipmentType === option.id"
                @click="currentEquipmentType = option.id"
              >
                {{ option.text }}
              </cy-button-check>
            </div>
            <div class="mt-2 border-t border-primary-30 pt-2">
              <cy-icon-text small text-color="fuchsia-60" class="mt-3">
                {{ t('enchant-simulator.stat-display-mode.title') }}
              </cy-icon-text>
              <div class="px-2 py-0.5">
                <cy-button-check
                  :selected="state.statDisplayMode === 0"
                  @update:selected="state.statDisplayMode = 0"
                >
                  {{ t('enchant-simulator.stat-display-mode.potential-cost') }}
                </cy-button-check>
                <cy-button-check
                  :selected="state.statDisplayMode === 1"
                  main-color="blue-60"
                  @update:selected="state.statDisplayMode = 1"
                >
                  {{ t('enchant-simulator.stat-display-mode.material-point') }}
                </cy-button-check>
              </div>
            </div>
          </AppLayoutBottomContent>
        </cy-transition>
      </template>
    </AppLayoutBottom>
  </AppLayoutMain>
  <AppLayoutMain v-else class="p-4">
    <div class="mb-3 text-center">
      {{ t('common.tips.view-unknown-error-tips') }}
    </div>
    <div class="flex w-full justify-center">
      <cy-button-action @click="createBuild">
        {{ t('enchant-simulator.append-build') }}
      </cy-button-action>
    </div>
  </AppLayoutMain>
</template>

<script lang="ts">
export default {
  name: 'EnchantSimulator',
}
</script>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { type Ref, computed, onMounted, provide, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useEnchantStore } from '@/stores/views/enchant'

import {
  EnchantBuild,
  EnchantStep,
  type EnchantBuildSaveData,
  EnchantEquipmentTypes,
} from '@/lib/Enchant/Enchant'

import AutoSave from '@/shared/setup/AutoSave'
import Confirm from '@/shared/setup/Confirm'
import ExportBuild from '@/shared/setup/ExportBuild'
import Notify from '@/shared/setup/Notify'
import ToggleService from '@/shared/setup/ToggleService'

import AppLayoutBottomContent from '@/components/app-layout/app-layout-bottom-content.vue'
import AppLayoutBottom from '@/components/app-layout/app-layout-bottom.vue'
import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'

import EnchantResult from './enchant-result.vue'
import EnchantSelectItem from './enchant-select-item.vue'
import EnchantStepView from './enchant-step/index.vue'

import { EnchantSimulatorInjectionKey } from './injection-keys'
import { type EnchantStatOptionBase } from './setup'
import EnchantCommonSetting from './enchant-common-setting.vue'

const { windows, contents, toggle } = ToggleService({
  windows: ['selectItem'] as const,
  contents: ['top', 'extraOptions', 'result'] as const,
})
const store = useEnchantStore()
const { t } = useI18n()
const { notify } = Notify()
const { confirm } = Confirm()

const { enchantBuilds, currentBuild } = (() => {
  const { enchantBuilds: _enchantBuilds, currentBuild: _currentBuild } = storeToRefs(store)
  return {
    enchantBuilds: _enchantBuilds as Ref<EnchantBuild[]>,
    currentBuild: _currentBuild as Ref<EnchantBuild | null>,
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
  target: EnchantStep | null
  type: 'step'
  once: boolean
}
const buildCount = ref(0)

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

AutoSave({
  save: () => store.save(),
  loadFirst: () => store.init(),
})

const buildDatas = computed(() => {
  return enchantBuilds.value.map((build, idx) => ({
    origin: build,
    id: idx,
  }))
})

const currentEquipment = computed(() => currentBuild.value!.equipment)

const successRate = computed(() => {
  const rate = currentEquipment.value.successRate
  return rate === -1 ? t('enchant-simulator.success-rate-unlimited') : Math.floor(rate) + '%'
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

const { exportBuild, importBuild } = ExportBuild({
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
      matchedStat.remove()
      return
    }
    const stat = target.appendStat(item.origin, item.type, 0)
    if (!stat) {
      notify(t('enchant-simulator.tips.stats-reached-upper-limit'))
      return
    }
    const eq = stat.belongEquipment
    const { min } = stat.limit
    const pot = stat.itemBase.getPotential(stat.type, eq)
    stat.value =
      pot > stat.originalPotential
        ? min - Math.min(eq.stat(stat.itemBase, stat.type, eq.lastStep!.index).value, 0)
        : 0
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

<style scoped>
@reference "@/tailwind.css";

div.steps-content-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;

  @apply py-4;

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
      @apply m-1.5 max-w-full;
    }
  }
}
</style>
