import ItemsSystem from "@lib/Items";
import CharacterSystem from "@lib/Character";
import TagSystem from "@lib/Tag";
import SkillSystem from "@lib/Skill";
import EnchantSystem from "@lib/Enchant";

import DownloadDatas from "../utils/DownloadDatas.js";
import loadEquipments from "./utils/LoadEquipments.js";
import loadCrystals from "./utils/LoadCrystals.js";
import loadStats from "./utils/LoadStats.js";
import loadCharacterStats from "./utils/LoadCharacterStat.js";
import loadTag from "./utils/LoadTag.js";
import { loadSkill, loadSkillMain } from "./utils/LoadSkill.js";
import loadEnchant from "./utils/LoadEnchant.js";

const store = {
  namespaced: true,
  state: {
    items: null,
    character: null,
    tag: null,
    skill: null,
    enchant: null,
    loaded: new Map()
  },
  getters: {
    checkInit: state => id => {
      return state[id] !== null;
    },
    checkLoad: state => id => {
      return state.loaded.has(id);
    }
  },
  mutations: {
    loadFinished(state, id) {
      state.loaded.set(id, true);
    },
    initItems(state, { checkInit }) {
      if (!checkInit('items'))
        state.items = new ItemsSystem();
    },
    initCharacter(state, { checkInit }) {
      if (!checkInit('character'))
        state.character = new CharacterSystem();
    },
    initTag(state, { checkInit }) {
      if (!checkInit('tag'))
        state.tag = new TagSystem();
    },
    initSkill(state, { checkInit }) {
      if (!checkInit('skill'))
        state.skill = new SkillSystem();
    },
    initEnchant(state, { checkInit }) {
      if (!checkInit('enchant'))
        state.enchant = new EnchantSystem();
    }
  },
  actions: {
    async* loadItems({ state, commit, getters }) {
      commit('initItems', { checkInit: getters.checkInit });
      const datas = await DownloadDatas('Equipment', 'Crystal');
      yield;
      loadEquipments(state.items, datas[0][0]);
      loadCrystals(state.items, datas[1][0]);
    },
    async* loadStats({ state, commit, getters }) {
      commit('initCharacter', { checkInit: getters.checkInit });
      const datas = await DownloadDatas({ path: 'Stats', lang: true });
      yield;
      loadStats(state.character, datas[0]);
    },
    async* loadCharacterStats({ state, commit, getters }) {
      commit('initCharacter', { checkInit: getters.checkInit });
      const datas = await DownloadDatas({ path: 'Character Stats', lang: true });
      yield;
      loadCharacterStats(state.character, datas[0]);
    },
    async* loadTag({ state, commit, getters }) {
      commit('initTag', { checkInit: getters.checkInit });
      const datas = await DownloadDatas({ path: 'Tag', lang: true });
      yield;
      loadTag(state.tag, datas[0]);
    },
    async* loadSkill({ state, commit, getters }) {
      commit('initSkill', { checkInit: getters.checkInit });
      const datas = await DownloadDatas({ path: 'Skill', lang: true }, { path: 'Skill Main', lang: true });
      yield;
      loadSkill(state.skill, datas[0]);
      loadSkillMain(state.skill, datas[1]);
      commit('character/setSkillRoot', state.skill.skillRoot, { root: true });
    },
    async* loadEnchant({ state, commit, getters }) {
      commit('initEnchant', { checkInit: getters.checkInit });
      const datas = await DownloadDatas('Enchant');
      yield;
      loadEnchant(state.enchant, datas[0][0]);
    }
  }
};

export default store;