/**
 * 貼到目標試算表的 Apps Script，並啟用 Google Sheets 進階服務。
 * 必須填入 Drive 上 plan.json 的檔案 ID 與資料工作表名稱。
 */
const SKILL_MIGRATION = {
  planFileId: '',
  sheetName: '',
  batchSize: 25,
  maxRunMilliseconds: 240000,
}

const SKILL_MIGRATION_KEY = 'skill-basic-migration-v1'

const SKILL_SIMPLIFIED_FORMULA =
  '=IFERROR(IF(AND(NOT(J:J=""), MATCH(I:I,\'清單放置處\'!$B$1:$B$20, 0)), GOOGLETRANSLATE(J:J, "zh-tw", "zh-cn"), ""), "")'

function previewSkillBasicMigration() {
  const { plan, sheet } = loadSkillMigration()
  const state = getSkillMigrationState(sheet, plan)
  verifySkillMigrationRows(sheet, expectedSkillMigrationRows(plan, state ? state.next : 0))
  if (!state) preflightSkillMigration(sheet, plan)
  console.log(
    JSON.stringify(
      {
        sheet: sheet.getName(),
        sourceRows: plan.source.length,
        outputRows: plan.outputRowCount,
        insertedRows: plan.outputRowCount - plan.source.length,
        operations: plan.operations.length,
        completedOperations: state ? state.next : 0,
        backupSheet: state ? state.backupName : null,
        translationColumn: 'T 不比對翻譯值；完成後執行 restoreSkillBasicTranslations 重套公式',
      },
      null,
      2
    )
  )
}

function applySkillBasicMigration() {
  const lock = LockService.getDocumentLock()
  if (!lock.tryLock(1000)) throw new Error('其他 migration 正在執行，請稍後再試')
  try {
    const started = Date.now()
    const { plan, sheet, spreadsheet } = loadSkillMigration()
    let state = getSkillMigrationState(sheet, plan)
    verifySkillMigrationRows(sheet, expectedSkillMigrationRows(plan, state ? state.next : 0))
    if (!state) {
      preflightSkillMigration(sheet, plan)
      if (plan.operations.length === 0) {
        console.log('此計畫沒有變更')
        return
      }
      const backupName =
        'skill-basic-backup-' + Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyyMMdd-HHmmss')
      const backup = sheet.copyTo(spreadsheet)
      backup.setName(backupName)
      const value = {
        sourceHash: plan.sourceHash,
        outputHash: plan.outputHash,
        next: 0,
        backupName,
      }
      Sheets.Spreadsheets.batchUpdate(
        {
          requests: [
            {
              createDeveloperMetadata: {
                developerMetadata: {
                  metadataKey: SKILL_MIGRATION_KEY,
                  metadataValue: JSON.stringify(value),
                  visibility: 'DOCUMENT',
                  location: { sheetId: sheet.getSheetId() },
                },
              },
            },
          ],
        },
        spreadsheet.getId()
      )
      state = getSkillMigrationState(sheet, plan)
    }
    while (
      state.next < plan.operations.length &&
      Date.now() - started < SKILL_MIGRATION.maxRunMilliseconds
    ) {
      const end = Math.min(state.next + SKILL_MIGRATION.batchSize, plan.operations.length)
      const batch = plan.operations.slice(state.next, end)
      const styles = getSkillMigrationStyles(spreadsheet, sheet, batch)
      const requests = []
      batch.forEach(operation =>
        requests.push(...skillMigrationRequests(sheet.getSheetId(), operation, styles))
      )
      const nextState = {
        sourceHash: plan.sourceHash,
        outputHash: plan.outputHash,
        next: end,
        backupName: state.backupName,
      }
      // 進度與插列／寫入在同一個原子 batch 中，逾時後重跑不會重複插列。
      requests.push({
        updateDeveloperMetadata: {
          dataFilters: [{ developerMetadataLookup: { metadataId: state.metadataId } }],
          developerMetadata: { metadataValue: JSON.stringify(nextState) },
          fields: 'metadataValue',
        },
      })
      Sheets.Spreadsheets.batchUpdate({ requests }, spreadsheet.getId())
      state = { ...nextState, metadataId: state.metadataId }
      console.log('已完成 ' + end + '/' + plan.operations.length)
    }
    verifySkillMigrationRows(sheet, expectedSkillMigrationRows(plan, state.next))
    console.log(
      state.next === plan.operations.length
        ? '完成：A～S 已與轉換結果逐格比對一致。請執行 restoreSkillBasicTranslations 重套 T 公式。備份：' +
            state.backupName
        : '已保存進度，請再次執行 applySkillBasicMigration 繼續。'
    )
  } finally {
    lock.releaseLock()
  }
}

function restoreSkillBasicTranslations() {
  const lock = LockService.getDocumentLock()
  if (!lock.tryLock(1000)) throw new Error('其他 migration 正在執行，請稍後再試')
  try {
    const { plan, sheet, spreadsheet } = loadSkillMigration()
    const state = getSkillMigrationState(sheet, plan)
    if (!state || state.next !== plan.operations.length)
      throw new Error('請先完成 applySkillBasicMigration，再重套 T 欄公式')
    verifySkillMigrationRows(sheet, expectedSkillMigrationRows(plan, state.next))
    if (!spreadsheet.getSheetByName('清單放置處'))
      throw new Error('找不到公式引用的「清單放置處」工作表')
    Sheets.Spreadsheets.batchUpdate(
      {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: sheet.getSheetId(),
                startRowIndex: 1,
                endRowIndex: plan.outputRowCount,
                startColumnIndex: 19,
                endColumnIndex: 20,
              },
              cell: { userEnteredValue: { formulaValue: SKILL_SIMPLIFIED_FORMULA } },
              fields: 'userEnteredValue',
            },
          },
        ],
      },
      spreadsheet.getId()
    )
    console.log(
      '已重套 T2:T' + plan.outputRowCount + ' 的簡中公式；請等待 GOOGLETRANSLATE 計算完成。'
    )
  } finally {
    lock.releaseLock()
  }
}

function loadSkillMigration() {
  if (!SKILL_MIGRATION.planFileId || !SKILL_MIGRATION.sheetName)
    throw new Error('請先設定 planFileId 與 sheetName')
  if (typeof Sheets === 'undefined') throw new Error('請在「服務」加入 Google Sheets API')
  const plan = JSON.parse(
    DriveApp.getFileById(SKILL_MIGRATION.planFileId).getBlob().getDataAsString('UTF-8')
  )
  if (
    plan.version !== 1 ||
    plan.columns !== 20 ||
    !Array.isArray(plan.source) ||
    !Array.isArray(plan.operations)
  )
    throw new Error('不支援的 migration 計畫')
  let previousRow = plan.source.length + 1
  const rows = plan.source.slice()
  plan.operations.forEach(operation => {
    if (
      !Number.isInteger(operation.row) ||
      operation.row < 2 ||
      operation.row >= previousRow ||
      !Array.isArray(operation.insert)
    )
      throw new Error('操作列號必須唯一且由下往上排列')
    previousRow = operation.row
    rows.push(operation.anchor, ...operation.insert)
  })
  if (
    rows.some(
      row =>
        !Array.isArray(row) || row.length !== 20 || row.some(value => typeof value !== 'string')
    )
  )
    throw new Error('資料必須為 20 欄字串')
  if (skillMigrationHash(plan.source) !== plan.sourceHash) throw new Error('來源資料雜湊不符')
  const output = expectedSkillMigrationRows(plan, plan.operations.length)
  if (output.length !== plan.outputRowCount || skillMigrationHash(output) !== plan.outputHash)
    throw new Error('轉換結果雜湊不符')
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = spreadsheet.getSheetByName(SKILL_MIGRATION.sheetName)
  if (!sheet) throw new Error('找不到工作表：' + SKILL_MIGRATION.sheetName)
  return { plan, spreadsheet, sheet }
}

function skillMigrationHash(rows) {
  return Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    JSON.stringify(rows),
    Utilities.Charset.UTF_8
  )
    .map(value => ((value + 256) % 256).toString(16).padStart(2, '0'))
    .join('')
}

function expectedSkillMigrationRows(plan, completed) {
  const result = plan.source.slice()
  plan.operations
    .slice(0, completed)
    .forEach(operation =>
      result.splice(operation.row - 1, 1, operation.anchor, ...operation.insert)
    )
  return result
}

function getSkillMigrationState(sheet, plan) {
  const response = Sheets.Spreadsheets.get(sheet.getParent().getId(), {
    fields: 'sheets(properties(sheetId),developerMetadata(metadataId,metadataKey,metadataValue))',
  })
  const item = response.sheets.find(entry => entry.properties.sheetId === sheet.getSheetId())
  const metadata = (item.developerMetadata || []).filter(
    entry => entry.metadataKey === SKILL_MIGRATION_KEY
  )
  if (metadata.length > 1) throw new Error('存在重複的 migration 進度，請改用乾淨副本')
  if (metadata.length === 0) return null
  const state = JSON.parse(metadata[0].metadataValue)
  if (
    state.sourceHash !== plan.sourceHash ||
    state.outputHash !== plan.outputHash ||
    !Number.isInteger(state.next) ||
    state.next < 0 ||
    state.next > plan.operations.length
  )
    throw new Error('此工作表的 migration 進度與計畫不同')
  return { ...state, metadataId: metadata[0].metadataId }
}

function verifySkillMigrationRows(sheet, expected) {
  if (sheet.getLastColumn() !== 20)
    throw new Error('工作表資料範圍不是預期的 A～T，請重新下載 CSV 產生計畫')
  const quotedName = "'" + sheet.getName().replace(/'/g, "''") + "'"
  // 直接透過 API 讀取，避免 SpreadsheetApp 快取仍回傳插列前的值。
  const actual =
    Sheets.Spreadsheets.Values.get(sheet.getParent().getId(), quotedName + '!A:S', {
      valueRenderOption: 'FORMATTED_VALUE',
    }).values || []
  if (actual.length !== expected.length) throw new Error('工作表資料列數不符，請檢查來源或續跑進度')
  for (let rowIndex = 0; rowIndex < expected.length; rowIndex++) {
    // T 由公式重新產生，翻譯值可能仍在載入或因 GOOGLETRANSLATE 重算而改變。
    for (let columnIndex = 0; columnIndex < 19; columnIndex++) {
      if ((actual[rowIndex][columnIndex] || '') !== expected[rowIndex][columnIndex])
        throw new Error(
          '資料不符：第 ' +
            (rowIndex + 1) +
            ' 列，第 ' +
            (columnIndex + 1) +
            ' 欄。停止套用，請檢查來源或備份。'
        )
    }
  }
}

function preflightSkillMigration(sheet, plan) {
  const spreadsheet = sheet.getParent()
  if (
    spreadsheet
      .getSheets()
      .reduce((sum, item) => sum + item.getMaxRows() * item.getMaxColumns(), 0) +
      sheet.getMaxRows() * sheet.getMaxColumns() +
      (plan.outputRowCount - plan.source.length) * sheet.getMaxColumns() >
    10000000
  )
    throw new Error('備份與插列將超過試算表的儲存格容量，請先清理未使用的列／欄或改在獨立副本執行')
  const formulas = sheet.getRange(1, 7, plan.source.length, 13).getFormulas()
  if (formulas.some(row => row.some(Boolean)))
    throw new Error('G～S 含試算表公式；只有 T 欄的簡中公式可在遷移後重套')
  const merges = sheet.getRange(1, 1, plan.source.length, 20).getMergedRanges()
  for (const merge of merges) {
    const first = merge.getRow(),
      last = merge.getLastRow()
    if (
      plan.operations.some(
        operation =>
          first <= operation.row &&
          last >= operation.row &&
          (merge.getLastColumn() >= 7 || (operation.insert.length > 0 && last > operation.row))
      )
    )
      throw new Error(
        '合併儲存格影響插列或寫入：' + merge.getA1Notation() + '。請先在副本取消相關合併。'
      )
  }
  const protections = sheet
    .getProtections(SpreadsheetApp.ProtectionType.SHEET)
    .concat(sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE))
  if (protections.some(protection => !protection.canEdit()))
    throw new Error('有無法編輯的保護範圍，請由具有權限的帳號執行')
}

function getSkillMigrationStyles(spreadsheet, sheet, operations) {
  const quotedName = "'" + sheet.getName().replace(/'/g, "''") + "'"
  const response = Sheets.Spreadsheets.get(spreadsheet.getId(), {
    ranges: operations.map(operation => quotedName + '!A' + operation.row + ':T' + operation.row),
    fields:
      'sheets(data(startRow,rowData(values(userEnteredFormat(borders))),rowMetadata(pixelSize)))',
  })
  const result = {}
  response.sheets.forEach(item =>
    (item.data || []).forEach(data => {
      result[(data.startRow || 0) + 1] = data
    })
  )
  return result
}

function skillMigrationRequests(sheetId, operation, styles) {
  const requests = []
  const count = operation.insert.length
  const anchorRange = {
    sheetId,
    startRowIndex: operation.row - 1,
    endRowIndex: operation.row,
    startColumnIndex: 6,
    endColumnIndex: 20,
  }
  if (count > 0) {
    const inserted = {
      sheetId,
      startRowIndex: operation.row,
      endRowIndex: operation.row + count,
      startColumnIndex: 0,
      endColumnIndex: 20,
    }
    requests.push({
      insertDimension: {
        range: {
          sheetId,
          dimension: 'ROWS',
          startIndex: operation.row,
          endIndex: operation.row + count,
        },
        inheritFromBefore: true,
      },
    })
    requests.push({
      copyPaste: {
        source: { ...inserted, startRowIndex: operation.row - 1, endRowIndex: operation.row },
        destination: inserted,
        pasteType: 'PASTE_FORMAT',
        pasteOrientation: 'NORMAL',
      },
    })
    requests.push({
      updateBorders: {
        range: inserted,
        top: { style: 'NONE' },
        bottom: { style: 'NONE' },
        innerHorizontal: { style: 'NONE' },
      },
    })
    const style = styles[operation.row] || {}
    const height = style.rowMetadata && style.rowMetadata[0] && style.rowMetadata[0].pixelSize
    if (height)
      requests.push({
        updateDimensionProperties: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: operation.row,
            endIndex: operation.row + count,
          },
          properties: { pixelSize: height },
          fields: 'pixelSize',
        },
      })
    const cells = style.rowData && style.rowData[0] ? style.rowData[0].values || [] : []
    cells.forEach((cell, columnIndex) => {
      const bottom =
        cell.userEnteredFormat &&
        cell.userEnteredFormat.borders &&
        cell.userEnteredFormat.borders.bottom
      if (!bottom || bottom.style === 'NONE') return
      requests.push({
        updateBorders: {
          range: {
            sheetId,
            startRowIndex: operation.row - 1,
            endRowIndex: operation.row,
            startColumnIndex: columnIndex,
            endColumnIndex: columnIndex + 1,
          },
          bottom: { style: 'NONE' },
        },
      })
      requests.push({
        updateBorders: {
          range: {
            sheetId,
            startRowIndex: operation.row + count - 1,
            endRowIndex: operation.row + count,
            startColumnIndex: columnIndex,
            endColumnIndex: columnIndex + 1,
          },
          bottom,
        },
      })
    })
    requests.push({
      updateCells: {
        range: inserted,
        rows: operation.insert.map(row => ({
          values: row.map(value =>
            value === '' ? {} : { userEnteredValue: { stringValue: value } }
          ),
        })),
        fields: 'userEnteredValue',
      },
    })
  }
  // 指定 stringValue，遊戲公式即使以 = 開頭也不會變成試算表公式。
  requests.push({
    updateCells: {
      range: anchorRange,
      rows: [
        {
          values: operation.anchor
            .slice(6)
            .map(value => (value === '' ? {} : { userEnteredValue: { stringValue: value } })),
        },
      ],
      fields: 'userEnteredValue',
    },
  })
  return requests
}
