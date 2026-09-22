# 技能資料處理

## 基本名詞

### 技能資料

技能資料（data）就是真正最後用來顯示介面的資料，是將技能效果、分支及屬性作各種處理後，最後輸出出來的資料。

### 技能效果

技能效果（effect）是組成一個技能的資料的基本單元。一個技能效果表示「裝備什麼裝備時，這個技能的效果是…」，用於區分裝備不同的裝備時，技能效果的差異。

### 分支

- 分支（branch）是組成一個技能效果的基本單元。多個分支組成一個技能效果。
- 分支都有分支名稱，用來表示這個分支是用來顯示什麼的。例如`damage`分支用來顯示技能的傷害資訊。
- 分支分為「主要分支」、「後綴分支」及「虛擬分支」三種。
  - 主要分支(main branch)：真正實際用來顯示介面的分支。
  - 後綴分支(suffix branch)：後綴分支只能依附在主要分支上，無法單獨存在，在轉換成**技能資料**之前會和主要分支進行資料相關的合併。
  - 虛擬分支(virtual branch)：可以單獨存在，但不會被轉換成**技能資料**，因此不會顯示在介面上。用於處理一些比較例外的狀況，或用於對資料本身作一些額外擴充

### 屬性

屬性（property）在分支底下，是組成分支的基本單位，也是一個技能的資料的最小單位。屬性也可以視為一個分支的各種參數。一個屬性又可以拆成「屬性名稱」和「屬性值」。

#### 子屬性

屬於屬性的一種，通常用於在屬性上補充其資訊。其 key 值會用`(屬性名稱).(子屬性名稱)`表示。

## 屬性基本類型

- 下面部分基本類型可以直接對應到`handleDisplayData`的`options`。其他的則是都有另外的處理方式。
- 所有屬性一定在下方基本屬性類型的分類中。
- 少部分屬性會由兩種類型進行組合。
  - 例1：`Formula + FormulaSpecial`表示這個公式除了有自己專用的變數，也可以使用`Formula`的變數。
  - 例2: `string + List`表示可以填入多個`string`。

### `Formula`: 公式

- 公式會被解析並進行相關運算，有其可以使用的變數清單。
- 對應到`options.values`。

### `FormulaExtended`: 角色能力公式

- 類似`Formula`，公式會被解析並進行相關運算。
- 為角色模擬器專用的公式，能使用的變數和其他`Formula`完全分開，互不相通。

### `FormulaSpecial`: 專用公式

- 類似`Formula`，公式會被解析並進行相關運算。
- 特定分支屬性專用的公式，通常用於在基礎架構上追加相關功能，能使用的變數和其他`Formula`完全分開，互不相通。

### `Text`: 說明文字

- 文字內部的`${(Formula)}`會用和`Formula`相同的方式進行解析。
- 除此之外還有部分格式會經由`parseText`處理。
- 對應到`options.texts`。

### `Options`: 選項

- 屬性值只能從數個特定的值之中選擇一項。

### `boolean`: 布林值

- 屬性值只有「是」或「不是」（1或0）。

### `string` 純文字

- 和`Text`很接近，但是`string`不會被做任何處理或解析。
- 對應到`options.pureDatas`。

### `number`: 純數字

- 和`Formula`很接近，但是`number`不會被做任何處理或解析，只會用`parseInt/parseFloat`處理。
- 對應到`options.pureValues`。

### `List`: 列表

- 表示屬性值可以填入多個值。
- 無例外情況下，每個值用「`,`」隔開，「`,`」前後的空白會被忽略。
- 此屬性類型必定和其他屬性類型作搭配，例如`string + List`表示可以填入多個`string`。
- `Formula + List`的屬性，每個值須用「`,,`」（兩個逗號）隔開。

### `Iterable`: 可迭代的

- 與`List`類似，差別在於此屬性的每個值必須分開列出。
- 填寫的格式為`(屬性名稱).(index)`。

## 屬性類型模組

屬性基本類型是「屬性值的處理策略」，不是分支種類。分支 Handler 仍依畫面語意組合多種屬性，實際的共用解析與結果建立集中在 `Properties`：

| 類型              | 模組                            | 責任                                                             |
| ----------------- | ------------------------------- | ---------------------------------------------------------------- |
| `Formula`         | `Properties/Formula.ts`         | 建立公式變數、解析一般公式、計算屬性與 Stat 結果                 |
| `FormulaExtended` | `Properties/FormulaExtended.ts` | 定義並合併角色模擬器追加的公式變數、文字與方法                   |
| `FormulaSpecial`  | `Properties/FormulaSpecial/`    | 依屬性拆分具有獨立變數範圍與計算時機的專用公式                   |
| `Text`            | `Properties/Text.ts`            | 解析文字標記及文字內的公式                                       |
| `Options`         | `Properties/Options.ts`         | 將限定選項轉為翻譯後的顯示結果                                   |
| `boolean`         | `Properties/Boolean.ts`         | 解析 `0`／`1` 並提供選項翻譯所需的正規化值                       |
| `string`          | `Properties/String.ts`          | 建立不解析內容的字串結果                                         |
| `number`          | `Properties/Number.ts`          | 建立數字結果；目前沿用既有公式計算入口以維持 `pureValues` 相容性 |
| `List`            | `Properties/List.ts`            | 切分一般列表與以 `,,` 分隔的公式列表                             |
| `Iterable`        | `Properties/Iterable.ts`        | 建立及載入 `(屬性名稱).(index)` 格式的鍵                         |

`List` 與 `Iterable` 是可疊加在其他基本類型上的結構修飾，不會自行決定內容的解析方式。`SkillComputing/compute.ts` 與 `damageSource.ts` 保留為相容匯出入口；跨子分類的新程式應從 `Properties/index.ts` 匯入。

### `FormulaSpecial` 分類

`FormulaSpecial` 是類型分類，不代表所有專用公式共用同一組變數。每個屬性在 `Properties/FormulaSpecial` 內使用獨立檔案定義 scope 與計算時機：

| 屬性                                  | 模組                | 變數與計算時機                                                                          |
| ------------------------------------- | ------------------- | --------------------------------------------------------------------------------------- |
| `registlet`                           | `Registlet.ts`      | 疊加在 `Formula` 或 Stat 結果上，使用 `RLv`，於一般公式結果建立時檢查托環等級並計算加值 |
| `conditionValue`                      | `ConditionValue.ts` | 僅供 Stat 使用；保存公式至角色模擬器取得 `$skill`、`$self`、`$branch` 後才判斷          |
| 傷害來源的 `conditionValue`、`amount` | `DamageSource.ts`   | 分別使用傷害來源所需的 `$skill`，以及 `$self.damage`、`$branch.frequency`               |

新增其他 `FormulaSpecial` 屬性時，應建立獨立檔案並明確定義其 scope，不應直接擴充一般 `Formula` 的共用變數。

## 模組邊界

- `Skill` 保存載入的技能、效果與原始分支資料。
- `Properties` 依屬性基本類型提供解析、正規化與結果建立策略。
- `SkillComputing` 組裝效果、管理 Stack 與計算公式。`computeBranchValueResults`、`computeBranchStatResults` 不執行單位格式化、顯示覆寫或 CSS 標記。
- `SkillDisplay` 提供查詢頁與角色模擬共用的 Handler、翻譯與顯示加工。請從其 `index.ts` 匯入，不要引用其他頁面的內部檔案。
- Vue 元件負責版面與互動；輸入框寬度等顯示決策由 `SkillDisplay/presentation.ts` 提供。

原本的 `views/Character/SkillQuery/skill/branch-handlers` 已移至 `SkillDisplay/handlers`。`Next` 沿用 `EffectHandler`，以 `realName` 判斷 Next 特有語意。

## 分支處理順序

1. 從原始分支建立可計算的分支，補基本資訊，建立歷史效果容器。
2. `initializeEffectBranches` 執行效果覆寫、固定預設值及特殊屬性處理。
3. 在分支仍為平面列表時，依日期由新到舊還原歷史資料。
4. 分類主分支與後綴分支，消化虛擬分支，再判斷延後計算需求。
5. 依序組裝歷史分支與 Stack，建立其下一版本比較資料；最後初始化目前效果的 Stack。

分類會消耗平面列表，每個效果僅執行一次。歷史還原前不能先分類；歷史比較的下一版本必須已經完成分類。歷史覆寫的空字串與刪除規則沿用既有行為，不在還原後重新填滿所有預設值。

分支 clone 會重建 suffix 與空 suffix 的主分支關聯，保留 `realName`；覆寫紀錄則由歷史組裝流程建立，不直接沿用上一版本的紀錄。

## Handler 與公式輸入

Handler 在屬性副本上解析衍生資料，再交給 `handleDisplayData`。`collectBranchFormulaValues` 收集有效屬性與 Stat 公式，包含 `@range`、`@extra_value[n]`、`.display`、`.registlet` 等欄位。

公式 helper 與後續計算使用同一份有效屬性。翻譯後還需要文字公式解析的 caption，會在翻譯後重新準備相依變數。RLv 陣列會複製，不修改呼叫端的響應式資料。

固定缺值與 `auto` 推導是不同操作：`cloneBranchProps` 的字串預設值只補不存在的 key，函式則轉換既有值。Stack 的名稱／預設公式與 Proration 的 `auto` 解讀集中於 `branchProps.ts`。

## 欄位與結果契約

Handler 可以使用既有的 values、texts、langs 等設定表組裝動態欄位；同一欄位應明確選擇一種顯示處理方式。filter 函式依原始值判斷；物件形式以 `source: 'raw' | 'computed'` 明確指定輸入。

共用處理不得修改傳入的屬性或設定表。顯示篩選與格式化使用副本：

- `result`、`get`、`has` 表示可見的顯示結果。
- `getValue`、`getValueSum` 優先讀取獨立的數值計算結果，即使數值欄位被顯示 filter 隱藏，也保留其數值與托環加值。
- `getOrigin` 仍讀取顯示欄位的 origin。衍生欄位的真正來源請使用結果的 `sources`。
- `computeBranchValueResults` 的缺值結果為 `0` 並標記 empty；Stat 合計沿用小數、一般數值合計沿用整數的既有規則。

衍生欄位在 `sources` 指定原始 branch、key，必要時加上 index。歷史標記依來源欄位比對；文字公式子結果會繼承來源。組合其他 Handler 時，使用 `setResult` 保留子結果、來源與顯示 metadata，不先轉成字串再包裝。

Heal 附加資料使用成對的 `HealExtraItem`。數值／標籤數量不一致時會記錄診斷，缺少數值以 `0` 補足，缺少標籤以空字串補足。Table 會記錄超出欄名範圍的 cell，維持原有欄數與呈現方式。

## 人工驗證項目

依專案規範不新增 unit test 或啟動 dev server。修改後執行相關檔案的 ESLint、Prettier 與 `yarn type-check`，再於實際頁面確認：

- 切換技能／角色等級與原公式模式，包含 `stack`、`stack[2]`、`RLv[1]`、`RLv[2]`。
- 啟用與停用第二個托環，確認主數值與加值均正確。
- 調整 Stack，確認預設值、自動名稱及公式中的名稱一致。
- 檢查短射程技能的 Area 示意圖，以及 Heal 的多項附加數值。
- 切換裝備與歷史版本，確認 Next 語意、suffix 所屬主分支與 Proration／衍生欄位的差異標記。
- 確認角色模擬的技能面板與傷害計算仍能讀取數值；顯示覆寫不能改變計算值。

公式引擎與遊戲公式保持原有設計。未加入跨狀態快取；效能調整應先量測，再決定如何追蹤技能等級、Stack、托環與語系等相依狀態。
