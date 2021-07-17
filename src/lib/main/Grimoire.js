import store from "@/store";

import ItemsSystem from "@/lib/Items";
import CharacterSystem from "@/lib/Character";
import TagSystem from "@/lib/Tag";
import SkillSystem from "@/lib/Skill";
import EnchantSystem from "@/lib/Enchant";

const Grimoire = {
  /** @type {CharacterSystem} */
  get Character() {
    return store.state.datas.character;
  },

  /** @type {ItemsSystem} */
  get Items() {
    return store.state.datas.items;
  },

  /** @type {SkillSystem} */
  get Skill() {
    return store.state.datas.skill;
  },

  /** @type {TagSystem} */
  get Tag() {
    return store.state.datas.tag;
  },

  /** @type {EnchantSystem} */
  get Enchant() {
    return store.state.datas.enchant;
  },
};

export default Grimoire;
