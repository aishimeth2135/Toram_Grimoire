import { CalcStructExpression } from '@/lib/Calculation/Damage/Calculation/base';

const calcStructCritical: CalcStructExpression = {
  id: 'expected_with_critical',
  operator: '*',
  left: {
    operator: '+++',
    list: [
      {
        operator: '*',
        left: {
          operator: '+',
          left: {
            operator: '*',
            left: {
              operator: '+',
              left: 'atk/base',
              right: 'atk/dual_sword',
            },
            right: 'atk/two_handed',
          },
          right: 'level_difference',
        },
        right: 'target_resistance',
      },
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

const calcStructWithoutCritical: CalcStructExpression = {
  id: 'expected_without_critical',
  operator: '*',
  left: {
    operator: '+++',
    list: [
      {
        operator: '*',
        left: {
          operator: '+++',
          list: [
            'atk/base',
            'atk/dual_sword',
            'level_difference',
          ],
        },
        right: 'target_resistance',
      },
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

const calcStructDisplay: CalcStructExpression = {
  id: 'display',
  operator: '*',
  left: {
    operator: '+++',
    list: [
      {
        operator: '*',
        left: {
          operator: '+++',
          list: [
            'atk/base',
            'atk/dual_sword',
            'level_difference',
          ],
        },
        right: 'target_resistance',
      },
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
