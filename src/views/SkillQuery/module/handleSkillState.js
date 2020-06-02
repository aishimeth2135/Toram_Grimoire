import CY from "@global-modules/cyteria.js";
import {SkillEffect} from "@lib/SkillSystem/module/SkillElements.js";

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
      empty: false,
      visible: true,
      '@parent-state': null,
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
      equipment: equip,
      historyList: [],
      stackStates: [],
      currentHistoryIdx: -1
    };

    return state;
  };

  const convertStateAttrs = st => {
    st.attrs = {
      'mp_cost': st.attrs[SkillEffect.MP_COST],
      'range': st.attrs[SkillEffect.RANGE],
      'skill_type': st.attrs[SkillEffect.SKILL_TYPE],
      'in_combo': st.attrs[SkillEffect.IN_COMBO],
      'action_time': st.attrs[SkillEffect.ACTION_TIME],
      'casting_time': st.attrs[SkillEffect.CASTING_TIME]
    };
  };

  const branchEmpty = b => CY.object.isEmpty(b.branchAttributes) && b.stats.length == 0;

  const branchOverwrite = (target, from) => {
    Object.keys(from.branchAttributes).forEach(k => {
      const value = from.branchAttributes[k];
      if (value == '' && target.attrs[k]) {
        delete target.attrs[k];
        target['@delete-list'].push(k);
      } else {
        target.attrs[k] = value;
        target['@overwrite-list'].push(k);
      }
    });

    from.stats.forEach(stat => {
      let idx = target.stats.findIndex(b => stat.equals(b));
      let findStat = target.stats[idx];
      if (idx == -1) {
        target.stats.push(stat.copy());
        target['@stat-overwrite-list'].push(stat.baseName());
      } else {
        if (stat.value === '') {
          target.stats.splice(idx, 0);
          target['@stat-delete-list'].push(stat.baseName());
        } else {
          findStat.statValue(stat.value);
          target['@stat-overwrite-list'].push(stat.baseName());
        }
      }
    });
  };

  const createHistoryData = (bch, hiddenFlag) => {
    bch.attrs['@history-date'] = bch.attrs['date'];
    return {
      date: bch.attrs['date'],
      branch: bch,
      hiddenFlag
    };
  };

  // 尋找符合裝備的 effect
  //const overwriteSef = skill.effects.find(p => checkEquipment(p, equipmentState));

  skill.effects.forEach(overwriteSef => {
    const state = createState(overwriteSef);

    if (overwriteSef != defSef){
      // 執行覆蓋
      Object.getOwnPropertySymbols(overwriteSef.attributes).forEach(k => {
        const value = overwriteSef.attributes[k];
        // 空值就移除
        value == '' && state.attrs[k] ? delete state.attrs[k] : (state.attrs[k] = value);
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

        branchOverwrite(p, branch);
      });
    }

    state.branchs.forEach(p => {
      p.empty = CY.object.isEmpty(p.attrs) && p.stats.length == 0;
      p['@parent-state'] = state;
    });

    // init of state attrs
    convertStateAttrs(state);

    // init of branch values
    setBranchAttributeDefault(state.branchs);

    // create list of history.date
    state.historyList = [...new Set(
      state.branchs
      .filter(p => p.name == 'history')
      .map(p => p.attrs['date'])
      .filter(p => /\d{4}\/\d{2}\/\d{2}/.test(p))
    )]
    .sort((a, b) => new Date(b) >= new Date(a) ? 1 : -1);

    // suffix
    const suffixBranchList = {
      'damage': ['extra', 'proration'],
      'effect': ['extra'],
      'next': ['extra'],
      'list': ['list'],
      '@global': ['formula_extra', 'group', {
        name: 'history',
        validation: b => b.attrs['target_branch'] === void 0
      }]
    };
    const searchSuffixList = (cur_bch, bch) => {
      return [cur_bch.name, '@global'].find(name => {
        const p = suffixBranchList[name];

        return p && p.find(a => typeof a != 'object' ?
          a == bch.name :
          a.name == bch.name && a.validation(bch));
      });
    };

    // 建立@parent-branch指標
    state.branchs.forEach(b => b.attrs['@parent-branch'] = b);

    /**
     * [重置branchs]
     * 將suffix branch串到main branch上，
     * 將vitual branch移除並處理。
     */
    const resBranchs = [];
    state.branchs.forEach(bch => {
      const curBranch = resBranchs.length != 0 ? resBranchs[resBranchs.length - 1] : null;

      if (!curBranch) {
        // 防呆
        const list = ['damage', 'effect', 'proration', 'next', 'list',
          'passive', 'heal', 'text', 'tips', 'stack', 'reference', 'history', 'import'
        ];
        list.includes(bch.name) && resBranchs.push(bch);
        return;
      }
      if (searchSuffixList(curBranch, bch)) {
        bch.mainBranch = curBranch;
        curBranch.suffix.push(bch);
      } else
        resBranchs.push(bch);
    });

    const vitualBranchList = ['history'];

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
        // if (p.name == 'history') {
        //   bch.history.push(createHistoryData(p, true));
        //   return false;
        // }
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

    // console.log('state.branchs: ', state.branchs);

    // store stacks value
    const stackStates = state.branchs.filter(b => b.name == 'stack')
      .map(b => ({
        id: b.attrs['id'],
        value: parseInt(b.attrs['default'] == 'auto' ? b.attrs['min'] : b.attrs['default'], 10)
      }));
    state.stackStates = stackStates;

    // handle history
    state.branchs.forEach(bch => {
      bch.history.sort((a, b) => new Date(b.date) >= new Date(a.date) ? 1 : -1);
      bch.history.forEach(a => {
        a.branch.name = bch.name;
        a.branch.suffix = bch.suffix;
      });
      [bch, ...bch.history.map(a => a.branch)].forEach((his, idx, ary) => {
        if (idx == ary.length - 1)
          return;
        const target = ary[idx + 1],
          from = his;

        Object.keys(from.attrs).forEach(k => {
          const value = target.attrs[k];
          if (value === void 0)
            target.attrs[k] = from.attrs[k];
          else if (value == '')
            delete target.attrs[k];
        });

        from.stats.forEach(stat => {
          const idx = target.stats.findIndex(a => a.equals(stat));
          if (idx == -1)
            target.stats.push(stat.copy());
          else if (target.stats[idx].statValue() == '')
            target.stats.splice(idx, 1);
        });
      });
    });

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
      'element': 'none',
      'judgment': 'common',
      'frequency_judgment': 'auto',
      'unsheathe_damage': '0',
      'range_damage': 'none',
      'is_place': '0',
      'radius': '1',
      'start_position_offsets': '0',
      'end_position_offsets': '0'
    },
    'proration': {
      'proration': 'auto'
    },
    'effect': {
      'condition': 'auto',
      'type': 'self',
      'is_place': '0',
      'radius': '1'
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
    branch['@is-default-list'] = p ? _sd(branch.attrs, p) : [];
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