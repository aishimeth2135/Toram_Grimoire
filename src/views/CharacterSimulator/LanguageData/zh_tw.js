export default function() {
  return {
    'Character Simulator': {
      'character': '角色',
      'append character': '新建角色',
      'character stats': '角色面板',
      'character level': '角色等級',
      'character name': '角色名稱',
      'character stat points': '角色能力點數',
      'equipment': '裝備',
      'skill': '技能',
      'food build': '料理',
      'save-load': '存檔',
      'stability': '穩定度',
      'confirm selection': '確定選取',
      'refining': '精鍊值',
      'crystal': '鍛晶',
      'crystal empty': '空空的鍛晶',
      'equipment type': '裝備類型',
      'custom equipment': '自訂裝備',
      'character optional base stat': '角色個人能力',
      'custom equipment: default name prefix': '自訂',
      'character field names': {
        'main-weapon': '主手武器',
        'sub-weapon': '副手裝備',
        'body-armor': '身體裝備',
        'additional': '追加裝備',
        'special': '特殊裝備',
        'avatar': '時裝'
      },
      'equipment type category': {
        'main-weapon': '主手武器',
        'sub-weapon': '副手武器',
        'sub-armor': '副手防具',
        'body-armor': '身體裝備',
        'additional': '追加裝備',
        'special': '特殊裝備',
        'avatar': '時裝'
      },
      'field type text': {
        'one-hand-sword': '單手劍',
        'two-hand-sword': '雙手劍',
        'bow': '弓',
        'bowgun': '弩',
        'staff': '杖',
        'magic-device': '魔導具',
        'knuckle': '拳套',
        'halberd': '旋風槍',
        'katana': '拔刀劍',
        'arrow': '箭矢',
        'shield': '盾牌',
        'dagger': '小刀',
        'body-armor-normal': '一般',
        'body-armor-dodge': '輕化',
        'body-armor-defense': '重化'
      },
      'browse equipments': {
        'action: normal': '裝備清單',
        'action: select-field-equipment': '裝備清單',
        'append equipments': '新增裝備',
        'message: remove equipment': '已移除裝備：$0。',
        'message: removed equipment recovery': '已復原裝備：$0。',
        'message: copy equipment': '成功複製裝備。'
      },
      'append equipments': {
        'window title: select-mode': '選擇新增方式',
        'window title: search': '查詢裝備',
        'window title: custom': '自訂裝備',
        'action: search': '查詢裝備',
        'action: custom': '自訂裝備',
        'action: search description': '可以從現存的裝備資料中選取多個想加入的裝備。',
        'action: custom description': '建立一件新裝備，可以自訂該裝備的各項能力值。',
        'search equipment placeholder': '搜尋裝備名稱...',
        'search equipment result: selected title': '件裝備已被選取',
        'search equipment result: obtain': {
          'mobs': '小怪掉落',
          'boss': '定點BOSS掉落',
          'mini_boss': '地圖BOSS掉落',
          'quest': '任務獎勵',
          'smith': '鐵匠鋪製作',
          'unknow': '未知的取得方式',
          'other': '其它',
          'box': '箱子道具內容物',
          'exchange': '交換所兌換'
        },

        'search equipment result: limit reached': '可顯示的搜尋結果數量已達上限。如果沒有找到想找的裝備，請試著更改關鍵字。',
        'search text is empty': '搜尋的關鍵字須至少一個字元。',
        'append equipments successfully': '已成功新增$0件裝備。',
        'selected equipments cleared': '已清除選取的裝備。'
      },
      'create custom equipment': {
        'window title': '建立自訂裝備',
        'select equipment type': '選擇裝備類型',
      },
      'custom equipment editor': {
        'select stat: window title': '管理裝備能力',
        'select stat: search placeholder': '搜尋能力',
        'select stat: current stats': '現存的能力',
        'select stat: appended stats': '新增的能力',
        'select stat: deleted stats': '刪除的能力',
        'equipment name': '裝備名稱',
        'equipment stats': '裝備能力',
        'equipment other': '其他',
        'window title': '自訂裝備設定',
        'equipment can only have one element stat': '一件裝備只能擁有一個屬性'
      },
      'select crystals': {
        'window title': '選擇鍛晶',
        'search placeholder': '搜尋緞晶',
        'selected crystals': '已選擇的鍛晶',
        'category title': ['武器', '身體裝備', '追加裝備', '特殊裝備', '通用']
      },
      'skill management': {
        'passive skills': '被動技能',
        'active skills': '主動技能',
        'user sets: window title': '參數數值設定',
        'default name of stack': '技能層數',
        'default name of skill branch': '技能效果',
        'skill disable': '裝備不符。',
        'skill multiple effects': '包含多個效果。',
        'formula text': {
          'target_def': '目標防禦',
          'target_level': '目標等級'
        },
        'suffix branch': {
          'condition: default': '額外效果'
        },
        'no build has been created': '還沒有建立任何配置喔～請先透過左上方的選單進入「技能模擬器」，建立新的技能配置。',
        'there are no skills yet': '這裡還沒有任何技能喔～請注意，要對角色能力有提升的技能才會顯示在這裡。'
      },
      'show character stats': {
        'base value': '基礎值',
        'init value': '初始值',
        'additional value': '額外加成',
        'equipped with: prefix text': '裝備為',
        'equipped with: suffix text': '時',
        'Click anywhere to close': '點擊任意處以關閉',
        'text of conditional values': {
          '1h_sword': '主手｜單手劍',
          '2h_sword': '雙手劍',
          'bow': '弓',
          'bowgun': '弩',
          'staff': '法杖',
          'magic_device': '主手魔導具',
          'knuckle': '主手｜拳套',
          'dual_sword': '雙劍',
          'halberd': '旋風槍',
          'katana': '拔刀劍',
          'main': {
            'none': '主手｜空手'
          },
          'sub': {
            'magic_device': '副手｜魔導具',
            'knuckle': '副手｜拳套',
            'arrow': '箭矢',
            'dagger': '小刀',
            'shield': '盾牌'
          },
          'armor': {
            'normal': '身體防具｜一般',
            'dodge': '身體防具｜輕量化',
            'defense': '身體防具｜重量化',
            'none': '身體防具｜無裝備'
          }
        }
      },
      'Food Builds Control': {
        'food build': '料理配置',
        'Current food-build is not exist': '無法獲取當前的料理配置，請點選下方的按鈕嘗試復原介面。',
        'Number of selected food has reached the maximum': '可選取的料理數量已達上限。'
      },
      'save-load control': {
        'Auto save Successfully': '自動存檔成功。',
        'Auto load Successfully': '自動讀取成功。',
        'save button: title': '手動存檔',
        'load button: title': '手動讀取',
        'top caption': '正常情況下，系統會在使用者離開頁面或進入頁面時自動進行存檔或讀檔。但如果有需要的話，下面的按鈕提供手動存檔或讀檔的功能。'
      },
      'Warn': {
        'Current character is not exist': '發生了ㄧ些小錯誤，導致無法獲取當前的角色資訊，介面也無法正常顯示......<br />請點選下面的按鈕來建立一個新的角色，以復原介面(_ _)',
        'no equipment selected': '這個欄位是空的w',
        'no eligible equipments found': '沒有符合條件的裝備～點擊上面的按鈕來新增裝備。',
        'no result found': '找不到任何結果0.0',
        'clear equipments completed': '清除成功。',
        'create custom equipment: no equipment type selected': '請先選擇一個裝備類別',
        'create custom equipment editor: selected stats clear': '已取消更動',
        'character stats compare: no result': '沒有任何能力值變化。',
        'Copy character successfully': '已成功複製：$0',
        'Remove character successfully': '已成功移除：$0',
        'Recovery character successfully': '已復原被刪除的：$0',
      }
    }
  };
}