import { isNumberString } from '@/shared/utils/string'
import { computeFormula } from '@/shared/utils/data'

import { Character } from '@/lib/Character/Character'
import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'
import { EquipmentTypes } from '@/lib/Character/CharacterEquipment/enums'
import { EquipmentFieldTypes } from '@/lib/Character/Character/enums'
import { ResultContainerStat } from '@/lib/Skill/SkillComputingContainer/ResultContainer'

import DisplayDataContainer from '@/views/SkillQuery/skill/branch-handlers/utils/DisplayDataContainer'

import { SkillResultsState } from '.'


export function getSkillStatContainerValid(character: Character | null, resultsState: SkillResultsState, statContainer: ResultContainerStat) {
  if (statContainer.conditionValue) {
    const vars = {
      skillId: resultsState.skill.skillId,
      skillRange: resultsState.basicContainer ? getSkillRange(character, resultsState.basicContainer) : -1,
    }
    return computeFormula(statContainer.conditionValue, vars, true) as boolean
  }
  return true
}

function getSkillRange(character: Character | null, basicContainer: DisplayDataContainer<SkillBranchItem>) {
  const skillRange = basicContainer.getValue('range')
  if (basicContainer.getOrigin('range') === 'main') {
    if (!character) {
      return 0
    }
    const main = character.equipmentField(EquipmentFieldTypes.MainWeapon)
    const weaponRangeAdd = main.equipment?.stats.find(stat => stat.baseName === 'weapon_range')?.value ?? 0
    return getMainWeaponBaseRange(main.equipmentType) + weaponRangeAdd
  } else if (isNumberString(skillRange)) {
    return parseFloat(skillRange)
  }
  return 0
}

function getMainWeaponBaseRange(main: EquipmentTypes): number {
  const mapping: Partial<Record<EquipmentTypes, number>> = {
    [EquipmentTypes.Empty]: 1,
    [EquipmentTypes.OneHandSword]: 2,
    [EquipmentTypes.TwoHandSword]: 3,
    [EquipmentTypes.Staff]: 2,
    [EquipmentTypes.MagicDevice]: 6,
    [EquipmentTypes.Bow]: 10,
    [EquipmentTypes.Bowgun]: 5,
    [EquipmentTypes.Knuckle]: 8,
    [EquipmentTypes.Halberd]: 2,
    [EquipmentTypes.Katana]: 4,
  }
  return mapping[main] ?? 0
}
