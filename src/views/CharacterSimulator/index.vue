<template>
  <div class="main--character-simulator">
    <template v-if="currentCharacterState">
      <div class="main">
        <character v-if="currentContentIndex == 0"
          :character-state="currentCharacterState"
          @create-character="createCharacter" />
        <character-stats v-if="currentContentIndex == 1"
          :character-state="currentCharacterState"
          :show-character-stat-datas="showCharacterStatDatas" />
        <keep-alive>
          <equipment-fields v-if="currentContentIndex == 2" :character-state="currentCharacterState" />
        </keep-alive>
        <keep-alive>
          <skills v-if="currentContentIndex == 3"
            :character-state="currentCharacterState"
            :passive-skill-states="passiveSkillStates"
            :active-skill-states="activeSkillStates" />
        </keep-alive>
        <food-build v-if="currentContentIndex == 4" />
        <save-load v-if="currentContentIndex == 5"
          @manual-auto-save="autoSave"
          @manual-auto-load="autoLoad"
          @close-auto-save="closeAutoSave" />
      </div>
      <div class="sticky bottom-2 bg-white border-1 border-solid border-light-2 rounded-2xl px-4 py-1 z-10 mx-2 mt-4">
        <cy-button v-for="(content, i) in contents"
          :key="content.id"
          :iconify-name="content.icon"
          :selected="i == currentContentIndex"
          @click="setCurrentContent(i)"
          class="border-0 p-0 mr-3">
          {{ content.text }}
        </cy-button>
      </div>
    </template>
    <div v-else>
      <cy-default-tips iconify-name="mdi-ghost">
        <span v-html="$lang('Warn/Current character is not exist')"></span>
      </cy-default-tips>
      <div style="text-align: center;">
        <cy-button iconify-name="ic-round-add" type="border"
          @click="createCharacter">
          {{ $lang('append character') }}
        </cy-button>
      </div>
    </div>
  </div>
</template>
<script>
import Vuex from "vuex";

import MessageNotify from "@Services/Notify";

import init from "./init.js";

import vue_equipmentFields from "./equipments/main.vue";
import vue_characterStats from "./character-stats/main.vue";
import vue_character from "./character.vue";
import vue_skills from "./skill/main.vue";
import vue_saveLoad from "./save-load.vue";
import vue_foodBuild from "./food/main.vue";

import { Character, EquipmentField } from "@lib/Character/Character";
import { MainWeapon, SubWeapon, SubArmor, BodyArmor } from "@lib/Character/CharacterEquipment";

import createSkillState from "@views/SkillQuery/utils/createSkillState.js";
import SkillBranchHandler from "./skill/utils/SkillBranchHandler.js";

export default {
  RegisterLang: 'Character Simulator',
  data() {
    return {
      contents: [{
        id: 'character',
        icon: 'bx-bxs-face',
        text: this.$lang('character')
      }, {
        id: 'character-stats',
        icon: 'bx-bxs-user-detail',
        text: this.$lang('character stats')
      }, {
        id: 'equipment-fields',
        icon: 'gg-shape-square',
        text: this.$lang('equipment')
      }, {
        id: 'skills',
        icon: 'ant-design:build-outlined',
        text: this.$lang('skill')
      }, {
        id: 'food-build',
        icon: 'mdi-food-apple',
        text: this.$lang('food build')
      }, {
        id: 'save-load',
        icon: 'mdi-ghost',
        text: this.$lang('save-load')
      }],
      currentContentIndex: 2,

      // levelSkillStateRoot[]
      allSkillStates: [],

      autoSaveDisable: false,
      listeners: {
        windowBeforeUnload: null,
        documentVisibilityChange: null
      }
    };
  },
  provide() {
    return {
      '$globalLang': this.$globalLang,
      'getValidLevelSkillState': this.getValidLevelSkillState,
      'handleCharacterStateDatas': this.handleCharacterStateDatas,
      'checkStatRestriction': this.checkStatRestriction
    };
  },
  beforeCreate() {
    init();
  },
  created() {
    if (this.skillBuilds.length === 0 || this.characterSimulatorHasInit)
      this.autoLoad();
    else {
      this.autoLoad({ resetOption: { skillBuildsReplaced: false } });
      MessageNotify(this.$lang('skill management/tips: skill-builds data not be replaced'));
    }
    this.$store.commit('character/characterSimulatorInitFinished');

    if (this.characterStates.length !== 0 && this.currentCharacterIndex === -1) {
      this.$store.commit('character/setCurrentCharacter', { index: 0 });
    }
    if (this.characterStates.length === 0) {
      this.createCharacter();
    }
    if (this.skillBuilds.length !== 0 && this.currentSkillBuildIndex === -1) {
      this.$store.commit('character/setCurrentSkillBuild', { index: 0 });
    }

    const evt_autoSave = () => this.autoSave();
    const evt_autoSave_2 = () => document.visibilityState === 'hidden' && this.autoSave();
    window.addEventListener('beforeunload', evt_autoSave);
    document.addEventListener('visibilitychange', evt_autoSave_2);
    this.listeners.windowBeforeUnload = evt_autoSave;
    this.listeners.documentVisibilityChange = evt_autoSave_2;
  },
  updated() {
    if (this.currentCharacterStateIndex >= this.characterStates.length) {
      this.$store.commit('character/setCurrentCharacter', { index: 0 });
    }
  },
  mounted() {
    if (this.$store.state.main.redirectPath === '/character/skill') {
      this.$router.replace('/character/skill');
      this.$store.commit('main/clearRedirectPath');
    }
  },
  unmounted() {
    window.removeEventListener('beforeunload', this.listeners.windowBeforeUnload);
    document.removeEventListener('visibilitychange', this.listeners.documentVisibilityChange);
    this.autoSave();
  },
  computed: {
    ...Vuex.mapState('character', {
      'characterStates': 'characters',
      'skillBuilds': 'skillBuilds',
      'currentCharacterStateIndex': 'currentCharacterIndex',
      'currentSkillBuildIndex': 'currentSkillBuildIndex',
      'characterSimulatorHasInit': 'characterSimulatorHasInit'
    }),
    ...Vuex.mapGetters('character', {
      'currentCharacterState': 'currentCharacter',
      'currentSkillBuild': 'currentSkillBuild',
      'currentFoodBuild': 'currentFoodBuild'
    }),
    equipmentElement() {
      const element = {
        'fire': 0,
        'water': 0,
        'earth': 0,
        'wind': 0,
        'light': 0,
        'dark': 0
      };
      const chara = this.currentCharacterState.origin;
      const setElement = stat => element[stat.baseName().replace('element_', '')] = 1;

      const sub = chara.equipmentField(EquipmentField.TYPE_SUB_WEAPON);
      // 主手弓副手矢時，矢優先於弓
      if (chara.checkFieldEquipmentType(EquipmentField.TYPE_MAIN_WEAPON, MainWeapon.TYPE_BOW) &&
         chara.checkFieldEquipmentType(EquipmentField.TYPE_SUB_WEAPON, SubWeapon.TYPE_ARROW) &&
        sub.equipment.elementStat) {
        setElement(sub.equipment.elementStat);
        return element;
      }

      // 主手
      const main = chara.equipmentField(EquipmentField.TYPE_MAIN_WEAPON);
      if (!main.isEmpty() && main.equipment.elementStat)
        setElement(main.equipment.elementStat);

      // 雙劍副手：雙重屬性
      if (chara.checkFieldEquipmentType(EquipmentField.TYPE_SUB_WEAPON, MainWeapon.TYPE_ONE_HAND_SWORD) &&
          sub.equipment.elementStat) {
        setElement(sub.equipment.elementStat);
      }

      return element;
    },
    baseCharacterStatDatas() {
      return this.handleCharacterStateDatas();
    },
    passiveSkillsCharacterStatDatas() {
      return this.handleCharacterStateDatas({
        handlePassiveSkill: true
      });
    },
    allCharacterStatDatas() {
      return this.handleCharacterStateDatas({
        handlePassiveSkill: true,
        handleActiveSkill: true
      });
    },
    showCharacterStatDatas() {
      return this.allCharacterStatDatas.map(p => ({
        name: p.name,
        stats: p.stats.filter(p => !p.hidden)
      }))
    },
    validSkillStates() {
      return this.allSkillStates
        .filter(state => state.levelSkillTreeState.originState.visible &&
          (state.levelSkill.level() > 0 || state.levelSkill.starGemLevel() > 0));
    },
    passiveSkillStates() {
      return this.validSkillStates.filter(state => state.type === 'passive');
    },
    activeSkillStates() {
      return this.validSkillStates.filter(state => state.type === 'active');
    }
  },
  methods: {
    /* ==[ character - main ]==========================================*/
    closeAutoSave() {
      this.autoSaveDisable = true;
    },
    autoSave() {
      if (!this.autoSaveDisable) {
        this.$store.dispatch('character/saveCharacterSimulator', { index: 0 });
        MessageNotify(this.$lang('save-load control/Auto save Successfully'), 'mdi-ghost', 'auto save successfully');
      }
    },
    autoLoad({ resetOption } = {}) {
      try {
        this.$store.dispatch('character/loadCharacterSimulator', { index: 0, resetOption });
        MessageNotify(this.$lang('save-load control/Auto load Successfully'), 'mdi-ghost', 'auto load successfully');
      } catch (e) {
        console.warn(e);
        console.warn('[Grimoire: character-simulator] Auto load faild. If you are entering this page for the first time, you can ignore this message.');
      }
    },
    findSkillById(stc, st, s) {
      return this.allSkillStates.find(state => {
        const skill = state.levelSkill.base;
        if (skill.id != s)
          return false;
        if (skill.parent.id != st)
          return false;
        if (skill.parent.parent.id != stc)
          return false;
        return true;
      });
    },
    handleCharacterStateDatas({
      handleFood = true,
      handlePassiveSkill = false,
      handleActiveSkill = false,
      calcField = null
    } = {}) {
      if (!this.currentCharacterState)
        return [];

      const categoryList = this.$store.state.datas.character.characterStatCategoryList;
      const characterStatMap = {};
      categoryList.map(p => p.stats).flat().forEach(p => characterStatMap[p.id] = p)

      const c = this.currentCharacterState.origin;

      let calcFieldNextFunc;
      if (calcField) {
        const f = c.equipmentField(calcField.type);
        const tmpEq = f.equipment;

        const sub = c.equipmentField(EquipmentField.TYPE_SUB_WEAPON);
        const subEmpty = sub.isEmpty();
        const tmpSubEq = sub.equipment;

        f.setEquipment(calcField.equipment);

        // 主手武器的話，setEquipment完，副手武器有可能被移除
        // if 不是主手武器 or 副手原本就是空的 or 更換主手後副手不是空的
        if (calcField.type !== EquipmentField.TYPE_MAIN_WEAPON || subEmpty || !sub.isEmpty()) {
          calcFieldNextFunc = () => {
            tmpEq ? f.setEquipment(tmpEq) : f.removeEquipment();
          };
        }
        else { // 否則必須復原副手武器
          calcFieldNextFunc = () => {
            tmpEq ? f.setEquipment(tmpEq) : f.removeEquipment();
            sub.setEquipment(tmpSubEq);
          };
        }
      }

      const isDualSword = c.checkFieldEquipmentType(EquipmentField.TYPE_MAIN_WEAPON, MainWeapon.TYPE_ONE_HAND_SWORD) && c.checkFieldEquipmentType(EquipmentField.TYPE_SUB_WEAPON, MainWeapon.TYPE_ONE_HAND_SWORD);

      const vars = {
        value: {
          '@': {
            'clv': c.level,
            'str': c.baseStatValue('STR'),
            'dex': c.baseStatValue('DEX'),
            'int': c.baseStatValue('INT'),
            'agi': c.baseStatValue('AGI'),
            'vit': c.baseStatValue('VIT'),
            'tec': c.baseStatValue('TEC'),
            'men': c.baseStatValue('MEN'),
            'crt': c.baseStatValue('CRT'),
            'luk': c.baseStatValue('LUK'),
            'main': c.fieldEquipment(EquipmentField.TYPE_MAIN_WEAPON),
            'sub': c.fieldEquipment(EquipmentField.TYPE_SUB_WEAPON),
            'armor': c.fieldEquipment(EquipmentField.TYPE_BODY_ARMOR),
            'additional': c.fieldEquipment(EquipmentField.TYPE_ADDITIONAL),
            'special': c.fieldEquipment(EquipmentField.TYPE_SPECIAL),
            'shield': c.checkFieldEquipmentType(EquipmentField.TYPE_SUB_WEAPON, SubArmor.TYPE_SHIELD) ?
              c.fieldEquipment(EquipmentField.TYPE_SUB_WEAPON) :
              { 'refining': 0, 'def': 0 },
            'arrow': c.checkFieldEquipmentType(EquipmentField.TYPE_SUB_WEAPON, SubWeapon.TYPE_ARROW) ?
              c.fieldEquipment(EquipmentField.TYPE_SUB_WEAPON) :
              { 'stability': 0, 'atk': 0 },
            'element': this.equipmentElement,
            'skill': {
              'Conversion': (() => {
                const skill = this.findSkillById(4, 1, 1);
                if (!skill)
                  return 0;
                return skill.disable ? 0 : skill.levelSkill.level();
              })()
            }
          },
          '#': {

          },
          '$': characterStatMap
        },
        conditional: {
          '@': {
            '1h_sword': !isDualSword && c.checkFieldEquipmentType(EquipmentField.TYPE_MAIN_WEAPON, MainWeapon.TYPE_ONE_HAND_SWORD),
            '2h_sword': c.checkFieldEquipmentType(EquipmentField.TYPE_MAIN_WEAPON, MainWeapon.TYPE_TWO_HAND_SWORD),
            'bow': c.checkFieldEquipmentType(EquipmentField.TYPE_MAIN_WEAPON, MainWeapon.TYPE_BOW),
            'bowgun': c.checkFieldEquipmentType(EquipmentField.TYPE_MAIN_WEAPON, MainWeapon.TYPE_BOWGUN),
            'staff': c.checkFieldEquipmentType(EquipmentField.TYPE_MAIN_WEAPON, MainWeapon.TYPE_STAFF),
            'magic_device': c.checkFieldEquipmentType(EquipmentField.TYPE_MAIN_WEAPON, MainWeapon.TYPE_MAGIC_DEVICE),
            'knuckle': c.checkFieldEquipmentType(EquipmentField.TYPE_MAIN_WEAPON, MainWeapon.TYPE_KNUCKLE),
            'dual_sword': isDualSword,
            'halberd': c.checkFieldEquipmentType(EquipmentField.TYPE_MAIN_WEAPON, MainWeapon.TYPE_HALBERD),
            'katana': c.checkFieldEquipmentType(EquipmentField.TYPE_MAIN_WEAPON, MainWeapon.TYPE_KATANA),
            'main': {
              'none': c.checkFieldEquipmentType(EquipmentField.TYPE_MAIN_WEAPON, EquipmentField.EMPTY)
            },
            'sub': {
              'arrow': c.checkFieldEquipmentType(EquipmentField.TYPE_SUB_WEAPON, SubWeapon.TYPE_ARROW),
              'shield': c.checkFieldEquipmentType(EquipmentField.TYPE_SUB_WEAPON, SubArmor.TYPE_SHIELD),
              'dagger': c.checkFieldEquipmentType(EquipmentField.TYPE_SUB_WEAPON, SubWeapon.TYPE_DAGGER),
              'knuckle': c.checkFieldEquipmentType(EquipmentField.TYPE_SUB_WEAPON, MainWeapon.TYPE_KNUCKLE),
              'magic_device': c.checkFieldEquipmentType(EquipmentField.TYPE_SUB_WEAPON, MainWeapon.TYPE_MAGIC_DEVICE)
            },
            'armor': {
              'normal': c.checkFieldEquipmentType(EquipmentField.TYPE_BODY_ARMOR, BodyArmor.TYPE_NORMAL),
              'dodge': c.checkFieldEquipmentType(EquipmentField.TYPE_BODY_ARMOR, BodyArmor.TYPE_DODGE),
              'defense': c.checkFieldEquipmentType(EquipmentField.TYPE_BODY_ARMOR, BodyArmor.TYPE_DEFENSE),
              'none': c.checkFieldEquipmentType(EquipmentField.TYPE_BODY_ARMOR, EquipmentField.EMPTY)
            }
          },
          '#': {}
        }
      };

      const all_stats = [];

      const appendStat = stat => {
        const t = all_stats.find(a => a.equals(stat));
        let v = stat.statValue();
        if (typeof v != 'number')
          v = parseFloat(v);
        if (Number.isNaN(v))
          v = 0;
        stat.statValue(v);
        t ? t.addStatValue(v) : all_stats.push(stat.copy());
      };

      c.equipmentFields.forEach(field => {
        if (!field.isEmpty() && !field.statsDisable()) {
          field.equipment.getAllStats(this.checkStatRestriction).forEach(appendStat);
        }
      });

      if (handleFood && this.currentFoodBuild) {
        this.currentFoodBuild.selectedFoods
          .map(p => p.stat()).forEach(appendStat);
      }

      const handleSkillStates = states => {
        const branchStatDatasToStats = stats => {
          return stats.map(stat => {
            const p = stat.origin.copy();
            p.statValue(stat.value);
            return p;
          });
        };
        states.forEach(levelSkillStateRoot => {
          if (levelSkillStateRoot.disable)
            return;
          const state = this.getValidLevelSkillState(levelSkillStateRoot);
          if (state) {
            state.branchStates
              .filter(bs => !bs.disable)
              .forEach(bs => {
                const v = bs.handler.value;
                if (v.stats.length != 0)
                  branchStatDatasToStats(v.stats).forEach(appendStat);
                v.conditionDatas
                  .filter(cs => cs.stats.length != 0)
                  .forEach(cs => branchStatDatasToStats(cs.stats).forEach(appendStat));
              });
          }
        });
      };

      handlePassiveSkill && handleSkillStates(this.passiveSkillStates);
      handleActiveSkill && handleSkillStates(this.activeSkillStates);

      // 還原因為calcField造成的暫時變動
      calcFieldNextFunc && calcFieldNextFunc();

      return categoryList.map(p => ({
        name: p.name,
        stats: p.stats.map(a => {
          //console.log('%c' + a.id, 'color: white; background-color: red');
          const res = a.result(all_stats, vars);
          return {
            id: a.id,
            name: a.name,
            ...res
          };
        })
      })).filter(a => a.stats.length != 0);
    },
    checkStatRestriction(stat) {
      const c = this.currentCharacterState.origin;
      const types = stat.restriction;
      if (!types)
        return true;

      if (['main', 'sub', 'body', 'other'].every(k => types[k] === null))
        return true;

      return types.other ||
        c.checkFieldEquipmentType(EquipmentField.TYPE_MAIN_WEAPON, types.main) ||
        c.checkFieldEquipmentType(EquipmentField.TYPE_SUB_WEAPON, types.sub) ||
        c.checkFieldEquipmentType(EquipmentField.TYPE_BODY_ARMOR, types.body);
    },
    /* ==[ skill item - skill branch ]================================ */
    findCharacterStatResult(src, id) {
      if (src === 'all')
        src = this.allCharacterStatDatas;
      else if (src === 'passive-skills')
        src = this.passiveSkillsCharacterStatDatas;
      else if (src === 'base')
        src = this.baseCharacterStatDatas;
      else
        console.warn('Unknow source name: ' + src);

      let res;
      src.find(cat => {
        const p = cat.stats.find(stat => stat.id == id);
        if (p) {
          res = p;
          return true;
        }
      });
      if (!res) {
        console.warn(`Can not find CharacterStat data with id: ${id}.`);
        return {
          id: null,
          value: 0
        }
      }
      return res;
    },
    /* ==[ skill item ]=============================================== */
    handleLevelSkillState({ levelSkillState, skillItemType }) {
      return levelSkillState.skillState.states.map(skillState => {
        const branchStates = [];

        if (skillItemType !== 'none') {
          let counter = 0;
          const branchFilter = skillItemType === 'passive' ?
            bch => bch.name === 'passive' :
            bch => bch.name === 'effect';
          const t = skillState.branchs
            .filter(branchFilter)
            .map(bch => {
              const handler = new SkillBranchHandler({
                branch: bch,
                skillState,
                levelSkill: levelSkillState.levelSkill,
                view: this,
                findCharacterStatResult: this.findCharacterStatResult,
                skillItemType: skillItemType
              });
              const res = {
                iid: counter,
                origin: bch,
                handler,
                disable: false
              };
              ++counter;

              return res;
            });
          branchStates.push(...t);
        }

        return {
          equipment: skillState.equipment,
          skillState,
          branchStates
        };
      });
    },
    getValidLevelSkillState(levelSkillStateRoot) {
      return levelSkillStateRoot.states
        .find(p => this.checkSkillEquipmentType(p.equipment, levelSkillStateRoot));
    },
    checkSkillEquipmentType(eq, skillState) {
      const fieldEq = (() => {
        const chara = this.currentCharacterState.origin;
        let mainField = chara.equipmentField(EquipmentField.TYPE_MAIN_WEAPON),
          subField = chara.equipmentField(EquipmentField.TYPE_SUB_WEAPON),
          bodyField = chara.equipmentField(EquipmentField.TYPE_BODY_ARMOR);
        const types = {
          main: mainField.equipmentType,
          sub: subField.equipmentType,
          body: bodyField.equipmentType
        };
        const mains = [
          MainWeapon.TYPE_ONE_HAND_SWORD,
          MainWeapon.TYPE_TWO_HAND_SWORD,
          MainWeapon.TYPE_BOW,
          MainWeapon.TYPE_BOWGUN,
          MainWeapon.TYPE_STAFF,
          MainWeapon.TYPE_MAGIC_DEVICE,
          MainWeapon.TYPE_KNUCKLE,
          MainWeapon.TYPE_HALBERD,
          MainWeapon.TYPE_KATANA,
          null,
          EquipmentField.EMPTY
        ];
        const subs = [
          SubWeapon.TYPE_ARROW,
          SubArmor.TYPE_SHIELD,
          SubWeapon.TYPE_DAGGER,
          MainWeapon.TYPE_MAGIC_DEVICE,
          MainWeapon.TYPE_KNUCKLE,
          MainWeapon.TYPE_KATANA,
          EquipmentField.EMPTY
        ];
        const bodys = [
          BodyArmor.TYPE_DODGE,
          BodyArmor.TYPE_DEFENSE,
          BodyArmor.TYPE_NORMAL,
          EquipmentField.EMPTY
        ];
        // 'main-weapon': ['單手劍', '雙手劍', '弓', '弩', '法杖', '魔導具', '拳套', '旋風槍', '拔刀劍', '雙劍', '空手'],
        // 'sub-weapon': ['箭矢', '盾牌', '小刀', '魔導具', '拳套', '拔刀劍', '無裝備'],
        // 'body-armor': ['輕量化', '重量化', '一般', '無裝備'],
        let main = -1, sub = -1, body = -1;

        mainField = types.main;
        subField = types.sub;
        bodyField = types.body;

        if (mainField) {
          main = mainField == MainWeapon.TYPE_ONE_HAND_SWORD &&
            subField && subField == MainWeapon.TYPE_ONE_HAND_SWORD ?
              9 :
              mains.indexOf(mainField);
        }
        if (subField && main != 9) {
          sub = subs.indexOf(subField);
        }
        if (bodyField) {
          body = bodys.indexOf(bodyField);
        }

        return { main, sub, body };
      })();

      const forDualSword = eq.main === 0 && fieldEq.main === 9 && !skillState.states.find(a => a.equipment.main == 9);

      const { main, sub, body } = eq;
      const _eq = { main, sub, body };

      /* ==== [ start compare ] ==================  */
      const a = _eq, b = fieldEq, operator = eq.operator;

      /* 通用 */
      const _check = t => [t.main, t.sub, t.body].every(p => p == -1);
      if (_check(a) || _check(b))
        return true;

      // or
      if (operator === 0) {
        const check = key => a[key] != -1 && b[key] != -1 && a[key] == b[key];
        return check('main') || forDualSword || check('sub') || check('body');
      }
      // and
      if (operator === 1) {
        const check = key => a[key] != -1 && b[key] != -1 && a[key] != b[key];
        return !(check('main') || forDualSword) && !check('sub') && !check('body');
      }
    },

    /* ==[ main ]=============================================== */
    setCurrentContent(idx) {
      this.currentContentIndex = idx;
    },
    createCharacter() {
      const c = new Character(this.$lang('character') + ' ' + (this.characterStates.length + 1).toString());
      // this.currentCharacterStateIndex = this.characterStates.length;
      this.$store.commit('character/createCharacter', c);
    }
  },
  watch: {
    currentSkillBuild(newv) {
      if (!newv || !this.currentCharacterState) {
        this.allSkillStates = [];
        return;
      }
      const leveSkillTreeStates = (() => {
        const res = [];
        newv.skillTreeCategoryStates.forEach(stc => {
          res.push(...stc.skillTreeStates.map(st => ({
            levelSkillTree: st.levelSkillTree,
            originState: st
          })));
        });
        return res.map(p => {
          const levelSkillTree = p.levelSkillTree;
          return {
            originState: p.originState,
            levelSkillTree,
            skills: levelSkillTree.levelSkills.map(skill => ({
              levelSkill: skill,
              skillState: createSkillState(skill.base)
            }))
          }
        });
      })();

      this.allSkillStates = (() => {
        const res = [];

        leveSkillTreeStates.forEach(st => {
          const p = st.skills.map(state => {
            let skillItemType = 'none';
            if (state.skillState.states.find(a => a.attrs['skill_type'] == 3))
              skillItemType = 'passive';
            else {
              const find = state.skillState.states.find(a => {
                return a.attrs['skill_type'] != 3 && a.branchs.find(bch => bch.stats.length != 0);
              });
              if (find)
                skillItemType = 'active';
            }
            return {
              states: this.handleLevelSkillState({
                levelSkillState: state,
                skillItemType
              }),
              type: skillItemType,
              levelSkill: state.levelSkill,
              // originalLevelSkillState: state,
              levelSkillTreeState: st,
              disable: skillItemType != 'passive'
            };
          });
          res.push(...p);
        });

        return res;
      })();
    },
  },
  components: {
    'equipment-fields': vue_equipmentFields,
    'character-stats': vue_characterStats,
    'character': vue_character,
    'skills': vue_skills,
    'save-load': vue_saveLoad,
    'food-build': vue_foodBuild
  }
};
</script>