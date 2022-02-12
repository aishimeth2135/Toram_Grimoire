import { InjectionKey } from 'vue'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { EquipmentField } from '@/lib/Character/Character'

interface CharacterSimulatorInjection {
  editCrystal: (equipment: CharacterEquipment) => void;
  editBasic: (equipment: CharacterEquipment) => void;
  editStat: (equipment: CharacterEquipment) => void;
  editEquipmentFieldEquipment: (field: EquipmentField) => void;
  appendEquipments: () => void;
  createCustomEquipment: () => void;
}

export const CharacterSimulatorInjectionKey: InjectionKey<CharacterSimulatorInjection> = Symbol('character-simulator')
