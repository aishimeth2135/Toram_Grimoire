import { storeToRefs } from 'pinia'
import { type Ref, computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'
import { useCharacterBuildLabelStore } from '@/stores/views/character/setup/setupCharacterBuildLabels'

import { useNotify } from '@/shared/composables/Notify'
import { defineViewState, useToggleList } from '@/shared/composables/State'
import { ViewNames } from '@/shared/consts/view'

import { EquipmentFieldTypes } from '@/lib/Character/Character'
import { CharacterBuildLabel } from '@/lib/Character/Character/CharacterBuildLabel'
import {
  CharacterEquipment,
  EquipmentCrystal,
  EquipmentTypes,
  MainWeaponTypeList,
  SubArmorTypeList,
  SubWeaponTypeList,
} from '@/lib/Character/CharacterEquipment'

export const useEquipmentsDisplayedItems = defineViewState(ViewNames.CharacterSimulator, () => {
  const displayedItems = new Map<string, EquipmentTypes[]>([
    ['main', MainWeaponTypeList],
    ['sub', [...SubWeaponTypeList, ...SubArmorTypeList]],
    ['body', [EquipmentTypes.BodyNormal, EquipmentTypes.BodyDodge, EquipmentTypes.BodyDefense]],
    ['other', [EquipmentTypes.Additional, EquipmentTypes.Special, EquipmentTypes.Avatar]],
  ])

  return { displayedItems }
})

export function getCrystalClasses(crystal: EquipmentCrystal | undefined) {
  if (!crystal) {
    return null
  }

  let backgroundClass: string
  switch (crystal.origin.category) {
    case 0:
      backgroundClass = 'bg-red-40'
      break
    case 1:
      backgroundClass = 'bg-emerald-40'
      break
    case 2:
      backgroundClass = 'bg-orange-40'
      break
    case 3:
      backgroundClass = 'bg-fuchsia-40'
      break
    default:
      backgroundClass = 'bg-blue-40'
  }

  return crystal.origin.enhancer ? [backgroundClass, 'item-enhancer'] : [backgroundClass]
}

export function getEquipmentFieldFilterOptions() {
  return new Map<EquipmentFieldTypes, EquipmentTypes[]>([
    [EquipmentFieldTypes.MainWeapon, MainWeaponTypeList],
    [
      EquipmentFieldTypes.SubWeapon,
      [
        ...SubWeaponTypeList,
        ...SubArmorTypeList,
        EquipmentTypes.OneHandSword,
        EquipmentTypes.MagicDevice,
        EquipmentTypes.Knuckle,
        EquipmentTypes.Katana,
      ],
    ],
    [
      EquipmentFieldTypes.BodyArmor,
      [EquipmentTypes.BodyNormal, EquipmentTypes.BodyDodge, EquipmentTypes.BodyDefense],
    ],
    [EquipmentFieldTypes.Additional, [EquipmentTypes.Additional]],
    [EquipmentFieldTypes.Special, [EquipmentTypes.Special]],
    [EquipmentFieldTypes.Avatar, [EquipmentTypes.Avatar]],
  ])
}

export function setupEquipmentLabelFilter() {
  const { buildLabels } = useCharacterBuildLabelStore()

  const selectedLabels = ref([] as CharacterBuildLabel[])

  const { itemSelected: labelSelected, toggleItem: toggleLabel } = useToggleList(selectedLabels)

  return {
    labelOptions: buildLabels,
    selectedLabels,
    labelSelected,
    toggleLabel,
  }
}

export function useEquipmentsForSearch() {
  const characterStore = useCharacterStore()

  const equipmentSearchListMap = computed(() => {
    const searchListMap = new Map<number, string[]>()
    characterStore.equipments.forEach(eq => {
      const searchList: string[] = [eq.name]
      searchList.push(...eq.stats.map(stat => stat.title))
      searchList.push(...eq.crystals.map(crystal => crystal.name))
      searchListMap.set(eq.instanceId, searchList)
    })
    return searchListMap
  })

  const getEquipmentSearchList = (equipment: CharacterEquipment): string[] => {
    return equipmentSearchListMap.value.get(equipment.id)!
  }

  const allEquipments = computed(() => characterStore.equipments)

  return { allEquipments, getEquipmentSearchList }
}

export const useEquipmentActions = (equipment: Ref<CharacterEquipment | null>) => {
  const characterStore = useCharacterStore()
  const { equipments } = storeToRefs(characterStore)
  const notify = useNotify()
  const { t } = useI18n()

  const copyEquipment = () => {
    if (!equipment.value) {
      return
    }

    const newEquip = equipment.value.clone()
    newEquip.name = equipment.value.name + ' *'
    const appendedEquipment = characterStore.appendEquipment(
      newEquip,
      equipments.value.indexOf(equipment.value) + 1
    )

    if (!appendedEquipment) {
      return
    }

    notify(t('character-simulator.browse-equipments.copy-equipment-tips'), {
      icon: 'bx:copy-alt',
      id: 'copy-equipment-tips',
    })

    equipment.value = appendedEquipment
  }

  const removeEquipment = () => {
    if (!equipment.value) {
      return
    }

    const eq = equipment.value
    const newIdx = characterStore.removeEquipment(eq)
    equipment.value = equipments.value[newIdx] ?? null

    notify.undo(
      t('character-simulator.browse-equipments.remove-equipment-tips', {
        name: eq.name,
      }),
      {
        icon: 'ic-baseline-delete-outline',
        label: t('global.recovery'),
        onUndo: () => {
          const restoredEquipment = characterStore.appendEquipment(eq)
          if (!restoredEquipment) {
            return false
          }
          equipment.value = restoredEquipment
          notify(
            t('character-simulator.browse-equipments.removed-equipment-restore-tips', {
              name: eq.name,
            })
          )
        },
      }
    )
  }

  return { copyEquipment, removeEquipment }
}
