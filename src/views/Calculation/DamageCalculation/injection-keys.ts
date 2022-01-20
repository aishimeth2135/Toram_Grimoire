import type { Ref, InjectionKey } from 'vue'

import type { ResultModeIdExpected, ResultModeItem } from './setup'

export const DamageCalculationRootInjectionKey: InjectionKey<Ref<ResultModeItem<ResultModeIdExpected>['value']>> = Symbol()
