import { InjectionKey } from 'vue'

import { EnchantStep } from '@/lib/Enchant/Enchant'

interface EnchantSimulatorInjection {
  rootState: {
    statDisplayMode: 0 | 1;
  };
  openSelectItem: (type: 'step', target: EnchantStep, once?: boolean) => void;
}

export const EnchantSimulatorInjectionKey: InjectionKey<EnchantSimulatorInjection> = Symbol('enchant-simulator')
