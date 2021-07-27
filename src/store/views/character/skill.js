import Papa from "papaparse";
import { LevelSkillTree } from "@/lib/Skill/Skill";

const storeState = {
  skillRoot: null,
  skillBuilds: [],
  currentSkillBuildIndex: -1,
};

const storeGetters = {
  currentSkillBuild(state) {
    return state.skillBuilds[state.currentSkillBuildIndex];
  },
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
      'levelSkill': 3,
    };
    const index = {
      type: 0,
      'skillRoot': {
        name: 1,
      },
      'skillTreeCategory': {
        id: 1,
      },
      'skillTree': {
        id: 1,
      },
      'levelSkill': {
        id: 1,
        level: 2,
        starGemLevel: 3,
      },
    };
    return { type, index };
  },
};

const mutations = {
  setSkillRoot(state, skillRoot) {
    state.skillRoot = skillRoot;
  },
  setCurrentSkillBuild(state, { index }) {
    state.currentSkillBuildIndex = index;
  },
  createSkillBuild(state, { name, skillBuild }) {
    const r = state.skillRoot;
    const newBuild = skillBuild ? skillBuild : {
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
            }),
        };
      }),
    };
    state.skillBuilds.push(newBuild);
    state.currentSkillBuildIndex = state.skillBuilds.length - 1;
  },
  removeSkillBuild(state, { index }) {
    state.skillBuilds.splice(index, 1);
    if (state.currentSkillBuildIndex >= state.skillBuilds.length)
      state.currentSkillBuildIndex = state.skillBuilds.length - 1;
  },
  resetSkillBuilds(state) {
    state.skillBuilds = [];
  },
};

const actions = {
  loadSkillBuildsCsv({ state, commit, getters }, { csvString, reset = true }) {
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
          reset && commit('resetSkillBuilds');
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
};

export default {
  namespaced: true,
  state: storeState,
  getters: storeGetters,
  mutations,
  actions,
};
