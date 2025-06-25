<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { type Ref, computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Draggable from 'vuedraggable'

import { useCharacterStore } from '@/stores/views/character'
import { useCharacterBuildLabelStore } from '@/stores/views/character/setup/setupCharacterBuildLabels'

import { AppColors } from '@/shared/services/Color'

import { CharacterBuildLabel } from '@/lib/Character/Character/CharacterBuildLabel'
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { Items } from '@/lib/common/Items'

import CardRow from '@/components/card/card-row.vue'
import CardRowsWrapper from '@/components/card/card-rows-wrapper.vue'
import CardRows from '@/components/card/card-rows.vue'

import CommonSelectionIcon from '../common/common-selection-icon.vue'

interface Props {
  equipment: CharacterEquipment
}

const props = defineProps<Props>()

const { t } = useI18n()

const buildLabelStore = useCharacterBuildLabelStore()

const { createBuildLabel, removeBuildLabel } = buildLabelStore

const { buildLabels } = storeToRefs(buildLabelStore)

const { equipments } = storeToRefs(useCharacterStore())

const currentEquipmentLabelIds = computed(() => {
  return new Set(props.equipment.labels.map(label => label.id))
})

const currentEditedLabel: Ref<CharacterBuildLabel | null> = ref(null)
const toggleCurrentEditedLabel = (label: CharacterBuildLabel) => {
  if (currentEditedLabel.value === label) {
    currentEditedLabel.value = null
  } else {
    currentEditedLabel.value = label
  }
}

const allColors = [
  AppColors.Red,
  AppColors.Blue,
  AppColors.Cyan,
  AppColors.Emerald,
  AppColors.Fuchsia,
  AppColors.Gray,
  AppColors.Orange,
  AppColors.Violet,
]

const removeLabel = (label: CharacterBuildLabel) => {
  currentEditedLabel.value = null
  removeBuildLabel(label, equipments.value)
}

const closeEditingLabel = () => {
  currentEditedLabel.value = null
}
</script>

<template>
  <div>
    <div class="flex items-center px-1.5 py-2 text-sm text-stone-40">
      {{ t('character-simulator.equipment-basic-editor.equipment-label') }}
      <cy-button-icon
        icon="ic-round-add-circle-outline"
        class="ml-auto"
        @click="createBuildLabel"
      />
    </div>
    <CardRowsWrapper class="max-h-[24rem] overflow-y-auto wd-lg:max-h-none">
      <CardRows v-if="buildLabels.length > 0">
        <Draggable v-model="buildLabels" item-key="id" handle=".drag-handle">
          <template #item="{ element: label }">
            <CardRow>
              <div class="flex items-center px-4 py-2">
                <CommonSelectionIcon
                  :selected="currentEquipmentLabelIds.has(label.id)"
                  class="shrink-0 cursor-pointer"
                  @click="Items.toggle(equipment.labels, label)"
                />
                <div
                  class="mr-2 h-3.5 w-3.5 shrink-0 cursor-pointer rounded-sm"
                  :class="`bg-${label.color}-50`"
                  @click="toggleCurrentEditedLabel(label)"
                />
                <div class="w-full pr-4">
                  <input
                    v-model="label.text"
                    class="w-full border-1 border-transparent bg-transparent px-1 duration-150 focus:border-b-primary-60 focus:text-primary-90"
                    :class="`text-${label.color}-60`"
                  />
                </div>
                <cy-icon
                  icon="ic:baseline-drag-indicator"
                  class="drag-handle shrink-0 cursor-pointer"
                />
              </div>
              <div
                v-if="currentEditedLabel === label"
                class="bg-orange-5/50 mx-1 rounded-md py-2 pl-9 pr-2"
              >
                <cy-tabs v-model="label.color" plain>
                  <cy-tab
                    v-for="color in allColors"
                    :key="color"
                    :value="color"
                    class="flex justify-center p-2"
                    @click="closeEditingLabel"
                  >
                    <div class="h-3.5 w-3.5 shrink-0 rounded-sm" :class="`bg-${color}-50`" />
                  </cy-tab>
                </cy-tabs>
                <div class="mt-3 text-right">
                  <span
                    class="cursor-pointer text-sm text-primary-50 underline"
                    @click="removeLabel(label)"
                  >
                    {{ t('character-simulator.equipment-basic-editor.label-delete') }}
                  </span>
                </div>
              </div>
            </CardRow>
          </template>
        </Draggable>
      </CardRows>
      <div v-else class="px-4 py-4 text-sm text-primary-50">
        {{ t('character-simulator.equipment-basic-editor.label-empty-caption') }}
      </div>
    </CardRowsWrapper>
  </div>
</template>
