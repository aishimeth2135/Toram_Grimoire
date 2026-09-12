---
name: create-page
description: 在 Toram Grimoire 專案建立新頁面的基本框架，包含 Vue 頁面、分類路由、初始化、多語系空檔與導覽入口。使用時須提供分類名稱、PascalCase 頁面名稱及繁體中文標題；適用於新增空白頁面，不負責實作頁面功能。
---

# 建立頁面框架

以 `src/views/Registlet/RegistletQuery` 與 `src/router/Registlet` 為組織範例。僅建立基本框架，不複製其資料載入、查詢或狀態邏輯。

## 必要輸入

- 分類名稱 `CategoryName`：獨立指定，用於 views 與 router 的分類資料夾及父路由名稱。新增分類沿用 PascalCase；既有分類使用實際名稱。
- 頁面名稱 `PageName`：必須由使用者指定 PascalCase 名稱，例如 `RegistletQuery`。不從中文標題推測，也不默默修正不合法的命名。
- 頁面標題：必須由使用者提供繁體中文顯示文字。
- 首頁分組：依目前首頁的實作，需指定加入哪個分組。現有分組為 `main`、`query`、`other`；分類資料夾名稱與首頁分組是不同概念。

缺少輸入或命名有歧義時，先彙整詢問，再進行依賴該答案的修改。圖示固定預設為 `mdi:book-outline`，留給人工後續調整，不必要求提供。

## 命名對應

將 PascalCase 轉為 kebab-case：`RegistletQuery` → `registlet-query`。縮寫邊界也應正確處理，例如 `XMLQuery` → `xml-query`；分詞有歧義時詢問。

| 用途                 | 對應                                                   |
| -------------------- | ------------------------------------------------------ |
| 頁面檔案             | `src/views/CategoryName/PageName/index.vue`            |
| 分類路由             | `src/router/CategoryName/index.ts`、`view-wrapper.vue` |
| 父路由名稱           | `AppRouteNames.CategoryName`                           |
| 子路由名稱           | `AppRouteNames.PageName`                               |
| 新分類 URL           | 分類名稱的 kebab-case，前綴 `/`                        |
| 首個子路由 path      | 空字串 `''`                                            |
| 語言檔               | `src/locales/<locale>/<page-kebab>.yaml`               |
| LocaleViewNamespaces | `PageName: 'page-kebab'`                               |
| 標題 ID              | `app.page-title.page-kebab`                            |

若分類與頁面同名，父子路由名稱會衝突，需詢問父路由名稱，不自行加 `Base`。若分類已存在，保留原有父路由與所有 children，詢問新頁面的 child path，不搶占既有空路徑或重建該分類。新增的 child 加在尾端。

## 實作流程

1. 查看 `git status` 與適用的 `AGENTS.md`，保留既有修改。確認以下實作尚符合目前專案：
   - `src/router/enums.ts`、`src/router/index.ts`
   - `src/router/Registlet/index.ts`、`view-wrapper.vue`
   - `src/stores/app/locale/enums.ts`、`index.ts`
   - `src/shared/services/ViewInit.ts`
   - `src/shared/consts/route.ts`
   - `src/views/Home/Home/home-main-section.vue`
   - `src/locales/zh-TW/app.yaml`
2. 檢查頁面檔案、路由名稱及 URL、namespace、翻譯 key 與導覽入口是否已存在。完全相同的註冊不重複新增；存在不相容內容時詢問，不覆寫。
3. 在 `src/router/enums.ts` 的 `AppRouteNames` 新增分類及頁面名稱，key/value 使用對應的 PascalCase 字串。分類已存在則沿用其值。
4. 建立頁面 `index.vue`，使用下方最小模板，只 import `AppLayoutMain`。
5. 新分類建立 `view-wrapper.vue` 與 `index.ts`，依下方模板替換命名；既有分類只追加所需項目。
   - `PrepareLocaleInit(LocaleViewNamespaces.PageName)` 在 `ViewInit` 前呼叫。
   - 新分類使用 `ViewInit().then(next)`，參數保持空白供人工補充，不引入 `DataStoreIds`。既有分類保留原本的初始化參數並追加 namespace。
   - `meta.leftMenuViewButtons` 新增 item，`pathName` 指向新頁面。
   - `children` 新增 route，使用 lazy import；其 `meta.title` 與按鈕 `title` 必須相同。
6. 在 `src/router/index.ts` import 新分類並加入 `routes`；既有分類不重複註冊。
7. 在 `src/stores/app/locale/enums.ts` 的 `LocaleViewNamespaces` 加入 `PageName: 'page-kebab'`。值必須等於語言檔名去掉 `.yaml` 的部分。
8. 在每個實際語系資料夾新增空白的 `<page-kebab>.yaml`，目前為 `en`、`ja`、`zh-CN`、`zh-TW`。不要填入範例字串或複製 Registlet 翻譯。loader 按語系與 namespace 動態 import，不需新增靜態 import。
9. 只在 `src/locales/zh-TW/app.yaml` 的既有 `page-title` 下新增 `<page-kebab>: <使用者提供的標題>`，不另建 `app` 根節點。含 YAML 特殊字元的標題須正確引用。其他語系的 `app.yaml` 不修改。
10. 在 `src/shared/consts/route.ts` 的 `ROUTE_LINK_DATAS` 新增下方入口，供全站側選單使用。
11. 在 `src/views/Home/Home/home-main-section.vue` 的使用者指定分組 `_handle([...])` 中加入 `AppRouteNames.PageName`。首頁採明列路由，不會自動顯示所有 `ROUTE_LINK_DATAS`。如使用者要建立新首頁分組，先詢問分組顯示與樣式需求。

## 模板

以下 `CategoryName`、`PageName`、`category-kebab`、`page-kebab` 為替換符號，產生檔案時使用實際輸入及其轉換結果。

頁面 `index.vue`：

```vue
<template>
  <AppLayoutMain />
</template>

<script lang="ts" setup>
import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'
</script>
```

`view-wrapper.vue`：

```vue
<template>
  <router-view />
</template>
```

新分類的 `index.ts`：

```ts
import type { RouteRecordRaw } from 'vue-router'

import { LocaleViewNamespaces } from '@/stores/app/locale/enums'

import { PrepareLocaleInit, ViewInit } from '@/shared/services/ViewInit'

import ViewWrapper from './view-wrapper.vue'

import { AppRouteNames } from '../enums'

const PageNameView = () => import('@/views/CategoryName/PageName/index.vue')

export default {
  name: AppRouteNames.CategoryName,
  path: '/category-kebab',
  component: ViewWrapper,
  beforeEnter(_to, _from, next) {
    PrepareLocaleInit(LocaleViewNamespaces.PageName)
    ViewInit().then(next)
  },
  meta: {
    leftMenuViewButtons: [
      {
        title: 'app.page-title.page-kebab',
        icon: 'mdi:book-outline',
        pathName: AppRouteNames.PageName,
      },
    ],
  },
  children: [
    {
      name: AppRouteNames.PageName,
      path: '',
      component: PageNameView,
      meta: {
        title: 'app.page-title.page-kebab',
      },
    },
  ],
} satisfies RouteRecordRaw
```

`ROUTE_LINK_DATAS` 新項目：

```ts
{
  name: 'page-kebab',
  icon: 'mdi:book-outline',
  pathName: AppRouteNames.PageName,
},
```

## 驗證與交付

- 對照 diff 確認父子路由、lazy import、路由註冊、namespace 與四語系空檔、兩處標題 ID、zh-TW 標題、全站入口與首頁分組均一致。
- 使用專案工具處理本次檔案格式，避免整批格式化；對修改的 Vue／TypeScript 檔執行 `yarn exec eslint <files>`，並執行 `yarn type-check`。需要時使用 `yarn exec prettier --check <files>` 檢查格式。
- 遵循專案要求，不新增 unit test、不啟動 dev server、不執行 build；功能由人工確認。
- 以繁體中文交付變更檔案、頁面 URL、已執行檢查結果及尚待人工補上的內容（頁面功能、ViewInit 資料需求與圖示）。未執行或失敗的檢查須明確註明。
