import { markRaw } from 'vue';
import { CalculationBase, CalcItemBaseContainer, CalcStruct, CurrentItemIdGetter } from './Calculation/base';

export default class {
  constructor() {
    this.calculationBase = null;
    this.init();
  }
  init() {
    /**
     * @callback FactoryCreated
     * @param {CalcItemBaseContainer} container
     */
    /**
     * @callback FactoryAlly
     * @param {string} id
     * @param {FactoryCreated} callback
     * @returns {CalcItemBaseContainer}
     */
    /**
     * @callback DamageTypeHandlerCallback
     * @param {boolean} result - true if damage type is "physical"
     * @returns {string} ItemBase.id
     */

    const base = new CalculationBase();

    const factory = (id, type, callback) => {
      const container = base.appendContainer(id, type);
      callback(container);
    };
    /** @type {FactoryAlly} */
    const normal = (id, callback) => factory(id, CalcItemBaseContainer.TYPE_NORMAL, callback);
    /** @type {FactoryAlly} */
    const options = (id, callback) => factory(id, CalcItemBaseContainer.TYPE_OPTIONS, callback);

    const utils = {
      getCurrentDamageTypeId(itemContainer) {
        return itemContainer.belongCalculation.containers.get('damage_type').currentItem.base.id;
      },
      /**
       * @param {DamageTypeHandlerCallback} handlerCallback
       * @returns {CurrentItemIdGetter}
       */
      damageTypeHandler(handlerCallback) {
        return ((itemContainer) => {
          const currentId = utils.getCurrentDamageTypeId(itemContainer);
          return handlerCallback(currentId === 'physical');
        });
      },
    };

    options('damage_type', container => {
      container.appendItem('physical');
      container.appendItem('magic');
    });
    options('atk/base', container => {
      container.appendItem('atk');
      container.appendItem('matk');
      container.setGetCurrentItemId(utils.damageTypeHandler(res => res ? 'atk' : 'matk'));
      container.controls.toggle = false;
    });
    normal('atk/dual_sword', container => {
      container.appendItem('sub_atk');
      container.appendItem('sub_stability').setRange(0);
      container.setCalcResult((itemContainer) => {
        const currentDamageTypeId = utils.getCurrentDamageTypeId(itemContainer);
        if (currentDamageTypeId !== 'physical') {
          return 0;
        }
        const subAtk = itemContainer.getItemValue('sub_atk');
        const subStability = itemContainer.getItemValue('sub_stability');
        return subAtk * subStability / 100;
      });
    });
    normal('atk/two_handed', container => {
      container.markMultiplier();
      container.appendItem('skill_level_two_handed')
        .setDefaultValue(0)
        .setRange(0, 10)
        .setUnit(null);
      container.setCalcResult((itemContainer) => {
        const currentDamageTypeId = utils.getCurrentDamageTypeId(itemContainer);
        if (currentDamageTypeId !== 'physical') {
          return 0;
        }
        const value = itemContainer.getItemValue('skill_level_two_handed');
        return (100 + value * 5);
      });
    });
    options('target_resistance', container => {
      container.markMultiplier();
      container.appendItem('target_physical_resistance')
        .setDefaultValue(0)
        .setRange(null, null);
      container.appendItem('target_magic_resistance')
        .setDefaultValue(0)
        .setRange(null, null);
      container.setCalcResult((itemContainer) => {
        const value = itemContainer.currentItem.value;
        return (100 - value);
      });
      container.setGetCurrentItemId(utils.damageTypeHandler(res => res ? 'target_physical_resistance' : 'target_magic_resistance'));
    });
    normal('level_difference', container => {
      container.appendItem('character_level');
      container.appendItem('target_level');
      container.setCalcResult((itemContainer) => {
        const clv = itemContainer.getItemValue('character_level');
        const tlv = itemContainer.getItemValue('target_level');
        return clv - tlv;
      });
    });
    options('target_def_base', container => {
      container.appendItem('target_def');
      container.appendItem('target_mdef');
      container.setCalcResult((itemContainer) => {
        const value = itemContainer.currentItem.value;
        return -1 * value;
      });
      container.setGetCurrentItemId(utils.damageTypeHandler(res => res ? 'target_def' : 'target_mdef'));
    });
    options('pierce', container => {
      container.markMultiplier();
      container.appendItem('physical_pierce').setDefaultValue(0);
      container.appendItem('magic_pierce').setDefaultValue(0);
      container.setCalcResult((itemContainer) => {
        const value = itemContainer.currentItem.value;
        return (100 - value);
      });
      container.setGetCurrentItemId(utils.damageTypeHandler(res => res ? 'physical_pierce' : 'magic_pierce'));
    });
    normal('skill/constant', container => {
      container.appendItem('skill_constant');
    });
    normal('unsheathe_attack/constant', container => {
      container.appendItem('unsheathe_attack_constant');
    });
    normal('other_constant', container => {
      container.appendItem('other_constant');
    });

    const rateCalcResult = itemContainer => (itemContainer.currentItem.value + 100);

    normal('critical', container => {
      container.markMultiplier();
      container.appendItem('critical_damage')
        .setDefaultValue(150);
      container.appendItem('critical_rate')
        .setDefaultValue(25)
        .setRange(0, 100, 10)
      container.appendItem('magic_critical_rate_conversion_rate');
      container.appendItem('magic_critical_damage_conversion_rate');
      container.setCalcResult((itemContainer) => {
        const currentDamageTypeId = utils.getCurrentDamageTypeId(itemContainer);
        const cr = itemContainer.getItemValue('critical_rate');
        const cd = itemContainer.getItemValue('critical_damage');
        const mcrr = itemContainer.getItemValue('critical_rate');
        const mcdr = itemContainer.getItemValue('critical_damage');
        if (currentDamageTypeId === 'physical') {
          return (cr * cd + (100 - cr)) / 10000;
        }
        const mcr = Math.floor(cr * mcrr / 100);
        const mcd = Math.floor(cd * mcdr / 100);
        return (mcr * mcd + (100 - mcr)) / 10000;
      });
    });
    options('range_damage', container => {
      container.markMultiplier();
      container.appendItem('short_range_damage');
      container.appendItem('long_range_damage');
      container.setCalcResult(rateCalcResult);
    });
    normal('unsheathe_attack/multiplier', container => {
      container.markMultiplier();
      container.appendItem('unsheathe_attack_multiplier');
    });
    options('stronger_against_element', container => {
      container.markMultiplier();
      container.appendItem('stronger_against_neutral');
      container.appendItem('stronger_against_fire');
      container.appendItem('stronger_against_water');
      container.appendItem('stronger_against_earth');
      container.appendItem('stronger_against_wind');
      container.appendItem('stronger_against_light');
      container.appendItem('stronger_against_dark');
      container.setCalcResult(rateCalcResult);
    });
    normal('proration', container => {
      container.markMultiplier();
      container.appendItem('proration')
        .setDefaultValue(250)
        .setRange(50, 250, 50)
    });
    normal('combo_multiplier', container => {
      container.markMultiplier();
      container.appendItem('combo_multiplier')
        .setDefaultValue(150)
    });
    normal('stability', container => {
      container.markMultiplier();
      container.appendItem('stability')
        .setDefaultValue(75)
        .setRange(0, 100, 10)
      container.appendItem('probability_of_graze')
        .setDefaultValue(0)
        .setRange(0, 100, 10)
      container.setCalcResult((itemContainer) => {
        const stability = itemContainer.getItemValue('stability');
        const grazeProbability = itemContainer.getItemValue('probability_of_graze');
        return (((stability * (100 - grazeProbability) + 100) / 200) + ((stability * grazeProbability / 2 + 100) / 200)) / 100;
      });
    });
    normal('other_multiplier', container => {
      container.markMultiplier();
      container.appendItem('other_multiplier');
    });


    /** @type {CalcStruct} */
    const calcStruct = {
      options: [
        'damage_type',
      ],
      root: {
        operator: '*',
        left: {
          operator: '+++',
          list: [
            {
              operator: '***',
              list: [
                {
                  operator: '+',
                  left: 'atk/base',
                  right: 'atk/dual_sword',
                },
                'atk/two_handed',
                'target_resistance',
              ],
            },
            'level_difference',
            {
              operator: '*',
              left: 'target_def_base',
              right: 'pierce',
            },
            'skill/constant',
            'unsheathe_attack/constant',
            'other_constant',
          ],
        },
        right: {
          operator: '***',
          list: [
            'critical',
            'range_damage',
            'unsheathe_attack/multiplier',
            'stronger_against_element',
            'proration',
            'combo_multiplier',
            'stability',
            'other_multiplier',
          ],
        },
      },
    };

    base.setCalcStruct(calcStruct);

    this.calculationBase = markRaw(base);
  }
}
