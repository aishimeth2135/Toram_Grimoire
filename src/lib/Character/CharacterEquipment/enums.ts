export const enum EquipmentTypes {
  OneHandSword = 'one-hand-sword',
  TwoHandSword = 'two-hand-sword',
  Bow = 'bow',
  Bowgun = 'bowgun',
  Staff = 'staff',
  MagicDevice = 'magic-device',
  Knuckle = 'knuckle',
  Halberd = 'halberd',
  Katana = 'katana',
  DualSword = 'dual-sword',

  Arrow = 'arrow',
  Dagger = 'dagger',
  NinjutsuScroll = 'ninjutsu-scroll',

  Shield = 'shield',

  BodyNormal = 'body-normal',
  BodyDodge = 'body-dodge',
  BodyDefense = 'body-defense',

  Additional = 'additional',
  Special = 'special',
  Avatar = 'avatar',

  Empty = 'empty',
}

export const enum EquipmentCategorys {
  MainWeapon = 'main-weapon',
  SubWeapon = 'sub-weapon',
  SubArmor = 'sub-armor',
  BodyArmor = 'body-armor',
  Additional = 'additional',
  Special = 'special',
  Avatar = 'avatar',
}

export const enum EquipmentKinds {
  Weapon = 'weapon',
  Armor = 'armor',
  Avatar = 'avatar',
  Other = 'other',
}

export const MainWeaponTypeList = [
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

export const SubWeaponTypeList = [
  EquipmentTypes.Arrow,
  EquipmentTypes.Dagger,
  EquipmentTypes.NinjutsuScroll,
]

export const SubArmorTypeList = [EquipmentTypes.Shield]
