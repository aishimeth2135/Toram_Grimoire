import store from "@store/main";

const Grimoire = {
  get CharacterSystem() {
    return store.state.datas.character;
  },
  get ItemSystem() {
    return store.state.datas.items;
  },
  get SkillSystem() {
    return store.state.datas.skill;
  },
  get TagSystem() {
    return store.state.datas.tag;
  },
  get EnchantSystem() {
    return store.state.datas.enchant;
  }
};

export default Grimoire;