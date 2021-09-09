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

  Arrow = 'sub-weapon|arrow',
  Dagger = 'sub-weapon|dagger',
  NinjutsuScroll = 'sub-weapon|ninjutsu-scroll',

  Shield = 'sub-armor|shield',

  BodyNormal = 'body-armor|normal',
  BodyDodge = 'body-armor|dodge',
  BodyDefense = 'body-armor|defense',

  Additional = 'additional',
  Special = 'special',
  Avatar = 'avatar',

  Empty = 'empty',
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
  MainWeaponTypeList,
  SubWeaponTypeList,
  SubArmorTypeList,
};

