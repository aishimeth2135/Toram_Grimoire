export default function() {
  return {
    'Item Query': {
      'modes': {
        'normal': '一般',
        'stat': '裝備能力',
        'item-level': '道具等級',
        'dye': '染色'
      },
      'no result tips': '找不到任何結果0.0',
      'options: normal': {
        'title': '搜尋目標',
        'name': '名稱',
        'material': '製作素材',
        'obtain-name': '取得來源'
      },
      'options: stat': {
        'select stat: window title': '選擇能力',
        'select stat: search placeholder': '搜尋能力',
        'select stat: title': '請選擇一個能力'
      },
      'sort options': {
        'title': '排序方式',
        'options': {
          'default': '預設排序',
          'atk': 'ATK',
          'def': 'DEF',
          'stability': '穩定度',
        },
        'order': {
          'title': '排序順序',
          'up': '由小至大',
          'down': '由大至小'
        }
      },
      'equipment detail': {
        'production equipment': '製作裝備',
        'scope title': {
          'stats': '裝備能力',
          'recipe': '製作配方',
          'obtains': '取得方式',
        },
        'recipe': {
          'item level': '道具等級',
          'item difficulty': '難易度',
          'spina': '眾神幣'
        },
        'restriction': {
          'event': '活動',
          '1h_sword': '單手劍',
          '2h_sword': '雙手劍',
          'bow': '弓',
          'bowgun': '弩',
          'staff': '法杖',
          'magic_device': '魔導具',
          'knuckle': '拳套',
          'halberd': '旋風槍',
          'katana': '拔刀劍',
          'sub': {
            'arrow': '箭矢',
            'shield': '盾牌',
            'dagger': '小刀',
            'katana': '副手拔刀劍',
            'magic_device': '副手魔導具',
            'knuckle': '副手拳套',
            '1h_sword': '雙劍'
          },
          'body': {
            'dodge': '輕化防具',
            'defense': '重化防具',
            'normal': '一般防具'
          }
        },
        'obtains': {
          'mobs': '小怪',
          'boss': '定點BOSS',
          'mini_boss': '地圖BOSS',
          'quest': '任務',
          'smith': '鐵匠鋪',
          'create equipment': '製作裝備',
          'all smith': '各個城鎮的鐵匠鋪',
          'no data': '尚無資料',
          'unknow': '未知',
          'other': '其它',
          'box': '箱子道具',
          'exchange': '交換所'
        },
        'tips: without any obtain': '取得方式未知',
        'tips: without any stat': '這個裝備沒有任何能力0.0',
      },
      'equipment type category': {
        'main': '主手武器',
        'sub': '副手',
        'body': '身體裝備',
        'additional': '追加裝備',
        'special': '特殊裝備',
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
        'sub-weapon|arrow': '箭矢',
        'sub-weapon|dagger': '小刀',
        'sub-armor|shield': '盾牌',
      },
      'search placeholder': '查詢...',
      'tips': {
        'sort: up': '升冪排序',
        'sort: down': '降冪排序',
        'sort: none': '不進行排序',
        'stats search: first': '請於上方的輸入欄位搜尋能力名稱。',
        'stats search: no result': '沒有符合的結果。請確認搜尋的關鍵字是否正確。'
      },
      'Show Search Caption': {
        'title': '查詢說明',
        'caption: main': [
          '利用((,))可以進行複數查詢，比對方式為((或))。例如：輸入((!A20,B20))，可同時搜尋到染色內帶有((!A20))或((!B20))的裝備。',
          '染色的顯示方式為((!部位+數字))。例如：A20，是指第一個染色部位，且顏色代號為20。一般而言會用ABC來稱呼三個染色部位。',
          '((指定染色查詢))：於搜尋結果查看該裝備時，((!取得方式))的部分僅會顯示帶有搜尋之指定染色的取得方式資訊。'
        ],
        'caption: stat': [
          '此功能可用來查詢具有特定能力的裝備，並依照數值大小進行排序。',
          '利用((,))可以進行複數查詢，比對方式為((或))。例如：輸入((!仇,HP))，可同時搜尋到名稱內帶有((!仇))或((!HP))的能力。',
          '於查詢欄位輸入((@all))時，可直接顯示所有目前已知的裝備能力。由於這樣會佔很多版面，使用上請自行斟酌。',
          '選擇複數的能力時，比對方式為((和))。例如：同時選擇((!仇恨值%))和((!HP上限%))時，只會查詢到同時帶有這兩個能力的裝備。',
          '點擊各項能力的右邊，可調整排序方式，分別有((!升冪))、((!降冪))和((!不進行排序))。不進行排序時，查詢結果會以其在原始資料中的順序來顯示。',
          '選擇複數能力時，會以優先度來進行排序，由左至右，由上至下，越左上角的能力優先度越高。如果複數能力排序時想跳過某項能力，可以將其設為((!不進行排序))。'
        ],
        'caption: item-level': [
          '此功能可用來查詢特定熟練度範圍內的裝備，僅會顯示玩家可製作的裝備。',
          '可用於在練匠時快速查詢有哪些裝備可以製作。'
        ]
      }
    }
  };
}