export default function() {
  return {
    'Item Query': {
      'modes': {
        'normal': '一般',
        'stat': '装备能力',
        'item-level': '道具等级',
        'dye': '染色'
      },
      'no result tips': '找不到任何结果0.0',
      'options: normal': {
        'title': '搜寻目标',
        'name': '名称',
        'material': '制作素材',
        'obtain-name': '取得来源'
      },
      'options: stat': {
        'select stat: window title': '选择能力',
        'select stat: search placeholder': '搜寻能力',
        'select stat: title': '请选择一个能力'
      },
      'sort options': {
        'title': '排序方式',
        'options': {
          'default': '预设排序',
          'atk': 'ATK',
          'def': 'DEF',
          'stability': '稳定度',
          'name': '名称'
        },
        'order': {
          'title': '排序顺序',
          'up': '由小至大',
          'down': '由大至小'
        }
      },
      'equipment detail': {
        'production equipment': '制作装备',
        'scope title': {
          'stats': '装备能力',
          'recipe': '制作配方',
          'obtains': '取得方式',
        },
        'recipe': {
          'item level': '道具等级',
          'item difficulty': '难易度',
          'spina': '众神币'
        },
        'restriction': {
          'event': '活动',
          'one-hand-sword': '单手剑',
          'two-hand-sword': '双手剑',
          'dual-sword': '双剑',
          'bow': '弓',
          'bowgun': '弩',
          'staff': '法杖',
          'magic-device': '魔导具',
          'knuckle': '拳套',
          'halberd': '旋风枪',
          'katana': '拔刀剑',
          'sub': {
            'arrow': '箭矢',
            'shield': '盾牌',
            'dagger': '小刀',
            'katana': '副手拔刀剑',
            'magic-device': '副手魔导具',
            'knuckle': '副手拳套',
            'one-hand-sword': '双剑'
          },
          'body': {
            'dodge': '轻化防具',
            'defense': '重化防具',
            'normal': '一般防具'
          }
        },
        'obtains': {
          'mobs': '小怪',
          'boss': '定点BOSS',
          'mini_boss': '地图BOSS',
          'quest': '任务',
          'smith': '铁匠铺',
          'create equipment': '制作装备',
          'all smith': '各个城镇的铁匠铺',
          'no data': '尚无资料',
          'unknow': '未知',
          'other': '其它',
          'box': '箱子道具',
          'exchange': '交换所'
        },
        'tips: without any obtain': '取得方式未知',
        'tips: without any stat': '这个装备没有任何能力0.0',
      },
      'equipment type category': {
        'main': '主手武器',
        'sub': '副手',
        'body': '身体装备',
        'additional': '追加装备',
        'special': '特殊装备',
      },
      'field type text': {
        'one-hand-sword': '单手剑',
        'two-hand-sword': '双手剑',
        'bow': '弓',
        'bowgun': '弩',
        'staff': '杖',
        'magic-device': '魔导具',
        'knuckle': '拳套',
        'halberd': '旋风枪',
        'katana': '拔刀剑',
        'sub-weapon|arrow': '箭矢',
        'sub-weapon|dagger': '小刀',
        'sub-armor|shield': '盾牌',
      },
      'search placeholder': '查询...',
      'tips': {
        'sort: up': '升幂排序',
        'sort: down': '降幂排序',
        'sort: none': '不进行排序',
        'stats search: first': '请于上方的输入栏位搜寻能力名称。',
        'stats search: no result': '没有符合的结果。请确认搜寻的关键字是否正确。'
      },
      'Show Search Caption': {
        'title': '查询说明',
        'caption: main': [
          '利用((,))可以进行复数查询，比对方式为((或))。例如：输入((!A20,B20))，可同时搜寻到染色内带有((!A20))或((!B20))的装备。',
          '染色的显示方式为((!部位+数字))。例如：A20，是指第一个染色部位，且颜色代号为20。一般而言会用ABC来称唿三个染色部位。',
          '((指定染色查询))：于搜寻结果查看该装备时，((!取得方式))的部分仅会显示带有搜寻之指定染色的取得方式资讯。'
        ],
        'caption: stat': [
          '此功能可用来查询具有特定能力的装备，并依照数值大小进行排序。',
          '利用((,))可以进行复数查询，比对方式为((或))。例如：输入((!仇,HP))，可同时搜寻到名称内带有((!仇))或((!HP))的能力。',
          '于查询栏位输入((@all))时，可直接显示所有目前已知的装备能力。由于这样会佔很多版面，使用上请自行斟酌。',
          '选择复数的能力时，比对方式为((和))。例如：同时选择((!仇恨值%))和((!HP上限%))时，只会查询到同时带有这两个能力的装备。',
          '点击各项能力的右边，可调整排序方式，分别有((!升幂))、((!降幂))和((!不进行排序))。不进行排序时，查询结果会以其在原始资料中的顺序来显示。',
          '选择复数能力时，会以优先度来进行排序，由左至右，由上至下，越左上角的能力优先度越高。如果复数能力排序时想跳过某项能力，可以将其设为((!不进行排序))。'
        ],
        'caption: item-level': [
          '此功能可用来查询特定熟练度范围内的装备，仅会显示玩家可制作的装备。',
          '可用于在练匠时快速查询有哪些装备可以制作。'
        ]
      }
    }
  };
}