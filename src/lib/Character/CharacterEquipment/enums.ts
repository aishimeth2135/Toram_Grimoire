const enum EquipmentTypes {
  OneHandSword = 'one-hand-sword',
  TwoHandSword = 'two-hand-sword',
  Bow = 'bow',
  Bowgun = 'bowgun',
  Staff = 'staff',
  MagicDevice = 'magic-device',
  Knuckle = 'knuckle',
  Halberd = 'halberd',
  Katana = 'katana',

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

const enum EquipmentCategorys {
  MainWeapon = 'main-weapon',
  SubWeapon = 'sub-weapon',
  SubArmor = 'sub-armor',
  BodyArmor = 'body-armor',
  Additional = 'additional',
  Special = 'special',
  Avatar = 'avatar',
}

const MainWeaponTypeList = [
  EquipmentTypes.OneHandSword,
  EquipmentTypes.TwoHandSword,
  EquipmentTypes.Bow,
  EquipmentTypes.Bowgun,
  EquipmentTypes.Staff,
  EquipmentTypes.MagicDevice,
  EquipmentTypes.Knuckle,
  EquipmentTypes.Halberd,
  EquipmentTypes.Katana,
] as const;

const SubWeaponTypeList = [
  EquipmentTypes.Arrow,
  EquipmentTypes.Dagger,
  EquipmentTypes.NinjutsuScroll,
] as const;

const SubArmorTypeList = [
  EquipmentTypes.Shield,
] as const;

export {
  EquipmentTypes,
  EquipmentCategorys,
  MainWeaponTypeList,
  SubWeaponTypeList,
  SubArmorTypeList,
};

