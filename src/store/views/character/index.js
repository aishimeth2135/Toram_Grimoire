
import { Character } from '@/lib/Character/Character';
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment';

import module_skill from './skill';
import module_food from './food';

const store = {
  namespaced: true,
  state: {
    currentCharacterIndex: -1,
    characterSimulatorHasInit: false,
    characters: [],
    equipments: [],
    // deleteAllSavedDataBackup: null
    autoSaveDisabled: false,
  },
  getters: {
    currentCharacter(state) {
      return state.characters[state.currentCharacterIndex];
    },
  },
  mutations: {
    closeAutoSave(state) {
      state.autoSaveDisabled = true;
    },
    characterSimulatorInitFinished(state) {
      state.characterSimulatorHasInit = true;
    },
    reset(state, { skillBuildsReplaced = true } = {}) {
      if (skillBuildsReplaced)
        state.skill.skillBuilds = [];
      state.characters = [];
      state.equipments = [];
      state.food.foodBuilds = [];
    },
    setCurrentCharacter(state, { index }) {
      state.currentCharacterIndex = index;
    },
    createCharacter(state, chara) {
      state.characters.push({
        iid: state.characters.length,
        origin: chara,
      });
      state.currentCharacterIndex = state.characters.length - 1;
    },
    removeCharacter(state, { index }) {
      state.characters.splice(index, 1);
      state.characters.forEach((_, i) => {
        state.iid = i;
      });
      if (state.currentCharacterIndex >= state.characters.length)
        state.currentCharacterIndex = state.characters.length - 1;
    },
    appendEquipments(state, eqs) {
      state.equipments.push(...eqs);
    },
    removeEquipment(state, { index }) {
      state.equipments.splice(index, 1);
    },
    deleteAllSavedData() {
      // const backup = {};

      const prefix = 'app--character-simulator--data-';
      const storage = window.localStorage;

      let find = true,
        cnt = 0,
        list = ['', '--characters', '--equipments', '--skillBuilds', '--foodBuilds'];
      while (find) {
        const cur_prefix = prefix + cnt;
        const finds = list.filter(p => {
          const item = cur_prefix + p;
          if (storage.getItem(item) !== null) {
            // backup[item] = storage.getItem(item);
            storage.removeItem(item);
            return true;
          }
          return false;
        });
        find = finds.length > 0;
        ++cnt;
      }

      // state.deleteAllSavedDataBackup = backup;
    },
  },
  actions: {
    loadCharacterSimulator({ state, commit, dispatch }, { index, resetOption = {} }) {
      const prefix = 'app--character-simulator--data-' + index;
      if (!window.localStorage.getItem(prefix)) {
        throw new Error(`Index: ${index} of Character-Simulator Data is not exist.`);
      }
      try {
        commit('reset', resetOption);

        const summary = JSON.parse(window.localStorage.getItem(prefix));
        const characters = JSON.parse(window.localStorage.getItem(prefix + '--characters'));
        const equipments = JSON.parse(window.localStorage.getItem(prefix + '--equipments'));
        const skillBuildsCsv = window.localStorage.getItem(prefix + '--skillBuilds');

        let foodBuilds = window.localStorage.getItem(prefix + '--foodBuilds');
        if (foodBuilds)
          foodBuilds = JSON.parse(foodBuilds);

        const allEquipments = equipments.map(p => {
          const load = CharacterEquipment.loadEquipment(p);
          if (!load.error)
            return load.equipment;
          return null;
        });

        characters.forEach(p => {
          const chara = new Character();
          const load = chara.load(p, allEquipments);
          if (!load.error)
            commit('createCharacter', chara);
        });

        const validEquipments = allEquipments.filter(p => p);
        commit('appendEquipments', validEquipments);

        const resetSkillBuilds = resetOption.skillBuildsReplaced === undefined ? true : resetOption.skillBuildsReplaced;
        dispatch('skill/loadSkillBuildsCsv', { csvString: skillBuildsCsv, reset: resetSkillBuilds });

        if (foodBuilds){
          foodBuilds.forEach(p => {
            const foods = state.food.foodsBase.createFoods();
            const load = foods.load(p);
            if (!load.error)
              commit('food/createFoodBuild', { foodBuild: foods });
          });
        }

        // 讀檔過程會改寫index，因此最後設定index
        commit('setCurrentCharacter', { index: summary.characterIndex });
        commit('skill/setCurrentSkillBuild', { index: summary.skillBuildIndex });
        commit('food/setCurrentFoodBuild', { index: summary.foodBuildIndex !== undefined ? summary.foodBuildIndex : -1 });
      } catch (error) {
        commit('reset');
        commit('createCharacter', new Character());
        console.warn('Error when load Character-Simulator data.');
        commit('closeAutoSave');
        throw error;
      }
    },
    saveCharacterSimulator({ state, getters }, { index = -1 }) {
      const characters = state.characters.map(p => p.origin.save(state.equipments));
      const equipments = state.equipments.map(p => p.save());
      const skillBuildsCsv = getters['skill/saveSkillBuildsCsv']();
      const foodBuilds = state.food.foodBuilds.map(p => p.save());

      let prefix = 'app--character-simulator--data-';
      if (index === -1) {
        let cnt = 0;
        while (window.localStorage.getItem(prefix + cnt))
          ++cnt;
        prefix = prefix + cnt;
      }
      else {
        prefix = prefix + index;
      }

      const summary = {
        characters: state.characters.map(p => p.origin.name),
        equipments: {
          numbers: state.equipments.length,
        },
        skillBuilds: state.skill.skillBuilds.map(p => p.name),
        characterIndex: state.currentCharacterIndex,
        skillBuildIndex: state.skill.currentSkillBuildIndex,
        foodBuildIndex: state.food.currentFoodBuildIndex,
      };

      try {
        window.localStorage.setItem(prefix, JSON.stringify(summary));
        window.localStorage.setItem(prefix + '--characters', JSON.stringify(characters));
        window.localStorage.setItem(prefix + '--equipments', JSON.stringify(equipments));
        window.localStorage.setItem(prefix + '--skillBuilds', skillBuildsCsv);
        window.localStorage.setItem(prefix + '--foodBuilds', JSON.stringify(foodBuilds));
      } catch (e) {
        console.warn('Error when save Character-Simulator datas');
        console.warn(e);
        window.localStorage.removeItem(prefix + '--characters');
        window.localStorage.removeItem(prefix + '--equipments');
        window.localStorage.removeItem(prefix + '--skillBuilds');
        window.localStorage.removeItem(prefix + '--foodBuilds');
      }
    },
  },
  modules: {
    skill: module_skill,
    food: module_food,
  },
};

export default store;
