import { type Ref, computed } from 'vue'

import Grimoire from '@/shared/Grimoire'
import { isNumberString } from '@/shared/utils/string'

import { Character, EquipmentFieldTypes } from '@/lib/Character/Character'
import { EquipmentTypes } from '@/lib/Character/CharacterEquipment'
import type { SkillBuild } from '@/lib/Character/SkillBuild'
import { StatRecorded, StatRestriction } from '@/lib/Character/Stat'
import {
  type CalcResultOptions,
  CalculationContainerIds,
  type CalculationContainerSnapshot,
  CalculationItemIds,
  type CalculationSnapshot,
  type CalculationSweepDimension,
  ContainerTypes,
  evaluateCalculationExpectedValueZipSweep,
} from '@/lib/Damage/DamageCalculation'
import { EnemyElements } from '@/lib/Enemy/Enemy'
import { parseSkillSelfBuffs } from '@/lib/Skill/Properties'
import { Skill, SkillBranchNames } from '@/lib/Skill/Skill'
import { SkillBranchItem, SkillBuffs, getDamageSource } from '@/lib/Skill/SkillComputing'

import { setupCalculationSnapshotExpectedResult } from '../../damage-calculation/setup'
import { createElementMap, getCharacterElement } from '../utils'
import { type SetupCharacterStatCategoryResultsExtended } from './setupCharacter'
import { type SkillResult } from './setupCharacterSkills'

export interface TargetProperties {
  physicalResistance: number
  magicResistance: number
  def: number
  mdef: number
  level: number
  criticalRateResistance: number
  criticalRateResistanceTotal: number
  dodge: number
  element: null | EnemyElements
  rangeDamage: CalculationItemIds
}

export interface CalculationOptions {
  proration: number
  comboRate: number
  forceCritical: boolean
}

const promisedAccuracyRateMapping: Partial<Record<EquipmentTypes, number>> = {
  [EquipmentTypes.Empty]: 50,
  [EquipmentTypes.OneHandSword]: 25,
  [EquipmentTypes.TwoHandSword]: 15,
  [EquipmentTypes.Staff]: 30,
  [EquipmentTypes.MagicDevice]: 10,
  [EquipmentTypes.Bow]: 10,
  [EquipmentTypes.Bowgun]: 5,
  [EquipmentTypes.Knuckle]: 10,
  [EquipmentTypes.Halberd]: 20,
  [EquipmentTypes.Katana]: 30,
}
const elementsMap: Record<EnemyElements, CalculationItemIds> = {
  [EnemyElements.Neutral]: CalculationItemIds.StrongerAgainstNeutral,
  [EnemyElements.Fire]: CalculationItemIds.StrongerAgainstFire,
  [EnemyElements.Water]: CalculationItemIds.StrongerAgainstWater,
  [EnemyElements.Wind]: CalculationItemIds.StrongerAgainstWind,
  [EnemyElements.Earth]: CalculationItemIds.StrongerAgainstEarth,
  [EnemyElements.Light]: CalculationItemIds.StrongerAgainstLight,
  [EnemyElements.Dark]: CalculationItemIds.StrongerAgainstDark,
}

const againstElementMap: Record<EnemyElements, EnemyElements> = {
  [EnemyElements.Neutral]: EnemyElements.Neutral,
  [EnemyElements.Fire]: EnemyElements.Earth,
  [EnemyElements.Water]: EnemyElements.Fire,
  [EnemyElements.Wind]: EnemyElements.Water,
  [EnemyElements.Earth]: EnemyElements.Wind,
  [EnemyElements.Light]: EnemyElements.Dark,
  [EnemyElements.Dark]: EnemyElements.Light,
}

export function setupDamageCalculation(
  character: Ref<Character | null>,
  setupCharacterStatCategoryResultsExtended: SetupCharacterStatCategoryResultsExtended,
  getSkillLevel: (skill: Skill) => { valid: boolean; level: number },
  skillBuild: Ref<SkillBuild | null>,
  availableBuffResults: Ref<SkillResult[]>
) {
  const calculationBase = Grimoire.DamageCalculation.calculationBase

  const skillTwoHanded = Grimoire.Skill.skillRoot.findSkillById('0-6-11')!

  const promisedAccuracyRate = computed(() => {
    if (!character.value) {
      return 0
    }
    const mainType = character.value.equipmentField(EquipmentFieldTypes.MainWeapon).equipmentType
    return promisedAccuracyRateMapping[mainType] ?? 0
  })

  interface SkillProperties {
    skillRealMpCost: number
    skillConstant: number
    skillMultiplier: number
  }

  const getSkillElement = (branchItem: SkillBranchItem) => {
    const chara = character.value
    if (!chara) {
      return null
    }
    const element = createElementMap()
    const setElement = (stat: StatRestriction) =>
      (element[stat.baseId.replace('element_', '') as EnemyElements] = 1)

    const skillElement = branchItem.prop('element')
    let skillDualElement = branchItem.prop('dual_element')
    if (skillDualElement === 'none') {
      const extraBch = branchItem.suffixBranches.find(suf => {
        if (!(skillBuild.value?.getSkillBranchState(suf).enabled ?? true)) {
          return false
        }
        return suf.isA(SkillBranchNames.Extra) && suf.hasProp('dual_element')
      })
      if (extraBch) {
        skillDualElement = extraBch.prop('dual_element')
      }
    }

    const sub = chara.equipmentField(EquipmentFieldTypes.SubWeapon)

    if (skillElement === 'against') {
      element[EnemyElements.Fire] = 1
      element[EnemyElements.Water] = 1
      element[EnemyElements.Earth] = 1
      element[EnemyElements.Wind] = 1
      element[EnemyElements.Light] = 1
      element[EnemyElements.Dark] = 1
      return element
    }
    if (skillElement !== 'none') {
      if (isValidElement(skillElement)) {
        element[skillElement] = 1
      }
      if (skillDualElement !== 'none') {
        if (sub.equipment?.elementStat) {
          let subType: EquipmentTypes | undefined
          switch (skillDualElement) {
            case 'arrow':
              subType = EquipmentTypes.Arrow
              break
            case 'one_hand_sword':
              subType = EquipmentTypes.OneHandSword
              break
            case 'magic_device':
              subType = EquipmentTypes.MagicDevice
          }
          if (subType) {
            const checkSub = chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, subType)
            if (checkSub) {
              setElement(sub.equipment.elementStat)
            }
          }
        }
      }
      return element
    }
    return null
  }

  const setupDamageCalculationExpectedResult = (
    skillResult: Ref<SkillResult>,
    extraStats: Ref<StatRecorded[]>,
    targetProperties: Ref<TargetProperties>,
    calculationOptions: Ref<CalculationOptions>
  ) => {
    const selectedBuffResults = computed<SkillResult[]>(() => {
      if (getDamageSource(skillResult.value.container.branchItem)) {
        return []
      }

      const selectedIds =
        skillBuild.value?.getSkillBranchState(skillResult.value.container.branchItem)
          .selectedBuffIds ?? []
      return availableBuffResults.value.filter(result =>
        selectedIds.includes(result.container.branchItem.defaultBranchId)
      )
    })

    const selectedStats = computed<StatRecorded[]>(() => {
      const stats = [...extraStats.value]
      selectedBuffResults.value.forEach(result => {
        const containers = [
          result.container,
          ...result.suffixContainers.filter(
            suffix => skillBuild.value?.getSkillBranchState(suffix.branchItem).enabled
          ),
        ]
        containers.forEach(container =>
          container.statContainers.forEach(statContainer => {
            if (isNumberString(statContainer.value)) {
              stats.push(statContainer.toStatRecorded(parseFloat(statContainer.value)))
            }
          })
        )
      })
      return stats
    })
    const { categoryResults, characterPureStats } = setupCharacterStatCategoryResultsExtended(
      selectedStats,
      skillResult
    )

    const container = computed(() => skillResult.value.container)
    const expectedResultOptions = computed<CalcResultOptions>(() => {
      const selfBuffs = skillResult.value.suffixContainers
        .filter(suffix => skillBuild.value?.getSkillBranchState(suffix.branchItem).enabled)
        .flatMap(suffix => parseSkillSelfBuffs(suffix.branchItem.prop('self_buffs')))
      const guaranteedCritical =
        selfBuffs.includes('guaranteed_critical') ||
        selectedBuffResults.value.some(result =>
          result.container.branchItem.buffs?.has(SkillBuffs.GuaranteedCritical)
        )

      return {
        containerResults: {
          ...(guaranteedCritical && {
            [CalculationContainerIds.CriticalRate]: 100,
          }),
          ...(selfBuffs.includes('guaranteed_hit') && { [CalculationContainerIds.Accuracy]: 100 }),
        },
      }
    })

    const statResults = computed(() => {
      return categoryResults.value.map(category => category.stats).flat()
    })

    const statValue = (baseId: string) =>
      characterPureStats.value.find(stat => stat.baseId === baseId)?.value ?? 0
    const targetDefMultiplier = computed(() => (100 - statValue('def_ignore')) / 100)
    const resultValue = (id: string) => {
      let idToSearch = id
      if (container.value.branchItem) {
        const damageStatSuf = container.value.branchItem.suffixBranches.find(suf => {
          if (!suf.isA(SkillBranchNames.DamageStat)) {
            return false
          }
          return suf.hasProp('id') && suf.prop('id') === id
        })
        if (damageStatSuf?.hasProp('override_id')) {
          idToSearch = damageStatSuf.prop('override_id')
        }
      }
      return statResults.value.find(result => result.id === idToSearch)?.resultValue ?? 0
    }

    const checkMagicWeapon = () => {
      if (!character.value) {
        return false
      }
      const isMainStaff = character.value.checkFieldEquipmentType(
        EquipmentFieldTypes.MainWeapon,
        EquipmentTypes.Staff
      )
      const isMainMagicDevice = character.value.checkFieldEquipmentType(
        EquipmentFieldTypes.MainWeapon,
        EquipmentTypes.MagicDevice
      )
      return isMainStaff || isMainMagicDevice
    }

    const currentCharacterElement = computed(() =>
      character.value ? getCharacterElement(character.value) : null
    )
    const skillElementExtra = computed(() => {
      const elementsRate = createElementMap()
      if (!currentCharacterElement.value) {
        return elementsRate
      }
      const skillElement = getSkillElement(container.value.branchItem)
      const isMagicWeapon = checkMagicWeapon()

      let magicExtra = 0
      if (container.value.getOrigin('damage_type') === 'magic') {
        magicExtra = isMagicWeapon
          ? resultValue('magic_element_extra_damage')
          : resultValue('magic_element_against_damage')
      }

      const calcElement = skillElement ?? currentCharacterElement.value
      const calcElementKeys = Object.keys(calcElement) as EnemyElements[]
      const isNotNeutral = calcElementKeys.some(key => {
        if (key === EnemyElements.Neutral) {
          return
        }
        return calcElement[key] === 1
      })

      if (isNotNeutral) {
        calcElementKeys.forEach(key => {
          if (isMagicWeapon) {
            elementsRate[key] = magicExtra
          }
          if (key === EnemyElements.Neutral) {
            return
          }
          const againstKey = againstElementMap[key]
          if (calcElement[key] === 1) {
            elementsRate[againstKey] += 25
            if (!isMagicWeapon) {
              elementsRate[againstKey] += magicExtra
            }
          }
        })
      }

      return elementsRate
    })

    const calculationVars = computed(() => {
      if (!character.value) {
        return new Map<CalculationItemIds, number>()
      }

      let extraMagicCriticalRateConvertionRate = 0
      if (checkMagicWeapon()) {
        const skillElement = getSkillElement(container.value.branchItem)
        if (skillElement?.neutral === 1 || currentCharacterElement.value?.neutral === 1) {
          extraMagicCriticalRateConvertionRate = 25
        }
      }

      const getElementExtra = (element: EnemyElements) => {
        return statValue(`stronger_against_${element}`) + skillElementExtra.value[element]
      }

      return new Map<CalculationItemIds, number>([
        [CalculationItemIds.Atk, resultValue('atk')],
        [CalculationItemIds.Matk, resultValue('matk')],
        [CalculationItemIds.SubAtk, resultValue('sub_atk')],
        [CalculationItemIds.SubStability, resultValue('sub_stability')],
        [CalculationItemIds.PhysicalPierce, resultValue('physical_pierce')],
        [CalculationItemIds.MagicPierce, resultValue('magic_pierce')],
        [CalculationItemIds.UnsheatheAttackConstant, resultValue('unsheathe_attack')],
        [CalculationItemIds.UnsheatheAttackMultiplier, resultValue('unsheathe_attack_multiplier')],
        [CalculationItemIds.CriticalDamage, resultValue('critical_damage')],
        [
          CalculationItemIds.MagicCriticalDamageConversionRate,
          50 + statValue('magic_cd_percentage'),
        ],
        [CalculationItemIds.CriticalRate, resultValue('critical_rate')],
        [
          CalculationItemIds.MagicCriticalRateConversionRate,
          statValue('magic_crt_percentage') + extraMagicCriticalRateConvertionRate,
        ],
        [CalculationItemIds.ShortRangeDamage, resultValue('short_range_damage')],
        [CalculationItemIds.LongRangeDamage, resultValue('long_range_damage')],
        [CalculationItemIds.Stability, resultValue('stability')],
        [CalculationItemIds.Accuracy, resultValue('accuracy')],
        [CalculationItemIds.PromisedAccuracyRate, promisedAccuracyRate.value],
        [CalculationItemIds.StrongerAgainstNeutral, 100 + getElementExtra(EnemyElements.Neutral)],
        [CalculationItemIds.StrongerAgainstFire, 100 + getElementExtra(EnemyElements.Fire)],
        [CalculationItemIds.StrongerAgainstWater, 100 + getElementExtra(EnemyElements.Water)],
        [CalculationItemIds.StrongerAgainstEarth, 100 + getElementExtra(EnemyElements.Earth)],
        [CalculationItemIds.StrongerAgainstWind, 100 + getElementExtra(EnemyElements.Wind)],
        [CalculationItemIds.StrongerAgainstLight, 100 + getElementExtra(EnemyElements.Light)],
        [CalculationItemIds.StrongerAgainstDark, 100 + getElementExtra(EnemyElements.Dark)],

        [CalculationItemIds.CharacterLevel, character.value.level],
        [CalculationItemIds.SkillLevelTwoHanded, getSkillLevel(skillTwoHanded).level],
        [
          CalculationItemIds.OtherMultiplier,
          ((100 + statValue('total_damage_A')) * (100 + statValue('total_damage_B'))) / 100,
        ],

        // [CalculationItemIds.SkillRealMpCost, 0],
      ])
    })

    const valid = computed(() => {
      const constant = container.value.getValue('constant') || '0'
      const multiplier = container.value.getValue('multiplier') || '0'
      return isNumberString(constant) && isNumberString(multiplier)
    })

    const skillProperties = computed<SkillProperties>(() => {
      if (!valid.value) {
        return {
          skillRealMpCost: 0,
          skillConstant: 0,
          skillMultiplier: 0,
        }
      }
      const constant = container.value.getValueSum('constant')
      const multiplier = container.value.getValueSum('multiplier')
      return {
        skillRealMpCost: 0,
        skillConstant: constant,
        skillMultiplier: multiplier,
      }
    })

    const baseSuffixBranch = computed(() =>
      container.value.branchItem.suffixBranches.find(suf => suf.isA(SkillBranchNames.Base))
    )

    const varsMap = computed(() => {
      let atkRate = 100
      let matkRate = 100
      const baseBranch = baseSuffixBranch.value
      if (baseBranch) {
        if (baseBranch.hasProp('atk_rate')) {
          atkRate = baseBranch.propNumber('atk_rate')
        }
        if (baseBranch.hasProp('matk_rate')) {
          matkRate = baseBranch.propNumber('matk_rate')
        }
      }

      return new Map<CalculationItemIds, number>([
        [CalculationItemIds.AtkRate, atkRate],
        [CalculationItemIds.MatkRate, matkRate],

        [CalculationItemIds.SkillRealMpCost, skillProperties.value.skillRealMpCost],
        [
          CalculationItemIds.SkillConstant,
          skillProperties.value.skillConstant + statValue('skill_constant_extra'),
        ],
        [
          CalculationItemIds.SkillMultiplier,
          ((skillProperties.value.skillMultiplier + statValue('skill_multiplier_extra')) *
            (100 + statValue('total_skill_multiplier'))) /
            100,
        ],

        [CalculationItemIds.TargetPhysicalResistance, targetProperties.value.physicalResistance],
        [CalculationItemIds.TargetMagicResistance, targetProperties.value.magicResistance],
        [CalculationItemIds.TargetLevel, targetProperties.value.level],
        [CalculationItemIds.TargetDef, targetProperties.value.def * targetDefMultiplier.value],
        [CalculationItemIds.TargetMdef, targetProperties.value.mdef * targetDefMultiplier.value],
        [
          CalculationItemIds.TargetCriticalRateResistance,
          targetProperties.value.criticalRateResistance,
        ],
        [
          CalculationItemIds.TargetCriticalRateResistanceTotal,
          targetProperties.value.criticalRateResistanceTotal,
        ],
        [CalculationItemIds.TargetDodge, targetProperties.value.dodge],

        [CalculationItemIds.Proration, calculationOptions.value.proration],
        [CalculationItemIds.ComboMultiplier, calculationOptions.value.comboRate],
      ])
    })

    const containerCurrentItemMap = computed(() => {
      let damageType: CalculationItemIds = CalculationItemIds.Physical
      let targetDefType: CalculationItemIds = CalculationItemIds.TargetDef
      let targetResistanceType: CalculationItemIds = CalculationItemIds.TargetPhysicalResistance

      if (container.value.getOrigin('damage_type') === 'magic') {
        damageType = CalculationItemIds.Magic
        targetDefType = CalculationItemIds.TargetMdef
        targetResistanceType = CalculationItemIds.TargetMagicResistance
      }

      const baseBranch = baseSuffixBranch.value
      if (baseBranch) {
        if (baseBranch.hasProp('target_def_type')) {
          if (baseBranch.prop('target_def_type') === 'def') {
            targetDefType = CalculationItemIds.TargetDef
          } else if (baseBranch.prop('target_def_type') === 'mdef') {
            targetDefType = CalculationItemIds.TargetMdef
          }
        }
        if (baseBranch.hasProp('target_resistance_type')) {
          if (baseBranch.prop('target_resistance_type') === 'physical') {
            targetResistanceType = CalculationItemIds.TargetPhysicalResistance
          } else if (baseBranch.prop('target_resistance_type') === 'magic') {
            targetResistanceType = CalculationItemIds.TargetMagicResistance
          }
        }
      }

      let rangeDamage = targetProperties.value.rangeDamage
      if (container.value.getOrigin('range_damage') === 'short') {
        rangeDamage = CalculationItemIds.ShortRangeDamage
      } else if (container.value.getOrigin('range_damage') === 'long') {
        rangeDamage = CalculationItemIds.LongRangeDamage
      }
      if (container.value.getOrigin('range_damage') === 'both') {
        rangeDamage =
          resultValue('short_range_damage') >= resultValue('long_range_damage')
            ? CalculationItemIds.ShortRangeDamage
            : CalculationItemIds.LongRangeDamage
      }

      const resultMap = new Map<CalculationContainerIds, CalculationItemIds>([
        [CalculationContainerIds.DamageType, damageType],
        [CalculationContainerIds.TargetDefBase, targetDefType],
        [CalculationContainerIds.TargetResistance, targetResistanceType],
        [
          CalculationContainerIds.Pierce,
          targetDefType === CalculationItemIds.TargetDef
            ? CalculationItemIds.PhysicalPierce
            : CalculationItemIds.MagicPierce,
        ],
        [CalculationContainerIds.RangeDamage, rangeDamage],
      ])
      if (targetProperties.value.element !== null) {
        resultMap.set(
          CalculationContainerIds.StrongerAgainstElement,
          elementsMap[targetProperties.value.element]
        )
      }
      return resultMap
    })

    const containerForceHiddenMap = computed(() => {
      const unsheatheDamageHidden = !container.value.branchItem.propBoolean('unsheathe_damage')
      const baseNone = container.value.branchItem.prop('base') === 'none'
      const baseOrigin = container.value.getOrigin('base')

      const mainType = character.value?.equipmentField(EquipmentFieldTypes.MainWeapon).equipmentType

      return new Map<CalculationContainerIds, boolean>([
        [CalculationContainerIds.BaseAtk, baseNone || baseOrigin === 'matk'],
        [
          CalculationContainerIds.BaseMatk,
          baseNone || baseOrigin === 'atk' || baseSuffixBranch.value?.prop('type') === 'dual_sword',
        ],
        [
          CalculationContainerIds.BaseDualSword,
          !character.value ||
            baseSuffixBranch.value?.prop('type') !== 'dual_sword' ||
            !character.value.checkFieldEquipmentType(
              EquipmentFieldTypes.MainWeapon,
              EquipmentTypes.OneHandSword
            ) ||
            !character.value.checkFieldEquipmentType(
              EquipmentFieldTypes.SubWeapon,
              EquipmentTypes.OneHandSword
            ),
        ],
        [CalculationContainerIds.CriticalRate, calculationOptions.value.forceCritical],
        [CalculationContainerIds.StrongerAgainstElement, targetProperties.value.element === null],
        [CalculationContainerIds.UnsheatheAttackConstant, unsheatheDamageHidden],
        [CalculationContainerIds.UnsheatheAttackMultiplier, unsheatheDamageHidden],
        [CalculationContainerIds.RangeDamage, container.value.getOrigin('range_damage') === '0'],
        [
          CalculationContainerIds.BaseTwoHanded,
          !getSkillLevel(skillTwoHanded).valid || mainType !== EquipmentTypes.Katana,
        ],

        [
          CalculationContainerIds.ComboMultiplier,
          !container.value.branchItem.propBoolean('combo_rate'),
        ],
      ])
    })

    const calculationSnapshot = computed<CalculationSnapshot>(() => {
      const itemValues = new Map<CalculationItemIds, number>()
      calculationBase.items.forEach((item, itemId) => itemValues.set(itemId, item.defaultValue))
      varsMap.value.forEach((value, itemId) => itemValues.set(itemId, value))
      calculationVars.value.forEach((value, itemId) => itemValues.set(itemId, value))

      const containers = new Map<CalculationContainerIds, CalculationContainerSnapshot>()
      calculationBase.containers.forEach((containerBase, containerId) => {
        const firstItemId = containerBase.items.keys().next().value ?? null
        containers.set(containerId, {
          enabled: true,
          applicable: !(containerForceHiddenMap.value.get(containerId) ?? false),
          currentItemId: containerCurrentItemMap.value.get(containerId) ?? firstItemId,
          customItemValues: [],
        })
      })

      return { itemValues, containers }
    })

    const calculationItems = computed(() => {
      const snapshot = calculationSnapshot.value
      return Array.from(calculationBase.containers, ([containerId, containerBase]) => {
        const containerSnapshot = snapshot.containers.get(containerId)!
        const itemIds =
          containerBase.type === ContainerTypes.Options
            ? [containerSnapshot.currentItemId]
            : Array.from(containerBase.items.keys())
        return itemIds.flatMap(itemId => {
          if (itemId === null) {
            return []
          }
          const item = calculationBase.items.get(itemId)!
          return [
            {
              id: itemId,
              value: snapshot.itemValues.get(itemId) ?? item.defaultValue,
              unit: item.unit,
              hidden: !containerSnapshot.applicable,
              valueValid: containerBase.controls.valueValid,
            },
          ]
        })
      }).flat()
    })

    const { expectedResult, evaluation } = setupCalculationSnapshotExpectedResult(
      calculationBase,
      calculationSnapshot,
      expectedResultOptions
    )

    return {
      calculationSnapshot,
      calculationItems,
      valid,
      expectedResult,
      evaluation,
      extraStats,
      targetDefMultiplier,
      expectedResultOptions,
    }
  }

  const setupDamageCalculationExpectedResultSweep = (
    skillResult: Ref<SkillResult>,
    extraStats: Ref<StatRecorded[]>,
    targetProperties: Ref<TargetProperties>,
    calculationOptions: Ref<CalculationOptions>,
    dimensions: Ref<readonly CalculationSweepDimension[]>
  ) => {
    const calculator = setupDamageCalculationExpectedResult(
      skillResult,
      extraStats,
      targetProperties,
      calculationOptions
    )
    const sweepResult = computed(() => {
      const effectiveDimensions = dimensions.value.map(dimension => {
        if (
          dimension.itemId !== CalculationItemIds.TargetDef &&
          dimension.itemId !== CalculationItemIds.TargetMdef
        ) {
          return dimension
        }

        return {
          itemId: dimension.itemId,
          values: dimension.values.map(value => value * calculator.targetDefMultiplier.value),
        }
      })

      return evaluateCalculationExpectedValueZipSweep(
        calculationBase,
        calculator.calculationSnapshot.value,
        effectiveDimensions,
        calculator.expectedResultOptions.value
      )
    })

    return {
      valid: computed(() => calculator.valid.value && sweepResult.value.issues.length === 0),
      expectedResults: computed(() => sweepResult.value.values),
    }
  }

  return {
    setupDamageCalculationExpectedResult,
    setupDamageCalculationExpectedResultSweep,
  }
}

function isValidElement(element: string | EnemyElements): element is EnemyElements {
  const elementsList = [
    EnemyElements.Neutral,
    EnemyElements.Fire,
    EnemyElements.Water,
    EnemyElements.Wind,
    EnemyElements.Earth,
    EnemyElements.Light,
    EnemyElements.Dark,
  ]
  return elementsList.includes(element as EnemyElements)
}
