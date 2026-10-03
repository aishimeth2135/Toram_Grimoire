# 技能 basic 一次性 migration

保留來源 CSV，將 L～Q 的舊屬性轉成 basic 分支，保留不需 basic 覆寫的空 effect 寫法。
既有 basic、歷史覆寫及 R、S 翻譯依 `LoadSkill` 語意保留；T 欄簡中翻譯在遷移後整欄重套公式。
不修改網站程式、套件或技能公式。

## 產生轉換結果

在專案根目錄執行（Node.js 22.17.0）：

```sh
node --experimental-strip-types src/tools/skill-basic-migration/migrate.ts
```

也可指定來源與輸出目錄：

```sh
node --experimental-strip-types src/tools/skill-basic-migration/migrate.ts "來源.csv" "輸出目錄"
```

輸出位於此目錄的 `output/`，已由 `.gitignore` 排除：

- `skill-data.migrated.csv`：可預覽／備用的新 CSV，UTF-8 BOM。
- `report.json`：統計、逐 effect 的變更與原始資料警告。
- `plan.json`：原始資料、雜湊及由下往上的插列／寫入計畫。
- `apply.gs`：貼到 Google Apps Script 的執行程式。

非預設 effect 套用舊屬性後若與預設 basic 相同，不新增 basic，包含空值與僅部分欄位填入相同值的情況。
原本透過空首列繼承 branches 的 effect，若不需 basic 覆寫，就保留原本空白的 G～K，不展開預設分支；必要時只清空 L～Q 舊值。
若需新增 basic 覆寫而中斷隱式繼承，僅補回與預設不同的原有 branches。刪除標記、空屬性與重複 ID 仍保留，避免改變覆寫順序或刪除語意。
新增的預設 basic 若無一般 effect 需要覆寫，且歷史紀錄亦無 `139` 參照，ID 設為 `-`；否則保留 `139`。既有 basic 不改寫。
產生結果前會比對非 basic 差異 branches、歷史覆寫資料與四語系的 basic 實際套用結果，並確認舊值清空及再次轉換不產生變更。
表頭、A～F 的技能／裝備／日期資訊保持不變。
新增 basic 會改變網站產生的 branch index；非 basic override id 與資料語意保持一致。

此份 CSV 的結果：514 個技能、960 個一般 effects、388 筆有效歷史紀錄，新增 544 個 basic 與 1,727 列，結果共 13,539 列。153 個空 effects 保留原本空白寫法，另 7 個只新增必要的 basic 覆寫，皆未複製預設的其他分支。413 個非預設 effects 直接沿用預設 basic；新增預設 basic 中，483 個使用 `-`，31 個保留 `139`。
原始 CSV 第 1,659 個紀錄的「法術/終結」歷史目標 effect `3` 不存在；依 LoadSkill 忽略該區塊並原樣保留，未修正這筆既有問題。
此處列號是 CSV 紀錄／試算表列號；多行儲存格會使文字檔的實體行號不同。

## 人工操作

若曾套用舊版計畫，請從遷移前的乾淨副本重跑，並重新上傳此次產生的 `plan.json`。新版計畫不能接續舊版的部分完成進度，也不能直接套用到已遷移的工作表。

1. 暫停編輯來源資料，先將整份 Google 試算表建立副本；第一次在副本操作。
2. 執行上方指令，查看 `report.json` 的 `warnings`。
3. 將 `output/plan.json` 上傳至 Google Drive，取得檔案網址 `/file/d/檔案ID/` 中的 ID。保持 JSON 檔案格式，不轉成 Google 文件。
4. 在試算表副本開啟「擴充功能 → Apps Script」，貼上 `output/apply.gs`。將 `SKILL_MIGRATION.planFileId` 設為檔案 ID，`sheetName` 設為包含 A～T 技能資料的工作表名稱。
5. 在 Apps Script 左側「服務 → ＋」加入 **Google Sheets API**，識別字保留 `Sheets`。若使用自訂 Cloud 專案，亦須在該專案啟用 Google Sheets API。
6. 執行 `previewSkillBasicMigration`，完成 Google Drive／試算表存取授權。A～S 需逐格符合 CSV；T 欄公式的翻譯結果不比對。成功時執行記錄會顯示預計插列與操作數量。
7. 執行 `applySkillBasicMigration`。它先建立 `skill-basic-backup-日期時間` 工作表，再每批處理 25 個 effects。若提示續跑或發生逾時，再執行同一函式；不要手動增刪列或更換計畫。已完成的批次由工作表 metadata 記錄，不會再次插列。
8. 顯示「完成」後，執行 `restoreSkillBasicTranslations`，將提供的 `IFERROR / MATCH / GOOGLETRANSLATE` 公式重新套用至 T2～最後資料列（T1 表頭保留）。這會覆寫此範圍內所有 T 值／公式；請保留公式引用的「清單放置處」工作表。等待翻譯計算完成，再執行 `previewSkillBasicMigration` 確認進度與 A～S 結果，人工查看技能間粗框線、新增列高度、翻譯及 L～Q 清空情況。抽查「威力攻擊」的裝備變體、「逆境怒吼」的繼承／舊值，以及「空舞斬」的既有 basic／歷史紀錄。
9. 驗收副本後，在原試算表依步驟 4～8 執行。原表必須仍與來源 CSV 一致；不一致時重新下載 CSV 並產生新計畫。操作原工作表會保留其 `gid`，不需要替換網站資料網址。
10. 在網站人工確認技能資料、裝備變體及歷史紀錄。若多語系下載使用另外的工作表，須確認它們是否由 R～T 即時產生；獨立維護的翻譯表需另外同步列數，不能直接套用此 20 欄計畫。

不需要將新 CSV 重新匯入或整份貼上原表。

## 樣式與限制

- 只寫入必要列的 G～T 值，保留其他原有儲存格的格式。
- 新列複製 effect 首列的格式／高度，移除新增列的上下及內部水平框線，並將原首列的下框線移至新增區塊末列，避免複製出多條技能粗框線。
- T 欄允許試算表公式；搬移時暫用 CSV 的翻譯值，完成後以 `restoreSkillBasicTranslations` 統一重套原公式。重套只更新 T 欄值，保留格式，亦可重跑；不逐格保存舊 T 公式。GOOGLETRANSLATE 的即時結果須人工確認，CSV 內 T 欄仍是下載時的固定值。
- 來源 G～S 若含試算表公式，或插列／寫入位置含不支援的合併儲存格，會在變更前停止。請先在副本處理後重新下載 CSV；遊戲公式文字不受影響，寫入時明確使用 `stringValue`。
- 條件式格式、列群組、篩選範圍、儲存格註解的語意位置與新列資料驗證，未承諾自動重建；須在副本人工確認。新增列只複製格式，不複製資料驗證。
- 執行前與每次續跑會逐格比對 A～S；同一批的資料變更和進度更新採 Sheets API 原子操作。分批執行不提供整張表的單次原子交易，執行期間應保持資料不被其他人修改。
- 本機已驗證 CSV；Google Sheets 的實際樣式與網站 UI 仍須人工驗收。

## 回復

若需回復，優先使用 Google 試算表版本紀錄復原原工作表，以保留原 `gid`。
備份工作表可供比對；單純把備份改名不會保留原 `gid`。
復原後若要重新套用，先執行預覽；若舊 metadata 與資料不符，請改用執行前的乾淨副本，或一併回復執行前的 metadata。不要只清除進度後直接重跑部分完成的工作表。
