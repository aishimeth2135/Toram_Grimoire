import Grimoire from '@/shared/Grimoire';
import { StatBase } from '@/lib/Character/Stat';
import CY from '@/shared/utils/Cyteria';

function checkConstructorArgs() {
  Array.from(arguments).forEach((arg, i) => {
    if (arg === null || arg === undefined) {
      console.log(`argument[${i}] of Constructor is null`);
      console.log(arguments);
    }
  });
}


class SkillRoot {
  constructor() {
    this.skillTreeCategorys = [];
    this.TYPE = SkillRoot.TYPE;
  }
  newElement(type, cArgs) {
    if (type == SkillTreeCategory.TYPE) {
      const { name, id } = cArgs;
      checkConstructorArgs(id, name);
      let stc = new SkillTreeCategory(this, id, name);
      this.skillTreeCategorys.push(stc);
      return stc;
    }
    return null;
  }
  findSkillByName(name) {
    let find = undefined;
    this.skillTreeCategorys.forEach(stc => {
      if (find) return;
      stc.skillTrees.forEach(st => {
        if (find) return;
        const t = st.skills.find(skill => skill.name === name);
        if (t !== undefined)
          find = t;
      });
    });
    return find;
  }
}
SkillRoot.TYPE = Symbol('SkillRoot');


class SkillTreeCategory {
  constructor(sr, id, name) {
    this.parent = sr;
    this.id = id;
    this.name = name;
    this.skillTrees = [];
    this.TYPE = SkillTreeCategory.TYPE;
  }
  newElement(type, cArgs) {
    if (type == SkillTree.TYPE) {
      const { name, id } = cArgs;
      checkConstructorArgs(id, name);
      let st = new SkillTree(this, id, name);
      this.skillTrees.push(st);
      return st;
    }
    return null;
  }
  findLocation() {
    return this.parent.skillTreeCategorys.indexOf(this);
  }
}
SkillTreeCategory.TYPE = Symbol('SkillTreeCategory');


class SkillTree {
  constructor(stc, id, name) {
    this.parent = stc;
    this.id = id;
    this.name = name;
    this.skills = [];
    this.TYPE = SkillTree.TYPE;

    this.attrs = {
      simulatorFlag: false,
    };
  }
  init(dtc) {
    this.drawTreeCode = dtc;
  }
  newElement(type, cArgs) {
    if (type == Skill.TYPE) {
      const { name, id } = cArgs;
      checkConstructorArgs(id, name);
      let skill = new Skill(this, id, name);
      this.skills.push(skill);
      return skill;
    }
    return null;
  }
  findLocation() {
    return this.parent.skillTrees.indexOf(this);
  }
}
SkillTree.TYPE = Symbol('SkillTree');
SkillTree.CATEGORY_TABLE = Symbol();
SkillTree.CATEGORY_DRAW_TREE = Symbol();
SkillTree.CATEGORY_EQUIPMENT = Symbol();


class SkillBase {
  constructor(st, id, name, cap = '') {
    this.parent = st;
    this.id = id;
    this.name = name;
    this.caption = cap;
  }
  init(pre, drawOrder) {
    this.previous = pre;
    this.drawOrder = drawOrder;
  }
  findLocation() {
    return this.parent.skills.indexOf(this);
  }
}


class Skill extends SkillBase {
  constructor(st, id, name, cap = '') {
    super(st, id, name, cap);

    this.effects = [];
    this.defaultEffect = null;
    this.TYPE = Skill.TYPE;
  }
  newElement(type, cArgs) {
    if (type == SkillEffect.TYPE) {
      const { mainWeapon, subWeapon, bodyArmor } = cArgs;
      checkConstructorArgs(mainWeapon, subWeapon, bodyArmor);
      let effect = new SkillEffect(this, mainWeapon, subWeapon, bodyArmor);
      this.effects.push(effect);
      return effect;
    }
    return null;
  }
  setDefaultEffect(sef) {
    this.defaultEffect = sef;
    return this;
  }
  checkData() {
    return this.defaultEffect !== undefined && this.defaultEffect !== null;
  }
}
Skill.TYPE = Symbol('Skill');
Skill.CATEGORY_MAIN = Symbol();

class SkillEffect {
  constructor(sk, m, s, b) {
    this.parent = sk;
    this.branchs = [];
    this.mainWeapon = m;
    this.subWeapon = s;
    this.bodyArmor = b;
    this.attributes = {};
    this.config = {
      equipmentConfirm: 0, // 0: or, 1: and
    };
    this.TYPE = SkillEffect.TYPE;
  }
  newElement(type, cArgs) {
    if (type == SkillBranch.TYPE) {
      const id = cArgs.id;
      const name = cArgs.name;
      checkConstructorArgs(id, name);
      let branch = new SkillBranch(this, id, name);
      this.branchs.push(branch);
      return branch;
    }
    return null;
  }
  findLocation() {
    return this.parent.effects.indexOf(this);
  }
  appendAttribute(name, v) {
    if (v !== null && v !== undefined)
      this.attributes[name] = v;
    return this;
  }
  setConfig(set) {
    Object.assign(this.config, set);
    return this;
  }
}
SkillEffect.TYPE = Symbol('SkillEffect');
SkillEffect.MP_COST = Symbol('mp_cost');
SkillEffect.RANGE = Symbol('range');
SkillEffect.SKILL_TYPE = Symbol('skill_type');
SkillEffect.IN_COMBO = Symbol('in_combo');
SkillEffect.ACTION_TIME = Symbol('action_type');
SkillEffect.CASTING_TIME = Symbol('casting_time');

class SkillBranch {
  constructor(sef, id, name) {
    this.parent = sef;
    this.id = id;
    this.name = name;
    this.branchAttributes = {};
    this.stats = [];
    this.TYPE = SkillBranch.TYPE;
  }
  appendBranchAttribute(name, v) {
    this.branchAttributes[name] = v;
    return this;
  }
  findLocation() {
    return this.parent.branchs.indexOf(this);
  }
  appendStat(baseName, v, tail) {
    let type;
    switch (tail) {
    case '':
      type = StatBase.TYPE_CONSTANT;
      break;
    case '%':
      type = StatBase.TYPE_MULTIPLIER;
      break;
    case '~':
      type = StatBase.TYPE_TOTAL;
      break;
    }
    const stat = Grimoire.Character.findStatBase(baseName).createStat(type, v);
    this.stats.push(stat);
    return stat;
  }
  isEmpty() {
    return CY.object.isEmpty(this.branchAttributes) && this.stats.length == 0;
  }
}
SkillBranch.TYPE = Symbol('SkillBranch');


class LevelSkillTree {
  constructor(st) {
    this.base = st;
    this.levelSkills = [];
  }
  appendLevelSkill(skill) {
    const t = new LevelSkill(this, skill);
    this.levelSkills.push(t);
    return t;
  }
  skillPointCost() {
    return this.levelSkills.reduce((c, skill) => c + skill.level(), 0);
  }
  starGemSkillPoint() {
    return this.levelSkills
      .reduce((c, skill) => c + Math.max(0, skill.starGemLevel() - skill.level()), 0);
  }
}

class LevelSkill {
  constructor(st, skill) {
    this.parent = st;
    this.base = skill;

    this._level = 0;
    this._starGemLevel = 0;
  }
  level(v) {
    if (typeof v == 'number') {
      v < 0 && (v = 0);
      v > 10 && (v = 10);
      this._level = v;
    }
    return this._level;
  }
  addLevel(v) {
    this.level(this._level + v);
    return this._level;
  }
  updateTree(forward = false) {
    if (!forward) {
      let p = this;
      // if (p == -1), p is head of tree
      while (p.base.previous != -1) {
        p = p.parent.levelSkills.find(a => a.base.id == p.base.previous);
        if (!p) break;
        p.level() < 5 && p.level(5);
      }
    } else if (forward && this.level() < 5) {
      const skills = this.parent.levelSkills;
      let p = [this];
      while (p.length != 0) {
        const t = p.pop();
        skills.forEach(a => {
          if (a.base.previous == t.base.id) {
            p.push(a);
            a.level() > 0 && a.level(0);
          }
        });
      }
    }
  }
  starGemLevel(v) {
    if (typeof v == 'number') {
      v < 0 && (v = 0);
      v > 10 && (v = 10);
      this._starGemLevel = v;
    }

    return this._starGemLevel;
  }
  addStarGemLevel(v) {
    this.starGemLevel(this._starGemLevel + v);
    return this._starGemLevel;
  }

  get id() {
    return this.base.id;
  }
}


export { SkillRoot, SkillTreeCategory, SkillTree, Skill, SkillEffect, SkillBranch, LevelSkillTree, LevelSkill };
