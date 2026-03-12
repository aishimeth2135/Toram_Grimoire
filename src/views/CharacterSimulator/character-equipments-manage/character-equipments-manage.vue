<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { reactive, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import Draggable from 'vuedraggable'

import { useCharacterStore } from '@/stores/views/character'
import { useCharacterBuildLabelStore } from '@/stores/views/character/setup/setupCharacterBuildLabels'

import type { CharacterBuildLabel } from '@/lib/Character/Character/CharacterBuildLabel'
import { AllEquipmentTypeCategorys, CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { Items } from '@/lib/common/Items'

import FloatPage from '@/components/app-layout/float-page/float-page.vue'
import CardRowsWrapper from '@/components/card/card-rows-wrapper.vue'
import CardRows from '@/components/card/card-rows.vue'
import ButtonRadioCaption from '@/components/common/button-radio-caption.vue'
import IconSelection from '@/components/common/icon-selection.vue'

import CharacterEquipmentsLabelSetting from './character-equipments-label-setting.vue'
import CharacterEquipmentItemPlain from './character-equipments-manage-item.vue'

const visible = defineModel<boolean>('visible', { required: true })

const { t } = useI18n()

const { equipments } = storeToRefs(useCharacterStore())
const { buildLabels } = storeToRefs(useCharacterBuildLabelStore())

// Base
const enum ManageMode {
  Common,
  BatchMove,
  Label,
}

const currentEditedMode = ref<ManageMode>(ManageMode.Common)
const selectedEquipment = shallowRef<CharacterEquipment | null>(null)

// Mode: Batch Move
const enum BatchMoveStep {
  Select,
  Confirm,
}
const batchMoveState = reactive({
  currentStep: BatchMoveStep.Select,
  selectedEquipments: [],
  moveTarget: null,
}) as {
  currentStep: BatchMoveStep
  selectedEquipments: CharacterEquipment[]
  moveTarget: CharacterEquipment | null
}

const goSelectTargetStep = () => {
  if (batchMoveState.currentStep !== BatchMoveStep.Select) {
    return
  }
  batchMoveState.currentStep = BatchMoveStep.Confirm
  batchMoveState.moveTarget = null
}

const resetBatchMoveState = () => {
  batchMoveState.currentStep = BatchMoveStep.Select
  batchMoveState.selectedEquipments = []
  batchMoveState.moveTarget = null
}

const toggleBatchMoveTarget = (equip: CharacterEquipment) => {
  if (Items.equal(batchMoveState.moveTarget, equip)) {
    batchMoveState.moveTarget = null
  } else {
    batchMoveState.moveTarget = equip
  }
}

const handleBatchMove = () => {
  const newEquipments = equipments.value.filter(
    equip => !Items.includes(batchMoveState.selectedEquipments, equip)
  )
  let insertIdx = 0
  if (batchMoveState.moveTarget !== null) {
    insertIdx = equipments.value.findIndex(equip => Items.equal(equip, batchMoveState.moveTarget!))
  }
  if (insertIdx > -1) {
    newEquipments.splice(insertIdx, 0, ...batchMoveState.selectedEquipments)
    equipments.value = newEquipments
    resetBatchMoveState()
  }
}

// Mode: Label
const selectedLabel = shallowRef<CharacterBuildLabel | null>(null)

const toggleSelectedLabel = (label: CharacterBuildLabel) => {
  if (selectedLabel.value === label) {
    selectedLabel.value = null
  } else {
    selectedLabel.value = label
  }
}

// Batch sorting
const enum BatchSortMode {
  EquipmentType,
  Label,
  LabelEnd,
}

const currentBatchSortMode = ref<BatchSortMode>(BatchSortMode.EquipmentType)
const batchSortEquipmentsBackup = shallowRef<CharacterEquipment[] | null>(null)

const EQUIPMENT_TYPE_ORDERS = Array.from(AllEquipmentTypeCategorys.values()).flat()

const rollbackBatchSort = () => {
  if (batchSortEquipmentsBackup.value) {
    equipments.value = batchSortEquipmentsBackup.value.slice()
    batchSortEquipmentsBackup.value = null
  }
}

const getEquipmentsSortComparation = (equip1: CharacterEquipment, equip2: CharacterEquipment) => {
  const equip1Order = EQUIPMENT_TYPE_ORDERS.indexOf(equip1.type)
  const equip2Order = EQUIPMENT_TYPE_ORDERS.indexOf(equip2.type)

  if (equip1Order === -1) {
    return 1
  } else if (equip2Order === -1) {
    return -1
  }

  return equip1Order - equip2Order
}

const handleBatchSortEquipmentsReplace = (newEquipments: CharacterEquipment[]) => {
  batchSortEquipmentsBackup.value = equipments.value.slice()
  equipments.value = newEquipments
}

const sortAllEquipmentsByEquipmentType = () => {
  const newEquipments = equipments.value.slice().sort(getEquipmentsSortComparation)
  handleBatchSortEquipmentsReplace(newEquipments)
}

const sortAllEquipmentsByLabels = (labelEnd = false) => {
  const newEquipments = equipments.value.slice().sort((equip1, equip2) => {
    if (equip1.labels.length === 0 && equip2.labels.length === 0) {
      return getEquipmentsSortComparation(equip1, equip2)
    }

    const hasLabelItemDir = labelEnd ? -1 : 1

    const equip1Order = buildLabels.value.findIndex(label => Items.includes(equip1.labels, label))
    const equip2Order = buildLabels.value.findIndex(label => Items.includes(equip2.labels, label))

    if (equip1Order === equip2Order) {
      return getEquipmentsSortComparation(equip1, equip2)
    } else if (equip1Order === -1) {
      return 1 * hasLabelItemDir
    } else if (equip2Order === -1) {
      return -1 * hasLabelItemDir
    }

    return equip1Order - equip2Order
  })

  handleBatchSortEquipmentsReplace(newEquipments)
}

const sortAllEquipments = () => {
  if (currentBatchSortMode.value === BatchSortMode.EquipmentType) {
    sortAllEquipmentsByEquipmentType()
  } else if (currentBatchSortMode.value === BatchSortMode.Label) {
    sortAllEquipmentsByLabels()
  } else if (currentBatchSortMode.value === BatchSortMode.LabelEnd) {
    sortAllEquipmentsByLabels(true)
  }
}
</script>

<template>
  <FloatPage
    v-model:visible="visible"
    :title="t('character-simulator.character-equipments-manage.title')"
    title-icon="ic-round-edit"
  >
    <div class="wd-lg:flex h-full w-full overflow-y-auto px-2 py-4">
      <div class="wd-lg:h-full shrink-0 py-2 pb-6">
        <div class="text-stone-40 mb-1 px-2 text-sm">
          {{ t('character-simulator.character-equipments-manage.mode-selections-title') }}
        </div>
        <div class="mb-1 space-y-2">
          <div>
            <cy-button-radio
              :selected="currentEditedMode === ManageMode.Common"
              @click="currentEditedMode = ManageMode.Common"
            >
              {{ t('character-simulator.character-equipments-manage.mode-common') }}
            </cy-button-radio>
            <ButtonRadioCaption>
              {{ t('character-simulator.character-equipments-manage.mode-common-caption') }}
            </ButtonRadioCaption>
          </div>
          <div>
            <cy-button-radio
              :selected="currentEditedMode === ManageMode.BatchMove"
              @click="currentEditedMode = ManageMode.BatchMove"
            >
              {{ t('character-simulator.character-equipments-manage.mode-batch-move') }}
            </cy-button-radio>
            <ButtonRadioCaption>
              {{ t('character-simulator.character-equipments-manage.mode-batch-move-caption') }}
            </ButtonRadioCaption>
          </div>
          <div>
            <cy-button-radio
              :selected="currentEditedMode === ManageMode.Label"
              @click="currentEditedMode = ManageMode.Label"
            >
              {{ t('character-simulator.character-equipments-manage.mode-label') }}
            </cy-button-radio>
            <ButtonRadioCaption>
              {{ t('character-simulator.character-equipments-manage.mode-label-caption') }}
            </ButtonRadioCaption>
          </div>
        </div>
        <div class="mb-5 mt-2 pl-1 pr-4">
          <CharacterEquipmentsLabelSetting
            :selected-labels="selectedLabel ? [selectedLabel] : []"
            @label-click="toggleSelectedLabel"
          />
        </div>
        <div class="text-stone-40 mb-1 px-2 text-sm">
          {{ t('character-simulator.character-equipments-manage.batch-sorting-title') }}
        </div>
        <div class="mb-2 flex flex-col">
          <cy-button-radio
            :selected="currentBatchSortMode === BatchSortMode.EquipmentType"
            @click="currentBatchSortMode = BatchSortMode.EquipmentType"
          >
            {{
              t('character-simulator.character-equipments-manage.batch-sorting-by-equipment-type')
            }}
          </cy-button-radio>
          <cy-button-radio
            :selected="currentBatchSortMode === BatchSortMode.Label"
            @click="currentBatchSortMode = BatchSortMode.Label"
          >
            {{ t('character-simulator.character-equipments-manage.batch-sorting-by-label') }}
          </cy-button-radio>
          <cy-button-radio
            :selected="currentBatchSortMode === BatchSortMode.LabelEnd"
            @click="currentBatchSortMode = BatchSortMode.LabelEnd"
          >
            {{ t('character-simulator.character-equipments-manage.batch-sorting-by-label-end') }}
          </cy-button-radio>
        </div>
        <div class="space-x-2">
          <cy-button-action @click="sortAllEquipments">
            {{ t('global.apply') }}
          </cy-button-action>
          <cy-button-action
            :disabled="batchSortEquipmentsBackup === null"
            color="gray"
            @click="rollbackBatchSort"
          >
            {{ t('global.recovery') }}
          </cy-button-action>
        </div>
      </div>
      <div class="wd:grow wd-lg:h-full wd-lg:ml-auto flex max-h-full max-w-[45.25rem] flex-col">
        <div v-if="currentEditedMode === ManageMode.BatchMove" class="shrink-0 pb-2">
          <div class="flex flex-wrap items-center">
            <cy-button-action
              :disabled="
                batchMoveState.currentStep !== BatchMoveStep.Select ||
                batchMoveState.selectedEquipments.length === 0
              "
              @click="goSelectTargetStep"
            >
              {{ t('global.next-step') }}
            </cy-button-action>
            <cy-icon icon="mdi:arrow-right-bold" class="mx-2" />
            <cy-button-action
              :disabled="batchMoveState.currentStep !== BatchMoveStep.Confirm"
              @click="handleBatchMove"
            >
              {{ t('global.confirm') }}
            </cy-button-action>
            <cy-button-plain class="ml-auto text-sm" @click="resetBatchMoveState">
              {{ t('global.reset') }}
            </cy-button-plain>
          </div>
          <div class="text-primary-60 mt-1 px-3 text-sm">
            <template v-if="batchMoveState.currentStep === BatchMoveStep.Select">
              {{
                t(
                  'character-simulator.character-equipments-manage.mode-batch-move-steps.step-select-caption'
                )
              }}
            </template>
            <template v-else-if="batchMoveState.currentStep === BatchMoveStep.Confirm">
              <template v-if="batchMoveState.moveTarget === null">
                {{
                  t(
                    'character-simulator.character-equipments-manage.mode-batch-move-steps.move-to-head-caption'
                  )
                }}
              </template>
              <i18n-t
                v-else
                keypath="character-simulator.character-equipments-manage.mode-batch-move-steps.move-to-equipment-behind-caption"
                tag="div"
                scope="global"
              >
                <template #name>
                  <span class="text-orange-60 mx-1">
                    {{ batchMoveState.moveTarget.name }}
                  </span>
                </template>
              </i18n-t>
            </template>
          </div>
        </div>
        <CardRowsWrapper class="grow overflow-y-auto">
          <CardRows>
            <Draggable v-model="equipments" item-key="id" handle=".drag-handle">
              <template #item="{ element: equip }: { element: CharacterEquipment }">
                <CharacterEquipmentItemPlain
                  :key="equip.id"
                  :equipment="equip"
                  :selected="selectedEquipment === equip"
                  @click="selectedEquipment = equip"
                >
                  <template #current-action>
                    <div class="px-1 pt-3.5">
                      <cy-icon
                        v-if="currentEditedMode === ManageMode.Common"
                        icon="ic:baseline-drag-indicator"
                        class="drag-handle shrink-0 cursor-pointer"
                      />
                      <template v-else-if="currentEditedMode === ManageMode.BatchMove">
                        <cy-button-check
                          v-if="batchMoveState.currentStep === BatchMoveStep.Select"
                          :selected="Items.includes(batchMoveState.selectedEquipments, equip)"
                          @click="Items.toggle(batchMoveState.selectedEquipments, equip)"
                        />
                        <IconSelection
                          v-else
                          :selected="batchMoveState.moveTarget === equip"
                          icon="mdi:label"
                          class="mx-2 cursor-pointer"
                          @click="toggleBatchMoveTarget(equip)"
                        />
                      </template>
                      <IconSelection
                        v-else-if="currentEditedMode === ManageMode.Label"
                        :selected="
                          selectedLabel !== null && Items.includes(equip.labels, selectedLabel)
                        "
                        class="mx-2 cursor-pointer"
                        @click="selectedLabel && Items.toggle(equip.labels, selectedLabel)"
                      />
                    </div>
                  </template>
                </CharacterEquipmentItemPlain>
              </template>
            </Draggable>
          </CardRows>
        </CardRowsWrapper>
      </div>
    </div>
  </FloatPage>
</template>
