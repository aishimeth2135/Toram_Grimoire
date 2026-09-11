# AGENTS.md

## 專案概述

Toram Grimoire（Cy's Grimoire）是 Toram Online 的網頁工具，
提供技能查詢、角色模擬、傷害計算、附魔與裝備相關功能。

主要技術：

- Vue 3、TypeScript、Vite
- Pinia、Vue Router、Vue I18n
- Tailwind CSS 4
- PWA（vite-plugin-pwa）

## 溝通原則

- 使用繁體中文說明工作內容。
- 保留程式識別字與現有領域術語。
- 完成後說明修改內容、驗證結果，以及尚未解決的問題。
- 未執行的檢查須明確註明，不得宣稱已通過。

## 環境與指令

- Node.js 版本以 `.node-version` 為準，目前為 22.17.0。
- 使用 Yarn，版本以 `package.json` 的 `packageManager` 為準。
- 保留 `yarn.lock`，不要新增 npm 或 pnpm 的 lockfile。

常用指令：

```sh
yarn install --immutable
yarn type-check
```

檢查指定檔案：

```sh
yarn exec eslint <file>
yarn exec prettier --check <file>
```

注意：

- `yarn lint` 會執行 `eslint . --fix`，可能修改整個專案。
- `yarn pretty` 與 `yarn format` 會格式化 src。
- 一般任務優先檢查或格式化本次修改的檔案。

## 目錄分工

- `src/views/`：頁面與功能專用元件。
- `src/components/`：共用 UI 元件。
- `src/lib/`：遊戲領域模型、公式與計算邏輯。
- `src/stores/`：Pinia 狀態、資料載入與功能狀態管理。
- `src/router/`：路由設定。
- `src/shared/`：共用常數、服務、組合邏輯與工具。
- `src/locales/`：en、ja、zh-CN、zh-TW 翻譯資源。
- `src/assets/`：樣式與其他資源。
- `src/dev/`：開發輔助工具。
- `src/sw.ts`：Service Worker。
- `public/`：公開靜態資源。

新增程式前，先尋找相同功能的現有實作並沿用其組織方式。

## 修改原則

- 開始前查看 `git status`，保留使用者尚未提交的修改。
- 將變更限制在任務所需範圍，避免無關重構與整批格式化。
- 不要手動修改 `node_modules/` 或建置產物。
- 非任務必要，不更換套件、不升級依賴、不修改建置設定。
- 不要為了通過檢查而停用規則或刪除必要邏輯。

## 程式風格

- 任何格式化皆可完全交由 prettier 及 eslint 的現有工具處理，不需要自己處理。
- `@/` 對應 `src/`，跨目錄引用沿用現有 alias 慣例。
- 新增 Vue 元件時，沿用鄰近元件的 API、命名與區塊順序。
- 優先使用明確型別；需要寬鬆型別時，將影響限制在必要範圍。
- 共用計算邏輯放在適當的領域模組，避免在 UI 元件中重複公式。

如果撰寫程式時需要知道此專案的程式格式風格，可參考以下幾點：

- 遵守 `.prettierrc.yaml` 與 `eslint.config.ts`。
- 使用兩個空白縮排、單引號、不加分號。
- 現有的格式化工具會處理 import 與 Tailwind class 排序。

### 空白行規則

- 只使用單一空白行分隔區塊，不得連續出現兩個以上的空白行。
- 不在函式、class、interface、type、CSS rule 或 Vue SFC block 的開頭與結尾保留空白行。
- import 群組及 import 與後續程式碼之間保留一個空白行；import 的排序與分組交由 Prettier 處理。
- TypeScript 頂層的 type、interface、變數、函式與 class 宣告之間，原則上保留一個空白行。
- 緊密相關且共同構成同一份 API 的短宣告可以不加空白行，例如 `Props` 與 `Emits`。
- class 的 constructor、method、getter 與 setter 之間保留一個空白行；用途相同的連續欄位不需逐項加入空白行。
- 函式內以「處理階段」決定空白行：仍在完成同一件事時保持緊湊，轉入下一個處理階段時加入一個空白行。
- guard clause 結束後，如果後續開始主要處理流程，加入一個空白行。
- 資料準備、主要計算、副作用處理與最終結果組裝屬於不同階段時，以一個空白行分隔。
- 不在連續且用途相同的 assignment、條件判斷、函式呼叫或資料轉換步驟之間加入空白行。
- 短小且只有單一處理流程的函式不需為了形式刻意加入空白行。
- Vue SFC 的 `<script>`、`<template>` 與 `<style>` block 之間保留一個空白行。
- Vue template 內預設不使用空白行分隔節點；只有大型且明確獨立的版面區段才可例外。
- CSS 的同層 rules、同層 nested selectors 與 `@keyframes` 等區塊之間保留一個空白行。
- CSS declarations 應保持連續，不依 property 類型插入空白行。
- CSS declarations 與後續第一個 nested selector 之間保留一個空白行。

## 錯誤處理

- 因為值可能不合法而需要錯誤處理時，優先考慮給定預設值，throw error 為最後手段。

## 遊戲公式與資料

- 牽涉到遊戲資料流處理及公式處理的相關流程，應以不更動到邏輯為優先。

## 遊戲名詞解釋

此處列出專案內用到的遊戲專有名詞及其中文名稱，在理解專案程式結構時可作為參考。

- Character(角色)
- Skill(技能)、Skill Tree(技能樹)、Skill Tree Category(技能樹類別)
- Equipment(裝備)
- Crystal(鍛晶，綁定在裝備上)
- Potion(藥劑/消耗品)
- Enchant(裝備附魔)
- Trait(特性)
- Food(料理)
- Registlet(雷吉斯托環，簡稱托環)
- Stat(能力，由裝備、技能、料理等各方面的配置提供)
- Character Stat(角色面板能力，為各方面的 Stat 數值加總後，再經由固定的公式，最後計算出來實際運用於角色身上的能力)
- Damage(傷害值，為角色發動攻擊時會對敵人造成的傷害數值)
- Quest(任務)、Main Quest(主線任務)
- Glossary(遊戲專用名詞，其結構包含名詞的詳細解釋)

## 元件

- 優先重用現有元件、樣式與互動模式。
- `<script>`內考慮可讀性，需要將部分邏輯分離出去時，於元件同目錄下建立`setup.ts`檔案。
- 頁面的元件樹較深，需要建立共用的狀態時，優先考慮此專案自訂的`defineState`，`inject`為最後手段。
- 建立新元件時，`<script>`標籤應在最前面，`<template>`及`<style>`在後方。這部分舊有元件則不必特別檢查及更動。

### 使用`defineProps`定義 props 時

- 一律先宣告一個`interface Props`再傳入。
- 如果要宣告變數，命名一律為`props`。
- 要處理預設值一律用`withDefaults`。
- 若遇到型別為`boolean`的 prop，一律先設定其預設值為`false`，再思考其命名。
- 取用 prop 時，一律直接存取`props`，非必要情況下一律不要使用`toRefs`。

### 使用`defineEmits`定義 events 時

- 一律先宣告一個`Emits`再傳入，變數命名一律為`emit`。
- 定義 optional prop 時，若遇到型別為`boolean`的 prop，一律先設定其預設值為`false`，再思考其命名。

### 建立響應式變數時

- 使用`<element ref="xxx">`時，優先使用`useTemplateRef('xxx')`。
- 需要建立`Ref`時，如果對象為物件，應優先評估使用情境並確認是否能使用`shallowRef`。
- 需要建立`Ref`或`ComputedRef`時，如果對象為物件，必須在函數泛型部分指定型別，例如`computed<SomeData>(() => xxx)`。

## 多語系

用於顯示給使用者閱讀的文字，遵循現有 i18n 機制。

新增翻譯 key 時，按照下列原則處理：

1. 以`zh-tw`語系為主，其他語系在開發時皆可忽略。
2. 優先搜尋`global.yaml`有沒有可用的字串。
3. 一些專案特有的名詞存放在`common.yaml`內。
4. 需要新增字串時，直接進入`zh-tw`語系資料夾，於該頁面對應的檔案內新增字串，字串 ID 命名及結構可參考其他字串檔。
5. 新增字串時，`zh-tw`以外的語系皆可忽略。

## 測試

- 目前專案未導入任何 unit test 機制，一律忽略並且不要嘗試新增。

## 驗證與交付

依修改性質選擇驗證：

- 文件變更：檢查內容與指令是否符合專案現況。
- Vue／TypeScript 變更：執行相關檔案的 ESLint 與型別檢查。
- 影響打包、資源或執行行為的變更：執行建置。
- 計算邏輯變更：驗證具體輸入與預期結果。
- 不需要嘗試運行 dev server 或 build，功能皆採用人工確認。
