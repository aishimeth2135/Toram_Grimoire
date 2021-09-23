const branchComputedAttrList = {
  'damage': ['multiplier'],
};

const branchAttrsDefaultValue = {
  'damage': {
    'constant': '0',
    'multiplier': '0',
    'extra_constant': '0',
    'type': 'single',
    'damage_type': 'physical',
    'base': 'auto',
    'frequency': '1',
    'end_position': 'target',
    'title': 'normal',
    'element': 'none',

    'detail_display': 'auto',
    'judgment': 'common',
    'frequency_judgment': 'auto',
    'unsheathe_damage': '0',
    'range_damage': 'none',
    'is_place': '0',

    'effective_area': 'circle',
    'radius': '1',
    'start_position_offsets': '0',
    'end_position_offsets': '0',
    'target_offsets': 'auto',
  },
  'base': {
    'title': 'auto',
  },
  'proration': {
    'proration': 'auto',
  },
  'effect': {
    'condition': 'auto',
    'type': 'self',
    'is_place': '0',
    'end_position': 'self',
    'effective_area': 'circle',
    'radius': '1',
    'start_position_offsets': '0',
    'end_position_offsets': '0',
    'effect_self': '1',
  },
  'heal': {
    'target': 'self',
    'frequency': '1',
    'constant': '0',
  },
  'list': {
    'is_tips': '0',
  },
  'stack': {
    'min': '1',
    'default': 'auto',
    'name': 'auto',
  },
  'group': {
    'expandable': '1',
    'expansion_default': '0',
  },
  'import': {
    'default_level': '5',
  },
  'space': {
    'disabled': '0',
  },
} as Record<string, Record<string, string>>;

// const branchAttrsType = {
//   'damage': {
//     values: [
//       'multiplier',
//       'constant',
//       'extra_constant',
//       'frequency',
//       'ailment_chance',
//       'duration',
//       'cycle',
//       'radius',
//       'angel',
//       'start_position_offsets',
//       'end_position_offsets',
//       'move_distance',
//       (value: string) => value !== 'auto',
//     ],
//     texts: [],
//     suffixs: {
//       'extra': {
//         values: ['ailment_chance'],
//         texts: [],
//       },
//       'base': {
//         values: [],
//         texts: ['caption'],
//       },
//     },
//   },
//   'effect': {
//     values: [
//       'duration',
//       'radius',
//     ],
//     texts: ['caption'],
//     suffixs: {
//       'extra': {
//         values: [],
//         texts: ['caption'],
//       },
//     },
//   },
//   'next': 'effect',
//   'passive': {
//     values: [],
//     texts: ['caption'],
//   },
//   'heal': {
//     values: [],
//   },
// };

export { branchComputedAttrList, branchAttrsDefaultValue };
