import store from "@store/main";

const Grimoire = {
  get CharacterSystem() {
    return store.state.datas.character;
  },
  get ItemSystem() {
    return store.state.datas.item;
  },
  get SkillSystem() {
    return store.state.datas.skill;
  },
  get TagSystem() {
    return store.state.datas.tag;
  },
  get EnchantSystem() {
    console.log(store.state);
    return store.state.datas.enchant;
  }
};

export default Grimoire;