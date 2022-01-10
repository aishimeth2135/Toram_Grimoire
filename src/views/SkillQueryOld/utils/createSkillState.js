
import CY from '@/shared/utils/Cyteria';
import { handleFormula } from '@/shared/utils/data';

export default function(skill, { defaultSkillLevel = 0, defaultCharacterLevel = 0 } = {}) {
  return {
    skill,
    slv: defaultSkillLevel,
    clv: defaultCharacterLevel,
    ...handleSkillState(skill, { vars: { slv: defaultSkillLevel, clv: defaultCharacterLevel } }),
  };
}

function handleSkillState(skill, { vars }) {
  const defSef = skill.defaultEffect;

  const states = [];

  const createState = sef => {
    const branches = defSef.branches.map((branch, i) => ({
      iid: i,
      id: branch.id,
      name: branch.name,
      attrs: Object.assign({}, branch.branchAttributes),
      stats: branch.stats.map(stat => stat.clone()),
      group: null,
      history: [],
      suffix: [],
      empty: false,
      visible: true,
      isGroupTail: false,
      '@parent-state': null,
      '@is-default-list': [],
      '@delete-list': [],
      '@overwrite-list': [],
      '@stat-delete-list': [],
      '@stat-overwrite-list': [],
    }));

    const equipment = {
      main: sef.mainWeapon,
      sub: sef.subWeapon,
      body: sef.bodyArmor,
      operator: sef.equipmentOperator,
    };

    const state = {
      branches,
      attrs: Object.assign({}, defSef.attributes),
      equipment,
      historyList: [],
      stackStates: [],
      currentHistoryIdx: -1,
    };

    return state;
  };

  const convertStateAttrs = st => {
    st.attrs = {
      'mp_cost': st.attrs.mpCost,
      'range': st.attrs.range,
      'skill_type': st.attrs.skillType,
      'in_combo': st.attrs.inCombo,
      'action_time': st.attrs.actionTime,
      'casting_time': st.attrs.castingTime,
    };
  };

  const branchEmpty = b => CY.object.isEmpty(b.branchAttributes) && b.stats.length === 0;

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
      if (idx === -1) {
        target.stats.push(stat.clone());
        target['@stat-overwrite-list'].push(stat.baseName);
      } else {
        if (stat.value === '') {
          target.stats.splice(idx, 1);
          target['@stat-delete-list'].push(stat.baseName);
        } else {
          findStat.value = stat.value;
          target['@stat-overwrite-list'].push(stat.baseName);
        }
      }
    });
  };

  const createHistoryData = (bch, hiddenFlag) => {
    bch.attrs['@history-date'] = bch.attrs['date'];
    return {
      date: bch.attrs['date'],
      branch: bch,
      hiddenFlag,
    };
  };

  skill.effects.forEach(overwriteSef => {
    const state = createState(overwriteSef);

    if (overwriteSef !== defSef) {
      // 執行覆蓋
      Object.keys(overwriteSef.attributes).forEach(k => {
        const value = overwriteSef.attributes[k];
        // 空值就移除
        if (value !== null) {
          state.attrs[k] = value;
        }
      });

      overwriteSef.branches.forEach(branch => {
        const idx = state.branches.findIndex(b => b.id != '-' && b.id == branch.id);
        const p = idx !== -1 ? state.branches[idx] : null;
        // ==== p: original branch ====

        if (!p)
          return false;

        // 如果 branch.id 一樣但 branch.name 為空值且isEmpty。去除此 branch。
        if (branch.name === '' && branchEmpty(branch)) {
          state.branches.splice(idx, 1);
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

    state.branches = state.branches
      .filter(p => !(CY.object.isEmpty(p.attrs) && p.stats.length === 0));
    state.branches.forEach(p => p['@parent-state'] = state);

    // init of state attrs
    convertStateAttrs(state);

    // init of branch values
    setBranchAttributeDefault(state.branches);

    // create list of history.date
    state.historyList = [...new Set(
      state.branches
        .filter(p => p.name === 'history')
        .map(p => p.attrs['date'])
        .filter(p => /\d{4}\/\d{2}\/\d{2}/.test(p)),
    )]
      .sort((a, b) => new Date(b) >= new Date(a) ? 1 : -1);

    // suffix
    const suffixBranchList = {
      'damage': ['extra', 'proration', 'base'],
      'effect': ['extra'],
      'next': ['extra'],
      'passive': ['extra'],
      'list': ['list'],
      '@global': ['formula_extra', 'group', {
        name: 'history',
        validation: b => b.attrs['target_branch'] === undefined,
      }],
    };
    const searchSuffixList = (cur_bch, bch) => {
      return [cur_bch.name, '@global'].find(name => {
        const p = suffixBranchList[name];

        return p && p.find(a => typeof a !== 'object' ?
          a == bch.name :
          a.name == bch.name && a.validation(bch));
      });
    };

    // 建立@parent-branch指標
    state.branches.forEach(b => b.attrs['@parent-branch'] = b);

    /**
     * [重置branchs]
     * 將suffix branch串到main branch上，
     * 將vitual branch移除並處理。
     */

    const mainBranchNameList = ['damage', 'effect', 'proration', 'next', 'list',
      'passive', 'heal', 'text', 'tips', 'stack', 'reference', 'history', 'import',
      'basic',
    ];
    const isMainBranch = _bch => mainBranchNameList.includes(_bch.name);
    const resBranchs = [];
    let space_flag = false;
    state.branches.forEach(bch => {
      if (bch.name == 'space') {
        space_flag = true;
        return;
      }

      const curBranch = resBranchs.length != 0 ? resBranchs[resBranchs.length - 1] : null;

      if (!curBranch && isMainBranch(bch)) {
        resBranchs.push(bch);
        return;
      }
      if (!curBranch) {
        return;
      }
      if (!space_flag && searchSuffixList(curBranch, bch)) {
        bch.mainBranch = curBranch;
        curBranch.suffix.push(bch);
      } else if (isMainBranch(bch)) {
        resBranchs.push(bch);
        space_flag = false;
      }
    });

    const vitualBranchList = ['history'];

    state.branches = resBranchs.filter(bch => {
      // handle group
      bch.suffix = bch.suffix.filter(p => {
        if (p.name == 'group') {
          bch.group = {
            size: parseInt(p.attrs['size'], 10),
            expandable: p.attrs['expandable'] == 1,
            expansion: p.attrs['expansion_default'] == 1,
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

    // console.log('state.branches: ', state.branches);

    // store stacks value
    const stackStates = state.branches.filter(b => b.name === 'stack')
      .map(b => ({
        id: b.attrs['id'],
        branch: b,
        value: handleFormula(b.attrs['default'] === 'auto' ? b.attrs['min'] : b.attrs['default'], {
          vars: {
            'SLv': vars.slv,
            'CLv': vars.clv,
          },
          toNumber: true,
        }),
      }));
    state.stackStates = stackStates;

    // handle history
    state.branches.forEach(bch => {
      bch.history.sort((a, b) => new Date(b.date) >= new Date(a.date) ? 1 : -1);
      bch.history.forEach(a => {
        a.branch.name = bch.name;
        a.branch.suffix = bch.suffix;
      });
      [bch, ...bch.history.map(a => a.branch)].forEach((his, idx, ary) => {
        if (idx === ary.length - 1)
          return;
        const target = ary[idx + 1],
          from = his;

        Object.keys(from.attrs).forEach(k => {
          const value = target.attrs[k];
          if (value === undefined)
            target.attrs[k] = from.attrs[k];
          else if (value == '')
            delete target.attrs[k];
        });

        from.stats.forEach(stat => {
          const statIdx = target.stats.findIndex(a => a.equals(stat));
          if (statIdx === -1)
            target.stats.push(stat.clone());
          else if (target.stats[statIdx].value === '')
            target.stats.splice(statIdx, 1);
        });
      });
    });

    states.push(state);
  });

  return {
    states,
  };
}

function setBranchAttributeDefault(branches) {
  const _sd = (target, def) => {
    const list = [];
    Object.keys(def).forEach(k => {
      if (target[k] === undefined) {
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
  };

  branches.forEach(branch => {
    const p = def_list[branch.name];
    branch['@is-default-list'] = p ? _sd(branch.attrs, p) : [];
  });
}