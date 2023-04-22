import { EquipmentTypes } from '@/lib/Character/CharacterEquipment'

import { SkillBranchNames } from '../Skill'

const BRANCH_PROPS_DEFAULT_VALUE: Partial<
  Record<SkillBranchNames, Record<string, string>>
> = {
  [SkillBranchNames.Damage]: {
    constant: '0',
    multiplier: '0',
    extra_constant: '0',
    type: 'single',
    damage_type: 'physical',
    base: 'auto',
    frequency: '1',
    end_position: 'target',
    title: 'normal',
    element: 'none',
    dual_element: 'none',

    detail_display: 'auto',
    judgment: 'common',
    frequency_judgment: 'auto',
    unsheathe_damage: '0',
    range_damage: 'none',
    is_place: '0',
    skill_long_range: 'auto',
    combo_rate: '1',

    effective_area: 'circle',
    radius: '1',
    start_position_offsets: '0',
    end_position_offsets: '0',
    target_offsets: 'auto',
  },
  [SkillBranchNames.Base]: {
    title: 'auto',
  },
  [SkillBranchNames.Extra]: {
    type: 'normal',
  },
  [SkillBranchNames.Proration]: {
    proration: 'auto',
  },
  [SkillBranchNames.Effect]: {
    duration: '0',
    condition: 'auto',
    type: 'self',
    is_place: '0',
    end_position: 'self',
    effective_area: 'circle',
    radius: '1',
    start_position_offsets: '0',
    end_position_offsets: '0',
    target_offsets: 'auto',
    effect_self: '1',
  },
  [SkillBranchNames.Heal]: {
    target: 'self',
    frequency: '1',
    constant: '0',
    effective_area: 'circle',
    target_offsets: 'auto',
    end_position: 'self',
  },
  [SkillBranchNames.List]: {
    is_tips: '0',
  },
  [SkillBranchNames.Stack]: {
    min: '1',
    default: 'auto',
    name: 'auto',
    step: '1',
  },
  [SkillBranchNames.Group]: {
    expandable: '1',
    expansion_default: '0',
  },
  [SkillBranchNames.Import]: {
    default_level: '5',
  },
  [SkillBranchNames.Space]: {
    disabled: '0',
  },
}

/**
 * 0'空手', 1'單手劍', 2'雙手劍', 3'弓', 4'弩', 5'法杖',
 * 6'魔導具', 7'拳套', 8'旋風槍', 9'拔刀劍', 10'雙劍',
 *
 * 0'無裝備', 1'箭矢', 2'盾牌', 3'小刀', 4'魔導具',
 * 5'拳套', 6'拔刀劍', 7'忍術卷軸',
 */
const EQUIPMENT_TYPE_MAIN_ORDER = [
  EquipmentTypes.Empty,
  EquipmentTypes.OneHandSword,
  EquipmentTypes.TwoHandSword,
  EquipmentTypes.Bow,
  EquipmentTypes.Bowgun,
  EquipmentTypes.Staff,
  EquipmentTypes.MagicDevice,
  EquipmentTypes.Knuckle,
  EquipmentTypes.Halberd,
  EquipmentTypes.Katana,
  EquipmentTypes.DualSword,
] as const

const EQUIPMENT_TYPE_SUB_ORDER = [
  EquipmentTypes.Empty,
  EquipmentTypes.Arrow,
  EquipmentTypes.Shield,
  EquipmentTypes.Dagger,
  EquipmentTypes.MagicDevice,
  EquipmentTypes.Knuckle,
  EquipmentTypes.Katana,
  EquipmentTypes.NinjutsuScroll,
] as const

const EQUIPMENT_TYPE_BODY_ORDER = [
  EquipmentTypes.Empty,
  EquipmentTypes.BodyDodge,
  EquipmentTypes.BodyDefense,
  EquipmentTypes.BodyNormal,
] as const

export {
  BRANCH_PROPS_DEFAULT_VALUE,
  EQUIPMENT_TYPE_MAIN_ORDER,
  EQUIPMENT_TYPE_SUB_ORDER,
  EQUIPMENT_TYPE_BODY_ORDER,
}
