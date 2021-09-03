import { CalcStructItem } from '@/lib/Calculation/Damage/Calculation/base';

/** @type {CalcStructItem} */
const calcStructCritical = {
  id: 'expected_with_critical',
  operator: '*',
  left: {
    operator: '+++',
    list: [
      {
        operator: '***',
        list: [
          {
            operator: '+',
            left: 'atk/base',
            right: 'atk/dual_sword',
          },
          'atk/two_handed',
          'target_resistance',
        ],
      },
      'level_difference',
      {
        operator: '*',
        left: 'target_def_base',
        right: 'pierce',
      },
      'skill/constant',
      'unsheathe_attack/constant',
      'other_constant',
    ],
  },
  right: {
    operator: '***',
    list: [
      'skill/multiplier',
      'critical/critical_damage',
      'range_damage',
      'unsheathe_attack/multiplier',
      'stronger_against_element',
      'proration',
      'combo_multiplier',
      'skill/long_range',
      // 'stability',
      'other_multiplier',
    ],
  },
};

/** @type {CalcStructItem} */
const calcStructWithoutCritical = {
  id: 'expected_without_critical',
  operator: '*',
  left: {
    operator: '+++',
    list: [
      {
        operator: '***',
        list: [
          {
            operator: '+',
            left: 'atk/base',
            right: 'atk/dual_sword',
          },
          // 'atk/two_handed',
          'target_resistance',
        ],
      },
      'level_difference',
      {
        operator: '*',
        left: 'target_def_base',
        right: 'pierce',
      },
      'skill/constant',
      'unsheathe_attack/constant',
      'other_constant',
    ],
  },
  right: {
    operator: '***',
    list: [
      'skill/multiplier',
      // 'critical/critical_damage',
      'range_damage',
      'unsheathe_attack/multiplier',
      'stronger_against_element',
      'proration',
      'combo_multiplier',
      'skill/long_range',
      // 'stability',
      'other_multiplier',
    ],
  },
};

/** @type {CalcStructItem} */
const calcStructDisplay = {
  id: 'display',
  operator: '*',
  left: {
    operator: '+++',
    list: [
      {
        operator: '***',
        list: [
          {
            operator: '+',
            left: 'atk/base',
            right: 'atk/dual_sword',
          },
          'target_resistance',
        ],
      },
      'level_difference',
      {
        operator: '*',
        left: 'target_def_base',
        right: 'pierce',
      },
      'skill/constant',
      'unsheathe_attack/constant',
      'other_constant',
    ],
  },
  right: {
    operator: '***',
    list: [
      'skill/multiplier',
      'critical',
      'range_damage',
      'unsheathe_attack/multiplier',
      'stronger_against_element',
      'proration',
      'combo_multiplier',
      'skill/long_range',
      'stability',
      'other_multiplier',
    ],
  },
};

export { calcStructDisplay, calcStructCritical, calcStructWithoutCritical };
