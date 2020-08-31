const store = {
  namespaced: true,
  state: {
    characters: [],
    skillBuilds: []
  },
  mutations: {
    createSkillBuild(state, build){
      state.skillBuilds.push(build);
    },
    deleteSkillBuild(state, { index }) {
      state.skillBuilds.splice(index, 1);
    },
    createCharacter(state, chara) {
      state.characters.push(chara);
    },
    deleteCharacter(state, { index }) {
      state.characters.splice(index, 1);
    }
  }
};

export default store;