export const EquipmentTypes = {
  OneHandSword: 'one-hand-sword',
  TwoHandSword: 'two-hand-sword',
  Bow: 'bow',
  Bowgun: 'bowgun',
  Staff: 'staff',
  MagicDevice: 'magic-device',
  Knuckle: 'knuckle',
  Halberd: 'halberd',
  Katana: 'katana',
  DualSword: 'dual-sword',

  Arrow: 'arrow',
  Dagger: 'dagger',
  NinjutsuScroll: 'ninjutsu-scroll',

  Shield: 'shield',

  BodyNormal: 'body-normal',
  BodyDodge: 'body-dodge',
  BodyDefense: 'body-defense',

  Additional: 'additional',
  Special: 'special',
  Avatar: 'avatar',

  Empty: 'empty',
} as const
export type EquipmentTypes = (typeof EquipmentTypes)[keyof typeof EquipmentTypes]

export const EquipmentCategorys = {
  MainWeapon: 'main-weapon',
  SubWeapon: 'sub-weapon',
  SubArmor: 'sub-armor',
  BodyArmor: 'body-armor',
  Additional: 'additional',
  Special: 'special',
  Avatar: 'avatar',
} as const
export type EquipmentCategorys = (typeof EquipmentCategorys)[keyof typeof EquipmentCategorys]

export const EquipmentKinds = {
  Weapon: 'weapon',
  Armor: 'armor',
  Avatar: 'avatar',
  Other: 'other',
} as const
export type EquipmentKinds = (typeof EquipmentKinds)[keyof typeof EquipmentKinds]

export const MainWeaponTypeList: EquipmentTypes[] = [
  EquipmentTypes.OneHandSword,
  EquipmentTypes.TwoHandSword,
  EquipmentTypes.Bow,
  EquipmentTypes.Bowgun,
  EquipmentTypes.Staff,
  EquipmentTypes.MagicDevice,
  EquipmentTypes.Knuckle,
  EquipmentTypes.Halberd,
  EquipmentTypes.Katana,
]

export const SubWeaponTypeList: EquipmentTypes[] = [
  EquipmentTypes.Arrow,
  EquipmentTypes.Dagger,
  EquipmentTypes.NinjutsuScroll,
]

export const SubArmorTypeList: EquipmentTypes[] = [EquipmentTypes.Shield]

export const BodyArmorTypeList: EquipmentTypes[] = [
  EquipmentTypes.BodyNormal,
  EquipmentTypes.BodyDodge,
  EquipmentTypes.BodyDefense,
]

export const AllEquipmentTypeCategorys = new Map<EquipmentCategorys, EquipmentTypes[]>([
  [EquipmentCategorys.MainWeapon, MainWeaponTypeList],
  [EquipmentCategorys.SubWeapon, SubWeaponTypeList],
  [EquipmentCategorys.SubArmor, SubArmorTypeList],
  [
    EquipmentCategorys.BodyArmor,
    [EquipmentTypes.BodyNormal, EquipmentTypes.BodyDodge, EquipmentTypes.BodyDefense],
  ],
  [EquipmentCategorys.Additional, [EquipmentTypes.Additional]],
  [EquipmentCategorys.Special, [EquipmentTypes.Special]],
  [EquipmentCategorys.Avatar, [EquipmentTypes.Avatar]],
])
