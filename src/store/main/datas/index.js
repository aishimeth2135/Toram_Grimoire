import ItemSystem from "@lib/ItemSystem";
import CharacterSystem from "@lib/CharacterSystem";
import TagSystem from "@lib/TagSystem";
import SkillSystem from "@lib/SkillSystem";
import EnchantSystem from "@lib/EnchantSystem";

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
    enchant: null
  },
  mutations: {
    initItems(state) {
      if (state.items === null)
        state.items = new ItemSystem();
    },
    initCharacter(state) {
      if (state.character === null)
        state.character = new CharacterSystem();
    },
    initTag(state) {
      if (state.tag === null)
        state.tag = new TagSystem();
    },
    initSkill(state) {
      if (state.skill === null)
        state.skill = new SkillSystem();
    },
    initEnchant(state) {
      if (state.enchant === null)
        state.enchant = new EnchantSystem();
    }
  },
  actions: {
    async* loadItems({ state, commit }) {
      commit('initItems');
      const datas = await DownloadDatas('Equipment', 'Crystal');
      yield;
      loadEquipments(state.items, datas[0].flat());
      loadCrystals(state.items, datas[1][0]);
    },
    async* loadStats({ state, commit }) {
      commit('initCharacter');
      const datas = await DownloadDatas({ path: 'Stats', lang: true });
      yield;
      loadStats(state.character, datas[0]);
    },
    async* loadCharacterStats({ state, commit }) {
      commit('initCharacter');
      const datas = await DownloadDatas({ path: 'Character Stats', lang: true });
      yield;
      loadCharacterStats(state.character, datas[0]);
    },
    async* loadTag({ state, commit }) {
      commit('initTag');
      const datas = await DownloadDatas({ path: 'Tag', lang: true });
      yield;
      loadTag(state.tag, datas[0]);
    },
    async* loadSkill({ state, commit }) {
      commit('initSkill');
      const datas = await DownloadDatas({ path: 'Skill', lang: true }, { path: 'Skill Main', lang: true });
      yield;
      loadSkill(state.skill, datas[0]);
      loadSkillMain(state.skill, datas[1]);
      commit('character/setSkillRoot', state.skill.skillRoot, { root: true });
    },
    async* loadEnchant({ state, commit }) {
      commit('initEnchant');
      const datas = await DownloadDatas('Enchant');
      yield;
      loadEnchant(state.enchant, datas[0]);
    }
  }
};

export default store;