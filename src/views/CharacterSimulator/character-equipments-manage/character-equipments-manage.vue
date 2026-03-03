<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { ref, shallowRef } from 'vue'
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

import CharacterEquipmentsLabelSetting from './character-equipments-label-setting.vue'
import CharacterEquipmentItemPlain from './character-equipments-manage-item.vue'

const visible = defineModel<boolean>('visible', { required: true })

const { t } = useI18n()

const { equipments } = storeToRefs(useCharacterStore())
const { buildLabels } = storeToRefs(useCharacterBuildLabelStore())

// Base
const enum ManageMode {
  Common = 'common',
  Label = 'label',
}

const currentEditedMode = ref<ManageMode>(ManageMode.Common)
const selectedEquipment = shallowRef<CharacterEquipment | null>(null)
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
  EquipmentType = 'equipment-type',
  Label = 'label',
  LabelEnd = 'label-end',
}

const currentBatchSortMode = ref<BatchSortMode>(BatchSortMode.EquipmentType)

const EQUIPMENT_TYPE_ORDERS = Array.from(AllEquipmentTypeCategorys.values()).flat()

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

const sortAllEquipmentsByEquipmentType = () => {
  equipments.value = equipments.value.slice().sort(getEquipmentsSortComparation)
}

const sortAllEquipmentsByLabels = (labelEnd = false) => {
  equipments.value = equipments.value.slice().sort((equip1, equip2) => {
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
        <div class="mb-2">
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
        <div class="mb-1">
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
        <div>
          <cy-button-action @click="sortAllEquipments">
            {{ t('global.apply') }}
          </cy-button-action>
        </div>
      </div>
      <CardRowsWrapper
        class="wd:grow wd-lg:h-full wd-lg:ml-auto max-h-full max-w-[45.25rem] overflow-y-auto"
      >
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
                    <cy-button-check
                      v-else
                      :selected="
                        selectedLabel !== null && Items.includes(equip.labels, selectedLabel)
                      "
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
  </FloatPage>
</template>
