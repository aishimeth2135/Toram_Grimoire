import { DatasStoreBase } from '@/stores/app/datas/DatasStoreBase'
import { I18nStore } from '@/stores/app/language/I18nStore'

import Logger from './services/Logger'

const Grimoire = {
  get Character() {
    return DatasStoreBase.Character!
  },

  get Items() {
    return DatasStoreBase.Items!
  },

  get Skill() {
    return DatasStoreBase.Skill!
  },

  get Glossary() {
    return DatasStoreBase.Glossary!
  },

  get Enchant() {
    return DatasStoreBase.Enchant!
  },

  get DamageCalculation() {
    return DatasStoreBase.DamageCalculation!
  },

  get Registlet() {
    return DatasStoreBase.Registlet!
  },

  get i18n() {
    return I18nStore.i18n!
  },

  Logger,
}

export default Grimoire
