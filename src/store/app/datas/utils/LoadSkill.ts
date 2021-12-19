
import Grimoire from '@/shared/Grimoire';
import { HandleLanguageData } from '@/shared/services/Language';

import SkillSystem from '@/lib/Skill';
import { SkillElement, SkillTreeCategory, SkillTree, Skill, SkillBranch, SkillEffect } from '@/lib/Skill/Skill';
import type { SkillEffectBase } from '@/lib/Skill/Skill';
import { SkillBranchNames } from '@/lib/Skill/Skill/enums';

import type { CsvData, LangCsvData } from './DownloadDatas';

function loadSkill(skillSystem: SkillSystem, datas: LangCsvData) {
  const sr = skillSystem.skillRoot;

  const
    /* all */
    ID = 0,
    CONFIRM = 1,
    /* Skill */
    NAME = 1,
    DEFAULT_SET = 2,
    DEFAULT_SET_LIST = ['預設', '非預設', '預設/and', '非預設/and', '歷史紀錄'],
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
    },
    HISTORY_EFFECT = {
      TARGET_EFFECT_ID: 3,
      DATE: 4,
    };

  let curElement: string = '';
  let curSkillTreeCategory: SkillTreeCategory;
  let curSkillTree: SkillTree;
  let curSkill: Skill;
  let curSkillEffect: SkillEffectBase | void;
  let curSkillBranch: SkillBranch;

  // language data
  HandleLanguageData(datas, {
    [EFFECT_BRANCH_ATTRIBUTE_VALUE]: LANG_DATA.EFFECT_BRANCH_ATTRIBUTE_VALUE,
  });
  const csvData = datas[0];

  const checkNull = <T extends number | string>(value: T, nullValue: T) => {
    return value === nullValue ? null : value;
  };

  csvData.forEach(function (row, index) {
    try {
      if (index === 0 || row.every(item => item === '')) {
        return;
      }
      //console.log(row);

      const id = row[ID] !== '' ? parseInt(row[ID], 10) : null;
      if (id !== null) {
        const confirmName = row[CONFIRM];
        if (confirmName === CONFIRM_SKILL_TREE_CATEGORY) {
          const name = row[SKILL_TREE_CATEGORY_NAME];
          curSkillTreeCategory = sr.appendSkillTreeCategory(id, name);
          curElement = 'tree-category';
        } else if (confirmName === CONFIRM_SKILL_TREE) {
          const name = row[SKILL_TREE_NAME];
          curSkillTree = curSkillTreeCategory.appendSkillTree(id, name);
          curElement = 'tree';
          if (row[SKILL_TREE_SIMULATOR_FLAG])
            curSkillTree.attrs.simulatorFlag = true;
        } else {
          if (confirmName !== '') {
            const name = row[NAME];
            curSkill = curSkillTree.appendSkill(id, name);
            curElement = 'skill';
          }

          const mainWeapon = MAIN_WEAPON_LIST.indexOf(row[MAIN_WEAPON]),
            subWeapon = SUB_WEAPON_LIST.indexOf(row[SUB_WEAPON]),
            bodyArmor = BODY_ARMOR_LIST.indexOf(row[BODY_ARMOR]),
            defaultSelected = DEFAULT_SET_LIST.indexOf(row[DEFAULT_SET]);
          if (defaultSelected === -1) {
            return;
          }
          curSkillEffect = defaultSelected !== 4 ?
            curSkill.appendSkillEffect(mainWeapon, subWeapon, bodyArmor) :
            curSkill.appendSkillEffectHistory(parseInt(row[HISTORY_EFFECT.TARGET_EFFECT_ID], 10), row[HISTORY_EFFECT.DATE]);
          curElement = 'effect';
          if (curSkillEffect && curSkillEffect instanceof SkillEffect) {
            if (defaultSelected === 0 || defaultSelected === 2) {
              curSkill.setDefaultEffect(curSkillEffect);
            }
            if (defaultSelected === 2 || defaultSelected === 3) {
              curSkillEffect.equipmentOperator = 1;
            }
            curSkillEffect.attributes.mpCost = checkNull(row[MP_COST], '');
            curSkillEffect.attributes.range = checkNull(row[RANGE], '');
            curSkillEffect.attributes.skillType = checkNull(SKILL_TYPE_LIST.indexOf(row[SKILL_TYPE]), -1);
            curSkillEffect.attributes.inCombo = checkNull(IN_COMBO_LIST.indexOf(row[IN_COMBO]), -1);
            curSkillEffect.attributes.actionTime = checkNull(ACTION_TIME_LIST.indexOf(row[ACTION_TIME]), -1);
            curSkillEffect.attributes.castingTime = checkNull(row[CASTING_TIME], '');
          }
        }
      }
      if (curElement !== 'effect' || !curSkillEffect) {
        return;
      }
      const bid = row[EFFECT_BRANCH_NO] || null;
      if (bid !== null) {
        const bidNum: number = bid === '-' ? -1 : parseInt(row[EFFECT_BRANCH_NO], 10);
        const bname = row[EFFECT_BRANCH_NAME];
        curSkillBranch = curSkillEffect.appendSkillBranch(bidNum, bname as SkillBranchNames);
      }
      const propName = row[EFFECT_BRANCH_ATTRIBUTE_NAME],
        propValue = row[EFFECT_BRANCH_ATTRIBUTE_VALUE];
      if (propName !== '') {
        if (!Grimoire.Character.findStatBase(propName))
          curSkillBranch.appendBranchAttribute(propName, propValue);
        else
          curSkillBranch.appendStat(propName, propValue, row[EFFECT_BRANCH_ATTRIBUTE_EXTRA]);
      }
    }
    catch (e) {
      // console.warn('[Error] When Load Skill Data');
      //console.log(e);
      // console.log(row);
    }
  });
}


function loadSkillMain(skillSystem: SkillSystem, datas: LangCsvData) {
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

  let curSkillTreeCategory: SkillTreeCategory;
  let curSkillTree: SkillTree;
  const [csvData, primaryLangCsvData, secondaryLangCsvData] = datas;

  const loadLangData = (cat: string, target: SkillElement, index: number) => {
    const data = primaryLangCsvData ? primaryLangCsvData[index] : null,
      sdata = secondaryLangCsvData ? secondaryLangCsvData[index] : null;
    const key = (() => {
      if (cat === CONFIRM_SKILL_TREE_CATEGORY)
        return LANG_DATA.CATEGORY_NAME;
      if (cat === CONFIRM_SKILL_TREE)
        return LANG_DATA.SKILL_TREE_NAME;
      return LANG_DATA.SKILL_NAME;
    })();
    const validDatas = [data, sdata].filter(item => item) as CsvData;
    validDatas.some(item => {
      const name = item[key];
      if (name) {
        target.name = name;
        return true;
      }
    });
  };

  csvData.forEach((row, idx) => {
    if (idx === 0 || row[ID] === '')
      return;
    try {
      const cat = row[CATEGORY], id = parseInt(row[ID], 10);
      if (cat === CONFIRM_SKILL_TREE_CATEGORY) {
        const find = sr.skillTreeCategorys.find(a => a.id === id);
        if (find) {
          curSkillTreeCategory = find;
          loadLangData(cat, curSkillTreeCategory, idx);
        }
      } else if (cat === CONFIRM_SKILL_TREE) {
        const find = curSkillTreeCategory.skillTrees.find(a => a.id === id);
        if (find) {
          curSkillTree = find;
          curSkillTree.init(row[SKILL_TREE_DRAW_TREE_CODE]);
          loadLangData(cat, curSkillTree, idx);
        }
      } else if (cat === '') {
        const find = curSkillTree.skills.find(a => a.id === id);
        if (find) {
          find.init(
            row[PREVIOUS_SKILL] === '-' ? -1 : parseInt(row[PREVIOUS_SKILL], 10),
            parseInt(row[DRAW_SKILL_TREE_ORDER], 10),
          );
          loadLangData(cat, find, idx);
        }
      }
    }
    catch (error) {
      console.groupCollapsed('[LoadSkillMain] unknown error');
      console.warn(error);
      console.warn(row);
      console.groupEnd();
    }
  });
}


export { loadSkill, loadSkillMain };
