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
    initItems(state) {
      if (state.Items === null) {
        state.Items = new ItemsSystem();
      }
    },
    initCharacter(state) {
      if (state.Character === null) {
        state.Character = new CharacterSystem();
      }
    },
    initTag(state) {
      if (state.Tag === null) {
        state.Tag = new TagSystem();
      }
    },
    initSkill(state) {
      if (state.Skill === null) {
        state.Skill = new SkillSystem();
      }
    },
    initEnchant(state) {
      if (state.Enchant === null) {
        state.Enchant = new EnchantSystem();
      }
    },
    initDamageCalculation(state) {
      if (state.DamageCalculation === null) {
        state.DamageCalculation = new DamageCalculationSystem();
      }
    },
  },
  actions: {
    async* loadItems({ state, commit }) {
      commit('initItems');
      const datas = await DownloadDatas('Equipment', 'Crystal');
      yield;
      loadEquipments(state.Items, datas[0][0]);
      loadCrystals(state.Items, datas[1][0]);
    },
    async* loadStats({ state, commit }) {
      commit('initCharacter');
      const datas = await DownloadDatas({ path: 'Stats', lang: true });
      yield;
      loadStats(state.Character, datas[0]);
    },
    async* loadCharacterStats({ state, commit }) {
      commit('initCharacter');
      const datas = await DownloadDatas({ path: 'Character Stats', lang: true });
      yield;
      loadCharacterStats(state.Character, datas[0]);
    },
    async* loadTag({ state, commit }) {
      commit('initTag');
      const datas = await DownloadDatas({ path: 'Tag', lang: true });
      yield;
      loadTag(state.Tag, datas[0]);
    },
    async* loadSkill({ state, commit }) {
      commit('initSkill');
      const datas = await DownloadDatas({ path: 'Skill', lang: true }, { path: 'Skill Main', lang: true });
      yield;
      loadSkill(state.Skill, datas[0]);
      loadSkillMain(state.Skill, datas[1]);
      commit('character/skill/setSkillRoot', state.Skill.skillRoot, { root: true });
    },
    async* loadEnchant({ state, commit }) {
      commit('initEnchant');
      const datas = await DownloadDatas('Enchant');
      yield;
      loadEnchant(state.Enchant, datas[0][0]);
    },
    async* loadDamageCalculation({ commit }) {
      commit('initDamageCalculation');
      yield;
      // do nothing
    },
  },
};

export default store;
