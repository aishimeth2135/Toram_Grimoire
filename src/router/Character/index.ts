
import type { RouteRecordRaw } from 'vue-router'

import { DataStoreIds } from '@/stores/app/datas/enums'
import { LocaleViewNamespaces } from '@/stores/app/language/enums'

import { PrepareLocaleInit, ViewInit } from '@/shared/services/ViewInit'

import ViewWrapper from './view-wrapper.vue'

const CharacterSimulatorView = () => import('@/views/CharacterSimulator/index.vue')
const SkillSimulatorView = () => import('@/views/SkillSimulator/index.vue')

export default {
  name: 'Character',
  path: '/character',
  component: ViewWrapper,
  beforeEnter(to, from, next) {
    PrepareLocaleInit(LocaleViewNamespaces.CharacterSimulator, LocaleViewNamespaces.SkillSimulator, LocaleViewNamespaces.SkillQuery)
    ViewInit(DataStoreIds.Stats, DataStoreIds.Items, DataStoreIds.CharacterStats, DataStoreIds.Skill, DataStoreIds.Food).then(next)
  },
  meta: {
    leftMenuViewButtons: [{
      title: 'app.page-title.character-simulator',
      icon: 'gridicons-user',
      pathName: 'CharacterSimulator',
    }, {
      title: 'app.page-title.skill-simulator',
      icon: 'bx-bxs-star-half',
      pathName: 'SkillSimulator',
    }],
  },
  children: [{
    name: 'CharacterSimulator',
    path: '',
    component: CharacterSimulatorView,
    meta: {
      title: 'app.page-title.character-simulator',
    },
  }, {
    name: 'SkillSimulator',
    path: 'skill',
    component: SkillSimulatorView,
    meta: {
      title: 'app.page-title.skill-simulator',
    },
  }],
} as RouteRecordRaw
