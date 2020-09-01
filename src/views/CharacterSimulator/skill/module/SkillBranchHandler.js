import handleFormula from "@views/SkillQuery/module/handleFormula.js";
import DataContainer from "@views/SkillQuery/module/DataContainer.js";

import { EquipmentField } from "@lib/CharacterSystem/CharacterStat/class/main.js";
import { SubWeapon, SubArmor } from "@lib/CharacterSystem/CharacterStat/class/CharacterEquipment.js";

class SkillBranchHandler {
  constructor({ branch, skillState, levelSkill, langText, characterState, findCharacterStatResult, skillItemType }) {
    this.branch = branch;
    this.skillState = skillState;
    this.levelSkill = levelSkill;
    this.langText = langText;
    this.characterState = characterState;
    this.findCharacterStatResult = findCharacterStatResult;
    this.skillItemType = skillItemType;

    this.userSets = (() => {
      const res = [];

      const formulaExtra = this.branch.suffix.find(suf => suf.name == 'formula_extra');
      if (formulaExtra) {
        const texts = formulaExtra.attrs['texts'].split(/\s*,\s*/);
        res.push(...texts.map((text, i) => ({
          text,
          value: 0,
          variableName: this.formulaExtraVariableName(i),
          disable: false,
          ignore: false
        })));
      }

      res.push({
        text: this.langText('skill management/formula text/target_def'),
        value: 0,
        variableName: 'target_def',
        disable: true,
        ignore: true
      }, {
        text: this.langText('skill management/formula text/target_level'),
        value: 0,
        variableName: 'target_level',
        disable: true,
        ignore: true
      });

      return res;
    })();

    const stackIds = this.branch.attrs['stack_id'] ?
      this.branch.attrs['stack_id'].split(/\s*,\s*/) : [];
    this.stackStates = stackIds.length == 0 ? [] : this.skillState.stackStates
      .filter(p => stackIds.includes(p.id))
      .map((p, i) => {
        const attrs = p.branch.attrs;
        let name = attrs['name'];
        if (name == 'auto')
          name = this.langText('skill management/default name of stack') + i;
        return {
          id: p.id,
          name,
          value: p.value,
          branch: p.branch
        };
      });

    this.stackStates.forEach(p => {
      const attrs = p.branch.attrs;
      p.range =  [
        parseInt(this.calcValueStr(attrs['min'])),
        attrs['max'] ? parseInt(this.calcValueStr(attrs['max'])) : null
      ];
    });

    this.infoType = this.branch.attrs['caption'] ? 'caption' : 'stats';
  }
  // computed
  get hasUserSets() {
    return this.stackStates.length != 0 || this.validUserSets.length != 0;
  }
  get validUserSets() {
    return this.userSets.filter(p => !p.disable);
  }

  // output method
  // captionData() {
  //   if (this.infoType != 'caption')
  //     return '';
  //   const caption = this.branch.attrs['caption']
  //     .replace(/\$\{([^}]+)\}(%?)/g, (m, m1, m2) => {
  //       const dc = new DataContainer(m1);
  //       this.handleDataContainer(dc, { beforeColorText: v => v + m2 });
  //       return dc.result();
  //     })
  //     .replace(/#([^\s]+)\s(\w?)/g, (m, m1, m2) => {
  //       let res = `<span class="light-text-2">${m1.replace(new RegExp('_', 'g'), ' ')}</span>`;
  //       if (m2 !== '')
  //         res += " " + m2;
  //       return res;
  //     })
  //     .replace(/\(\(((?:(?!\(\().)+)\)\)/g, (m, m1) => `<span class="multiple-values">${m1}</span>`);
  // }
  // statDatas() {
  //   // if (this.branch.name == 'passive') {
  //   //   return this.statTexts(this.branch.stats);
  //   // }
  //   const conditionStats = this.branch.suffix
  //     .filter(suf => suf.name == 'extra' && suf.stats.length != 0)
  //     .map((suf, i) => ({
  //       iid: i,
  //       stats: this.statTexts(suf.stats),
  //       condition: suf.attrs['condition'] || this.langText('skill management/suffix branch/condition: default')
  //     }));

  //   return {
  //     stats: this.statTexts(this.branch.stats),
  //     conditionStats
  //   };
  // }

  handleTextData(str) {
    return str
      .replace(/\$\{([^}]+)\}(%?)/g, (m, m1, m2) => {
        const dc = new DataContainer(m1);
        this.handleDataContainer(dc, { beforeColorText: v => v + m2 });
        return dc.result();
      })
      .replace(/#([^\s]+)\s(\w?)/g, (m, m1, m2) => {
        let res = `<span class="light-text-2">${m1.replace(new RegExp('_', 'g'), ' ')}</span>`;
        if (m2 !== '')
          res += " " + m2;
        return res;
      })
      .replace(/\(\(((?:(?!\(\().)+)\)\)/g, (m, m1) => `<span class="multiple-values">${m1}</span>`);
  }

  handleDatas() {
    let caption = '', stats = [];
    if (this.infoType == 'caption') {
      caption = this.handleTextData(this.branch.attrs['caption']);
    }
    else {
      stats = this.statTexts(this.branch.stats);
    }

    const conditionDatas = this.branch.suffix
      .filter(suf => suf.name == 'extra')
      .map((suf, i) => {
        let _stats = [], _caption = '';
        if (suf.stats.length != 0)
          _stats = this.statTexts(suf.stats);
        else if (suf.attrs['caption'])
          _caption = this.handleTextData(suf.attrs['caption']);
        return {
          iid: i,
          stats: _stats,
          caption: _caption,
          condition: suf.attrs['condition'] || this.langText('skill management/suffix branch/condition: default')
        };
      })
      .filter(p => p.stats.length != 0 || p.caption);

    return {
      stats,
      caption,
      conditionDatas
    };
  }

  get value() {
    // return this.infoType == 'stats' ?
    //   this.statDatas() :
    //   this.captionData();
    return this.handleDatas();
  }

  // methods
  formulaExtraVariableName(idx) {
    return '__FORMULA_EXTRA_' + idx + '__';
  }
  statTexts(stats) {
    return stats.map((p, i) => {
      const dc = new DataContainer(p.statValue());

      let v = this.calcValueStr(dc.value());
      let sign = '+';
      // if (/^\(?-?[\d.]+\)?$/.test(v)) {
      //   v = v.replace(/\(?(-?[\d.]+)\)?/, (m, m1) => m1);
      // }
      if (v.charAt(0) == '-') {
        sign = '-';
      }

      const beforeColorText = v => sign + (sign == '-' ? v.replace('-', '') : v) + sd.tail;

      const sd = p.getShowData();
      this.handleDataContainer(dc, { beforeColorText });

      return {
        text: sd.title + dc.result(),
        value: parseFloat(v),
        origin: p,
        iid: i
      };
    });
  }
  calcValueStr(str, repeat = true) {
    if (!str)
      return str;
    const skillState = {
      clv: this.characterState.origin.level,
      slv: this.levelSkill.level()
    };
    const effectState = {
      stackStates: this.stackStates
    };

    str = str.split(/\s*,,\s*/)
      .map(p => handleFormula(p, { skillState, effectState, branch: this.branch }))
      //.map(p => p.charAt(0) == '-' ? `(${p})` : p)
      .join('+')
      .replace(/\+-/g, '-');
    return /^-?[\d.]+$/.test(str) || !repeat ? str : this.calcValueStr(str, false);
  }
  handleDataContainer(dc, { beforeColorText }={}) {
    //const numStrToPercentage = s => (100 * parseFloat(s)).toFixed(1).replace('.0', '') + '%';

    this.handleReplacedVariable(dc);
    dc.handle(v => this.calcValueStr(v));
    // dc.handleResult(v => v
    //   .replace(/([$_a-zA-Z][$_a-zA-Z0-9]*)(\*)(\d\.\d+)/g,
    //     (m, m1, m2, m3) => m1 + m2 + numStrToPercentage(m3))
    //   .replace(/\*/g, '×')
    // );

    if (!dc.isNumberValue())
      dc.handle(() => 0);
    dc.handleResult(v => v.replace(/(\d+\.)(\d{2,})/g, (m, m1, m2) => m1 + m2.slice(0, 2)));

    // dc.isNumberValue() && toPercentage && dc.handleResult(v => numStrToPercentage(v));
    this.dataResultHighlight(dc, { beforeColorText });
  }
  dataResultHighlight(dc, {
    base = 'light-text',
    stack = 'light-text-1',
    extra = [],
    beforeColorText = null
    //   <span class="light-text">
    //     extraHandle(v = "<span class="multiple-values"></span>")
    //   </span>
  } = {}) {
    const clist = [(dc.origin.includes('stack') ? stack : base), ...extra];
    dc.isNumberValue() && parseFloat(dc.value()) < 0 && clist.push('text-dark');
    //!dc.isNumberValue() && dc.handleResult(v => `<span class="multiple-values">${v}</span>`);

    beforeColorText && dc.handleResult(v => beforeColorText(v));
    dc.handleResult(v => `<span class="${clist.join(' ')}">${v}</span>`);
  }
  handleReplacedVariable(dc) {
    const findSrc = this.skillItemType == 'passive' ? 'base' : 'passive-skills';
    const chara = this.characterState.origin;
    const list = {
      'BSTR': chara.baseStatValue('STR'),
      'BINT': chara.baseStatValue('INT'),
      'BAGI': chara.baseStatValue('AGI'),
      'BVIT': chara.baseStatValue('VIT'),
      'BDEX': chara.baseStatValue('DEX'),
      'TEC': chara.baseStatValue('TEC'),
      'STR': this.findCharacterStatResult(findSrc, 'str').value,
      'INT': this.findCharacterStatResult(findSrc, 'int').value,
      'AGI': this.findCharacterStatResult(findSrc, 'agi').value,
      'VIT': this.findCharacterStatResult(findSrc, 'vit').value,
      'DEX': this.findCharacterStatResult(findSrc, 'dex').value,
      'shield_refining': chara.checkFieldEquipmentType(EquipmentField.TYPE_SUB_WEAPON, SubArmor.TYPE_SHIELD) ?
        chara.equipmentField(EquipmentField.TYPE_SUB_WEAPON).equipment.refining : 0,
      'dagger_atk': chara.checkFieldEquipmentType(EquipmentField.TYPE_SUB_WEAPON, SubWeapon.TYPE_DAGGER) ?
        chara.equipmentField(EquipmentField.TYPE_SUB_WEAPON).equipment.atk : 0,
      'target_def': () => {
        const find = this.userSets.find(p => p.variableName == 'target_def');
        find.disable = false;
        return find.value;
      },
      'target_level': () => {
        const find = this.userSets.find(p => p.variableName == 'target_level');
        find.disable = false;
        return find.value;
      },
      'guard_power': this.findCharacterStatResult(findSrc, 'guard_power').value
    };

    dc.handle(v => {
      Object.keys(list).forEach(k => {
        v = v.replace(new RegExp('\\$' + k, 'g'), list[k]);
      });
      v = v.replace(/&(\d+):/g, (m, m1) => this.formulaExtraVariableName(m1));
      this.userSets.filter(p => !p.ignore).forEach(p => {
        v = v.replace(new RegExp(p.variableName, 'g'), p.value);
      });
      return v;
    });

    return dc;
  }
}

export default SkillBranchHandler;