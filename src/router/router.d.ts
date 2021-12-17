import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    title?: string | (() => string) | null;
    leftMenuViewButtons?: {
      title: string | (() => string);
      icon: string;
      path: string;
    }[];
    metaTags?: Record<string, string>[];
  }
}
