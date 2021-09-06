import Grimoire from '@/shared/Grimoire';
import { HandleLanguageData } from '@/shared/services/Language';

import { SkillTreeCategory, SkillTree, Skill, SkillEffect, SkillBranch } from '@/lib/Skill/Skill';

function loadSkill(skillSystem, datas) {
  const sr = skillSystem.skillRoot;

  const
    /* all */
    ID = 0,
    CONFIRM = 1,
    /* Skill */
    NAME = 1,
    DEFAULT_SET = 2,
    DEFAULT_SET_LIST = ['預設', '非預設', '預設/and', '非預設/and'],
    MAIN_WEAPON = 3,
    SUB_WEAPON = 4,
    BODY_ARMOR = 5,
    MAIN_WEAPON_LIST = ['空手', '單手劍', '雙手劍', '弓', '弩', '法杖', '魔導具', '拳套', '旋風槍', '拔刀劍', '雙劍'],
    SUB_WEAPON_LIST = ['無裝備', '箭矢', '盾牌', '小刀', '魔導具', '拳套', '拔刀劍', '忍術卷軸'],
    BODY_ARMOR_LIST = ['無裝備', '輕量化', '重量化', '一般'],
    EFFECT_BRANCH_NO = 6,
    EFFECT_BRANCH_NAME = 7,
    EFFECT_BRANCH_ATTRIBUTE_NAME = 8,
    EFFECT_BRANCH_ATTRIBUTE_VALUE = 9,
    EFFECT_BRANCH_ATTRIBUTE_EXTRA = 10,
    MP_COST = 11,
    RANGE = 12,
    SKILL_TYPE = 13,
    IN_COMBO = 14,
    ACTION_TIME = 15,
    CASTING_TIME = 16,
    SKILL_TYPE_LIST = ['瞬發', '須詠唱', '須蓄力', '被動', 'EX技能'],
    IN_COMBO_LIST = ['可以放入連擊', '無法放入連擊', '不可放入連擊的第一招'],
    ACTION_TIME_LIST = ['極慢', '慢', '稍慢', '一般', '稍快', '快', '極快'],
    /* Skill Tree Category */
    CONFIRM_SKILL_TREE_CATEGORY = '0',
    SKILL_TREE_CATEGORY_NAME = 2,
    /* Skill Tree */
    CONFIRM_SKILL_TREE = '1',
    SKILL_TREE_NAME = 2,
    SKILL_TREE_SIMULATOR_FLAG = 3,
    /* Language Data */
    LANG_DATA = {
      EFFECT_BRANCH_ATTRIBUTE_VALUE: 0,
    };

  let cur = null;

  const SKILL_ELEMENT_ORDER = [
    SkillTreeCategory.TYPE,
    SkillTree.TYPE,
    Skill.TYPE,
    SkillEffect.TYPE,
    SkillBranch.TYPE,
  ];

  function _TreeBack(se, se_type) {
    if (SKILL_ELEMENT_ORDER.indexOf(se.TYPE) <= SKILL_ELEMENT_ORDER.indexOf(se_type))
      return se;
    while (se.TYPE !== se_type)
      se = se.parent;
    return se;
  }
  function _nullConfirm(v, null_v) {
    if (v === null_v)
      return null;
    return v;
  }
  function SetEffectDefault(sef, v, parent) {
    switch (v) {
    case 2:
    case 3:
      sef.setConfig({ equipmentConfirm: 1 });
      if (v !== 2) break;
      // fall through
    case 0:
      parent.setDefaultEffect(sef);
    }
  }

  // language data
  HandleLanguageData(datas, {
    [EFFECT_BRANCH_ATTRIBUTE_VALUE]: LANG_DATA.EFFECT_BRANCH_ATTRIBUTE_VALUE,
  });
  const c = datas[0];

  c.forEach(function (p, index) {
    try {
      if (index === 0) return;
      //console.log(p);

      let id = p[ID];
      if (id !== '') {
        const confirm_name = p[CONFIRM];
        id = parseInt(p[ID], 10);
        switch (confirm_name) {
        case CONFIRM_SKILL_TREE_CATEGORY: {
          const name = p[SKILL_TREE_CATEGORY_NAME];
          cur = sr.newElement(SkillTreeCategory.TYPE, { id, name });
        } break;
        case CONFIRM_SKILL_TREE: {
          cur = _TreeBack(cur, SkillTreeCategory.TYPE);
          const name = p[SKILL_TREE_NAME];
          cur = cur.newElement(SkillTree.TYPE, { id, name });
          if (p[SKILL_TREE_SIMULATOR_FLAG])
            cur.attrs.simulatorFlag = true;
        } break;
        default: {
          if (confirm_name != '') {
            cur = _TreeBack(cur, SkillTree.TYPE);
            const name = p[NAME];
            cur = cur.newElement(Skill.TYPE, { id, name });
          }
        }
        // fall through
        case '': {
          const mainWeapon = MAIN_WEAPON_LIST.indexOf(p[MAIN_WEAPON]),
            subWeapon = SUB_WEAPON_LIST.indexOf(p[SUB_WEAPON]),
            bodyArmor = BODY_ARMOR_LIST.indexOf(p[BODY_ARMOR]),
            default_set = DEFAULT_SET_LIST.indexOf(p[DEFAULT_SET]);
          if (default_set === -1)
            return;
          cur = _TreeBack(cur, Skill.TYPE);
          const sef = cur.newElement(SkillEffect.TYPE, { mainWeapon, subWeapon, bodyArmor });
          SetEffectDefault(sef, default_set, cur);

          cur = sef
            .appendAttribute(SkillEffect.MP_COST, _nullConfirm(p[MP_COST], ''))
            .appendAttribute(SkillEffect.RANGE, _nullConfirm(p[RANGE], ''))
            .appendAttribute(SkillEffect.SKILL_TYPE, _nullConfirm(SKILL_TYPE_LIST.indexOf(p[SKILL_TYPE]), -1))
            .appendAttribute(SkillEffect.IN_COMBO, _nullConfirm(IN_COMBO_LIST.indexOf(p[IN_COMBO]), -1))
            .appendAttribute(SkillEffect.ACTION_TIME, _nullConfirm(ACTION_TIME_LIST.indexOf(p[ACTION_TIME]), -1))
            .appendAttribute(SkillEffect.CASTING_TIME, _nullConfirm(p[CASTING_TIME], ''));
        }
        }
      }
      if (SKILL_ELEMENT_ORDER.indexOf(cur.TYPE) < SKILL_ELEMENT_ORDER.indexOf(SkillEffect.TYPE))
        return;
      const bno = p[EFFECT_BRANCH_NO];
      if (bno !== '') {
        cur = _TreeBack(cur, SkillEffect.TYPE);
        const bname = p[EFFECT_BRANCH_NAME];
        cur = cur.newElement(SkillBranch.TYPE, { id: bno, name: bname });
      }
      const battrname = p[EFFECT_BRANCH_ATTRIBUTE_NAME],
        battrvalue = p[EFFECT_BRANCH_ATTRIBUTE_VALUE];
      if (battrname != '') {
        if (!Grimoire.Character.findStatBase(battrname))
          cur.appendBranchAttribute(battrname, battrvalue);
        else
          cur.appendStat(battrname, battrvalue, p[EFFECT_BRANCH_ATTRIBUTE_EXTRA]);
      }
    }
    catch (e) {
      // console.warn('[Error] When Load Skill Data');
      //console.log(e);
      // console.log(p);
    }
  });
}


function loadSkillMain(skillSystem, datas) {
  const sr = skillSystem.skillRoot;

  const CATEGORY = 0,
    ID = 1,
    PREVIOUS_SKILL = 2,
    DRAW_SKILL_TREE_ORDER = 3,
    CONFIRM_SKILL_TREE_CATEGORY = '0',
    CONFIRM_SKILL_TREE = '1',
    SKILL_TREE_DRAW_TREE_CODE = 3,
    LANG_DATA = {
      CATEGORY_NAME: 0,
      SKILL_TREE_NAME: 0,
      SKILL_NAME: 0,
    };

  let cur_stc, cur_st;
  const [c, lang_c, slang_c] = datas;

  const loadLangData = (cat, target, index) => {
    const data = lang_c ? lang_c[index] : null,
      sdata = slang_c ? slang_c[index] : null;
    switch (cat) {
    case CONFIRM_SKILL_TREE_CATEGORY:
      [data, sdata].find(t => {
        if (!t)
          return;
        const name = t[LANG_DATA.CATEGORY_NAME];
        if (name) {
          target.name = name;
          return true;
        }
      });
      break;
    case CONFIRM_SKILL_TREE:
      [data, sdata].find(t => {
        if (!t)
          return;
        const name = t[LANG_DATA.SKILL_TREE_NAME];
        if (name) {
          target.name = name;
          return true;
        }
      });
      break;
    case '':
      [data, sdata].find(t => {
        if (!t)
          return;
        const name = t[LANG_DATA.SKILL_NAME];
        if (name) {
          target.name = name;
          return true;
        }
      });
    }
  };

  c.forEach((p, i) => {
    if (i === 0 || p[ID] === '')
      return;
    try {
      const cat = p[CATEGORY], id = parseInt(p[ID], 10);
      switch (cat) {
      case CONFIRM_SKILL_TREE_CATEGORY:
        cur_stc = sr.skillTreeCategorys.find(a => a.id == id);
        loadLangData(cat, cur_stc, i);
        break;
      case CONFIRM_SKILL_TREE:
        cur_st = cur_stc.skillTrees.find(a => a.id == id);
        cur_st.init(p[SKILL_TREE_DRAW_TREE_CODE]);
        loadLangData(cat, cur_st, i);
        break;
      case '': {
        const skill = cur_st.skills.find(a => a.id == id);
        skill.init(
          p[PREVIOUS_SKILL] === '-' ? -1 : parseInt(p[PREVIOUS_SKILL], 10),
          parseInt(p[DRAW_SKILL_TREE_ORDER]),
        );
        loadLangData(cat, skill, i);
      }
      }
    }
    catch (e) {
      console.warn('[Error] When Load Skill Main Data');
      console.log(e);
      console.log(p);
    }
  });
}


export { loadSkill, loadSkillMain };
