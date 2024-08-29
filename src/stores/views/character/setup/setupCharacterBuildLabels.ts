import { defineStore } from 'pinia'
import { type ShallowReactive, ref } from 'vue'

import {
  CharacterBuildLabel,
  type CharacterBuildLabelSaveData,
} from '@/lib/Character/Character/CharacterBuildLabel'
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { Items } from '@/lib/common/Items'

export const useCharacterBuildLabelStore = defineStore(
  'view-character-build-label',
  () => {
    const labels = ref([] as ShallowReactive<CharacterBuildLabel>[])

    const createBuildLabel = () => {
      const newLabel = CharacterBuildLabel.reactivity('0.0')
      labels.value.unshift(newLabel)
      return newLabel
    }

    const loadBuildLabel = (
      loadedCategory: string,
      data: CharacterBuildLabelSaveData
    ) => {
      const newLabel = CharacterBuildLabel.fromLoad(
        loadedCategory,
        data
      ).toReactive()
      labels.value.push(newLabel)
    }

    const removeBuildLabel = (
      target: number | CharacterBuildLabel,
      relatedEquipments: CharacterEquipment[]
    ) => {
      Items.remove(labels.value, target)
      relatedEquipments.forEach(equip => Items.remove(equip.labels, target))
    }

    const resetBuildLabelStore = () => {
      labels.value = []
    }

    return {
      buildLabels: labels,

      loadBuildLabel,
      createBuildLabel,
      removeBuildLabel,
      resetBuildLabelStore,
    }
  }
)
