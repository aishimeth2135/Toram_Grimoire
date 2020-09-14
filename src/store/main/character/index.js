import Papa from "papaparse";

import { LevelSkillTree } from "@lib/SkillSystem/module/SkillElements.js";
import { CharacterEquipment } from "@lib/CharacterSystem/CharacterStat/class/CharacterEquipment.js";
import { Character } from "@lib/CharacterSystem/CharacterStat/class/main.js";

import createFoodBuild from "./food-build.js";

const store = {
  namespaced: true,
  state: {
    skillRoot: null,
    currentCharacterIndex: -1,
    currentSkillBuildIndex: -1,
    currentFoodBuildIndex: -1,
    characters: [],
    skillBuilds: [],
    equipments: [],
    foodBuilds: []
  },
  getters: {
    saveSkillBuildsCsv: (state, getters) => () => {
      const { type, index } = getters.saveSkillBuildsCsvSetting();
      const datas = [];

      function createColumn() {
        const t = [];
        datas.push(t);
        return t;
      }
      state.skillBuilds.forEach(sr => {
        const p1 = createColumn(),
          n1 = 'skillRoot';
        p1[index['type']] = type[n1];
        p1[index[n1]['name']] = sr.name;
        sr.skillTreeCategoryStates.forEach(stc => {
          if (!stc.visible) return;
          const p2 = createColumn(),
            n2 = 'skillTreeCategory';
          p2[index['type']] = type[n2];
          p2[index[n2]['id']] = stc.origin.id;
          stc.skillTreeStates.forEach(st => {
            if (!st.visible) return;
            const p3 = createColumn(),
              n3 = 'skillTree';
            p3[index['type']] = type[n3];
            p3[index[n3]['id']] = st.origin.id;
            st.levelSkillTree.levelSkills.forEach(skill => {
              const lv = skill.level(),
                sglv = skill.starGemLevel();
              if (lv == 0 && sglv == 0) return;
              const p4 = createColumn(),
                n4 = 'levelSkill';
              p4[index['type']] = type[n4];
              p4[index[n4]['id']] = skill.base.id;
              p4[index[n4]['level']] = lv;
              p4[index[n4]['starGemLevel']] = sglv;
            });
          });
        });
      });

      return Papa.unparse(datas);
    },
    saveSkillBuildsCsvSetting: () => () => {
      const type = {
        'skillRoot': 0,
        'skillTreeCategory': 1,
        'skillTree': 2,
        'levelSkill': 3
      };
      const index = {
        type: 0,
        'skillRoot': {
          name: 1
        },
        'skillTreeCategory': {
          id: 1
        },
        'skillTree': {
          id: 1
        },
        'levelSkill': {
          id: 1,
          level: 2,
          starGemLevel: 3
        }
      };
      return { type, index };
    },
    currentSkillBuild(state) {
      return state.skillBuilds[state.currentSkillBuildIndex];
    },
    currentCharacter(state) {
      return state.characters[state.currentCharacterIndex];
    },
    currentFoodBuild(state) {
      return state.foodBuilds[state.currentFoodBuildIndex];
    }
  },
  mutations: {
    reset(state) {
      state.skillBuilds = [];
      state.characters = [];
      state.equipments = [];
      state.foodBuilds = [];
    },
    setSkillRoot(state, skillRoot) {
      state.skillRoot = skillRoot;
    },
    setCurrentSkillBuild(state, { index }) {
      state.currentSkillBuildIndex = index;
    },
    createSkillBuild(state, { name }) {
      const r = state.skillRoot;
      const newBuild = {
        stateId: state.skillBuilds.length,
        name: name,
        origin: r,
        skillTreeCategoryStates: r.skillTreeCategorys.map(stc => {
          return {
            origin: stc,
            visible: false,
            skillTreeStates: stc.skillTrees
              .filter(st => !st.attrs.simulatorFlag)
              .map(st => {
                const lst = new LevelSkillTree(st);
                st.skills.forEach(skill => lst.appendLevelSkill(skill));
                return {
                  origin: st,
                  levelSkillTree: lst,
                  visible: false,
                };
              })
          };
        })
      };
      state.skillBuilds.push(newBuild);
      state.currentSkillBuildIndex = state.skillBuilds.length - 1;
    },
    removeSkillBuild(state, { index }) {
      state.skillBuilds.splice(index, 1);
    },
    resetSkillBuilds(state) {
      state.skillBuilds = [];
    },
    setCurrentCharacter(state, { index }) {
      state.currentCharacterIndex = index;
    },
    createCharacter(state, chara) {
      state.characters.push({
        iid: state.characters.length,
        origin: chara
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
    setCurrentFoodBuild(state, { index }) {
      state.currentFoodBuildIndex = index;
    },
    createFoodBuild(state, { name, foodBuild }) {
      state.foodBuilds.push(foodBuild ? foodBuild : createFoodBuild(name));
      state.currentFoodBuildIndex = state.foodBuilds.length - 1;
    },
    removeFoodBuild(state, { index }) {
      state.foodBuilds.splice(index, 1);
      if (state.currentFoodBuildIndex >= state.foodBuilds.length)
        state.currentFoodBuildIndex = state.foodBuilds.length - 1;
    }
  },
  actions: {
    loadCharacterSimulator({ commit, dispatch }, { index }) {
      const prefix = 'app--character-simulator--data-' + index;
      if (!window.localStorage.getItem(prefix)) {
        console.warn(`Index: ${index} of Character-Simulator Data is not exist.`);
        return;
      }
      try {
        commit('reset');

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

        dispatch('loadSkillBuildsCsv', { csvString: skillBuildsCsv });

        if (foodBuilds){
          foodBuilds.forEach(p => {
            const foods = createFoodBuild('potum');
            const load = foods.load(p);
            if (!load.error)
              commit('createFoodBuild', { foodBuild: foods });
          });
        }

        // 讀檔過程會改寫index，因此最後設定index
        commit('setCurrentCharacter', { index: summary.characterIndex });
        commit('setCurrentSkillBuild', { index: summary.skillBuildIndex });
        commit('setCurrentFoodBuild', { index: summary.foodBuildIndex !== void 0 ? summary.foodBuildIndex : -1 });
      } catch (e) {
        commit('reset');
        commit('createCharacter', new Character());
        throw e;
      }
    },
    saveCharacterSimulator({ state, getters }, { index = -1 }) {
      const characters = state.characters.map(p => p.origin.save(state.equipments));
      const equipments = state.equipments.map(p => p.save());
      const skillBuildsCsv = getters.saveSkillBuildsCsv();
      const foodBuilds = state.foodBuilds.map(p => p.save());

      let prefix = 'app--character-simulator--data-';
      if (index == -1) {
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
          numbers: state.equipments.length
        },
        skillBuilds: state.skillBuilds.map(p => p.name),
        characterIndex: state.currentCharacterIndex,
        skillBuildIndex: state.currentSkillBuildIndex,
        foodBuildIndex: state.currentFoodBuildIndex
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
    loadSkillBuildsCsv({ state, commit, getters }, { csvString }) {
      const { type, index } = getters.saveSkillBuildsCsvSetting();

      const createBuild = () => {
        commit('createSkillBuild', { name: 'potum' });
        return state.skillBuilds[state.skillBuilds.length - 1];
      };

      let hasInit = false;
      let cur, cur_stc, cur_st;
      Papa.parse(csvString).data.forEach(p => {
        let _type;
        Object.keys(type).find(k => {
          if (type[k] == p[index['type']]) {
            _type = k;
            return true;
          }
        });

        if (_type == 'skillRoot') {
          if (!hasInit) {
            commit('resetSkillBuilds');
            cur = createBuild();
            hasInit = true;
          } else {
            cur = createBuild();
          }
          cur.name = p[index[_type]['name']];
        } else if (_type == 'skillTreeCategory') {
          const id = parseInt(p[index[_type]['id']], 10);
          cur_stc = cur.skillTreeCategoryStates.find(a => a.origin.id == id);
          cur_stc.visible = true;
        } else if (_type == 'skillTree') {
          const id = parseInt(p[index[_type]['id']], 10);
          cur_st = cur_stc.skillTreeStates.find(a => a.origin.id == id);
          cur_st.visible = true;
        } else if (_type == 'levelSkill') {
          const id = parseInt(p[index[_type]['id']], 10);
          const skill = cur_st.levelSkillTree.levelSkills.find(a => a.base.id == id);
          skill.level(parseInt(p[index[_type]['level']], 10));
          skill.starGemLevel(parseInt(p[index[_type]['starGemLevel']], 10));
        }
      });
    },
  }
};

export default store;