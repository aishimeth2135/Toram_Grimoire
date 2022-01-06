import { defineStore } from 'pinia';
import { readonly, ref } from 'vue';

interface NavItem {
  title: string;
  pathName: string;
}

export const useNavStore = defineStore('app-nav', () => {
  const navItems = ref<NavItem[]>([]);

  const setItems = (items: NavItem[]) => {
    navItems.value = [{
      title: 'app.page-title.base',
      pathName: 'Home',
    }, ...items];
  };

  return {
    navItems: readonly(navItems),
    setItems,
  };
});

export type { NavItem };
