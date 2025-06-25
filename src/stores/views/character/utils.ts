import type { CharacterSimulatorSaveData } from '.'

import { Character, EquipmentFieldTypes } from '@/lib/Character/Character'
import { EquipmentTypes } from '@/lib/Character/CharacterEquipment'
import { StatRestriction } from '@/lib/Character/Stat'
import { EnemyElements } from '@/lib/Enemy/Enemy'

export function checkStatRestriction(chara: Character, stat: StatRestriction): boolean {
  if (stat.isPlain()) {
    return true
  }
  const types = stat.restriction!

  const checkMain =
    types.main !== null && chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, types.main)
  const checkMainSub =
    types.main !== null && chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, types.main)
  const checkSub =
    types.sub !== null && chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, types.sub)
  const checkBody =
    types.body !== null && chara.checkFieldEquipmentType(EquipmentFieldTypes.BodyArmor, types.body)

  return !!types.other || checkMain || checkMainSub || checkSub || checkBody
}

export function createElementMap(): Record<EnemyElements, number> {
  return {
    [EnemyElements.Neutral]: 0,
    [EnemyElements.Fire]: 0,
    [EnemyElements.Water]: 0,
    [EnemyElements.Earth]: 0,
    [EnemyElements.Wind]: 0,
    [EnemyElements.Light]: 0,
    [EnemyElements.Dark]: 0,
  }
}

export function getCharacterElement(chara: Character): Record<EnemyElements, number> {
  const element = createElementMap()

  let neutralFlag = true
  const setElement = (stat: StatRestriction) => {
    element[stat.baseId.replace('element_', '') as EnemyElements] = 1
    neutralFlag = false
  }

  const sub = chara.equipmentField(EquipmentFieldTypes.SubWeapon)
  // 主手弓/弩、副手矢時，矢優先於弓
  if (
    (chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.Bow) ||
      chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.Bowgun)) &&
    chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.Arrow) &&
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
    chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.OneHandSword) &&
    sub.equipment!.elementStat
  ) {
    setElement(sub.equipment!.elementStat)
  }

  if (neutralFlag) {
    element.neutral = 1
  }

  return element
}

export function migrateCharacterSimulatorSaveData(datas: CharacterSimulatorSaveData) {
  if (!datas.registletBuilds) {
    datas.registletBuilds = []
  }
  if (!datas.potionBuilds) {
    datas.potionBuilds = []
  }
  if (!datas.characterStates) {
    datas.characterStates = []
  }
  if (!datas.buildLabels) {
    datas.buildLabels = []
  }
}
