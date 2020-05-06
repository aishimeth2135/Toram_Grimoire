import CY from "@global-modules/cyteria.js";

export default function(skill, equipmentState){
  const defSef = skill.defaultEffect;

  const branchs = defSef.branchs.map((p, i) => ({
    iid: i,
    id: p.id,
    name: p.name,
    attrs: Object.assign({}, p.branchAttributes),
    stats: p.stats.map(p => p.copy())
  }));

  const state = {
    branchs,
    attrs: Object.assign({}, defSef.attributes)
  };

  // 尋找符合裝備的 effect
  const overwriteSef = skill.effects.find(p => checkEquipment(p, equipmentState));

  const branchEmpty = b => CY.object.isEmpty(b.branchAttributes) && b.stats.length == 0;

  // 執行覆蓋
  Object.getOwnPropertySymbols(overwriteSef.attributes).forEach(k => {
    const value = overwriteSef.attributes[k];
    // 空值就移除
    value == '' && state.attrs[k] ? delete state.attrs[k] : state.attrs[k] = value;

    overwriteSef.branchs.forEach(branch => {
      const idx = state.branchs.findIndex(b => b.id != '-' && b.id == branch.id);
      const p = idx != -1 ? state.branchs[idx] : null;
      // ==== p: original branch ====
      
      if ( !p )
        return;

      // 如果 branch.id 一樣但 branch.name 為空值且isEmpty。去除此 branch。
      if ( branch.name === '' && branchEmpty(p) ){
        state.branchs.splice(idx, 1);
        return;
      }

      // 如果 branch.id 一樣但 branch.name 不一樣，先清空所有屬性。branch.name 為空值時，默認兩者同名。
      if ( branch.name !== '' && p.name != branch.name ){
        p.name = branch.name;
        CY.object.empty(p.attrs);
      }

      Object.keys(branch.branchAttributes).forEach(_k => {
        const _value = branch.branchAttributes[_k];
        _value == '' && p.attrs[_k] ? delete p.attrs[_k] : p.attrs[_k] = _value;
      });

      branch.stats.forEach(stat => {
        let _idx = p.stats.findIndex(b => stat.equals(b));
        let findStat = p.stats[_idx];
        if ( _idx == -1 )
          p.stats.push(stat.copy());
        else
          stat.value === '' ? p.stats.splice(_idx, 0) : findStat.statValue(stat.value);
      });
    });
  });

  // init of branch values
  setBranchAttributeDefault(state.branchs);

  const stack = state.branchs.filter(b => b.name == 'stack')
    .map(b => ({
      id: b.attrs['id'],
      value: b.attrs['default'] || b.attrs['default'] == 0 ? b.attrs['default'] : b.attrs['min']
    }));

  return state;
}

function setBranchAttributeDefault(branchs){
  const _sd = (target, def) => {
    Object.keys(def).forEach(k => {
      const list = [];
      if ( target[k] === void 0 ){
        target[k] = def[k];
        list.push(k);
      }
      target['@--is-default-list'] = list;
    });
  };

  const def_list = {
      'damage': {
        'constant': '0', 'multiplier': '0',
        'type': 'single', 'damage_type': 'physical',
        'base': 'auto', 'frequency': '1',
        'end_position': 'target',
        'effective_area': 'circle',
        'title': 'normal', 'judgment': 'common',
        'element': 'none', 'is_place': '0'
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
        'target': 'self', 'frequency': '1',
        'constant': '0'
      },
      'list': {
        'is_tips': '0'
      },
      'stack': {
        'min': '0', 'default': 'auto',
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
    p && _sd(branch.attrs, p);
  });
}

function checkEquipment(eft, equip){
  /* 通用 */
  if ( [eft.mainWeapon, eft.subWeapon, eft.bodyArmor].every(p => p == -1) )
    return true;

  /* 非通用 */

  // or
  if ( eft.config.equipmentConfirm === 0 ){
    if ( equip.mainWeapon != -1 && equip.mainWeapon == eft.mainWeapon || (eft.mainWeapon === 0 && equip.mainWeapon === 9 && eft.parent.effects.find(a => a.mainWeapon == 9) === void 0) )
      return true;
    if ( equip.subWeapon != -1 && equip.subWeapon == eft.subWeapon )
      return true;
    if ( equip.bodyArmor != -1 && equip.bodyArmor == eft.bodyArmor )
      return true;
    return false;
  }

  // and
  if ( eft.config.equipmentConfirm === 1 ){
    if ( equip.mainWeapon != eft.mainWeapon || (eft.mainWeapon === 0 && equip.mainWeapon === 9 && eft.parent.effects.find(a => a.mainWeapon == 9) !== void 0) )
      return false;
    if ( equip.subWeapon != eft.subWeapon )
      return false;
    if ( equip.bodyArmor != eft.bodyArmor )
      return false;
    return true;
  }
}