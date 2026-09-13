import type { RouteRecordRaw } from 'vue-router'

import { DataStoreIds } from '@/stores/app/datas'
import { LocaleViewNamespaces } from '@/stores/app/locale/enums'

import ViewWrapper from './view-wrapper.vue'

import { AppRouteNames } from '../enums'
import { createCategoryViewInitGuard } from '../utils'

export const CharacterSimulatorRouteNames = {
  Basic: 'CharacterSimulator.Basic',
  Equipment: 'CharacterSimulator.Equipment',
  Food: 'CharacterSimulator.Food',
  Potion: 'CharacterSimulator.Potion',
  Registlet: 'CharacterSimulator.Registlet',
  Save: 'CharacterSimulator.Save',
  Skill: 'CharacterSimulator.Skill',
  Dashboard: 'CharacterSimulator.Dashboard',
} as const
export type CharacterSimulatorRouteNames =
  (typeof CharacterSimulatorRouteNames)[keyof typeof CharacterSimulatorRouteNames]

const createCharacterViewInitGuard = createCategoryViewInitGuard(AppRouteNames.Character)

export default {
  name: AppRouteNames.Character,
  path: '/character',
  component: ViewWrapper,
  meta: {
    leftMenuViewButtons: [
      {
        title: 'app.page-title.character-simulator',
        icon: 'gridicons-user',
        pathName: AppRouteNames.CharacterSimulator,
      },
      {
        title: 'app.page-title.skill-query',
        icon: 'ic-outline-menu-book',
        pathName: AppRouteNames.SkillQuery,
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
      beforeEnter: createCharacterViewInitGuard(
        [
          LocaleViewNamespaces.CharacterSimulator,
          LocaleViewNamespaces.SkillSimulator,
          LocaleViewNamespaces.SkillQuery,
          LocaleViewNamespaces.DamageCalculation,
          LocaleViewNamespaces.RegistletQuery,
          LocaleViewNamespaces.EquipmentTrait,
        ],
        DataStoreIds.Stats,
        DataStoreIds.Items,
        DataStoreIds.Crystals,
        DataStoreIds.CharacterStats,
        DataStoreIds.Skill,
        DataStoreIds.Food,
        DataStoreIds.DamageCalculation,
        DataStoreIds.Registlet,
        DataStoreIds.ItemsPotion,
        DataStoreIds.EquipmentTrait,
        DataStoreIds.Glossary
      ),
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
            import('@/views/CharacterSimulator/character-equipment-fields/character-equipment-fields.vue'),
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
    {
      name: AppRouteNames.SkillQuery,
      path: 'skill-info/:skillId?',
      component: () => import('@/views/Character/SkillQuery/index.vue'),
      meta: {
        title: 'app.page-title.skill-query',
      },
      beforeEnter: createCharacterViewInitGuard(
        [LocaleViewNamespaces.SkillQuery],
        DataStoreIds.Stats,
        DataStoreIds.Skill,
        DataStoreIds.Glossary,
        DataStoreIds.Registlet
      ),
    },
  ],
} satisfies RouteRecordRaw
