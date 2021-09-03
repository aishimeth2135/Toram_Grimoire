import { markRaw } from 'vue';
import { CalculationBase, CalcItemContainerBase, CurrentItemIdGetter } from './Calculation/base';

export default class {
  constructor() {
    this.calculationBase = null;
    this.init();
  }
  init() {
    /**
     * @callback FactoryCreated
     * @param {CalcItemContainerBase} container
     */
    /**
     * @callback FactoryAlly
     * @param {string} id
     * @param {FactoryCreated} callback
     * @returns {CalcItemContainerBase}
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
    const normal = (id, callback) => factory(id, CalcItemContainerBase.TYPE_NORMAL, callback);
    /** @type {FactoryAlly} */
    const options = (id, callback) => factory(id, CalcItemContainerBase.TYPE_OPTIONS, callback);

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
    normal('atk/base', container => {
      container.appendItem('atk').setDefaultValue(0);
      container.appendItem('matk').setDefaultValue(0);
      container.appendItem('atk_rate')
        .setDefaultValue(100).setRange(0).setUnit('%');
      container.appendItem('matk_rate')
        .setDefaultValue(100).setRange(0).setUnit('%');
      // container.setGetCurrentItemId(utils.damageTypeHandler(res => res ? 'atk' : 'matk'));
      container.controls.toggle = false;
      container.setCalcResult((itemContainer) => {
        const atk = itemContainer.getItemValue('atk');
        const matk = itemContainer.getItemValue('matk');
        const atkr = itemContainer.getItemValue('atk_rate');
        const matkr = itemContainer.getItemValue('matk_rate');
        return Math.floor(atk * atkr / 100) + Math.floor(matk * matkr / 100);
      });
    });
    normal('atk/dual_sword', container => {
      container.appendItem('sub_atk');
      container.appendItem('sub_stability')
        .setRange(0).setUnit('%');
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
        .setRange(null);
      container.appendItem('target_magic_resistance')
        .setDefaultValue(0)
        .setRange(null);
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

    normal('skill/multiplier', container => {
      container.markMultiplier();
      container.appendItem('skill_multiplier');
    });

    normal('critical', container => {
      container.markMultiplier();
      container.disableFloorResult();

      container.appendItem('critical_damage')
        .setDefaultValue(150);
      container.appendItem('critical_rate')
        .setDefaultValue(25)
        .setRange(0, 100, 10)
      container.appendItem('magic_critical_rate_conversion_rate')
        .setDefaultValue(0)
      container.appendItem('magic_critical_damage_conversion_rate')
        .setDefaultValue(50);
      container.appendItem('target_critical_rate_resistance')
        .setDefaultValue(0)
        .setRange(null);
      container.appendItem('target_critical_rate_resistance_total')
        .setDefaultValue(0)
        .setRange(0, 100);

      container.setCalcResult((itemContainer) => {
        const cr = itemContainer.belongCalculation.containers
          .get('critical/critical_rate').result();
        const cd = itemContainer.belongCalculation.containers
          .get('critical/critical_damage').result();
        return (cr * cd / 100 + (100 - cr));
      });
    });
    normal('critical/critical_damage', container => {
      container.markMultiplier();

      /* @containers/critical */
      container.appendItem('critical_damage');
      container.appendItem('magic_critical_damage_conversion_rate');
      /* --- */

      container.setCalcResult((itemContainer) => {
        const currentDamageTypeId = utils.getCurrentDamageTypeId(itemContainer);
        const cd = itemContainer.getItemValue('critical_damage');
        const mcdr = itemContainer.getItemValue('magic_critical_damage_conversion_rate');
        let result = cd;
        if (result > 300) {
          result = 300 + Math.floor((result - 300) / 2);
        }
        result = currentDamageTypeId === 'physical' ?
          result :
          Math.floor((result - 100) * mcdr / 100) + 100;
        return result;
      });
    });
    normal('critical/critical_rate', container => {
      container.markMultiplier();

      /* @containers/critical */
      container.appendItem('critical_rate');
      container.appendItem('target_critical_rate_resistance')
      container.appendItem('magic_critical_rate_conversion_rate');
      container.appendItem('target_critical_rate_resistance_total');
      /* --- */

      container.setCalcResult((itemContainer) => {
        const currentDamageTypeId = utils.getCurrentDamageTypeId(itemContainer);
        const cr = itemContainer.getItemValue('critical_rate');
        const cr_r = itemContainer.getItemValue('target_critical_rate_resistance');
        const cr_rt = itemContainer.getItemValue('target_critical_rate_resistance_total');
        const mcrr = itemContainer.getItemValue('magic_critical_rate_conversion_rate');
        let result = Math.max(cr - cr_r, 0);
        result = Math.min(100, Math.floor(result * (100 - cr_rt) / 100));
        return currentDamageTypeId === 'physical' ? result : Math.floor(result * mcrr / 100);
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
