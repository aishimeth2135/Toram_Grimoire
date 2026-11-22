# Glossary Tag 資料流與契約

## 資料來源與語系

`useDatasStore().ensureLoaded()` 透過 `prepareGlossary()` 準備 `DataStoreIds.Glossary`。`DownloadGlossaryDataset` 從 `/public/glossary/manifest.json` 載入並驗證同一版本的四語 CSV，重用 `createCdnDataset` 管理已驗證與上一版的離線快照。基礎 A:C 與各語系兩欄投影為新陣列並交給 `LoadGlossaryTag()`。完成模型後掛載至 `DatasStoreBase.Glossary`，使用端透過 `Grimoire.Glossary` 存取同一個 `GlossarySystem`。

基礎 CSV 為繁體中文。首列由載入器略過，資料列依欄位位置讀取。

| 基礎欄位                 | 翻譯欄位 | 用途                           |
| ------------------------ | -------- | ------------------------------ |
| `tag/name`（第 1 欄）    | 第 1 欄  | 條目名稱，也是關聯條目的查找鍵 |
| `frame/name`（第 2 欄）  | —        | 外框類型，固定由基礎 CSV 提供  |
| `frame/value`（第 3 欄） | 第 2 欄  | 分類或正文文字                 |

`getLocaleDataResult()` 按列號對齊資料，逐欄優先取主要語系的非空值，其次取備用語系的非空值，最後保留基礎值。翻譯 CSV 須維持相同列序。名稱翻譯後，`#[...]` 引用的目標也須與載入後的名稱一致。

## 列與資料模型

- 非空的 `tag/name` 建立新的 `GlossaryTag` 並結束上一筆條目的正文區塊。名稱空白的列沿用目前條目。第一筆條目之前的資料列會略過。
- `category` 將 `frame/value` 寫入 `GlossaryTag.categoryText`。每個條目只有一個分類字串，初始值為空字串。同一條目再遇到 `category` 時，最後一筆值覆蓋前值，空字串也會覆蓋。`category` 會結束目前的正文區塊。
- `caption` 和 `list` 都會建立一個 `GlossaryTagRow`，按 CSV 順序存入 `GlossaryTag.rows`。每個 `GlossaryTagRow` 的 `type` 為 `caption` 或 `list`，`value` 為字串陣列，第一個元素來自建立該區塊的資料列。
- `frame/name` 空白時，非空的 `frame/value` 會接到目前條目最後開啟的正文區塊。若目前沒有開啟的正文區塊，該值會略過。遇到未知的 `frame/name` 時，略過該列的外框與文字，並結束目前的正文區塊。
- `GlossarySystem.tags` 依建立順序儲存條目。`getTagByName()` 以名稱完全相符查找第一筆，提供資料時應讓每個條目名稱唯一。

## 查詢、顯示與關聯條目

- 名詞查詢頁對 `name`、`categoryText` 和 `rows` 的所有文字做不分大小寫的子字串搜尋。
- 名詞查詢頁與名詞浮窗都在標題旁顯示 `categoryText`，空字串時省略分類。正文由共用的 `GlossaryTagContentRows` 顯示，`caption` 取第一筆文字，`list` 將所有文字依序顯示為項目。
- `#[名稱]` 同時指定查找名稱與顯示文字，`#[顯示文字][名稱]` 則指定兩者。技能說明等支援名詞浮窗的文字會依名稱查找條目，查不到時只呈現文字。名詞正文將引用呈現為橘色文字，也支援以空白結尾的舊式 `#名稱` 標記，其中底線會轉為空格。
- `getIncludedTags()` 掃描分類文字及正文每一筆文字中的 `#[...]` 引用，遞迴收集可查到的條目。結果以名稱去重，排除起始條目，並依起始條目名稱快取。查詢頁與浮窗都在主條目下列出這些關聯條目，子條目本身只顯示內容。舊式標記僅用於正文顯示。
