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
        'equipment pretext': {
          'main': '主手',
          'sub': '副手',
          'body': '衣服'
        },
        'damage': {
          'base name': '傷害',
          'base': {
            'atk': '有效ATK',
            'matk': '有效MATK'
          },
          'damage_type': {
            'physical': '物理',
            'magic': '魔法'
          },
          'is_place': {
            'true': '設置型'
          },
          'type': {
            'AOE': '範圍傷害'
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
        'global': {
          'times': '次'
        }
      },
      'warn': {
        'no skill tree selected': '還沒選取技能樹0.0'
      }
    }
  };
}