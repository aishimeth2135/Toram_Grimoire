export default function(){
    return {
        'Top List': {
            'item 1': '布偶的魔法书',
            'item 2': '附魔模拟器'
        },
        'Enchant Simulator': {
            'Equipment Field List': ['主手武器', '身体装备'],
            'Material Point Type List': ['金属' ,'兽品', '木材', '布料','药品', '魔素'],
            'select stat title': '选取能力',
            'equipment': '装备',
            'step type': ['一般', '分次附'],
            'step title': '步骤',
            'enchant per time: title': '每次附',
            'Original Potential': '初始潜力值',
            'Base Potential': '基础潜力值',
            'Success Rate': '成功率',
            'Character Level': '角色等级',
            'tips': {
                'Base Potential': '「制作装备」时，装备的基础潜力值。大部分情况下无需设定。 '
            },
            'Warn': {
                'Step Stat Repeat': '单一步骤不可存在重复的能力。 ',
                'Number of Equipment Item exceeding the maximum': '可附魔的能力数量已达上限。 ',
                'Potential of Equipment has been less than 1': '装备潜力值已小于1，无法继续附魔。 ',
                'Potential of Step is less than 1': '提示：有部分前置步骤的结算潜力值小于1，此附魔无法实作。 ',
                'Success to copy': '已复制完毕。 '
            }
        }
    };
}