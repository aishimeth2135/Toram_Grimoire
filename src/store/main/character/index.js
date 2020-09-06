const store = {
  namespaced: true,
  state: {
    characters: [],
    skillBuilds: [],
    equipments: []
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
    },
    appendEquipments(state, eqs) {
      state.equipments.push(...eqs);
    },
    removeEquipment(state, { index }) {
      state.equipments.splice(index, 1);
    }
  }
};

export default store;