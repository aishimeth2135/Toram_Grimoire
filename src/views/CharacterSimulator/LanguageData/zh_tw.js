export default function(){
    return {
        'Character Simulator': {
            'main menu': {
                'character-simulator': '角色配置',
                'skill-simulator': '技能配點'
            },
            'character': '角色',
            'equipment': '裝備',
            'skill': '技能',
            'stability': '穩定度',
            'confirm selection': '確定選取',
            'refining': '精鍊值',
            'crystal': '鍛晶',
            'crystal empty': '空空的鍛晶',
            'equipment type': '裝備類型',
            'character field names': {
                'main-weapon': '主手武器',
                'sub-weapon': '副手裝備',
                'body-armor': '身體裝備',
                'additional': '追加裝備',
                'special': '特殊裝備',
                'avatar': '時裝'
            },
            'field type text': {
                'one-hand-sword': '單手劍',
                'two-hand-sword': '雙手劍',
                'bow': '弓', 'bowgun': '弩',
                'staff': '杖', 'magic-device': '魔導具',
                'knuckle': '拳套', 'halberd': '旋風槍',
                'arrow': '箭矢', 'shield': '盾牌',
                'dagger': '小刀',
                'body-armor-normal': '一般',
                'body-armor-dodge': '輕化',
                'body-armor-defense': '重化'
            },
            'browse equipments': {
                'action: browse': '裝備清單',
                'action: select-field-equipment': '裝備清單'
            },
            'append equipment': {
                'window title: select-mode': '選擇新增方式',
                'window title: search': '查詢裝備',
                'window title: custom': '自訂裝備',
                'action: search': '查詢裝備',
                'action: custom': '自訂裝備',
                'action: search description': '可以從現存的裝備資料中選取多個想加入的裝備。',
                'action: custom description': '建立一件新裝備，可以自訂該裝備的各項能力值。',
                'search equipment placeholder': '搜尋裝備名稱...',
                'search equipment result: selected title': '已選取$0件裝備',
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
                }
            },
            'select crystal': {
                'title': '選擇鍛晶',
                'category title': ['武器', '身體裝備', '追加裝備', '特殊裝備', '通用']
            },
            'Warn': {
                'no equipment selected': '這個欄位是空的0.0',
                'no eligible equipments found': '沒有符合條件的裝備～點擊上面的按鈕來新增裝備。',
                'append equipment: no result found': '找不到任何符合的裝備。換一個搜尋的關鍵字試試～',
                'append equipments successfully': '已成功新增$0件裝備。',
                'clear equipments completed': '清除成功。',
            }
        }
    };
}