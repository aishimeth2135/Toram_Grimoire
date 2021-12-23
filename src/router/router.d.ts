import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    title?: string | null;
    leftMenuViewButtons?: {
      title: string;
      icon: string;
      path: string;
    }[];
    metaTags?: Record<string, string>[];
  }
}
