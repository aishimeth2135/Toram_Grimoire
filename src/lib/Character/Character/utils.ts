import { EquipmentFieldTypes } from '.'

export function getEquipmentFieldTypeText(
  type: EquipmentFieldTypes,
  t: (id: string) => string
): string {
  switch (type) {
    case EquipmentFieldTypes.MainWeapon:
      return t('common.Equipment.field.main-weapon')
    case EquipmentFieldTypes.SubWeapon:
      return t('common.Equipment.field.sub-weapon')
    case EquipmentFieldTypes.BodyArmor:
      return t('common.Equipment.field.body-armor')
    case EquipmentFieldTypes.Additional:
      return t('common.Equipment.field.additional')
    case EquipmentFieldTypes.Special:
      return t('common.Equipment.field.special')
    case EquipmentFieldTypes.Avatar:
      return t('common.Equipment.field.avatar')
  }
}
