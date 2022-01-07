
import type { RouteRecordRaw } from 'vue-router';

import { DataStoreIds } from '@/stores/app/datas/enums';

import { ViewInit } from '@/shared/services/ViewInit';

import WrapperView from './wrapper.vue';

const CharacterSimulatorView = () => import(/* webpackChunkName: "character-simulator" */ '@/views/CharacterSimulator/index.vue');
const SkillSimulatorView = () => import(/* webpackChunkName: "skill-simulator" */ '@/views/SkillSimulator/index.vue');

export default {
  name: 'Character',
  path: '/character',
  component: WrapperView,
  beforeEnter(to, from, next) {
    ViewInit(DataStoreIds.Stats, DataStoreIds.Items, DataStoreIds.CharacterStats, DataStoreIds.Skill, DataStoreIds.Food).then(next);
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
} as RouteRecordRaw;
