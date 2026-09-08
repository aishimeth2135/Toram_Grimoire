const DataStoreIds = {
  Items: 'Items',
  Stats: 'Stats',
  CharacterStats: 'CharacterStats',
  Glossary: 'Glossary',
  Skill: 'Skill',
  Food: 'Food',
  Enchant: 'Enchant',
  DamageCalculation: 'DamageCalculation',
  Registlet: 'Registlet',
  ItemsPotion: 'ItemsPotion',
  Quest: 'Quest',
  EquipmentTrait: 'EquipmentTrait',
} as const
type DataStoreIds = (typeof DataStoreIds)[keyof typeof DataStoreIds]

export { DataStoreIds }
