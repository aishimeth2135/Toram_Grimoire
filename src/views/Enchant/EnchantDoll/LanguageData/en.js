export default function(){
  return {
    'Enchant Doll': {
      'next step': 'Next step',
      'back to step': 'Back to this step',
      'select item': 'Select stats',
      'export result': {
        'title': 'Load this configuration',
        'caption': 'Save this configuration to Stats Filling simulator,to make manual adjustments。',
        'build default name': 'auto configuration',
        'redirect to enchant-simulator': 'Move to Stats Filling simulator',
      },
      'top caption': [
        'Here is Stats Filling doll 0.0, it is a doll that automatically calculates Stats Filling steps～',
        'Stats Filling doll will ask you some question first, and try to figure out the Stats Filling steps with the highest success rate according to the conditions that you have set.(=￣ω￣=)',
      ],
      'equipment': {
        'select type': {
          'title': 'What are we going to Stat fill this time? o((>ω< ))o',
          'caption': 'select equipment type to stat Stats fill',
        },
        'original potential': {
          'title': 'Please set the initial potential value of the equipment.',
          'caption': 'Please set the initial potential value of the equipment, or let Stats Filling doll find the lowest potential requirement with 100% success rate.',
          'auto find minimum': 'Automatically find the lowest potential requirement',
        },
        'set config': {
          'title': 'Click here for other settings',
        },
      },
      'select positive stats': {
        'title': 'Select positive stats.(。-`ω´-)',
        'caption': 'Please select positive stats, at least one, up to 8 stats 0.0',
        'auto fill': 'Automatically fill to the maximum value when selected',
      },
      'select negative stats': {
        'title': 'Select negative stats.ヘ(￣ω￣ヘ)',
        'caption': 'Please select negative stats, or you can also let the doll automatically select for you 0.0. Stats Filling doll will try to figure out the highest success rate set of negative stats.',
        'tips 1': 'will not select 「Natural MP Regen」.',
        'auto select': 'auto select by Stats Filling doll',
        'select config: base type': {
          'title': 'Set the purpose of the equipment',
          'caption': 'Please select what purpose will this equipment be used, physical class or magic class, so the stats filling doll can choose the correct set of negative stats. stats filling doll will select one according to the positive stats。',
          'option texts': {
            'physical': 'physical',
            'magic': 'magic',
            'none': 'both/none',
          },
        },
        'select config: auto find negative stats type': {
          'title': 'Please set additional conditions for automatic selection.',
          'caption': 'You can set the doll to give priority to the highest success rate or the lower material consumption when automatically choosing. The set of negatives with the highest success rate and lowest material consumption may also be exactly the same.',
          'option texts': {
            'success-rate': 'Success rate',
            'material': 'Material consumption',
          },
        },
        'stats from auto not enough': ['Insufficient number of automatically selected negative stat, you may need to add negative stat by yourself.', 'When the number of negative stats are insufficient,stats filling doll may not be able to correctly calculate the set of negative stats with the highest success rate.'],
        'auto selected': 'Doll automatic selection',
        'manually selected': 'Manual selection',
      },
      'result': {
        'title': 'Calculation results～(๑＞ω＜)☆',
        'caption': ['Calculation result is here 0.0.You can simply copy the results, or export the results to the stats filling simulator for manual adjustment.'],
        'current potential is': 'Current potential is',
      },
      'tips': {
        'no stat selected': 'You have not chosen any stats...',
        'number of stats has reached the upper limit': '8 stats have been already selected...',
        'stat repeated': 'Already have this stat 0.0',
        'at least one positive stat': 'At least one positive stats.',
        'reset confirm': 'Are you sure you want to reset?The current settings will be deleted.',
        'export successfully': 'Export successfully.',
        'performance of auto find negative stats': 'According to the selected stats,stats filling doll may need some calculations when automatically selecting negatives, And may cause the page to be freeze for a few seconds, which is normal.',
        'performance of auto find minimum of original potential': 'According to the selected stats, finding the lowest potential requirement may require a huge amount of calculation，And may cause the page to be freeze for a few seconds, which is normal.',
        'performance of auto find minimum of original potential and auto find negative stats': 'When performing 「finding the lowest potential requirement」, stats filling doll will simplify the calculation process of finding the set of negatives with the highest success rate, so the accuracy may be reduced by 0.0',
        'can not auto find minimum of original potential': 'Even if the potential exceeds 99, the success rate of this equipment is still not 100%, so the lowest potential requirement cannot be found. You can try other stats 0.0',
        'cannot directly modify the settings of the previous step': 'You can’t modify the previous steps directly 0.0',
        'unknow error when calc': 'Stats Filling doll don’t know why he got lost...Please contact the author.',
      },
    },
  };
}
