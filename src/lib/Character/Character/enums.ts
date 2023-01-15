const enum EquipmentFieldTypes {
  MainWeapon = 'main-weapon',
  SubWeapon = 'sub-weapon',
  BodyArmor = 'body-armor',
  Additional = 'additional',
  Special = 'special',
  Avatar = 'avatar',
}

enum CharacterBaseStatTypes {
  STR = 'STR',
  DEX = 'DEX',
  INT = 'INT',
  AGI = 'AGI',
  VIT = 'VIT',

  // optional
  TEC = 'TEC',
  MEN = 'MEN',
  LUK = 'LUK',
  CRT = 'CRT',
}

export { EquipmentFieldTypes, CharacterBaseStatTypes }
