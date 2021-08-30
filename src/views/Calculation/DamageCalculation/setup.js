import { computed, readonly, ref, Ref, ComputedRef } from 'vue';
import { useStore } from 'vuex';
import RegisterLang from '@/setup/RegisterLang';
import Notify from '@/setup/Notify';

import { calcStructCritical, calcStructWithoutCritical } from './consts';

import { Calculation } from '@/lib/Calculation/Damage/Calculation';
import { CalcStructItem } from '@/lib/Calculation/Damage/Calculation/base';

const setupCalcMode = () => {
  const calcMode = ref('critical');
  const toggleCalcMode = () => calcMode.value = calcMode.value === 'critical' ? 'without_critical' : 'critical';
  const currentCalcStruct = computed(() => calcMode.value === 'critical' ? calcStructCritical : calcStructWithoutCritical);

  return {
    calcMode: readonly(calcMode),
    currentCalcStruct,
    toggleCalcMode,
  }
};

const setupCalculationStoreState = () => {
  const store = useStore();

  /** @type {ComputedRef<Array<Calculation>>} */
  const calculations = computed(() => store.state['damage-calculation'].calculations);

  /** @type {ComputedRef<Calculation>} */
  const currentCalculation = computed(() => store.getters['damage-calculation/currentCalculation']);

  return {
    calculations,
    currentCalculation,
  }
};

const setupCalculationStore = () => {
  const store = useStore();
  const { lang, rootLang } = RegisterLang('Damage Calculation');
  const { notify } = Notify();

  const { calculations, currentCalculation } = setupCalculationStoreState();

  const removeCurrentCalculation = () => {
    if (calculations.value.length === 1) {
      notify(lang('tips/At least one build must be kept'));
      return;
    }
    const calculation = currentCalculation.value;
    store.commit('damage-calculation/removeCalculation', calculation);
    notify(lang('tips/Successfully removed build', [calculation.name]), {
      buttons: [{
        text: rootLang('global/recovery'),
        removeMessageAfterClick: true,
        click: () => store.commit('damage-calculation/appendCalculation', calculation),
      }],
    });
  };

  const copyCurrentCalculation = () => {
    const calculation = currentCalculation.value.copy();
    store.commit('damage-calculation/appendCalculation', calculation);
  };

  const calculationItems = computed(() => {
    return calculations.value.map((calc, index) => ({
      index,
      origin: calc,
    }));
  });

  return {
    calculations,
    currentCalculation,
    calculationItems,

    removeCurrentCalculation,
    copyCurrentCalculation,
  }
};

/**
 * @param {Ref<Calculation>|ComputedRef<Calculation>} calculation
 */
const setupExpectedResults = (calculation) => {
  const expectedResultComputedBase = [calcStructCritical, calcStructWithoutCritical]
    .map(calcStruct => ({
      id: calcStruct.id,
      computed: computed(() => calculation.value.result(calcStruct)),
    }));
  const expectedResults = computed(() => {
    return expectedResultComputedBase.map(item => ({
      id: item.id,
      result: item.computed.value,
    }));
  });

  const expectedResult = computed(() => {
    const cr = calculation.value.containers.get('critical_rate').result();
    return Math.floor((cr * expectedResultComputedBase[0].computed.value) / 100 + ((100 - cr) * expectedResultComputedBase[1].computed.value) / 100);
  });

  return {
    expectedResults,
    expectedResult,
  };
};

/**
 * @param {Ref<Calculation>|ComputedRef<Calculation>} calculation
 * @param {Ref<CalcStructItem>|ComputedRef<CalcStructItem>} currentCalcStruct
 */
const setupResultMode = (calculation, currentCalcStruct) => {
  const {
    expectedResults,
    expectedResult,
  } = setupExpectedResults(calculation);

  const expectedResultWithCurrentCalcStruct = computed(() => expectedResults.value.find(item => item.id === currentCalcStruct.value.id).result);

  const resultWithStability = computed(() => {
    const min = calculation.value.result(currentCalcStruct.value, {
      containerResult: {
        'stability': itemContainer => itemContainer.getItemValue('stability'),
      },
    });
    const max = calculation.value.result(currentCalcStruct.value, {
      containerResult: {
        'stability': 100,
      },
    });
    return { min, max };
  });

  const resultModeId = ref('expected: selected calc struct');

  /** @param {string} modeId */
  const selectResultMode = modeId => {
    resultModeId.value = modeId;
  };

  const resultModeList = computed(() => {
    return [{
      id: 'expected: selected calc struct',
      icon: 'ant-design:star-outlined',
      value: expectedResultWithCurrentCalcStruct.value,
    }, {
      id: 'range',
      icon: 'tabler:angle',
      value: resultWithStability.value,
    }, {
      id: 'expected',
      icon: 'ant-design:star-outlined',
      value: expectedResult.value,
    }];
  });
  const resultMode = computed(() => resultModeList.value.find(item => item.id === resultModeId.value));

  return {
    resultMode,
    resultModeList,
    selectResultMode,
  };
};

/**
 * @param {Ref<Calculation>|ComputedRef<Calculation>} calculation
 */
const setupCalculationCalcOptions = (calculation) => {
  const options = [{
    containerId: 'damage_type',
  }];

  const calculationContainerOptions = computed(() => {
    return options.map(item => {
      const container = calculation.value.containers.get(item.containerId);
      return {
        container,
        containerItems: Array.from(container.items.values()),
        type: item.type,
      };
    });
  });

  return {
    calculationContainerOptions,
  };
};

export {
  setupCalcMode,
  setupCalculationStoreState,
  setupCalculationStore,
  setupExpectedResults,
  setupResultMode,
  setupCalculationCalcOptions,
};
