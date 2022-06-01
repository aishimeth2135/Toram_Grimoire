<template>
  <AppLayoutMain v-if="currentBuild">
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
    <AppLayoutBottom>
      <template #default>
        <div class="flex items-center justify-end py-0.5 px-1">
          <cy-icon-text icon="bx-bx-star" class="mr-3">
            {{ t('enchant-simulator.success-rate') }}
          </cy-icon-text>
          <span class="text-light-4">
            {{ successRate }}
          </span>
        </div>
      </template>
      <template #main-end>
        <cy-button-circle
          icon="ic:round-format-list-bulleted"
          color="water-blue"
          float
          toggle
          :selected="contents.result"
          @click="toggle('contents/result')"
        />
      </template>
      <template #side-buttons>
        <cy-button-circle
          icon="ic:baseline-settings"
          color="bright"
          float
          toggle
          :selected="contents.top"
          @click="toggle('contents/top')"
        />
      </template>
      <template #side-contents>
        <cy-transition type="fade" mode="out-in">
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
                :options="buildDatas.map(item => ({ id: item.id, value: item.origin }))"
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
            <div class="flex items-center flex-wrap">
              <div class="mx-2">
                <cy-button-action
                  icon="bx-bx-copy"
                  @click="copyBuild"
                >
                  {{ t('global.copy') }}
                </cy-button-action>
                <cy-button-action
                  icon="mdi-export"
                  color="blue-green"
                  @click="exportBuild"
                >
                  {{ t('global.export') }}
                </cy-button-action>
                <cy-button-action
                  icon="mdi-import"
                  color="blue-green"
                  @click="importBuild"
                >
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
            <cy-icon-text small text-color="purple" class="mt-4">
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
                <cy-icon-text small text-color="water-blue" icon-color="water-blue" class="mt-4">
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
                <cy-icon-text small text-color="water-blue" icon-color="water-blue" class="mt-4">
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
            <cy-icon-text small text-color="purple" class="mt-3">
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
            <div class="pt-2 mt-2 border-t border-light-2">
              <cy-icon-text small text-color="purple" class="mt-3">
                {{ t('enchant-simulator.stat-display-mode.title') }}
              </cy-icon-text>
              <div class="py-0.5 px-2">
                <cy-button-check
                  :selected="state.statDisplayMode === 0"
                  @update:selected="state.statDisplayMode = 0"
                >
                  {{ t('enchant-simulator.stat-display-mode.material-point') }}
                </cy-button-check>
                <cy-button-check
                  :selected="state.statDisplayMode === 1"
                  main-color="water-blue"
                  @update:selected="state.statDisplayMode = 1"
                >
                  {{ t('enchant-simulator.stat-display-mode.potential-cost') }}
                </cy-button-check>
              </div>
            </div>
          </AppLayoutBottomContent>
        </cy-transition>
      </template>
    </AppLayoutBottom>
  </AppLayoutMain>
  <AppLayoutMain v-else class="p-4">
    <div class="text-center mb-3">
      {{ t('common.tips.view-unknow-error-tips') }}
    </div>
    <div class="flex justify-center w-full">
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

import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'
import AppLayoutBottomContent from '@/components/app-layout/app-layout-bottom-content.vue'
import AppLayoutBottom from '@/components/app-layout/app-layout-bottom.vue'

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
    id: idx,
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
