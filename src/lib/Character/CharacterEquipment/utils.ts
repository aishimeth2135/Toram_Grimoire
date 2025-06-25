import { BagEquipment } from '@/lib/Items/BagItem'

import { EquipmentTypes } from './enums'

export function equipmentOriginalCategoryToType(item: BagEquipment) {
  /*
    0: '單手劍',
    1: '雙手劍',
    2: '弓',
    3: '弩',
    4: '法杖',
    5: '魔導具',
    6: '拳套',
    7: '旋風槍',
    8: '拔刀劍',

    100: '箭矢',
    101: '小刀',
    102: '忍術卷軸',

    200: '盾牌',

    300: '身體裝備',
    400: '追加裝備',
    500: '特殊裝備',
  */
  if (item.category === 300) {
    return EquipmentTypes.BodyNormal
  }
  if (item.category === 400) {
    return EquipmentTypes.Additional
  }
  if (item.category === 500) {
    return EquipmentTypes.Special
  }
  if (item.category < 100) {
    return [
      EquipmentTypes.OneHandSword,
      EquipmentTypes.TwoHandSword,
      EquipmentTypes.Bow,
      EquipmentTypes.Bowgun,
      EquipmentTypes.Staff,
      EquipmentTypes.MagicDevice,
      EquipmentTypes.Knuckle,
      EquipmentTypes.Halberd,
      EquipmentTypes.Katana,
    ][item.category]
  }
  if (item.category < 200) {
    return [EquipmentTypes.Arrow, EquipmentTypes.Dagger, EquipmentTypes.NinjutsuScroll][
      item.category - 100
    ]
  }
  if (item.category < 300) {
    return EquipmentTypes.Shield
  }

  return EquipmentTypes.Avatar
}
