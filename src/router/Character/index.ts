import type { RouteRecordRaw } from 'vue-router'

import { DataStoreIds } from '@/stores/app/datas'
import { LocaleViewNamespaces } from '@/stores/app/language/enums'

import { PrepareLocaleInit, ViewInit } from '@/shared/services/ViewInit'

import ViewWrapper from './view-wrapper.vue'

import { AppRouteNames } from '../enums'

export const enum CharacterSimulatorRouteNames {
  Basic = 'CharacterSimulator.Basic',
  Equipment = 'CharacterSimulator.Equipment',
  Food = 'CharacterSimulator.Food',
  Potion = 'CharacterSimulator.Potion',
  Registlet = 'CharacterSimulator.Registlet',
  Save = 'CharacterSimulator.Save',
  Skill = 'CharacterSimulator.Skill',
  Dashboard = 'CharacterSimulator.Dashboard',
}

export default {
  name: AppRouteNames.Character,
  path: '/character',
  component: ViewWrapper,
  beforeEnter(_to, _from, next) {
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
    ],
  },
  children: [
    {
      name: AppRouteNames.CharacterSimulator,
      path: '',
      component: () => import('@/views/CharacterSimulator/index.vue'),
      meta: {
        title: 'app.page-title.character-simulator',
        wideLayout: true,
      },
      redirect: {
        name: CharacterSimulatorRouteNames.Equipment,
      },
      children: [
        {
          name: CharacterSimulatorRouteNames.Basic,
          path: 'basic',
          component: () => import('@/views/CharacterSimulator/character-basic.vue'),
        },
        {
          name: CharacterSimulatorRouteNames.Equipment,
          path: 'equipment',
          component: () =>
            import(
              '@/views/CharacterSimulator/character-equipment-fields/character-equipment-fields.vue'
            ),
        },
        {
          name: CharacterSimulatorRouteNames.Skill,
          path: 'skill',
          component: () => import('@/views/CharacterSimulator/character-skill/index.vue'),
        },
        {
          name: CharacterSimulatorRouteNames.Food,
          path: 'food',
          component: () => import('@/views/CharacterSimulator/character-food/index.vue'),
        },
        {
          name: CharacterSimulatorRouteNames.Potion,
          path: 'potion',
          component: () => import('@/views/CharacterSimulator/character-potion/index.vue'),
        },
        {
          name: CharacterSimulatorRouteNames.Registlet,
          path: 'registlet',
          component: () => import('@/views/CharacterSimulator/character-registlet/index.vue'),
        },
        {
          name: CharacterSimulatorRouteNames.Save,
          path: 'save',
          component: () => import('@/views/CharacterSimulator/character-save/index.vue'),
        },
        {
          name: CharacterSimulatorRouteNames.Dashboard,
          path: 'dashboard',
          component: () =>
            import('@/views/CharacterSimulator/character-dashboard/character-dashboard.vue'),
        },
      ],
    },
  ],
} as RouteRecordRaw
