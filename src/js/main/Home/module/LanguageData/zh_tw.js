export default function(){
    return {
        'Page Title': '布偶的魔法書',
        'Top Menu': ['主頁', '關於網頁'],
        'settings': {
            'switch font': {
                'caption': '若字體顯示有問題（特定裝置會發生），或是不喜歡現在的預設字體。<br />可切換字體為基本字體。',
                'switch': '切換'
            },
            'select language': {
                'caption': '可選擇頁面顯示的語言，一般情況下不必特別設定。',
                'warn 1': '設定完畢後，頁面需重新整理方得生效。',
                'warn 2': '尚未翻譯的部分依然會顯示其他語言。',
                'button text: list': {
                    'lang auto': '自動判定',
                    'lang 0': 'English',
                    'lang 1': '繁體中文',
                    'lang 2': '日本語',
                    'lang 3': '简体中文'
                }
            },
            'select second language': {
                'caption': '可設定第二優先級語言。簡單來說，若選擇的語言還沒有翻譯，便會優先顯示這邊設定的語言。',
                'warn 1': '設定完畢後，頁面需重新整理方得生效。',
                'warn 2': '若第二優先級語言依然沒有翻譯，則會顯示原始資料（一般而言是繁體中文）。',
                'button text: list': {
                    'lang 0': 'English',
                    'lang 1': '繁體中文',
                    'lang 2': '日本語',
                    'lang 3': '简体中文'
                }
            }
        },
        'Home': {
            'link text': '點此進入',
            'Skill Query': {
                'Title': '技能查詢',
                'content-1': '技能的傷害公式、效果公式。',
                'content-2': '可自訂技能等級、角色等級、當前裝備。',
                'content-3': '多種查詢時的小工具。'
            },
            'Item Query': {
                'Title': '道具查詢',
                'content-1': '查詢遊戲內的裝備。',
                'content-2': '基本的關鍵字查詢。',
                'content-3': '利用裝備能力、道具等級查詢。'
            },
            'Enchant Simulator': {
                'Title': '附魔模擬器',
                'content-1': '模擬遊戲裡的附魔。',
                'content-2': '查看每個步驟的潛力消耗、素材消耗。',
                'content-3': '查看成功率與總素材耗量。'
            },
            'Damage Calculation': {
                'Title': '簡易傷害計算器',
                'content-1': '自行輸入各數值，以計算傷害。',
                'content-2': '可儲存或分享輸入完畢的數據。',
                'content-3': '簡單的比較功能，可比較各配置的傷害高低。'
            },
            'About': {
                'Donate Group': '贊助公會',
                'Author': '作者',
                'Skill Data Maintenance': '技能資料維護',
                'Input Skill Tree Drawaing Code': '技能樹繪製資料填寫',
                'Skill Icons Arrangement': '技能圖示排列',
                'Equipment Data Maintenance': '裝備資料維護',
                'translation': {
                    'zh-cn': {
                        'Skill Name and Tag List': '技能名稱及標籤清單（簡體中文）'
                    }
                }
            }
        }
    };
}