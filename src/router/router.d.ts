import { LeftMenuViewButton } from '@/stores/app/left-menu'
import 'vue-router'
declare module 'vue-router' {
  interface RouteMeta {
    title?: string | null;
    leftMenuViewButtons?: LeftMenuViewButton[];
    metaTags?: Record<string, string>[];

    // parent path name to get pure path without params
    parentPathName?: string;
  }
}
