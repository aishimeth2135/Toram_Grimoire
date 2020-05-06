export default function(){
    return {
        'Page Title': '布偶的魔法书｜技能查询',
        'Top List': {
            'item 1': '布偶的魔法书',
            'item 2': '技能查询'
        },
        'Loading Message': {
            'Character Stats': '载入角色能力清单',
            'Skill Data': '载入技能资料',
            'Init Skill Data': '初始化技能资料',
            'Tag Data': '载入标签清单'
        },
        'Skill Query': {
            'Skill Element': {
                'skill tree: from': '所属技能树'
            },
            'Controller': {
                'main weapon': '主手武器',
                'sub weapon': '副手武器',
                'body armor': '身体装备',
                'equipment: unlimited': '无限制',
                'switch display': '切换显示',
                'current skill': '当前技能',
                'skill attribute icon tips: title': '图示说明',
                'select skill history date: title': '选择改版记录'
            },
            "Analysis Skill": {
                'unknow date': '未知的日期',
                'no data': '此技能资料尚未齐全。',
                'equipment not confirm': '所选取的装备无法使用此技能。',
                'Main Weapon List': ['单手剑', '双手剑', '弓', '弩', '法杖', '魔导具', '拳套', '旋风枪', '拔刀剑', '双剑', '空手'],
                'Sub Weapon List': ['箭矢', '盾牌', '小刀', '魔导具', '拳套', '拔刀剑', '无装备'],
                'Body Armor List': ['轻量化', '重量化', '一般', '无装备'],
                'mp cost': 'MP消耗',
                'range': '射程',
                'skill type': '类型',
                'damage type': '伤害类型',
                'proration type': '惯性类型',
                'in combo': '连击',
                'action time': '动作时间',
                'casting time': '咏唱时间',
                'charging time': '蓄力时间',
                'skill type: List': ['瞬发', '须咏唱', '须蓄力', '被动', 'EX技能'],
                'damage type: List': ['物理', '魔法'],
                'proration type: List': ['物理', '魔法', '一般攻击'],
                'in combo: List': ['可以放入连击', '无法放入连击', '不可放入连击的第一招'],
                'action time: List': ['极慢', '慢', '稍慢', '一般', '稍快', '快', '极快'],
                'range: no limit': '无限制',
                'skill formula: STR': '角色STR',
                'skill formula: DEX': '角色DEX',
                'skill formula: INT': '角色INT',
                'skill formula: AGI': '角色AGI',
                'skill formula: VIT': '角色VIT',
                'skill formula: BSTR': '角色基础STR',
                'skill formula: BDEX': '角色基础DEX',
                'skill formula: BINT': '角色基础INT',
                'skill formula: BAGI': '角色基础AGI',
                'skill formula: BVIT': '角色基础VIT',
                'skill formula: shield_refining': '盾精炼值',
                'skill formula: dagger_atk': '小刀ATK',
                'skill formula: target_def': '目标DEF',
                'skill formula: target_level': '目标Lv',
                'skill formula: guard_power': '阻挡力%',
                'character level': '角色等级',
                'skill level': '技能等级',
                'physical': '物理',
                'magic': '魔法',
                'normal attack': '一般攻击',
                'damage proration type: none': '不受惯性影响',
                'effective proration type: none': '不影响惯性',
                'damage proration: title': '伤害惯性',
                'effective proration: title': '造成惯性',
                'element: neutral': '无属性',
                'element: fire': '火属性',
                'element: water': '水属性',
                'element: earth': '地属性',
                'element: wind': '风属性',
                'element: light': '光属性',
                'element: dark': '暗属性',
                'element: arrow': '套用箭矢属性',
                'element: one hand sword': '套用单手剑属性',
                'target type: self': '自身',
                'target type: party': '全队伍',
                'target type: party & is place': '区域内的队伍成员',
                'target type: aura': '光环内的队伍成员',
                'target type: target': '目标',
                'radius': '半径',
                'sector: angle': '夹角',
                'effective area: title': '类别',
                'effective area type: circle': '圆形',
                'effective area type: line': '直线型',
                'effective area type: sector': '扇型',
                'move distanve: title': '移动距离',
                'effective area: character position': '角色位置',
                'effective area: target position': '目标位置',
                'effective area: end position': '终点位置',
                'effective area: target front': '目标身前',
                'effective area: target behind': '目标身后',
                'formula text: replace': {
                    'Math.floor': '向下取整',
                    'Math.max': '取最大值',
                    'Math.min': '取最小值'
                },
                'branch development controller': {
                    'title: default': '预设',
                    'title: not default': '非预设'
                },
                'branch': {
                    'stack': {
                        'base name': '技能层数',
                        'min value': '最小值',
                        'max value': '最大值'
                    },
                    'damage': {
                        'title type: one': '单下伤害',
                        'title type: total': '总伤害',
                        'title type: each': '每下伤害',
                        'title type: normal attack': '一般攻击伤害提升',
                        'valid base: atk': '有效ATK',
                        'valid base: matk': '有效MATK',
                        'skill constant': '技能常数',
                        'skill multiplier': '技能倍率',
                        'skill extra constant': '额外加成',
                        'chance': '机率',
                        'ailment': '异常状态',
                        'target type: single': '单体',
                        'target type: AOE': '范围',
                        'is place': '设置型',
                        'frequency: unit': '次',
                        'judgment: common': '共同判定',
                        'judgment: separate': '分开判定',
                        'cycle: pretext': '每',
                        'extra': {
                            'base title': '额外效果'
                        }
                    },
                    'effect': {
                        'condition: auto': '施放成功后',
                        'condition: hit': '命中成功后',
                        'condition: next': '下一招技能',
                        'condition: next-2': ['之后的', '招技能'],
                        'condition: passive': '被动效果',
                        'duration': '持续时间',
                        'duration-2': ['', '秒内']
                    },
                    'heal': {
                        'title: hp': 'HP恢复',
                        'title: mp': 'MP恢复',
                        'frequency: unit': '次',
                    },
                    'reference': {
                        'reference url': '资料参考连结'
                    }
                },
                'button text': {
                    'to skill': '查看'
                }         
            },
            'button text': {
                'back': '上一个'
            }
        }
    };
}