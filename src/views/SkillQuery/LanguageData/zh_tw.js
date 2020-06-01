export default function(){
  return {
    'Skill Query': {
      'historical record': '查看歷史紀錄',
      'range: no limit': '無限制',
      'range: main': '同主手武器',
      'click anywhere to close': '點擊任意處關閉',
      'select skill': '選擇技能',
      'skill level': '技能等級',
      'character level': '角色等級',
      'default message': '請點選這裡或右上角的按鈕來選擇一個技能。',
      'default message: equipment conditions': '所選取的技能不符合當前的裝備。<br />請更改裝備類型，或是點選這裡或右上角的按鈕來選擇其他技能。',
      'equipment': {
        'main-weapon': ['單手劍', '雙手劍', '弓', '弩', '法杖', '魔導具', '拳套', '旋風槍', '拔刀劍', '雙劍', '空手'],
        'sub-weapon': ['箭矢', '盾牌', '小刀', '魔導具', '拳套', '拔刀劍', '無裝備'],
        'body-armor': ['輕量化', '重量化', '一般', '無裝備'],
        'no select': '無選取',
        'none': '通用',
        'main-weapon: title': '主手武器',
        'sub-weapon: title': '副手裝備',
        'body-armor: title': '身體裝備'
      },
      'effect attrs': {
        'mp_cost': 'MP消耗',
        'range': '射程',
        'skill_type': '技能類型',
        'in_combo': '連擊',
        'action_time': '動作時間',
        'casting_time': '詠唱時間',
        'skill_type: list': ['瞬發', '須詠唱', '須蓄力', '被動', 'EX技能'],
        'damage_type: list': ['物理', '魔法'],
        'in_combo: list': ['可以放入連擊', '無法放入連擊', '無法放在連擊的第一招'],
        'action_time: list': ['極慢', '慢', '稍慢', '一般', '稍快', '快', '極快']
      },
      'Branch': {
        'display duration': '$0秒內',
        'ailment title': '命中成功後',
        'other equipment info: title': '各裝備的效果',
        'apply element': '套用$0。',
        'formula replaced text': {
          'BSTR': '基礎STR',
          'BINT': '基礎INT',
          'BAGI': '基礎AGI',
          'BVIT': '基礎VIT',
          'BDEX': '基礎DEX',
          'TEC': '基礎TEC',
          'STR': '總STR',
          'INT': '總INT',
          'AGI': '總AGI',
          'VIT': '總VIT',
          'DEX': '總DEX',
          'shield_refining': '盾精鍊值',
          'dagger_atk': '小刀ATK',
          'target_def': '目標DEF',
          'target_level': '目標LV',
          'guard_power': '阻檔力'
        },
        'skill area': {
          'button text': '查看技能範圍',
          'point: character': '角色',
          'point: target': '目標'
        },
        'global suffix: extra': {
          'condition default': '施放時額外效果'
        },
        'damage': {
          'base name': '傷害',
          'base': {
            'atk': '有效ATK',
            'matk': '有效MATK'
          },
          'damage_type': {
            'physical': '物理傷害',
            'magic': '魔法傷害'
          },
          'type': {
            'AOE': '範圍'
          },
          'title': {
            'normal_attack': '一般攻擊的傷害提升'
          },
          'frequency': {
            'positive': '總傷害拆成$0'
          },
          'ailment text': '有$0機率使敵人$1。',
          'effective_area': {
            'circle': '圓形', 'line': '直線', 'sector': '扇形'
          },
          'start_position_offsets': {
            'positive': '自身前方$0m處',
            'negative': '自身後方$m處'
          },
          'end_position_offsets': {
            'positive': '目標後方$0處',
            'negative': '目標前方$0處'
          },
          'element': {
            'neutral': '無屬性',
            'fire': '火屬性',
            'water': '水屬性',
            'earth': '地屬性',
            'wind': '風屬性',
            'light': '光屬性',
            'dark': '暗屬性',
            'one_hand_sword': '單手劍屬性',
            'arrow': '箭矢屬性'
          },
          'effective_area: title': '類型',
          'end_position_offsets: title': '起點位置',
          'radius: title': '作用半徑',
          'move_distance: title': '移動距離',
          'angle: title': '作用角度',
          'start_position_offsets: title': '終點位置',
          'end_position_offsets: title': '起點位置'
        },
        'damage: proration': {
          'damage: title': '傷害慣性',
          'proration: title': '造成慣性',
          'damage': {
            'physical': '物理',
            'magic': '魔法',
            'normal_attack': '一般攻擊',
            'none': '不受慣性影響'
          },
          'proration': {
            'physical': '物理',
            'magic': '魔法',
            'normal_attack': '一般攻擊',
            'none': '不造成慣性'
          }
        },
        'damage-detail': {
          'judgment': {
            'common': '每下傷害共用判定',
            'separate': '每下傷害分開判定'
          },
          'frequency_judgment': {
            'single': '限傷時視為單次傷害',
            'multiple': '限傷時視為多段傷害'
          },
          'unsheathe_attack': {
            'true': '受拔刀傷害影響',
            'false': '不受拔刀傷害影響',
            'none': '未確認是否受拔刀傷害影響'
          },
          'range_damage': {
            'true': '受距離威力影響',
            'false': '受距離威力影響',
            'none': '未確認是否受距離威力影響'
          },
          'is_place': {
            'true': '設置型技能'
          }
        },
        'proration': {
          'damage: title': '傷害慣性',
          'proration: title': '造成慣性',
          'damage': {
            'physical': '物理',
            'magic': '魔法',
            'normal_attack': '一般攻擊',
            'none': '不受慣性影響'
          },
          'proration': {
            'physical': '物理',
            'magic': '魔法',
            'normal_attack': '一般攻擊',
            'none': '不造成慣性'
          }
        },
        'stack': {
          'base name': '技能層數'
        },
        'effect': {
            'base name': '技能效果',
            'condition': {
                'auto': '施放成功後',
                'hit': '命中成功後'
            },
            'type': {
                'self': '自身增益',
                'party': '全隊伍增益',
                'aura': '光環',
                'target': '單體增益'
            }
        },
        'next': {
          'condition default': '下一招技能'
        },
        'passive': {
          'base name': '被動效果'
        },
        'global': {
          'times': '次'
        },
        'heal': {
          'base name': '恢復效果',
          'type': {
            'hp': '恢復HP',
            'mp': '恢復MP'
          }
        }
      },
      'warn': {
        'no skill tree selected': '還沒選取技能樹0.0'
      }
    }
  };
}