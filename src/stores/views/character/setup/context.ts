import { type ComputedRef, type Ref, computed } from 'vue'

import Grimoire from '@/shared/Grimoire'

import {
  type Character,
  CharacterBaseStatTypes,
  type CharacterStatResultInputVars,
  EquipmentFieldTypes,
} from '@/lib/Character/Character'
import { EquipmentTypes } from '@/lib/Character/CharacterEquipment'
import type { FoodsBuild } from '@/lib/Character/FoodBuild'
import type { PotionBuild } from '@/lib/Character/PotionBuild'
import type { RegistletBuild } from '@/lib/Character/RegistletBuild'
import type { SkillBuild } from '@/lib/Character/SkillBuild'
import type { StatRecorded } from '@/lib/Character/Stat'

import { createElementMap, getCharacterElement } from '../utils'

export interface CharacterBuildsContext {
  skillBuild: SkillBuild | null
  registletBuild: RegistletBuild | null
  potionBuild: PotionBuild | null
  foodBuild: FoodsBuild | null
}

export interface CharacterPureStatsResult {
  skillStats: ComputedRef<StatRecorded[]>
  registletStats: ComputedRef<StatRecorded[]>
  potionStats: ComputedRef<StatRecorded[]>
  foodStats: ComputedRef<StatRecorded[]>
}

export function useCharacterStatsBaseVars(
  character: Ref<Character | null>,
  buildsContext: Ref<CharacterBuildsContext>
) {
  const equipmentElement = computed(() =>
    character.value ? getCharacterElement(character.value) : createElementMap()
  )

  const skill_Conversion = computed(() => {
    const stc = Grimoire.Skill.skillRoot.skillTreeCategorys.find(_stc => _stc.id === 4)
    const st = stc?.skillTrees.find(_st => _st.id === 1)
    return st?.skills.find(_skill => _skill.id === 1) ?? null
  })

  const getSkillLevel = (skillId: string) => {
    const skill = Grimoire.Skill.skillRoot.findSkillById(skillId)
    if (!skill) {
      return 0
    }
    return buildsContext.value.skillBuild?.getSkillLevel(skill) ?? 0
  }

  const characterStatsBaseVars = computed<CharacterStatResultInputVars>(() => {
    const chara = character.value!

    const isDualSword =
      chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.OneHandSword) &&
      chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.OneHandSword)

    const mainField = chara.fieldEquipment(EquipmentFieldTypes.MainWeapon)
    const subField = chara.fieldEquipment(EquipmentFieldTypes.SubWeapon)
    const bodyField = chara.fieldEquipment(EquipmentFieldTypes.BodyArmor)
    const additionalField = chara.fieldEquipment(EquipmentFieldTypes.Additional)
    const specialField = chara.fieldEquipment(EquipmentFieldTypes.Special)
    return {
      value: {
        '@clv': chara.level,
        '@str': chara.baseStatValue(CharacterBaseStatTypes.STR),
        '@dex': chara.baseStatValue(CharacterBaseStatTypes.DEX),
        '@int': chara.baseStatValue(CharacterBaseStatTypes.INT),
        '@agi': chara.baseStatValue(CharacterBaseStatTypes.AGI),
        '@vit': chara.baseStatValue(CharacterBaseStatTypes.VIT),
        '@tec': chara.baseStatValue(CharacterBaseStatTypes.TEC),
        '@men': chara.baseStatValue(CharacterBaseStatTypes.MEN),
        '@crt': chara.baseStatValue(CharacterBaseStatTypes.CRT),
        '@luk': chara.baseStatValue(CharacterBaseStatTypes.LUK),
        '@main': mainField
          ? {
              atk: mainField.basicValue,
              refining: mainField.refining,
              stability: mainField.stability,
            }
          : {
              atk: 0,
              refining: 0,
              stability: 0,
            },
        '@sub': subField
          ? {
              atk: subField.basicValue,
              def: subField.basicValue,
              refining: subField.refining,
              stability: subField.stability,
            }
          : {
              atk: 0,
              def: 0,
              refining: 0,
              stability: 0,
            },
        '@armor': bodyField
          ? {
              def: bodyField.basicValue,
              refining: bodyField.refining,
            }
          : {
              def: 0,
              refining: 0,
            },
        '@additional': additionalField
          ? {
              def: additionalField.basicValue,
              refining: additionalField.refining,
            }
          : {
              def: 0,
              refining: 0,
            },
        '@special': specialField ? { def: specialField.basicValue } : { def: 0 },
        '@shield': chara.checkFieldEquipmentType(
          EquipmentFieldTypes.SubWeapon,
          EquipmentTypes.Shield
        )
          ? { refining: subField!.refining, def: subField!.basicValue }
          : { refining: 0, def: 0 },
        '@arrow': chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.Arrow)
          ? { stability: subField!.stability, atk: subField!.basicValue }
          : { stability: 0, atk: 0 },
        '@element': equipmentElement.value,
        '@skill': {
          Conversion: skill_Conversion.value
            ? (buildsContext.value.skillBuild?.getSkillLevel(skill_Conversion.value) ?? 0)
            : 0,
        },
      },
      conditional: {
        '@1h_sword':
          !isDualSword &&
          chara.checkFieldEquipmentType(
            EquipmentFieldTypes.MainWeapon,
            EquipmentTypes.OneHandSword
          ),
        '@2h_sword': chara.checkFieldEquipmentType(
          EquipmentFieldTypes.MainWeapon,
          EquipmentTypes.TwoHandSword
        ),
        '@bow': chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.Bow),
        '@bowgun': chara.checkFieldEquipmentType(
          EquipmentFieldTypes.MainWeapon,
          EquipmentTypes.Bowgun
        ),
        '@staff': chara.checkFieldEquipmentType(
          EquipmentFieldTypes.MainWeapon,
          EquipmentTypes.Staff
        ),
        '@magic_device': chara.checkFieldEquipmentType(
          EquipmentFieldTypes.MainWeapon,
          EquipmentTypes.MagicDevice
        ),
        '@knuckle': chara.checkFieldEquipmentType(
          EquipmentFieldTypes.MainWeapon,
          EquipmentTypes.Knuckle
        ),
        '@dual_sword': isDualSword,
        '@halberd': chara.checkFieldEquipmentType(
          EquipmentFieldTypes.MainWeapon,
          EquipmentTypes.Halberd
        ),
        '@katana': chara.checkFieldEquipmentType(
          EquipmentFieldTypes.MainWeapon,
          EquipmentTypes.Katana
        ),
        '@main': {
          none: chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.Empty),
        },
        '@sub': {
          arrow: chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.Arrow),
          shield: chara.checkFieldEquipmentType(
            EquipmentFieldTypes.SubWeapon,
            EquipmentTypes.Shield
          ),
          dagger: chara.checkFieldEquipmentType(
            EquipmentFieldTypes.SubWeapon,
            EquipmentTypes.Dagger
          ),
          knuckle: chara.checkFieldEquipmentType(
            EquipmentFieldTypes.SubWeapon,
            EquipmentTypes.Knuckle
          ),
          magic_device: chara.checkFieldEquipmentType(
            EquipmentFieldTypes.SubWeapon,
            EquipmentTypes.MagicDevice
          ),
        },
        '@armor': {
          normal: chara.checkFieldEquipmentType(
            EquipmentFieldTypes.BodyArmor,
            EquipmentTypes.BodyNormal
          ),
          dodge: chara.checkFieldEquipmentType(
            EquipmentFieldTypes.BodyArmor,
            EquipmentTypes.BodyDodge
          ),
          defense: chara.checkFieldEquipmentType(
            EquipmentFieldTypes.BodyArmor,
            EquipmentTypes.BodyDefense
          ),
          none: chara.checkFieldEquipmentType(EquipmentFieldTypes.BodyArmor, EquipmentTypes.Empty),
        },
      },
      methods: {
        getSkillLevel,
      },
    }
  })

  return { characterStatsBaseVars }
}
