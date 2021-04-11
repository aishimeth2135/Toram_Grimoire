export default function() {
  return {
    'Character Simulator': {
      'character': 'Character',
      'append character': 'New Character',
      'character stats': 'Character Stats',
      'character level': 'Character Level',
      'character name': 'Character Name',
      'character stat points': 'Character Stats Points',
      'equipment': 'Equipment',
      'skill': 'Skills',
      'food build': 'Food Buffs',
      'save-load': 'Save',
      'stability': 'Stability',
      'confirm selection': 'Confirm Selection',
      'refining': 'Refining',
      'crystal': 'Xtal',
      'crystal empty': 'no Xtal',
      'equipment type': 'Equipment Type',
      'custom equipment': 'Customize Equipment',
      'character optional base stat': 'Personal Stats',
      'custom equipment: default name prefix': 'Customize',
      'character field names': {
        'main-weapon': 'Main Weapon',
        'sub-weapon': 'Sub Weapon',
        'body-armor': 'Body Armor',
        'additional': 'Additional Equipment',
        'special': 'Special Equipment',
        'avatar': 'Avatar'
      },
      'equipment type category': {
        'main-weapon': 'Main Weapon',
        'sub-weapon': 'Sub Weapon',
        'sub-armor': 'Sub Armor(Shield)',
        'body-armor': 'Body Armor',
        'additional': 'Additional Equipment',
        'special': 'Special Equipment',
        'avatar': 'Avatar'
      },
      'field type text': {
        'one-hand-sword': 'One-Handed Sword',
        'two-hand-sword': 'Two-Handed Sword',
        'bow': 'Bow',
        'bowgun': 'Bowgun',
        'staff': 'Staff',
        'magic-device': 'Magic Device',
        'knuckle': 'Knuckle',
        'halberd': 'Halberd',
        'katana': 'Katana',
        'sub-weapon|arrow': 'Arrow',
        'sub-weapon|dagger': 'Dagger',
        'sub-armor|shield': 'Shield',
        'body-armor|normal': 'Normal Armor',
        'body-armor|dodge': 'Light Armor',
        'body-armor|defense': 'Heavy Armor'
      },
      'stat restriction text': {
        'event': 'Event',
        'one-hand-sword': 'One-Handed Sword',
        'two-hand-sword': 'Two-Handed Sword',
        'dual-sword': 'Dual Sword',
        'bow': 'Bow',
        'bowgun': 'Bowgun',
        'staff': 'Staff',
        'magic-device': 'Magic Device',
        'knuckle': 'Knuckle',
        'halberd': 'Halberd',
        'katana': 'Katana',
        'sub': {
          'arrow': 'Arrow',
          'shield': 'Shield',
          'dagger': 'Dagger',
          'katana': 'Katana(Sub)',
          'magic-device': 'Magic Device(Sub)',
          'knuckle': 'Knuckle(Sub)',
          'one-hand-sword': 'One-Hand Sword(Dual Sword Sub)'
        },
        'body': {
          'dodge': 'Light Armor',
          'defense': 'Heavy Armor',
          'normal': 'Normal Armor'
        }
      },
      'browse equipments': {
        'action: normal': 'Equipment List',
        'action: select-field-equipment': 'Equipment List',
        'append equipments': 'Add Equipment',
        'message: remove equipment': 'Equipment Removed: $0.',
        'message: removed equipment recovery': 'Equipment Recovered: $0.',
        'message: copy equipment': 'Equipment successfully copied'
      },
      'append equipments': {
        'window title: select-mode': 'Select',
        'window title: search': 'Equipment Search',
        'window title: custom': 'Customize Equipment',
        'action: search': 'Equipment Search',
        'action: custom': 'Customize Equipment',
        'action: search description': 'Able to select multiple equipments you want to add from the exsisting equipment data.',
        'action: custom description': 'Make new equipment, you are able to customize the status of this equipment.',
        'search equipment placeholder': 'Search Equipment by name...',
        'search equipment result: selected title': 'Equipment(s) have been selected',
        'search equipment result: obtain': {
          'mobs': 'Mobs Drop',
          'boss': 'Boss Drop',
          'mini_boss': 'Mini Boss Drop',
          'quest': 'Quest Reward',
          'smith': 'Smith craft',
          'unknow': 'Unknown',
          'other': 'Other',
          'box': 'Loot Box content',
          'exchange': 'Exchange'
        },

        'search equipment result: limit reached': 'Search Limit has being reached. If you cannot find the equipment, Try to search with more details.',
        'search text is empty': 'The search bar is empty',
        'append equipments successfully': 'Successfully added $0 Equipment(s).',
        'selected equipments cleared': 'Selected Equipment cleared.'
      },
      'create custom equipment': {
        'window title': 'Create Customize Equipment',
        'select equipment type': 'Select Equipment Type',
      },
      'custom equipment editor': {
        'select stat: window title': 'Manage Equipment Status',
        'select stat: search placeholder': 'Search Status',
        'select stat: current stats': 'Exsisting Status',
        'select stat: appended stats': 'New Status',
        'select stat: deleted stats': 'Deleted Status',
        'equipment name': 'Equipment Name',
        'equipment stats': 'Equipment Status',
        'equipment other': 'Other',
        'window title': 'Customize Equipment Status',
        'equipment can only have one element stat': 'One Equipment can only have one element'
      },
      'select crystals': {
        'window title': 'Select Xtal',
        'search placeholder': 'Xtal Search',
        'selected crystals': 'Selected Xtal',
        'category title': ['Weapon', 'Body Armor', 'Additional Equipment', 'Special', 'Normal']
      },
      'skill management': {
        'passive skills': 'Passive Skills',
        'active skills': 'Skills',
        'user sets: window title': 'Stacks Setting',
        'default name of stack': 'Stacks',
        'default name of skill branch': 'Skill Effects',
        'skill disable': 'Skill not available',
        'skill multiple effects': 'This skill has multiple effects',
        'tips: skill-builds data not be replaced': 'Skill-builds data will not be replaced. ',
        'formula text': {
          'target_def': 'Target Def',
          'target_level': 'Target Level'
        },
        'suffix branch': {
          'condition: default': 'Additional Effects'
        },
        'no build has been created': 'No build has been created~ Click the menu on the upper left corner and enter the "Skill Simulator" to set up the build.',
        'there are no skills yet': 'There are no skills yet~ Click the menu on the upper left corner and enter the "Skill Simulator" to set up the build. Keep in mind, only skills that will boost your character will appear here.'
      },
      'show character stats': {
        'base value': 'Base ',
        'init value': 'Initial ',
        'additional value': 'Additional Bonus',
        'equipped with: prefix text': 'When',
        'equipped with: suffix text': 'is equipped',
        'Click anywhere to close': 'Click anywhere to close this window',
        'text of conditional values': {
          '1h_sword': 'One-Handed Sword',
          '2h_sword': 'Two-Handed Sword',
          'bow': 'Bow',
          'bowgun': 'Bowgun',
          'staff': 'Staff',
          'magic_device': 'Magic Device(Main)',
          'knuckle': 'Knuckle(Main)',
          'dual_sword': 'Dual Sword',
          'halberd': 'Halberd',
          'katana': 'Katana',
          'main': {
            'none': 'None'
          },
          'sub': {
            'magic_device': 'Magic Device(Sub)',
            'knuckle': 'Knuckle(Sub)',
            'arrow': 'Arrow',
            'dagger': 'Dagger',
            'shield': 'Shield'
          },
          'armor': {
            'normal': 'Body Armor(Normal)',
            'dodge': 'Body Armor(Light)',
            'defense': 'Body Armor(Heavy)',
            'none': 'None'
          }
        }
      },
      'Food Builds Control': {
        'food build': 'Food Buffs',
        'append food build': 'Add Food Buffs',
        'food build name': 'Name of Food Buffs Build',
        'food list': 'Food List',
        'Copy food build successfully': 'Food buffs successfully copied.',
        'Remove food build successfully': 'Food buffs successfully removed. ',
        'Recovery food build successfully': 'Food buffs successfully recovered',
        'Must have at least one food build': 'Must have at least one food buff build',
        'Current food-build is not exist': 'Unable to load the current food buffs, please click the buttom below to fix this issue. ',
        'Number of selected food has reached the maximum': 'No more food buff can be selected. ',
        'tips: select food': 'Click the buttom in front of the food to select it, can only select 5 or less. ',
        'tips: auto select food': 'Food buff will be automatically selected when you level it up. '
      },
      'save-load control': {
        'Auto save Successfully': 'Auto Save Successfully. ',
        'Auto load Successfully': 'Auto Load Successfully. ',
        'save button: title': 'Manual save',
        'load button: title': 'Manual load',
        'top caption': 'In the normal condition, the data will be saved automatically when you exit or enter this site. Save and load by hand is available if you need them. ',
        'button: deleta all data': 'Delete all datas in Character Simulator',
        'Message: deleta all data': 'Successfully deleted all datas in Character Simulator, auto-save is turned off by the system. Please Reload.',
        'delete counter: title': 'Delete Counter',
        'delete all data: caption': [
          'Under some condition，Errors may occur in Character Simulator that can cause a system malfunction. Use the buttom below to clear all the datas in Character Simulator. Auto-save will also be unavailable temporary，Which means the exsisting datas will not be saved automatically. ',
          'Adjust the number of "Delete Counter" below to 10，then the delete buttom will appear. ',
          'After delete the datas, please reload immediately, so the system can reinitialize. '
        ]
      },
      'Warn': {
        'Current character is not exist': 'Some little errors occured, character datas are unable to load ，the site cannot display properly......<br /> Please click the buttoms below to create new character, to restore the site(_ _)',
        'no equipment selected': 'No equipment selected',
        'no eligible equipments found': 'No eligible equipment can be found～ Click the buttom on the top to add an equipment. ',
        'no result found': 'No Results found 0.0',
        'clear equipments completed': 'Equipments Cleared',
        'create custom equipment: no equipment type selected': 'Please select the equipment type first.',
        'create custom equipment editor: selected stats clear': 'Changes canceled.',
        'character stats compare: no result': 'No changes on the status',
        'Copy character successfully': 'Successfully copied: $0',
        'Remove character successfully': 'Successfully removed: $0',
        'Recovery character successfully': 'Successfully recovered: $0',
        'Must have at least one character': 'Must have at least one character. '
      }
    }
  };
}