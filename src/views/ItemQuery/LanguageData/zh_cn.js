export default function() {
  return {
    'Item Query': {
      'Search': {
        'options menu': {
          'main': '一般',
          'stat': '装备能力',
          'item-level': '道具等级'
        },
        'options: main': {
          'search by: name': '名称',
          'search by: material': '制作素材',
          'search by: dye': '染色',
          'search by: obtain-name': '取得来源'
        },
        'search': '查询',
        'search: dye only': '指定染色查询',
        'item detail': {
          'scope title': {
            'stats': '装备能力',
            'create': '基础潜力值',
            'materials': '制作素材',
            'obtains': '取得方式',
            'base atk': '基础ATK',
            'base def': '基础DEF',
            'base stability': '基础稳定度'
          },
          'create': {
            'item level': '道具等级',
            'item difficulty': '难易度'
          },
          'spina': '众神币',
          'restriction': {
            'event': '活动',
            '1h_sword': '单手剑',
            '2h_sword': '双手剑',
            'bow': '弓',
            'bowgun': '弩',
            'staff': '法杖',
            'magic_device': '魔导具',
            'knuckle': '拳套',
            'halberd': '旋风枪',
            'katana': '拔刀剑'
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
          }
        },
        'Equipmemt Category list': [
          '单手剑', '双手剑', '弓', '弩',
          '法杖', '魔导具', '拳套', '旋风枪',
          '拔刀剑', '箭矢', '盾牌', '小刀',
          '身体装备', '追加装备', '特殊装备'
        ],
        'search placeholder': '查询...',
        'No Result': '没有符合搜寻条件的道具。',
        'tips': {
          'sort: up': '升幂排序',
          'sort: down': '降幂排序',
          'sort: none': '不进行排序',
          'stats search: first': '请于上方的输入栏位搜寻能力名称。',
          'stats search: no result': '没有符合的结果。请确认搜寻的关键字是否正确。'
        },
        'option scope title': {
          'category': '装备类型',
          'search by': '搜寻目标',
          'obtain type': '取得方式类型',
          'button': {
            'select all': '全选',
            'cancel all': '重置'
          }
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
    }
  };
}