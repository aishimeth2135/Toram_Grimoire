import { AppRouteNames } from '@/router/enums'

export const APP_STORAGE_KEYS = {
  FONT_FAMILY: 'app--font-family',
  PRIMARY_LOCALE: 'app--app-locale',
  FALLBACK_LOCALE: 'app--fallback-locale',
  ROOT_ELEMENT_FONT_SIZE: 'app--root-element-font-size',
  NIGHT_MODE: 'app--night-mode',
}

export const ROUTE_LINK_DATAS: {
  name: string;
  icon: string;
  pathName: AppRouteNames;
}[] = [{
  name: 'skill-query',
  icon: 'ic-outline-menu-book',
  pathName: AppRouteNames.SkillQuery,
}, {
  name: 'character-simulator',
  icon: 'mdi-ghost',
  pathName: AppRouteNames.CharacterSimulator,
}, {
  name: 'skill-simulator',
  icon: 'ant-design:build-outlined',
  pathName: AppRouteNames.SkillSimulator,
}, {
  name: 'enchant-simulator',
  icon: 'mdi-cube-scan',
  pathName: AppRouteNames.EnchantSimulator,
}, {
  name: 'enchant-doll',
  icon: 'ant-design:calculator-outlined',
  pathName: AppRouteNames.EnchantDoll,
}, {
  name: 'item-query',
  icon: 'jam-box',
  pathName: AppRouteNames.ItemQuery,
}, {
  name: 'crystal-query',
  icon: 'bx-bx-cube-alt',
  pathName: AppRouteNames.CrystalQuery,
}, {
  name: 'damage-calculation',
  icon: 'mdi-sword',
  pathName: AppRouteNames.DamageCalculation,
}, {
  name: 'registlet-query',
  icon: 'mdi:book-outline',
  pathName: AppRouteNames.RegistletQuery,
}]
