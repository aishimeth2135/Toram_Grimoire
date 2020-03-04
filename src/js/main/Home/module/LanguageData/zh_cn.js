export default function(){
    return {
        'Page Title': '布偶的魔法书｜首页',
        'Top Menu': ['首页', '关于网页'],
        'settings': {
            'switch font': {
                'caption': '若字体显示有问题（特定装置会发生），或是不喜欢现在的预设字体。<br />可切换字体为基本字体。',
                'switch': '切换'
            },
            'select language': {
                'caption': '可选择页面显示的语言，一般情况下不必特别设定。',
                'warn 1': '设定完毕后，页面需重新整理方得生效。',
                'warn 2': '尚未翻译的部分依然会显示其他语言。',
                'button text: list': {
                    'lang auto': '自动判定',
                    'lang 0': 'English',
                    'lang 1': '繁体中文',
                    'lang 2': '日本语',
                    'lang 3': '简体中文'
                }
            },
            'select second language': {
                'caption': '可设定第二优先级语言。简单来说，若选择的语言还没有翻译，便会优先显示这边设定的语言。',
                'warn 1': '设定完毕后，页面需重新整理方得生效。',
                'warn 2': '若第二优先级语言依然没有翻译，则会显示原始资料（一般而言是繁体中文）。',
                'button text: list': {
                    'lang 0': 'English',
                    'lang 1': '繁体中文',
                    'lang 2': '日本语',
                    'lang 3': '简体中文'
                }
            }
        },
        'Home': {
            'download pwa': '下载APP',
            'link text': '点此进入',
            'Skill Query': {
                'Title': '技能查询',
                'content-1': '技能的伤害公式、效果公式。',
                'content-2': '可自订技能等级、角色等级、当前装备。',
                'content-3': '多种查询时的小工具。'
            },
            'Item Query': {
                'Title': '道具查询',
                'content-1': '查询游戏内的装备。',
                'content-2': '基本的关键字查询。',
                'content-3': '利用装备能力、道具等级查询。'
            },
            'Enchant Simulator': {
                'Title': '附魔模拟器',
                'content-1': '模拟游戏里的附魔。',
                'content-2': '查看每个步骤的潜力消耗、素材消耗。',
                'content-3': '查看成功率与总素材耗量。'
            },
            'Damage Calculation': {
                'Title': '简易伤害计算器',
                'content-1': '自行输入各数值，以计算伤害。',
                'content-2': '可储存或分享输入完毕的数据。',
                'content-3': '简单的比较功能，可比较各配置的伤害高低。'
            },
            'Skill Simluator': {
                'Title': '技能配点模拟器',
                'content-1': '进行技能配点或星石的配置。',
                'content-2': '存档及读档功能。',
                'content-3': '将配置汇出成图片或文本。'
            },
            'About': {
                'Donate Group': '赞助公会',
                'Donor': '赞助者',
                'Author': '作者',
                'Skill Data Maintenance': '技能资料维护',
                'Input Skill Tree Drawaing Code': '技能树绘制资料填写',
                'Skill Icons Arrangement': '技能图示排列',
                'Equipment Data Maintenance': '装备资料维护',
                'translation': {
                    'zh-cn': {
                        'Skill Name and Tag List': '技能名称及标签清单（简体中文）',
                        'Skill Data': '技能资料（简体中文）'
                    },
                    'en': {
                        'Skill Data': '技能资料（英文）'
                    }
                }
            }
        }
    };
}