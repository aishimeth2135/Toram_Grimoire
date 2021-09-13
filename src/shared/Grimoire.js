
import store from '@/store';

import CharacterSystem from '@/lib/Character';
import EnchantSystem from '@/lib/Enchant';
import ItemsSystem from '@/lib/Items';
import SkillSystem from '@/lib/Skill';
import TagSystem from '@/lib/Tag';


const Grimoire = {
  /** @type {CharacterSystem} */
  get Character() {
    return store.state.datas.Character;
  },

  /** @type {ItemsSystem} */
  get Items() {
    return store.state.datas.Items;
  },

  /** @type {SkillSystem} */
  get Skill() {
    return store.state.datas.Skill;
  },

  /** @type {TagSystem} */
  get Tag() {
    return store.state.datas.Tag;
  },

  /** @type {EnchantSystem} */
  get Enchant() {
    return store.state.datas.Enchant;
  },
};

export default Grimoire;
