import { markRaw } from 'vue';
import { CalculationBase, CalcItemBaseContainer, CurrentItemIdGetter } from './Calculation/base';

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
      container.appendItem('atk').setDefaultValue(1000);
      container.appendItem('matk').setDefaultValue(1000);
      container.setGetCurrentItemId(utils.damageTypeHandler(res => res ? 'atk' : 'matk'));
      container.controls.toggle = false;
    });
    normal('atk/dual_sword', container => {
      container.appendItem('sub_atk');
      container.appendItem('sub_stability').setRange(0).setUnit('%');
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
      container.defaultDisabled();
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

    // normal('critical', container => {
    //   container.markMultiplier();
    //   container.disableFloorResult();
    //   container.appendItem('critical_damage')
    //     .setDefaultValue(150);
    //   container.appendItem('critical_rate')
    //     .setDefaultValue(25)
    //     .setRange(0, 100, 10)
    //   container.appendItem('magic_critical_rate_conversion_rate');
    //   container.appendItem('magic_critical_damage_conversion_rate');
    //   container.setCalcResult((itemContainer) => {
    //     const currentDamageTypeId = utils.getCurrentDamageTypeId(itemContainer);
    //     const cr = itemContainer.getItemValue('critical_rate');
    //     const cd = itemContainer.getItemValue('critical_damage');
    //     const mcrr = itemContainer.getItemValue('critical_rate');
    //     const mcdr = itemContainer.getItemValue('critical_damage');
    //     if (currentDamageTypeId === 'physical') {
    //       return (cr * cd + (100 - cr)) / 100;
    //     }
    //     const mcr = Math.floor(cr * mcrr / 100);
    //     const mcd = Math.floor(cd * mcdr / 100);
    //     return (mcr * mcd + (100 - mcr)) / 100;
    //   });
    // });
    normal('skill/multiplier', container => {
      container.markMultiplier();
      container.appendItem('skill_multiplier');
    });
    normal('critical_damage', container => {
      container.markMultiplier();
      container.appendItem('critical_damage')
        .setDefaultValue(150);
      container.appendItem('magic_critical_damage_conversion_rate');
      container.setCalcResult((itemContainer) => {
        const currentDamageTypeId = utils.getCurrentDamageTypeId(itemContainer);
        const cd = itemContainer.getItemValue('critical_damage');
        const mcdr = itemContainer.getItemValue('magic_critical_damage_conversion_rate');
        if (currentDamageTypeId === 'physical') {
          return cd;
        }
        return Math.floor(cd * mcdr / 100);
      });
    });
    normal('critical_rate', container => {
      container.markMultiplier();
      container.appendItem('critical_rate')
        .setDefaultValue(150);
      container.appendItem('magic_critical_rate_conversion_rate');
      container.setCalcResult((itemContainer) => {
        const currentDamageTypeId = utils.getCurrentDamageTypeId(itemContainer);
        const cr = itemContainer.getItemValue('critical_rate');
        const mcrr = itemContainer.getItemValue('magic_critical_rate_conversion_rate');
        if (currentDamageTypeId === 'physical') {
          return cr;
        }
        return Math.floor(cr * mcrr / 100);
      });
    });
    options('range_damage', container => {
      container.markMultiplier();
      container.appendItem('short_range_damage');
      container.appendItem('long_range_damage');
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
    });
    normal('proration', container => {
      container.markMultiplier();
      container.appendItem('proration')
        .setDefaultValue(250)
        .setRange(50, 250, 50);
    });
    normal('combo_multiplier', container => {
      container.markMultiplier();
      container.appendItem('combo_multiplier')
        .setDefaultValue(150);
    });
    normal('skill/long_range', container => {
      container.markMultiplier();
      container.defaultDisabled();
      container.appendItem('skill_level_long_range')
        .setDefaultValue(10)
        .setRange(0, 10)
        .setUnit(null);
      container.setCalcResult((itemContainer) => {
        const value = itemContainer.getItemValue('skill_level_long_range');
        return (100 + value);
      });
    });
    normal('stability', container => {
      container.markMultiplier();
      container.disableFloorResult();
      container.appendItem('stability')
        .setDefaultValue(75)
        .setRange(0, 100, 10);
      container.appendItem('probability_of_graze')
        .setDefaultValue(0)
        .setRange(0, 100, 10);
      container.setCalcResult((itemContainer) => {
        const stability = itemContainer.getItemValue('stability');
        const grazeProbability = itemContainer.getItemValue('probability_of_graze');
        return ((stability + 100) / 200)  * (100 - grazeProbability) + ((stability / 2 + 100) / 200) * grazeProbability;
      });
    });
    normal('other_multiplier', container => {
      container.markMultiplier();
      container.appendItem('other_multiplier');
    });

    this.calculationBase = markRaw(base);
  }
}
