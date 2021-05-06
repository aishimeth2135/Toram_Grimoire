import store from "@/store";

const Grimoire = {
  get Character() {
    return store.state.datas.character;
  },
  get Items() {
    return store.state.datas.items;
  },
  get Skill() {
    return store.state.datas.skill;
  },
  get Tag() {
    return store.state.datas.tag;
  },
  get Enchant() {
    return store.state.datas.enchant;
  }
};

export default Grimoire;