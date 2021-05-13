export default function(){
  return {
    'Enchant Doll': {
      'next step': '下一步',
      'back to step': '回到此步驟',
      'select item': '選擇能力',
      'export result': {
        'title': '匯出這個配置',
        'caption': '儲存這個配置至附魔模擬器，來進行手動的調整。',
        'build default name': '自動配置',
        'redirect to enchant-simulator': '移至附魔模擬器'
      },
      'equipment': {
        'select type': {
          'title': '想要附什麼裝備呢？',
          'caption': '請選擇想要附的裝備的類型。'
        },
        'original potential': {
          'title': '設定裝備的初始潛力值',
          'caption': '請設定乾淨的裝備最一開始的潛力值是多少。或者可以讓系統自動計算成功率100%的最低需求潛力。',
          'auto find minimum': '自動尋找最低需求'
        }
      },
      'select positive stats': {
        'title': '選擇要附的能力',
        'caption': '請選擇想要附的正屬。至少要選擇一個，最多可以選擇八個0.0',
      },
      'select negative stats': {
        'title': '選擇退潛的能力',
        'caption': '請選擇用來退潛的負屬，也可以讓系統自動選取0.0。系統將在設定的條件下嘗試找出成功率最高的退潛項目。',
        'auto select': '系統自動選取',
        'select config: base type': {
          'title': '設定這件裝備的用途',
          'caption': '請選擇這件裝備是物理職還是魔法職要用的，讓系統可以選擇正確的退潛。系統會根據選定的正屬先自動選一個。',
          'option texts': {
            'physical': '物理',
            'magic': '魔法',
            'none': '都可以'
          }
        },
        'select config: auto find negative stats type': {
          'title': '設定自動選取退潛的條件',
          'caption': '可以設定系統在自動選擇退潛時，要優先考慮最高成功率還是較低的素材耗量。最高成功率和最低素材耗量的退潛項目也可能一模一樣。',
          'option texts': {
            'success-rate': '成功率',
            'material': '素材耗量'
          }
        },
        'stats from auto not enough': ['自動選取的負屬數量不夠，可能需要自行增加退潛項目。', '退潛項目的數量未補足時，系統可能無法正確地推算出成功率最高的退潛項目。'],
        'auto selected': '系統自動選取',
        'manually selected': '手動選取'
      },
      'result': {
        'title': '計算結果',
        'caption': ['計算結果已出爐0.0。可以單純複製結果，或將結果匯出至附魔模擬器。', '若需要設定角色鍛造熟練度，請到附魔模擬器的介面進行設定。'],
        'current potential is': '目前潛力為'
      },
      'tips': {
        'no stat selected': '還沒有選擇任何能力...',
        'number of stats has reached the upper limit': '已經選擇八個能力了...',
        'stat repeated': '已經有這個能力了0.0',
        'at least one positive stat': '要保留至少一個正屬。',
        'reset confirm': '確定要重置嗎？目前的設定都將被清空。',
        'export successfully': '匯出成功。',
        'performance of auto find negative stats': '根據選擇的能力，系統在自動選取退潛時可能需要一些計算量，而導致頁面卡住數秒鐘，為正常的現象。',
        'performance of auto find minimum of original potential': '根據選擇的能力，尋找最低需求潛力可能需要龐大的計算量，而導致頁面卡住數秒鐘，為正常的現象。',
        'performance of auto find minimum of original potential and auto find negative stats': '在進行「尋找最低需求潛力」時，基於效能問題，系統將簡化尋找最高成功率之退潛項目的計算過程，因此精確度可能會降低。',
        'can not auto find minimum of original potential': '即使潛力超過99這個裝備的成功率還是無法100%，因此無法找到最低需求潛。可以換個能力試試0.0',
        'cannot directly modify the settings of the previous step': '不行直接對前面的步驟進行修改唷0.0',
        'unknow error when calc': '系統在計算時發生未知的錯誤，請聯絡作者。'
      }
    }
  };
}