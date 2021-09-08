const EquipmentFieldTypes = {
  'main-weapon': 'main-weapon',
  'sub-weapon': 'sub-weapon',
  'body-armor': 'body-armor',
  'additional': 'additional',
  'special': 'special',
  'avatar': 'avatar',
  'empty': 'empty',
} as const;

const CharacterBaseStatTypes = {
  'STR': 'STR',
  'DEX': 'DEX',
  'INT': 'INT',
  'AGI': 'AGI',
  'VIT': 'VIT',
} as const;

const CharacterOptionalBaseStatTypes = {
  'TEC': 'TEC',
  'MEN': 'MEN',
  'LUK': 'LUK',
  'CRT': 'CRT',
} as const;

export { EquipmentFieldTypes, CharacterBaseStatTypes, CharacterOptionalBaseStatTypes };

