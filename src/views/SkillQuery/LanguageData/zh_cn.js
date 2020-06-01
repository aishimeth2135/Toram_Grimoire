export default function(){
  return {
    'Skill Query': {
      'historical record': '查看历史纪录',
      'range: no limit': '无限制',
      'range: main': '同主手武器',
      'click anywhere to close': '点击任意处关闭',
      'select skill': '选择技能',
      'skill level': '技能等级',
      'character level': '角色等级',
      'default message': '请点选这里或右上角的按钮来选择一个技能。',
      'equipment': {
        'main-weapon': ['单手剑', '双手剑', '弓', '弩', '法杖', '魔导具', '拳套', '旋风枪', '拔刀剑', '双剑', '空手'],
        'sub-weapon': ['箭矢', '盾牌', '小刀', '魔导具', '拳套', '拔刀剑', '无装备'],
        'body-armor': ['轻量化', '重量化', '一般', '无装备'],
        'no select': '无选取',
        'none': '通用',
        'main-weapon: title': '主手武器',
        'sub-weapon: title': '副手装备',
        'body-armor: title': '身体装备'
      },
      'effect attrs': {
        'mp_cost': 'MP消耗',
        'range': '射程',
        'skill_type': '技能类型',
        'in_combo': '连击',
        'action_time': '动作时间',
        'casting_time': '咏唱时间',
        'skill_type: list': ['瞬发', '须咏唱', '须蓄力', '被动', 'EX技能'],
        'damage_type: list': ['物理', '魔法'],
        'in_combo: list': ['可以放入连击', '无法放入连击', '无法放在连击的第一招'],
        'action_time: list': ['极慢', '慢', '稍慢', '一般', '稍快', '快', '极快']
      },
      'Branch': {
        'display duration': '$0秒内',
        'ailment title': '命中成功后',
        'other equipment info: title': '各装备的效果',
        'apply element': '套用$0。',
        'formula replaced text': {
          'BSTR': '基础力量',
          'BINT': '基础智力',
          'BAGI': '基础敏捷',
          'BVIT': '基础耐力',
          'BDEX': '基础灵巧',
          'TEC': '基础技巧',
          'STR': '总力量',
          'INT': '总智力',
          'AGI': '总敏捷',
          'VIT': '总耐力',
          'DEX': '总灵巧',
          'shield_refining': '盾精鍊值',
          'dagger_atk': '小刀ATK',
          'target_def': '目标DEF',
          'target_level': '目标LV',
          'guard_power': '阻档力'
        },
        'skill area': {
          'button text': '查看技能范围',
          'point: character': '角色',
          'point: target': '目标'
        },
        'global suffix: extra': {
          'condition default': '施放时额外效果'
        },
        'damage': {
          'base name': '伤害',
          'base': {
            'atk': '有效ATK',
            'matk': '有效MATK'
          },
          'damage_type': {
            'physical': '物理伤害',
            'magic': '魔法伤害'
          },
          'type': {
            'AOE': '范围'
          },
          'title': {
            'normal_attack': '一般攻击的伤害提升'
          },
          'ailment text': '有$0机率使敌人$1。',
          'effective_area': {
            'circle': '圆形', 'line': '直线', 'sector': '扇形'
          },
          'start_position_offsets': {
            'positive': '自身前方$0m处',
            'negative': '自身后方$m处'
          },
          'end_position_offsets': {
            'positive': '目标后方$0处',
            'negative': '目标前方$0处'
          },
          'element': {
            'neutral': '无属性',
            'fire': '火属性',
            'water': '水属性',
            'earth': '地属性',
            'wind': '风属性',
            'light': '光属性',
            'dark': '暗属性',
            'one_hand_sword': '单手剑属性',
            'arrow': '箭矢属性'
          },
          'effective_area: title': '类型',
          'end_position_offsets: title': '起点位置',
          'radius: title': '作用半径',
          'move_distance: title': '移动距离',
          'angle: title': '作用角度',
          'start_position_offsets: title': '终点位置',
          'end_position_offsets: title': '起点位置'
        },
        'damage-detail': {
          'judgment': {
            'common': '每下伤害共用判定',
            'separate': '每下伤害分开判定'
          },
          'frequency_judgment': {
            'single': '限伤时视为单次伤害',
            'multiple': '限伤时视为多段伤害'
          },
          'unsheathe_attack': {
            'true': '受拔刀伤害影响',
            'false': '不受拔刀伤害影响'
          },
          'range_damage': {
            'true': '受距离威力影响',
            'false': '受距离威力影响'
          },
          'is_place': {
            'true': '设置型技能'
          }
        },
        'proration': {
          'damage: title': '伤害惯性',
          'proration: title': '造成惯性',
          'damage': {
            'physical': '物理',
            'magic': '魔法',
            'normal_attack': '一般攻击',
            'none': '不受惯性影响'
          },
          'proration': {
            'physical': '物理',
            'magic': '魔法',
            'normal_attack': '一般攻击',
            'none': '不造成惯性'
          }
        },
        'stack': {
          'base name': '技能层数'
        },
        'effect': {
            'base name': '技能效果',
            'condition': {
                'auto': '施放成功后',
                'hit': '命中成功后'
            },
            'type': {
                'self': '自身增益',
                'party': '全队伍增益',
                'aura': '光环',
                'target': '单体增益'
            }
        },
        'next': {
          'condition default': '下一招技能'
        },
        'passive': {
          'base name': '被动效果'
        },
        'global': {
          'times': '次'
        },
        'heal': {
          'base name': '恢复效果',
          'type': {
            'hp': '恢复HP',
            'mp': '恢复MP'
          }
        }
      },
      'warn': {
        'no skill tree selected': '还没选取技能树0.0'
      }
    }
  };
}