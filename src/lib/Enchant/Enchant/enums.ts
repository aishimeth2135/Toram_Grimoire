const EnchantItemConditions = {
  MainWeapon: 'main-weapon',
  BodyArmor: 'body-armor',
  OriginalElement: 'original-element',
} as const
type EnchantItemConditions = (typeof EnchantItemConditions)[keyof typeof EnchantItemConditions]

const EnchantEquipmentTypes = {
  MainWeapon: 'main-weapon',
  BodyArmor: 'body-armor',
} as const
type EnchantEquipmentTypes = (typeof EnchantEquipmentTypes)[keyof typeof EnchantEquipmentTypes]

const EnchantStepTypes = {
  Normal: 'normal',
  Each: 'each',
} as const
type EnchantStepTypes = (typeof EnchantStepTypes)[keyof typeof EnchantStepTypes]

export { EnchantItemConditions, EnchantEquipmentTypes, EnchantStepTypes }
