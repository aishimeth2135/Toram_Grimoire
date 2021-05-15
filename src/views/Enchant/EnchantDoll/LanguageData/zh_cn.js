export default function(){
  return {
    'Enchant Doll': {
      'next step': '下一步',
      'back to step': '回到此步骤',
      'select item': '选择能力',
      'export result': {
        'title': '汇出这个配置',
        'caption': '储存这个配置至附魔模拟器，来进行手动的调整。',
        'build default name': '自动配置',
        'redirect to enchant-simulator': '移至附魔模拟器'
      },
      'equipment': {
        'select type': {
          'title': '想要附什么装备呢？',
          'caption': '请选择想要附的装备的类型。'
        },
        'original potential': {
          'title': '设定装备的初始潜力值',
          'caption': '请设定干净的装备最一开始的潜力值是多少。或者可以让系统自动计算成功率100%的最低需求潜力。',
          'auto find minimum': '自动寻找最低需求'
        }
      },
      'select positive stats': {
        'title': '选择要附的能力',
        'caption': '请选择想要附的正属。至少要选择一个，最多可以选择八个0.0',
        'auto fill': '选取时自动补到最大值'
      },
      'select negative stats': {
        'title': '选择退潜的能力',
        'caption': '请选择用来退潜的负属，也可以让系统自动选取0.0。系统将在设定的条件下尝试找出成功率最高的退潜项目。',
        'auto select': '系统自动选取',
        'select config: base type': {
          'title': '设定这件装备的用途',
          'caption': '请选择这件装备是物理职还是魔法职要用的，让系统可以选择正确的退潜。系统会根据选定的正属先自动选一个。',
          'option texts': {
            'physical': '物理',
            'magic': '魔法',
            'none': '都可以'
          }
        },
        'select config: auto find negative stats type': {
          'title': '设定自动选取退潜的条件',
          'caption': '可以设定系统在自动选择退潜时，要优先考虑最高成功率还是较低的素材耗量。最高成功率和最低素材耗量的退潜项目也可能一模一样。',
          'option texts': {
            'success-rate': '成功率',
            'material': '素材耗量'
          }
        },
        'stats from auto not enough': ['自动选取的负属数量不够，可能需要自行增加退潜项目。', '退潜项目的数量未补足时，系统可能无法正确地推算出成功率最高的退潜项目。'],
        'auto selected': '系统自动选取',
        'manually selected': '手动选取'
      },
      'result': {
        'title': '计算结果',
        'caption': ['计算结果已出炉0.0。可以单纯复制结果，或将结果汇出至附魔模拟器。', '若需要设定角色锻造熟练度，请到附魔模拟器的介面进行设定。'],
        'current potential is': '目前潜力为'
      },
      'tips': {
        'no stat selected': '还没有选择任何能力...',
        'number of stats has reached the upper limit': '已经选择八个能力了...',
        'stat repeated': '已经有这个能力了0.0',
        'at least one positive stat': '要保留至少一个正属。',
        'reset confirm': '确定要重置吗？目前的设定都将被清空。',
        'export successfully': '汇出成功。',
        'performance of auto find negative stats': '根据选择的能力，系统在自动选取退潜时可能需要一些计算量，而导致页面卡住数秒钟，为正常的现象。',
        'performance of auto find minimum of original potential': '根据选择的能力，寻找最低需求潜力可能需要庞大的计算量，而导致页面卡住数秒钟，为正常的现象。',
        'performance of auto find minimum of original potential and auto find negative stats': '在进行「寻找最低需求潜力」时，基于效能问题，系统将简化寻找最高成功率之退潜项目的计算过程，因此精确度可能会降低。',
        'can not auto find minimum of original potential': '即使潜力超过99这个装备的成功率还是无法100%，因此无法找到最低需求潜。可以换个能力试试0.0',
        'cannot directly modify the settings of the previous step': '不行直接对前面的步骤进行修改唷0.0',
        'unknow error when calc': '系统在计算时发生未知的错误，请联络作者。'
      }
    }
  };
}