export default function(){
    return {
        'Skill Query': {
            'equipment': {
                'main-weapon': ['單手劍', '雙手劍', '弓', '弩', '法杖', '魔導具', '拳套', '旋風槍', '拔刀劍', '雙劍', '空手'],
                'sub-weapon': ['箭矢', '盾牌', '小刀', '魔導具', '拳套', '拔刀劍', '無裝備'],
                'body-armor': ['輕量化', '重量化', '一般', '無裝備'],
                'no select': '無選取'
            },
            'Branch': {
                'damage': {
                    'base': {
                        'atk': '有效ATK',
                        'matk': '有效MATK'
                    }
                }
            },
            'warn': {
                'no skill tree selected': '還沒選取技能樹0.0'
            }
        }
    };
}