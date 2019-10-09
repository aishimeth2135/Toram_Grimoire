export default function(){
    return {
        'Top List': {
            'item 1': '布偶的魔法書',
            'item 2': '道具查詢'
        },
        'Item Query': {
            'Search': {
                'options menu': {
                    'main': '一般',
                    'stat': '裝備能力',
                    'item-level': '道具等級'
                },
                'options: main': {
                    'search by: name': '名稱',
                    'search by: material': '製作素材',
                    'search by: dye': '染色',
                    'search by: obtain-name': '取得來源'
                },
                'search': '查詢',
                'item detail': {
                    'scope title': {
                        'stats': '裝備能力',
                        'create': '基礎潛力值',
                        'materials': '製作素材',
                        'obtains': '取得方式',
                        'base atk': '基礎ATK',
                        'base def': '基礎DEF',
                        'base stability': '基礎穩定度'
                    },
                    'create': {
                        'item level': '道具等級',
                        'item difficulty': '難易度'
                    },
                    'spina': '眾神幣',
                    'restriction': {
                        'event': '活動',
                        '1h_sword': '單手劍',
                        '2h_sword': '雙手劍',
                        'bow': '弓', 'bowgun': '弩',
                        'staff': '法杖', 'magic_device': '魔導具',
                        'knuckle': '拳套', 'halberd': '旋風槍',
                        'katana': '拔刀劍'
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
                        'exchange': '交換所'
                    }
                },
                'Equipmemt Category list': [
                    '單手劍', '雙手劍', '弓', '弩',
                    '法杖', '魔導具', '拳套', '旋風槍',
                    '拔刀劍', '箭矢', '盾牌', '小刀',
                    '身體裝備', '追加裝備', '特殊裝備'
                ],
                'search placeholder': '查詢...',
                'No Result': '沒有符合搜尋條件的道具。',
                'tips': {
                    'sort: up': '升冪排序',
                    'sort: down': '降冪排序',
                    'sort: none': '不進行排序',
                    'stats search: first': '請於上方的輸入欄位搜尋能力名稱。',
                    'stats search: no result': '沒有符合的結果。請確認搜尋的關鍵字是否正確。'
                },
                'option scope title': {
                    'category': '裝備類型',
                    'search by': '搜尋目標',
                    'obtain type': '取得方式類型',
                    'button': {
                        'select all': '全選',
                        'cancel all': '重置'
                    }
                },
                'Show Search Caption': {
                    'title': '查詢說明',
                    'caption: main': [
                        '利用((,))可以進行複數查詢，比對方式為((或))。例如：輸入((!A20,B20))，可同時搜尋到染色內帶有((!A20))或((!B20))的裝備。',
                        '若((搜尋目標))只選擇一項((染色))。則於搜尋結果查看該裝備時，((!取得方式))的部分僅會顯示帶有該染色的取得資訊。例如：((!冒險者服裝))的取得方式有數十種，如果只想找特定染色的取得方式會十分費時，利用此功能就可以迅速找到。'
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
        }
    };
}