
import store from '@/store';

import CharacterSystem from '@/lib/Character';
import EnchantSystem from '@/lib/Enchant';
import ItemsSystem from '@/lib/Items';
import SkillSystem from '@/lib/Skill';
import TagSystem from '@/lib/Tag';

const Grimoire = {
  get Character() {
    return store.state.datas.Character as CharacterSystem;
  },

  get Items() {
    return store.state.datas.Items as ItemsSystem;
  },

  get Skill() {
    return store.state.datas.Skill as SkillSystem;
  },

  get Tag() {
    return store.state.datas.Tag as TagSystem;
  },

  get Enchant() {
    return store.state.datas.Enchant as EnchantSystem;
  },
};

export default Grimoire;
