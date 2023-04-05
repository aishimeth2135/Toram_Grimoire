import { Character } from '@/lib/Character/Character'
import { EquipmentFieldTypes } from '@/lib/Character/Character/enums'
import { EquipmentTypes } from '@/lib/Character/CharacterEquipment/enums'
import { StatRestriction } from '@/lib/Character/Stat'
import { EnemyElements } from '@/lib/Enemy/enums'

export function checkStatRestriction(
  chara: Character,
  stat: StatRestriction
): boolean {
  if (stat.isEmpty()) {
    return true
  }
  const types = stat.restriction!

  const checkMain =
    types.main !== null &&
    chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, types.main)
  const checkMainSub =
    types.main !== null &&
    chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, types.main)
  const checkSub =
    types.sub !== null &&
    chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, types.sub)
  const checkBody =
    types.body !== null &&
    chara.checkFieldEquipmentType(EquipmentFieldTypes.BodyArmor, types.body)

  return !!types.other || checkMain || checkMainSub || checkSub || checkBody
}

export function getCharacterElement(
  chara: Character
): Record<EnemyElements, number> {
  const element: Record<EnemyElements, number> = {
    neutral: 0,
    fire: 0,
    water: 0,
    earth: 0,
    wind: 0,
    light: 0,
    dark: 0,
  }

  let neutralFlag = true
  const setElement = (stat: StatRestriction) => {
    element[stat.baseId.replace('element_', '') as EnemyElements] = 1
    neutralFlag = false
  }

  const sub = chara.equipmentField(EquipmentFieldTypes.SubWeapon)
  // 主手弓/弩、副手矢時，矢優先於弓
  if (
    (chara.checkFieldEquipmentType(
      EquipmentFieldTypes.MainWeapon,
      EquipmentTypes.Bow
    ) ||
      chara.checkFieldEquipmentType(
        EquipmentFieldTypes.MainWeapon,
        EquipmentTypes.Bowgun
      )) &&
    chara.checkFieldEquipmentType(
      EquipmentFieldTypes.SubWeapon,
      EquipmentTypes.Arrow
    ) &&
    sub.equipment!.elementStat
  ) {
    setElement(sub.equipment!.elementStat)
    return element
  }

  // 主手
  const main = chara.equipmentField(EquipmentFieldTypes.MainWeapon)
  if (!main.isEmpty && main.equipment!.elementStat) {
    setElement(main.equipment!.elementStat)
  }

  // 雙劍副手：雙重屬性
  if (
    chara.checkFieldEquipmentType(
      EquipmentFieldTypes.SubWeapon,
      EquipmentTypes.OneHandSword
    ) &&
    sub.equipment!.elementStat
  ) {
    setElement(sub.equipment!.elementStat)
  }

  if (neutralFlag) {
    element.neutral = 1
  }

  return element
}
