import DamageCalculationSystem from '@/lib/Calculation/Damage';
import CharacterSystem from '@/lib/Character';
import EnchantSystem from '@/lib/Enchant';
import ItemsSystem from '@/lib/Items';
import SkillSystem from '@/lib/Skill';
import TagSystem from '@/lib/Tag';

import DownloadDatas from './utils/DownloadDatas';
import loadCharacterStats from './utils/LoadCharacterStat';
import loadCrystals from './utils/LoadCrystals';
import loadEnchant from './utils/LoadEnchant';
import loadEquipments from './utils/LoadEquipments';
import { loadSkill, loadSkillMain } from './utils/LoadSkill';
import loadStats from './utils/LoadStats';
import loadTag from './utils/LoadTag';

const store = {
  namespaced: true,
  state: {
    Items: null,
    Character: null,
    Tag: null,
    Skill: null,
    Enchant: null,
    DamageCalculation: null,
    loaded: new Map(),
  },
  getters: {
    checkLoad: state => id => {
      return state.loaded.has(id);
    },
  },
  mutations: {
    loadFinished(state, id) {
      state.loaded.set(id, true);
    },
    initItems(state, { Equipments = null, Crystals = null } = {}) {
      if (state.Items === null) {
        state.Items = new ItemsSystem();
      }
      if (Equipments) {
        loadEquipments(state.Items, Equipments);
      }
      if (Crystals) {
        loadCrystals(state.Items, Crystals);
      }
    },
    initCharacter(state, { Stats = null, CharacterStats = null } = {}) {
      if (state.Character === null) {
        state.Character = new CharacterSystem();
      }
      if (Stats) {
        loadStats(state.Character, Stats);
      }
      if (CharacterStats) {
        loadCharacterStats(state.Character, CharacterStats);
      }
    },
    initTag(state, { Tag = null } = {}) {
      if (state.Tag === null) {
        state.Tag = new TagSystem();
      }
      if (Tag) {
        loadTag(state.Tag, Tag);
      }
    },
    initSkill(state, { Skill = null, SkillMain = null } = {}) {
      if (state.Skill === null) {
        state.Skill = new SkillSystem();
      }
      if (Skill) {
        loadSkill(state.Skill, Skill);
      }
      if (SkillMain) {
        loadSkillMain(state.Skill, SkillMain);
      }
    },
    initEnchant(state, { Enchant = null } = {}) {
      if (state.Enchant === null) {
        state.Enchant = new EnchantSystem();
      }
      if (Enchant) {
        loadEnchant(state.Enchant, Enchant);
      }
    },
    initDamageCalculation(state) {
      if (state.DamageCalculation === null) {
        state.DamageCalculation = new DamageCalculationSystem();
      }
    },
  },
  actions: {
    async* loadItems({ commit }) {
      const datas = await DownloadDatas('Equipment', 'Crystal');
      yield;
      commit('initItems', {
        Equipments: datas[0][0],
        Crystals: datas[1][0],
      });
    },
    async* loadStats({ commit }) {
      const datas = await DownloadDatas({ path: 'Stats', lang: true });
      yield;
      commit('initCharacter', { Stats: datas[0] });
    },
    async* loadCharacterStats({ commit }) {
      const datas = await DownloadDatas({ path: 'Character Stats', lang: true });
      yield;
      commit('initCharacter', { CharacterStats: datas[0] });
    },
    async* loadTag({ commit }) {
      const datas = await DownloadDatas({ path: 'Tag', lang: true });
      yield;
      commit('initTag', { Tag: datas[0] });
    },
    async* loadSkill({ state, commit }) {
      const datas = await DownloadDatas({ path: 'Skill', lang: true }, { path: 'Skill Main', lang: true });
      yield;
      commit('initSkill', {
        Skill: datas[0],
        SkillMain: datas[1],
      });
      commit('character/skill/setSkillRoot', state.Skill.skillRoot, { root: true });
    },
    async* loadFood({ commit }) {
      // do nothing
      yield;
      commit('character/food/setFoodsBase', null, { root: true });
    },
    async* loadEnchant({ commit }) {
      const datas = await DownloadDatas('Enchant');
      yield;
      commit('initEnchant', { Enchant: datas[0][0] });
    },
    async* loadDamageCalculation({ commit }) {
      // do nothing
      yield;
      commit('initDamageCalculation');
    },
  },
};

export default store;
