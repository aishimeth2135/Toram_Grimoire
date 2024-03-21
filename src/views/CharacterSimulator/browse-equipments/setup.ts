import { Ref, computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'
import { useCharacterBuildLabelStore } from '@/stores/views/character/setup/setupCharacterBuildLabels'

import { ViewNames } from '@/shared/consts/view'
import Notify from '@/shared/setup/Notify'
import { defineViewState, useToggleList } from '@/shared/setup/State'

import { EquipmentFieldTypes } from '@/lib/Character/Character'
import { CharacterBuildLabel } from '@/lib/Character/Character/CharacterBuildLabel'
import {
  CharacterEquipment,
  EquipmentTypes,
  MainWeaponTypeList,
  SubArmorTypeList,
  SubWeaponTypeList,
} from '@/lib/Character/CharacterEquipment'
import { BagCrystal } from '@/lib/Items/BagItem'

import { setupCharacterStore } from '../setup'

export const useEquipmentsDisplayedItems = defineViewState(
  ViewNames.CharacterSimulator,
  () => {
    const displayedItems = new Map([
      ['main', MainWeaponTypeList],
      ['sub', [...SubWeaponTypeList, ...SubArmorTypeList]],
      [
        'body',
        [
          EquipmentTypes.BodyNormal,
          EquipmentTypes.BodyDodge,
          EquipmentTypes.BodyDefense,
        ],
      ],
      [
        'other',
        [
          EquipmentTypes.Additional,
          EquipmentTypes.Special,
          EquipmentTypes.Avatar,
        ],
      ],
    ])

    return { displayedItems }
  }
)

export function getCrystalPureColor(crystal: BagCrystal) {
  switch (crystal.category) {
    case 0:
      return 'red'
    case 1:
      return 'emerald'
    case 2:
      return 'orange'
    case 3:
      return 'fuchsia'
    default:
      return 'blue'
  }
}

export function getEquipmentFieldFilterOptions() {
  return new Map([
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
      [
        EquipmentTypes.BodyNormal,
        EquipmentTypes.BodyDodge,
        EquipmentTypes.BodyDefense,
      ],
    ],
    [EquipmentFieldTypes.Additional, [EquipmentTypes.Additional]],
    [EquipmentFieldTypes.Special, [EquipmentTypes.Special]],
    [EquipmentFieldTypes.Avatar, [EquipmentTypes.Avatar]],
  ])
}

export function setupEquipmentLabelFilter() {
  const { buildLabels } = useCharacterBuildLabelStore()

  const selectedLabels = ref([] as CharacterBuildLabel[])

  const { itemSelected: labelSelected, toggleItem: toggleLabel } =
    useToggleList(selectedLabels)

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
    ;(characterStore.equipments as CharacterEquipment[]).forEach(eq => {
      const searchList: string[] = [eq.name]
      searchList.push(...eq.stats.map(stat => stat.title))
      searchList.push(...eq.crystals.map(crystal => crystal.name))
      searchListMap.set(eq.instanceId, searchList)
    })
    return searchListMap
  })

  const getEquipmentSearchList = (equipment: CharacterEquipment) => {
    return equipmentSearchListMap.value.get(equipment.id)!
  }

  const allEquipments = computed(
    () => characterStore.equipments as CharacterEquipment[]
  )

  return { allEquipments, getEquipmentSearchList }
}

export const useEquipmentActions = (
  equipment: Ref<CharacterEquipment | null>
) => {
  const { store, equipments } = setupCharacterStore()
  const { notify } = Notify()
  const { t } = useI18n()

  const copyEquipment = () => {
    if (!equipment.value) {
      return
    }

    const newEquip = equipment.value.clone()
    newEquip.name = equipment.value.name + ' *'
    const appendedEquipment = store.appendEquipment(
      newEquip,
      equipments.value.indexOf(equipment.value) + 1
    )

    notify(
      t('character-simulator.browse-equipments.copy-equipment-tips'),
      'bx:copy-alt',
      'copy-equipment-tips'
    )

    equipment.value = appendedEquipment
  }

  const removeEquipment = () => {
    if (!equipment.value) {
      return
    }

    const eq = equipment.value
    const newIdx = store.removeEquipment(eq)
    equipment.value = equipments.value[newIdx] ?? null

    notify(
      t('character-simulator.browse-equipments.remove-equipment-tips', {
        name: eq.name,
      }),
      'ic-baseline-delete-outline',
      null,
      {
        buttons: [
          {
            text: t('global.recovery'),
            click: () => {
              equipment.value = store.appendEquipment(eq)
              notify(
                t(
                  'character-simulator.browse-equipments.removed-equipment-restore-tips',
                  { name: eq.name }
                )
              )
            },
            removeMessageAfterClick: true,
          },
        ],
      }
    )
  }

  return { copyEquipment, removeEquipment }
}
