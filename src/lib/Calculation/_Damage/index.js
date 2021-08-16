import { markRaw } from "vue";
import { CalculationBase, CalcItemBaseContainer } from "./Calculation/base";

export default class {
  constructor() {
    this.damageCalculationBase = null;
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

    const base = new CalculationBase();

    const factory = (id, type, callback) => {
      const container = base.appendContainer(id, type);
      callback(container);
    };
    /** @type {FactoryAlly} */
    const normal = (id, callback) => factory(id, CalcItemBaseContainer.TYPE_NORMAL, callback);
    /** @type {FactoryAlly} */
    const options = (id, callback) => factory(id, CalcItemBaseContainer.TYPE_OPTIONS, callback);

    options('damage_type', container => {
      container.appendItem('physical');
      container.appendItem('magic');
    });
    options('atk/base', container => {
      container.appendItem('atk');
      container.appendItem('matk');
    });
    normal('atk/dual_sword', container => {
      container.appendItem('sub_atk');
      container.appendItem('sub_stability');
      container.setCalcResult((itemContainer) => {
        const subAtk = itemContainer.getItemValue('sub_atk');
        const subStability = itemContainer.getItemValue('sub_stability');
        return subAtk * subStability / 100;
      });
    });
    normal('atk/two_handed', container => {
      container.appendItem('skill_level_two_handed');
      container.setCalcResult((itemContainer) => {
        const value = itemContainer.getItemValue('skill_level_two_handed');
        return (100 + value * 5) / 100;
      });
    });
    options('target_resistance', container => {
      container.appendItem('target_physical_resistance');
      container.appendItem('target_magic_resistance');
      container.setCalcResult((itemContainer) => {
        const value = itemContainer.currentItem.value;
        return (100 - value) / 100;
      });
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
    });
    options('pierce', container => {
      container.appendItem('physical_pierce');
      container.appendItem('magic_pierce');
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

    const rateCalcResult = itemContainer => (itemContainer.currentItem.value + 100) / 100;

    normal('critical', container => {
      container.appendItem('critical_damage')
        .initForMultiplier()
        .setDefaultValue(150);
      container.appendItem('critical_rate')
        .setDefaultValue(25)
        .setRange(0, 100, 10)
        .setUnit('%');
        container.appendItem('magic_critical_rate_conversion_rate');
        container.appendItem('magic_critical_damage_conversion_rate');
        container.setCalcResult((itemContainer) => {
          const currentDamageTypeId = itemContainer.belongCalculation.containers.get('damage_type').base.id;
          if (currentDamageTypeId === 'physical') {
            return 0;
          }
        });
    });
    options('range_damage', container => {
      container.appendItem('short_range_damage').initForMultiplier();
      container.appendItem('long_range_damage').initForMultiplier();
      container.setCalcResult(rateCalcResult);
    });
    normal('unsheathe_attack/multiplier', container => {
      container.appendItem('unsheathe_attack_multiplier').initForMultiplier();
    });
    options('stronger_against_element', container => {
      container.appendItem('stronger_against_neutral').initForMultiplier();
      container.appendItem('stronger_against_fire').initForMultiplier();
      container.appendItem('stronger_against_water').initForMultiplier();
      container.appendItem('stronger_against_earth').initForMultiplier();
      container.appendItem('stronger_against_wind').initForMultiplier();
      container.appendItem('stronger_against_light').initForMultiplier();
      container.appendItem('stronger_against_dark').initForMultiplier();
      container.setCalcResult(rateCalcResult);
    });
    normal('proration', container => {
      container.appendItem('proration')
        .setDefaultValue(250)
        .setRange(50, 250, 50)
        .setUnit('%');
    });
    normal('stability', container => {
      container.appendItem('stability')
        .setDefaultValue(75)
        .setRange(0, 100, 10)
        .setUnit('%');
      container.appendItem('probability_of_graze')
        .setDefaultValue(0)
        .setRange(0, 100, 10)
        .setUnit('%');
      container.setCalcResult((itemContainer) => {
        const stability = itemContainer.getItemValue('stability');
        const grazeProbability = itemContainer.getItemValue('probability_of_graze');
        return (stability * (100 - grazeProbability) / 100) + (stability * grazeProbability / 200);
      });
    });
    normal('combo_multiplier', container => {
      container.appendItem('combo_multiplier')
        .setDefaultValue(150)
        .setRange(10, 150)
        .setUnit('%');
    });
    normal('other_multiplier', container => {
      container.appendItem('other_multiplier')
        .setDefaultValue(100)
        .setRange(0)
        .setUnit('%');
    });

    const calcStruct = {
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
        right: {},
      },
    };

    base.setCalcStruct(calcStruct);

    this.damageCalculationBase = markRaw(base);
  }
}
