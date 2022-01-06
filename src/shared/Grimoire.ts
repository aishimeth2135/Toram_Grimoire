
import { DatasStoreBase } from '@/stores/app/datas';
import { I18nStore } from '@/stores/app/language';

const Grimoire = {
  get Character() {
    return DatasStoreBase.Character!;
  },

  get Items() {
    return DatasStoreBase.Items!;
  },

  get Skill() {
    return DatasStoreBase.Skill!;
  },

  get Tag() {
    return DatasStoreBase.Tag!;
  },

  get Enchant() {
    return DatasStoreBase.Enchant!;
  },

  get i18n() {
    return I18nStore.i18n!;
  },
};

export default Grimoire;
