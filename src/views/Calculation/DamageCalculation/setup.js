import { computed, ref, Ref, ComputedRef } from 'vue';
import { useStore } from 'vuex';
import RegisterLang from '@/setup/RegisterLang';
import Notify from '@/setup/Notify';

import { calcStructDisplay, calcStructCritical, calcStructWithoutCritical } from './consts';

import { Calculation } from '@/lib/Calculation/Damage/Calculation';
import { CalcStructItem } from '@/lib/Calculation/Damage/Calculation/base';

const setupCalcMode = () => {
  const calcModeList = [{
    id: 'common',
    calcStruct: calcStructDisplay,
    outsideItems: ['atk/two_handed'],
  }, {
    id: 'critical',
    calcStruct: calcStructCritical,
    outsideItems: ['critical/critical_rate'],
  }];
  const currentCalcModeId = ref('common');
  const selectCalcMode = id => currentCalcModeId.value = id;
  const calcMode = computed(() => calcModeList.find(item => item.id === currentCalcModeId.value));

  return {
    calcModeList,
    calcMode,
    selectCalcMode,
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
      result: computed(() => calculation.value.result(calcStruct)),
    }));
  // const expectedResults = computed(() => {
  //   return expectedResultComputedBase.map(item => ({
  //     id: item.id,
  //     result: item.computed.value,
  //   }));
  // });

  /**
   * @param {string} target
   */
  const getResult = target => {
    const cr = calculation.value.containers.get('critical/critical_rate').result();
    const stability = calculation.value.containers.get('stability').getItemValue('stability');
    const stabilityValue = (() => {
      if (target === 'max') {
        return 100;
      }
      if (target === 'min') {
        return stability;
      }
      if (target === 'grazeMin') {
        return Math.floor(stability / 2);
      }
    })();
    const criticalValue = Math.floor(expectedResultComputedBase[0].result.value * stabilityValue / 100);
    const withoutCriticalValue = Math.floor(expectedResultComputedBase[1].result.value * stabilityValue / 100);
    return Math.floor((cr * criticalValue) / 100 + ((100 - cr) * withoutCriticalValue) / 100);
  };

  const expectedResultMax = computed(() => getResult('max'));
  const expectedResultMin = computed(() => getResult('min'));
  const expectedResultGrazeMin = computed(() => getResult('grazeMin'));

  const expectedResult = computed(() => {
    const max = expectedResultMax.value;
    const stability = calculation.value.containers.get('stability').result();
    return Math.floor(max * stability / 100);
  });

  const stabilityResult = computed(() => ({
    min: expectedResultMin.value,
    max: expectedResultMax.value,
  }));
  const stabilityResultGraze = computed(() => ({
    min: expectedResultGrazeMin.value,
    max: expectedResultMax.value,
  }));

  return {
    expectedResult,
    stabilityResult,
    stabilityResultGraze,
  };
};

/**
 * @param {Ref<Calculation>|ComputedRef<Calculation>} calculation
 * @param {Ref<CalcStructItem>|ComputedRef<CalcStructItem>} currentCalcStruct
 */
const setupResultMode = (calculation) => {
  const {
    expectedResult,
    stabilityResult,
    stabilityResultGraze,
  } = setupExpectedResults(calculation);

  const resultModeId = ref('expected');

  /** @param {string} modeId */
  const selectResultMode = modeId => {
    resultModeId.value = modeId;
  };

  const resultModeList = computed(() => {
    return [{
      id: 'stability',
      icon: 'tabler:angle',
      value: stabilityResult.value,
    }, {
      id: 'stability: with graze',
      icon: 'tabler:angle',
      value: stabilityResultGraze.value,
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
