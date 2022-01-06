<template>
  <div class="main--character-simulator">
    <template v-if="currentCharacterState">
      <div class="main">
        <character
          v-if="currentContentIndex == 0"
          :character-state="currentCharacterState"
          @create-character="createCharacter"
        />
        <character-stats
          v-if="currentContentIndex == 1"
          :character-state="currentCharacterState"
          :show-character-stat-datas="showCharacterStatDatas"
        />
        <keep-alive>
          <equipment-fields v-if="currentContentIndex == 2" :character-state="currentCharacterState" />
        </keep-alive>
        <keep-alive>
          <skills
            v-if="currentContentIndex == 3"
            :character-state="currentCharacterState"
            :passive-skill-states="passiveSkillStates"
            :active-skill-states="activeSkillStates"
          />
        </keep-alive>
        <food-build v-if="currentContentIndex == 4" />
        <save-load
          v-if="currentContentIndex == 5"
          @manual-auto-save="autoSave"
          @manual-auto-load="autoLoad"
          @close-auto-save="closeAutoSave"
        />
      </div>
      <div class="sticky bottom-2 bg-white border-1 border-solid border-light-2 rounded-2xl px-4 py-1 z-10 mx-2 mt-4">
        <cy-button-inline
          v-for="(content, i) in contents"
          :key="content.id"
          :icon="content.icon"
          :selected="i === currentContentIndex"
          class="mr-2 my-1"
          @click="setCurrentContent(i)"
        >
          {{ content.text }}
        </cy-button-inline>
      </div>
    </template>
    <div v-else>
      <cy-default-tips icon="mdi-ghost">
        <span v-html="$lang('Warn/Current character is not exist')" />
      </cy-default-tips>
      <div style="text-align: center;">
        <cy-button-border icon="ic-round-add" @click="createCharacter">
          {{ $lang('append character') }}
        </cy-button-border>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia';

import { useCharacterStore } from '@/stores/views/character';
import { useCharacterSkillStore } from '@/stores/views/character/skill';
import { useCharacterFoodStore } from '@/stores/views/character/food';
import { useMainStore } from '@/stores/app/main';
import { useDatasStore } from '@/stores/app/datas';

import { Character, EquipmentField } from '@/lib/Character/Character';
import { CharacterBaseStatTypes, CharacterOptionalBaseStatTypes } from '@/lib/Character/Character/enums';
import { EquipmentFieldTypes } from '@/lib/Character/Character/enums';
import { EquipmentTypes, MainWeaponTypeList } from '@/lib/Character/CharacterEquipment/enums';

import createSkillState from '@/views/SkillQueryOld/utils/createSkillState.js';

import vue_characterStats from './character-stats/main.vue';
import vue_character from './character.vue';
import vue_equipmentFields from './equipments/main.vue';
import vue_foodBuild from './food/main.vue';
import vue_saveLoad from './save-load.vue';
import vue_skills from './skill/main.vue';

import init from './init.js';
import SkillBranchHandler from './skill/utils/SkillBranchHandler.js';

export default {
  name: 'CharacterSimulator',
  RegisterLang: 'Character Simulator',
  provide() {
    return {
      'getValidLevelSkillState': this.getValidLevelSkillState,
      'handleCharacterStateDatas': this.handleCharacterStateDatas,
      'checkStatRestriction': this.checkStatRestriction,
    };
  },
  setup() {
    const store = useCharacterStore();
    const mainStore = useMainStore();
    const datasStore = useDatasStore();
    return { store, mainStore, datasStore };
  },
  data() {
    return {
      contents: [{
        id: 'character',
        icon: 'bx-bxs-face',
        text: this.$lang('character'),
      }, {
        id: 'character-stats',
        icon: 'bx-bxs-user-detail',
        text: this.$lang('character stats'),
      }, {
        id: 'equipment-fields',
        icon: 'gg-shape-square',
        text: this.$lang('equipment'),
      }, {
        id: 'skills',
        icon: 'ant-design:build-outlined',
        text: this.$lang('skill'),
      }, {
        id: 'food-build',
        icon: 'mdi-food-apple',
        text: this.$lang('food build'),
      }, {
        id: 'save-load',
        icon: 'mdi-ghost',
        text: this.$lang('save-load'),
      }],
      currentContentIndex: 2,

      // levelSkillStateRoot[]
      allSkillStates: [],

      listeners: {
        windowBeforeUnload: null,
        documentVisibilityChange: null,
      },
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
      this.$notify(this.$lang('skill management/tips: skill-builds data not be replaced'));
    }
    this.store.characterSimulatorInitFinished();

    if (this.characterStates.length !== 0 && this.currentCharacterIndex === -1) {
      this.store.setCurrentCharacter(0);
    }
    if (this.characterStates.length === 0) {
      this.createCharacter();
    }
    if (this.skillBuilds.length !== 0 && this.currentSkillBuildIndex === -1) {
      this.store.setCurrentCharacter(0);
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
      this.store.setCurrentCharacter(0);
    }
  },
  mounted() {
    if (this.mainStore.redirectPathName === 'SkillSimulator') {
      this.$router.replace({ name: 'SkillSimulator' });
      this.mainStore.clearRedirectPathName();
    }
  },
  unmounted() {
    window.removeEventListener('beforeunload', this.listeners.windowBeforeUnload);
    document.removeEventListener('visibilitychange', this.listeners.documentVisibilityChange);
    this.autoSave();
  },
  computed: {
    ...mapState(useCharacterStore, {
      'characterStates': 'characters',
      'currentCharacterStateIndex': 'currentCharacterIndex',
      'characterSimulatorHasInit': 'characterSimulatorHasInit',
      'autoSaveDisabled': 'autoSaveDisabled',
      'currentCharacterState': 'currentCharacter',
    }),
    ...mapState(useCharacterSkillStore, {
      'skillBuilds': 'skillBuilds',
      'currentSkillBuildIndex': 'currentSkillBuildIndex',
      'currentSkillBuild': 'currentSkillBuild',
    }),
    ...mapState(useCharacterFoodStore, ['currentFoodBuild']),

    equipmentElement() {
      const element = {
        'fire': 0,
        'water': 0,
        'earth': 0,
        'wind': 0,
        'light': 0,
        'dark': 0,
      };
      const chara = this.currentCharacterState.origin;
      const setElement = stat => element[stat.baseName.replace('element_', '')] = 1;

      const sub = chara.equipmentField(EquipmentFieldTypes.SubWeapon);
      // 主手弓副手矢時，矢優先於弓
      if (chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.Bow) &&
         chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.Arrow) &&
        sub.equipment.elementStat) {
        setElement(sub.equipment.elementStat);
        return element;
      }

      // 主手
      const main = chara.equipmentField(EquipmentFieldTypes.MainWeapon);
      if (!main.isEmpty && main.equipment.elementStat)
        setElement(main.equipment.elementStat);

      // 雙劍副手：雙重屬性
      if (chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.OneHandSword) &&
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
        handlePassiveSkill: true,
      });
    },
    allCharacterStatDatas() {
      return this.handleCharacterStateDatas({
        handlePassiveSkill: true,
        handleActiveSkill: true,
      });
    },
    showCharacterStatDatas() {
      return this.allCharacterStatDatas.map(data => ({
        name: data.name,
        stats: data.stats.filter(p => !p.hidden),
      }));
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
    },
  },
  methods: {
    /* ==[ character - main ]==========================================*/
    closeAutoSave() {
      this.store.closeAutoSave();
    },
    autoSave() {
      if (!this.autoSaveDisabled) {
        this.store.saveCharacterSimulator(0);
        this.$notify(this.$lang('save-load control/Auto save Successfully'), 'mdi-ghost', 'auto save successfully');
      }
    },
    autoLoad({ resetOption } = {}) {
      try {
        this.store.loadCharacterSimulator({ index: 0, resetOption });
        this.$notify(this.$lang('save-load control/Auto load Successfully'), 'mdi-ghost', 'auto load successfully');
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
      calcField = null,
    } = {}) {
      if (!this.currentCharacterState)
        return [];

      const categoryList = this.datasStore.Character.characterStatCategoryList;
      const chara = this.currentCharacterState.origin.copy();

      // let calcFieldNextFunc;
      if (calcField) {
        const field = chara.equipmentField(calcField.type);
        field.setEquipment(calcField.equipment);
      }

      const isDualSword = chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.OneHandSword)
        && chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.OneHandSword);

      const mainField = chara.fieldEquipment(EquipmentFieldTypes.MainWeapon);
      const subField = chara.fieldEquipment(EquipmentFieldTypes.SubWeapon);
      const bodyField = chara.fieldEquipment(EquipmentFieldTypes.BodyArmor);
      const additionalField = chara.fieldEquipment(EquipmentFieldTypes.Additional);
      const specialField = chara.fieldEquipment(EquipmentFieldTypes.Special);
      const vars = {
        value: {
          '@clv': chara.level,
          '@str': chara.baseStatValue(CharacterBaseStatTypes.STR),
          '@dex': chara.baseStatValue(CharacterBaseStatTypes.DEX),
          '@int': chara.baseStatValue(CharacterBaseStatTypes.INT),
          '@agi': chara.baseStatValue(CharacterBaseStatTypes.AGI),
          '@vit': chara.baseStatValue(CharacterBaseStatTypes.VIT),
          '@tec': chara.baseStatValue(CharacterOptionalBaseStatTypes.TEC),
          '@men': chara.baseStatValue(CharacterOptionalBaseStatTypes.MEN),
          '@crt': chara.baseStatValue(CharacterOptionalBaseStatTypes.CRT),
          '@luk': chara.baseStatValue(CharacterOptionalBaseStatTypes.LUK),
          '@main': mainField ? {
            atk: mainField.atk,
            refining: mainField.refining,
            stability: mainField.stability,
          } : {
            atk: 0,
            refining: 0,
            stability: 0,
          },
          '@sub': subField ? {
            atk: subField.atk || 0,
            def: subField.def || 0,
            refining: subField.refining || 0,
            stability: subField.stability || 0,
          } : {
            atk: 0,
            def: 0,
            refining: 0,
            stability: 0,
          },
          '@armor': bodyField ? {
            def: bodyField.def,
            refining: bodyField.refining,
          } : {
            def: 0,
            refining: 0,
          },
          '@additional': additionalField ? {
            def: additionalField.def,
            refining: additionalField.refining,
          } : {
            def: 0,
            refining: 0,
          },
          '@special': specialField ? { def: specialField.def } : { def: 0 },
          '@shield': chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.Shield) ?
            { refining: subField.refining, def: subField.def } :
            { refining: 0, def: 0 },
          '@arrow': chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.Arrow) ?
            { stability: subField.stability, atk: subField.atk } :
            { stability: 0, atk: 0 },
          '@element': this.equipmentElement,
          '@skill': {
            'Conversion': (() => {
              const skill = this.findSkillById(4, 1, 1);
              if (!skill)
                return 0;
              return skill.disabled ? 0 : skill.levelSkill.level();
            })(),
          },
        },
        conditional: {
          '@1h_sword': !isDualSword && chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.OneHandSword),
          '@2h_sword': chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.TwoHandSword),
          '@bow': chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.Bow),
          '@bowgun': chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.Bowgun),
          '@staff': chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.Staff),
          '@magic_device': chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.MagicDevice),
          '@knuckle': chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.Knuckle),
          '@dual_sword': isDualSword,
          '@halberd': chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.Halberd),
          '@katana': chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.Katana),
          '@main': {
            'none': chara.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, EquipmentTypes.Empty),
          },
          '@sub': {
            'arrow': chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.Arrow),
            'shield': chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.Shield),
            'dagger': chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.Dagger),
            'knuckle': chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.Knuckle),
            'magic_device': chara.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, EquipmentTypes.MagicDevice),
          },
          '@armor': {
            'normal': chara.checkFieldEquipmentType(EquipmentFieldTypes.BodyArmor, EquipmentTypes.BodyNormal),
            'dodge': chara.checkFieldEquipmentType(EquipmentFieldTypes.BodyArmor, EquipmentTypes.BodyDodge),
            'defense': chara.checkFieldEquipmentType(EquipmentFieldTypes.BodyArmor, EquipmentTypes.BodyDefense),
            'none': chara.checkFieldEquipmentType(EquipmentFieldTypes.BodyArmor, EquipmentTypes.Empty),
          },
        },
        computed: {},
        computedResultStore: {},
      };
      const pureStats = [];

      const appendStat = stat => {
        const t = pureStats.find(a => a.equals(stat));
        let v = stat.value;
        if (typeof v !== 'number')
          v = parseFloat(v);
        if (Number.isNaN(v))
          v = 0;
        stat.value = v;
        t ? t.add(v) : pureStats.push(stat.copy());
      };

      chara.equipmentFields.forEach(field => {
        if (!field.isEmpty && !field.statsDisabled()) {
          field.equipment.getAllStats(this.checkStatRestriction).forEach(appendStat);
        }
      });

      if (handleFood && this.currentFoodBuild) {
        this.currentFoodBuild.selectedFoods
          .map(p => p.stat()).forEach(appendStat);
      }

      const handleSkillStates = states => {
        const branchStatDatasToStats = stats => {
          return stats.map(stat => stat.origin.toStat(stat.value));
        };
        states.forEach(levelSkillStateRoot => {
          if (levelSkillStateRoot.disabled)
            return;
          const state = this.getValidLevelSkillState(levelSkillStateRoot);
          if (state) {
            state.branchStates
              .filter(bs => !bs.disabled)
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

      const result = categoryList.map(p => ({
        name: p.name,
        stats: p.stats.map(a => {
          //console.log('%c' + a.id, 'color: white; background-color: red');
          const res = a.result(pureStats, vars);
          return {
            id: a.id,
            name: a.name,
            ...res,
          };
        }),
      })).filter(a => a.stats.length !== 0);

      return result;
    },
    checkStatRestriction(stat) {
      const c = this.currentCharacterState.origin;
      const types = stat.restriction;
      if (!types)
        return true;

      if (['main', 'sub', 'body', 'other'].every(k => types[k] === null))
        return true;

      return types.other ||
        c.checkFieldEquipmentType(EquipmentFieldTypes.MainWeapon, types.main) ||
        c.checkFieldEquipmentType(EquipmentFieldTypes.SubWeapon, types.sub) ||
        c.checkFieldEquipmentType(EquipmentFieldTypes.BodyArmor, types.body);
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
          value: 0,
        };
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
            bch => bch.name === 'effect' && bch.attrs['effect_self'] !== '0';
          const t = skillState.branches
            .filter(branchFilter)
            .map(bch => {
              const handler = new SkillBranchHandler({
                branch: bch,
                skillState,
                levelSkill: levelSkillState.levelSkill,
                view: this,
                findCharacterStatResult: this.findCharacterStatResult,
                skillItemType: skillItemType,
              });
              const res = {
                iid: counter,
                origin: bch,
                handler,
                disabled: false,
              };
              counter += 1;

              return res;
            });
          branchStates.push(...t);
        }

        return {
          equipment: skillState.equipment,
          skillState,
          branchStates,
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
        let mainField = chara.equipmentField(EquipmentFieldTypes.MainWeapon),
          subField = chara.equipmentField(EquipmentFieldTypes.SubWeapon),
          bodyField = chara.equipmentField(EquipmentFieldTypes.BodyArmor);
        const types = {
          main: mainField.equipmentType,
          sub: subField.equipmentType,
          body: bodyField.equipmentType,
        };
        const mains = [
          EquipmentTypes.Empty,
          ...MainWeaponTypeList,
          null,
        ];
        const subs = [
          EquipmentField.EMPTY,
          EquipmentTypes.Arrow,
          EquipmentTypes.Shield,
          EquipmentTypes.Dagger,
          EquipmentTypes.MagicDevice,
          EquipmentTypes.Knuckle,
          EquipmentTypes.Katana,
          EquipmentTypes.NinjutsuScroll,
        ];
        const bodys = [
          EquipmentTypes.Empty,
          EquipmentTypes.BodyDodge,
          EquipmentTypes.BodyDefense,
          EquipmentTypes.BodyNormal,
        ];
        /**
         * 0'空手', 1'單手劍', 2'雙手劍', 3'弓', 4'弩', 5'法杖',
         * 6'魔導具', 7'拳套', 8'旋風槍', 9'拔刀劍', 10'雙劍',
         *
         * 0'無裝備', 1'箭矢', 2'盾牌', 3'小刀', 4'魔導具',
         * 5'拳套', 6'拔刀劍', 7'忍術卷軸',
         *
         * 0'無裝備', 1'輕量化', 2'重量化', 3'一般',
        */
        let main = -1, sub = -1, body = -1;

        mainField = types.main;
        subField = types.sub;
        bodyField = types.body;

        if (mainField) {
          main = mainField === EquipmentTypes.OneHandSword &&
            subField && subField === EquipmentTypes.OneHandSword ?
            10 :
            mains.indexOf(mainField);
        }
        if (subField && main != 10) {
          sub = subs.indexOf(subField);
        }
        if (bodyField) {
          body = bodys.indexOf(bodyField);
        }

        return { main, sub, body };
      })();

      const forDualSword = eq.main === 1 && fieldEq.main === 10 && !skillState.states.find(a => a.equipment.main == 10);

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
      this.store.createCharacter(c);
    },
  },
  watch: {
    currentSkillBuild(newv) {
      if (!newv || !this.currentCharacterState) {
        this.allSkillStates = [];
        return;
      }
      const levelSkillTreeStates = (() => {
        const res = [];
        newv.skillTreeCategoryStates.forEach(stc => {
          res.push(...stc.skillTreeStates.map(st => ({
            levelSkillTree: st.levelSkillTree,
            originState: st,
          })));
        });
        return res.map(p => {
          const levelSkillTree = p.levelSkillTree;
          return {
            originState: p.originState,
            levelSkillTree,
            skills: levelSkillTree.levelSkills.map(skill => ({
              levelSkill: skill,
              skillState: createSkillState(skill.base),
            })),
          };
        });
      })();

      this.allSkillStates = (() => {
        const res = [];

        levelSkillTreeStates.forEach(st => {
          const p = st.skills.map(state => {
            let skillItemType = 'none';
            if (state.skillState.states.find(a => a.attrs['skill_type'] == 3))
              skillItemType = 'passive';
            else {
              const find = state.skillState.states.find(a => {
                return a.attrs['skill_type'] != 3 && a.branches.find(bch => bch.stats.length != 0);
              });
              if (find)
                skillItemType = 'active';
            }
            return {
              states: this.handleLevelSkillState({
                levelSkillState: state,
                skillItemType,
              }),
              type: skillItemType,
              levelSkill: state.levelSkill,
              // originalLevelSkillState: state,
              levelSkillTreeState: st,
              disabled: skillItemType != 'passive',
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
    'food-build': vue_foodBuild,
  },
};
</script>
