import type { RouteRecordRaw } from 'vue-router'

import { DataStoreIds } from '@/stores/app/datas'
import { LocaleViewNamespaces } from '@/stores/app/language/enums'

import { PrepareLocaleInit, ViewInit } from '@/shared/services/ViewInit'

import ViewWrapper from './view-wrapper.vue'

import { AppRouteNames } from '../enums'

const CharacterSimulatorView = () =>
  import('@/views/CharacterSimulator/index.vue')
const SkillSimulatorView = () => import('@/views/SkillSimulator/index.vue')

export default {
  name: AppRouteNames.Character,
  path: '/character',
  component: ViewWrapper,
  beforeEnter(to, from, next) {
    PrepareLocaleInit(
      LocaleViewNamespaces.CharacterSimulator,
      LocaleViewNamespaces.SkillSimulator,
      LocaleViewNamespaces.SkillQuery,
      LocaleViewNamespaces.DamageCalculation,
      LocaleViewNamespaces.RegistletQuery
    )
    ViewInit(
      DataStoreIds.Stats,
      DataStoreIds.Items,
      DataStoreIds.CharacterStats,
      DataStoreIds.Skill,
      DataStoreIds.Food,
      DataStoreIds.DamageCalculation,
      DataStoreIds.Registlet,
      DataStoreIds.ItemsPotion,
      DataStoreIds.Glossary
    ).then(next)
  },
  meta: {
    leftMenuViewButtons: [
      {
        title: 'app.page-title.character-simulator',
        icon: 'gridicons-user',
        pathName: AppRouteNames.CharacterSimulator,
      },
      {
        title: 'app.page-title.skill-simulator',
        icon: 'bx-bxs-star-half',
        pathName: AppRouteNames.SkillSimulator,
      },
    ],
  },
  children: [
    {
      name: AppRouteNames.CharacterSimulator,
      path: '',
      component: CharacterSimulatorView,
      meta: {
        title: 'app.page-title.character-simulator',
      },
    },
    {
      name: AppRouteNames.SkillSimulator,
      path: 'skill',
      component: SkillSimulatorView,
      meta: {
        title: 'app.page-title.skill-simulator',
      },
    },
  ],
} as RouteRecordRaw
