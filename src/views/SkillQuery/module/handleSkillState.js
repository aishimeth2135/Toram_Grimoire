import CY from "@global-modules/cyteria.js";

export default function(skill) {
  const defSef = skill.defaultEffect;

  const states = [];

  const createState = sef => {
    const branchs = defSef.branchs.map((p, i) => ({
      iid: i,
      id: p.id,
      name: p.name,
      attrs: Object.assign({}, p.branchAttributes),
      stats: p.stats.map(p => p.copy()),
      group: null,
      history: [],
      suffix: [],
      '@is-default-list': [],
      '@delete-list': [],
      '@overwrite-list': [],
      '@stat-delete-list': [],
      '@stat-overwrite-list': []
    }));

    const equip = {
      main: sef.mainWeapon,
      sub: sef.subWeapon,
      body: sef.bodyArmor,
      operator: sef.config.equipmentConfirm
    };

    const state = {
      branchs,
      attrs: Object.assign({}, defSef.attributes),
      equipment: equip
    };

    return state;
  };

  const branchEmpty = b => CY.object.isEmpty(b.branchAttributes) && b.stats.length == 0;

  // 尋找符合裝備的 effect
  //const overwriteSef = skill.effects.find(p => checkEquipment(p, equipmentState));

  skill.effects.forEach(overwriteSef => {
    const state = createState(overwriteSef);

    if (overwriteSef != defSef){
      // 執行覆蓋
      Object.getOwnPropertySymbols(overwriteSef.attributes).forEach(k => {
        const value = overwriteSef.attributes[k];
        // 空值就移除
        value == '' && state.attrs[k] ? delete state.attrs[k] : state.attrs[k] = value;
      });

      overwriteSef.branchs.forEach(branch => {
        const idx = state.branchs.findIndex(b => b.id != '-' && b.id == branch.id);
        const p = idx != -1 ? state.branchs[idx] : null;
        // ==== p: original branch ====

        if (!p)
          return false;

        // 如果 branch.id 一樣但 branch.name 為空值且isEmpty。去除此 branch。
        if (branch.name === '' && branchEmpty(branch)) {
          state.branchs.splice(idx, 1);
          return;
        }

        // 如果 branch.id 一樣但 branch.name 不一樣，先清空所有屬性。
        // branch.name 為空值時，默認兩者同名。
        if (branch.name !== '' && p.name != branch.name) {
          p.name = branch.name;
          CY.object.empty(p.attrs);
        }

        Object.keys(branch.branchAttributes).forEach(_k => {
          const _value = branch.branchAttributes[_k];
          if (_value == '' && p.attrs[_k]) {
            delete p.attrs[_k];
            p['@delete-list'].push(_k);
          } else {
            p.attrs[_k] = _value;
            p['@overwrite-list'].push(_k);
          }
        });

        branch.stats.forEach(stat => {
          let _idx = p.stats.findIndex(b => stat.equals(b));
          let findStat = p.stats[_idx];
          if (_idx == -1) {
            p.stats.push(stat.copy());
            p['@stat-overwrite-list'].push(stat.baseName());
          } else {
            if (stat.value === '') {
              p.stats.splice(_idx, 0);
              p['@stat-delete-list'].push(stat.baseName());
            } else {
              findStat.statValue(stat.value);
              p['@stat-overwrite-list'].push(stat.baseName());
            }
          }
        });
      });
    }

    // init of branch values
    setBranchAttributeDefault(state.branchs);

    // create list of history.date
    // const historyList = [...new Set(
    //   state.branchs
    //   .filter(p => p.name == 'history')
    //   .map(p => p.attrs['date'])
    // )];

    // suffix
    const suffixBranchList = {
      'damage': ['extra', 'poration'],
      'effect': ['extra'],
      'list': ['list'],
      '@global': ['formula_extra', 'group', {
        name: 'history',
        validation: b => b.attrs['target_branch'] !== void 0
      }]
    };
    const searchSuffixList = bch => {
      return [bch.name, '@global'].find(name => {
        const p = suffixBranchList[name];

        return p && p.find(a => {
          return typeof a != 'object' ? a == bch.name : a.name == bch.name && a.validation(bch);
        });
      });
    };

    const resBranchs = [];
    state.branchs.forEach(bch => {
      const curBranch = resBranchs.length != 0 ? resBranchs[resBranchs.length - 1] : null;

      if (!curBranch) {
        // 防呆
        const list = ['damage', 'effect', 'poration', 'next', 'list',
          'passive', 'heal', 'text', 'tips', 'stack', 'reference', 'history', 'import'
        ];
        list.includes(bch.name) && resBranchs.push(bch);
        return;
      }

      if (searchSuffixList(bch)) {
        bch.mainBranch = curBranch;
        curBranch.suffix.push(bch);
      } else
        resBranchs.push(bch);
    });

    const vitualBranchList = ['history'];
    const createHistoryData = (bch, hiddenCtr) => {
      return {
        date: bch.attrs['date'],
        attrs: bch.attrs,
        hiddenCtr
      };
    };

    state.branchs = resBranchs.filter(bch => {
      // handle group
      bch.suffix = bch.suffix.filter(p => {
        if (p.name == 'group') {
          bch.group = {
            size: parseInt(p.attrs['size'], 10),
            expandable: p.attrs['expandable'] == 1,
            expansion: p.attrs['expansion_default'] == 1
          };
          return false;
        }
        if (p.name == 'history') {
          bch.history.push(createHistoryData(p, true));
          return false;
        }
        return true;
      });

      // 提取虛擬分支
      if (vitualBranchList.includes(bch.name)) {
        if (bch.name == 'history') {
          const _bch = resBranchs.find(q => q.id == bch.attrs['target_branch']);
          _bch && _bch.history.push(createHistoryData(bch, false));
        }
        return false;
      }

      return true;
    });

    // store stacks value
    const stack = state.branchs.filter(b => b.name == 'stack')
      .map(b => ({
        id: b.attrs['id'],
        value: b.attrs['default'] || b.attrs['default'] == 0 ? b.attrs['default'] : b.attrs['min']
      }));
    state.stack = stack;

    states.push(state);
  });

  return {
    states
  };
}

function setBranchAttributeDefault(branchs) {
  const _sd = (target, def) => {
    const list = [];
    Object.keys(def).forEach(k => {
      if (target[k] === void 0) {
        target[k] = def[k];
        list.push(k);
      }
    });
    return list;
  };

  const def_list = {
    'damage': {
      'constant': '0',
      'multiplier': '0',
      'type': 'single',
      'damage_type': 'physical',
      'base': 'auto',
      'frequency': '1',
      'end_position': 'target',
      'effective_area': 'circle',
      'title': 'normal',
      'judgment': 'common',
      'element': 'none',
      'is_place': '0'
    },
    'proration': {
      'proration': 'auto'
    },
    'effect': {
      'condition': 'auto',
      'type': 'self',
      'is_place': '0'
    },
    'heal': {
      'target': 'self',
      'frequency': '1',
      'constant': '0'
    },
    'list': {
      'is_tips': '0'
    },
    'stack': {
      'min': '0',
      'default': 'auto',
      'name': 'auto'
    },
    'group': {
      'expandable': '1',
      'expansion_default': '0'
    },
    'import': {
      'default_level': '5'
    }
  };

  branchs.forEach(branch => {
    const p = def_list[branch.name];
    if (p)
      branch['@is-default-list'] = _sd(branch.attrs, p);
  });
}

// function checkEquipment(eft, equip) {
//   /* 通用 */
//   if ([eft.mainWeapon, eft.subWeapon, eft.bodyArmor].every(p => p == -1))
//     return true;

//   /* 非通用 */

//   // or
//   if (eft.config.equipmentConfirm === 0) {
//     if (equip.mainWeapon != -1 && equip.mainWeapon == eft.mainWeapon || (eft.mainWeapon === 0 && equip.mainWeapon === 9 && eft.parent.effects.find(a => a.mainWeapon == 9) === void 0))
//       return true;
//     if (equip.subWeapon != -1 && equip.subWeapon == eft.subWeapon)
//       return true;
//     if (equip.bodyArmor != -1 && equip.bodyArmor == eft.bodyArmor)
//       return true;
//     return false;
//   }

//   // and
//   if (eft.config.equipmentConfirm === 1) {
//     if (equip.mainWeapon != eft.mainWeapon || (eft.mainWeapon === 0 && equip.mainWeapon === 9 && eft.parent.effects.find(a => a.mainWeapon == 9) !== void 0))
//       return false;
//     if (equip.subWeapon != eft.subWeapon)
//       return false;
//     if (equip.bodyArmor != eft.bodyArmor)
//       return false;
//     return true;
//   }
// }