import { markRaw } from 'vue'

import { CalcItemContainer } from './Calculation'
import { CalculationBase, CalcItemContainerBase } from './Calculation/base'
import type { CurrentItemIdGetter } from './Calculation/base'
import { CalculationContainerIds, CalculationItemIds, ContainerTypes } from './Calculation/enums'

export default class DamageCalculationSystem {
  calculationBase: CalculationBase
  constructor() {
    type FactoryCreated = (container: CalcItemContainerBase) => void
    type FactoryAlly = (id: CalculationContainerIds, callback: FactoryCreated) => void
    type DamageTypeHandlerCallback = (result: boolean) => CalculationItemIds

    const base = new CalculationBase()

    const factory = (id: CalculationContainerIds, type: ContainerTypes, callback: FactoryCreated): void => {
      const container = base.appendContainer(id, type)
      callback(container)
    }
    const normal: FactoryAlly = (id, callback) => factory(id, ContainerTypes.Normal, callback)
    const options: FactoryAlly = (id, callback) => factory(id, ContainerTypes.Options, callback)

    const utils = {
      getCurrentItemId(itemContainer: CalcItemContainer, containerId: CalculationContainerIds) {
        return itemContainer.belongCalculation.containers.get(containerId)!.currentItem.base.id
      },
      getCurrentDamageTypeId(itemContainer: CalcItemContainer) {
        return utils.getCurrentItemId(itemContainer, CalculationContainerIds.DamageType)
      },
      damageTypeHandler(handlerCallback: DamageTypeHandlerCallback): CurrentItemIdGetter {
        return ((itemContainer: CalcItemContainer) => {
          const currentId = utils.getCurrentDamageTypeId(itemContainer)
          return handlerCallback(currentId === CalculationItemIds.Physical)
        })
      },
    }

    options(CalculationContainerIds.DamageType, container => {
      container.appendItem(CalculationItemIds.Physical)
      container.appendItem(CalculationItemIds.Magic)
      container.controls.valueValid = false
    })
    normal(CalculationContainerIds.BaseAtk, container => {
      container.appendItem(CalculationItemIds.Atk)
      container.appendItem(CalculationItemIds.AtkRate)
        .setDefaultValue(100).setRange(0).setUnit('%')
      container.setCalcResult((itemContainer) => {
        const atk = itemContainer.getItemValue(CalculationItemIds.Atk)
        const atkr = itemContainer.getItemValue(CalculationItemIds.AtkRate)
        return Math.floor(atk * atkr / 100)
      })
    })
    normal(CalculationContainerIds.BaseMatk, container => {
      container.appendItem(CalculationItemIds.Matk)
      container.appendItem(CalculationItemIds.MatkRate)
        .setDefaultValue(100).setRange(0).setUnit('%')
      container.setCalcResult((itemContainer) => {
        const matk = itemContainer.getItemValue(CalculationItemIds.Matk)
        const matkr = itemContainer.getItemValue(CalculationItemIds.MatkRate)
        return Math.floor(matk * matkr / 100)
      })
    })
    normal(CalculationContainerIds.Base, container => {
      container.setVirtual([CalculationContainerIds.BaseAtk, CalculationContainerIds.BaseMatk])
      container.setCalcResult((itemContainer) => {
        const baseAtk = itemContainer.belongCalculation.containers.get(CalculationContainerIds.BaseAtk)!.result()
        const baseMatk = itemContainer.belongCalculation.containers.get(CalculationContainerIds.BaseMatk)!.result()
        return baseAtk + baseMatk
      })
    })
    normal(CalculationContainerIds.BaseDualSword, container => {
      container.appendItem(CalculationItemIds.SubAtk)
      container.appendItem(CalculationItemIds.SubStability)
        .setRange(0).setUnit('%')
      container.setCalcResult((itemContainer) => {
        const subAtk = itemContainer.getItemValue(CalculationItemIds.SubAtk)
        const subStability = itemContainer.getItemValue(CalculationItemIds.SubStability)
        return subAtk * subStability / 100
      })
      container.setGetHidden((itemContainer) => {
        const currentBaseTypeId = utils.getCurrentDamageTypeId(itemContainer)
        return currentBaseTypeId === CalculationItemIds.Magic
      })
    })
    normal(CalculationContainerIds.BaseTwoHanded, container => {
      container.markMultiplier()
      container.defaultDisabled()
      container.appendItem(CalculationItemIds.SkillLevelTwoHanded)
        .setDefaultValue(0)
        .setRange(0, 10)
        .setUnit('')
      container.setCalcResult((itemContainer) => {
        const value = itemContainer.getItemValue(CalculationItemIds.SkillLevelTwoHanded)
        return (100 + value * 5)
      })
      container.setGetHidden((itemContainer) => {
        const currentBaseTypeId = utils.getCurrentDamageTypeId(itemContainer)
        return currentBaseTypeId === CalculationItemIds.Magic
      })
    })
    options(CalculationContainerIds.TargetResistance, container => {
      container.markMultiplier()
      container.appendItem(CalculationItemIds.TargetPhysicalResistance)
        .setDefaultValue(0)
        .setRange(null)
      container.appendItem(CalculationItemIds.TargetMagicResistance)
        .setDefaultValue(0)
        .setRange(null)
      container.setCalcResult((itemContainer) => {
        const value = itemContainer.currentItem.value
        return (100 - value)
      })
      container.setGetCurrentItemId((itemContainer) => {
        const currentBaseTypeId = utils.getCurrentDamageTypeId(itemContainer)
        if (currentBaseTypeId === CalculationItemIds.Physical) {
          return CalculationItemIds.TargetPhysicalResistance
        }
        if (currentBaseTypeId === CalculationItemIds.Magic) {
          return CalculationItemIds.TargetMagicResistance
        }
        return null
      })
      container.disableFloorResult()
    })
    normal(CalculationContainerIds.LevelDifference, container => {
      container.appendItem(CalculationItemIds.CharacterLevel)
      container.appendItem(CalculationItemIds.TargetLevel)
      container.setCalcResult((itemContainer) => {
        const clv = itemContainer.getItemValue(CalculationItemIds.CharacterLevel)
        const tlv = itemContainer.getItemValue(CalculationItemIds.TargetLevel)
        return clv - tlv
      })
    })
    options(CalculationContainerIds.TargetDefBase, container => {
      container.appendItem(CalculationItemIds.TargetDef)
      container.appendItem(CalculationItemIds.TargetMdef)
      container.setCalcResult((itemContainer) => {
        const value = itemContainer.currentItem.value
        return -1 * value
      })
      container.setGetCurrentItemId((itemContainer) => {
        const currentBaseTypeId = utils.getCurrentDamageTypeId(itemContainer)
        if (currentBaseTypeId === CalculationItemIds.Physical) {
          return CalculationItemIds.TargetDef
        }
        if (currentBaseTypeId === CalculationItemIds.Magic) {
          return CalculationItemIds.TargetMdef
        }
        return null
      })
    })
    options(CalculationContainerIds.Pierce, container => {
      container.markMultiplier()
      container.appendItem(CalculationItemIds.PhysicalPierce).setDefaultValue(0)
      container.appendItem(CalculationItemIds.MagicPierce).setDefaultValue(0)
      container.setCalcResult((itemContainer) => {
        const value = itemContainer.currentItem.value
        return (100 - value)
      })
      container.setGetCurrentItemId((itemContainer) => {
        const currentDefBaseId = utils.getCurrentItemId(itemContainer, CalculationContainerIds.TargetDefBase)
        if (currentDefBaseId === CalculationItemIds.TargetDef) {
          return CalculationItemIds.PhysicalPierce
        }
        if (currentDefBaseId === CalculationItemIds.TargetMdef) {
          return CalculationItemIds.MagicPierce
        }
        return null
      })
    })
    normal(CalculationContainerIds.SkillConstant, container => {
      container.appendItem(CalculationItemIds.SkillConstant)
    })
    normal(CalculationContainerIds.UnsheatheAttackConstant, container => {
      container.appendItem(CalculationItemIds.UnsheatheAttackConstant)
    })
    normal(CalculationContainerIds.OtherConstant, container => {
      container.appendItem(CalculationItemIds.OtherConstant)
      container.setCalcResult((itemContainer) => {
        return itemContainer.customItems
          .reduce((cur, item) => cur + item.value, itemContainer.getItemValue(CalculationItemIds.OtherConstant))
      })
    })

    normal(CalculationContainerIds.SkillMultiplier, container => {
      container.markMultiplier()
      container.appendItem(CalculationItemIds.SkillMultiplier)
    })

    // normal(CalculationContainerIds.Critical, container => {
    //   container.markMultiplier()
    //   container.disableFloorResult()

    //   container.setVirtual([CalculationContainerIds.CriticalRate, CalculationContainerIds.CriticalDamage])

    //   container.setCalcResult((itemContainer) => {
    //     const cr = itemContainer.belongCalculation.containers.get(CalculationContainerIds.CriticalRate)!.result()
    //     const cd = itemContainer.belongCalculation.containers.get(CalculationContainerIds.CriticalDamage)!.result()
    //     return (cr * cd / 100 + (100 - cr))
    //   })
    // })
    normal(CalculationContainerIds.CriticalDamage, container => {
      container.markMultiplier()

      container.appendItem(CalculationItemIds.CriticalDamage)
        .setDefaultValue(150)
      container.appendItem(CalculationItemIds.MagicCriticalDamageConversionRate)
        .setDefaultValue(50)

      container.setCalcResult((itemContainer) => {
        const currentDamageTypeId = utils.getCurrentDamageTypeId(itemContainer)
        const cd = itemContainer.getItemValue(CalculationItemIds.CriticalDamage)
        const mcdr = itemContainer.getItemValue(CalculationItemIds.MagicCriticalDamageConversionRate)
        let result = cd
        result = currentDamageTypeId === CalculationItemIds.Physical ?
          result :
          Math.floor((result - 100) * mcdr / 100) + 100
        return result
      })
    })
    normal(CalculationContainerIds.CriticalRate, container => {
      container.markMultiplier()

      container.appendItem(CalculationItemIds.CriticalRate)
        .setDefaultValue(25)
        .setRange(0, null, 10)
      container.appendItem(CalculationItemIds.MagicCriticalRateConversionRate)
        .setDefaultValue(0)
      container.appendItem(CalculationItemIds.TargetCriticalRateResistance)
        .setDefaultValue(0)
        .setRange(null)
      container.appendItem(CalculationItemIds.TargetCriticalRateResistanceTotal)
        .setDefaultValue(0)
        .setRange(0, 100)

      container.setCalcResult((itemContainer) => {
        const currentDamageTypeId = utils.getCurrentDamageTypeId(itemContainer)
        const cr = itemContainer.getItemValue(CalculationItemIds.CriticalRate)
        const cr_r = itemContainer.getItemValue(CalculationItemIds.TargetCriticalRateResistance)
        const cr_rt = itemContainer.getItemValue(CalculationItemIds.TargetCriticalRateResistanceTotal)
        const mcrr = itemContainer.getItemValue(CalculationItemIds.MagicCriticalRateConversionRate)
        let result = Math.max(cr - cr_r, 0)
        result = Math.max(0, Math.floor(result * (100 - cr_rt) / 100))
        result = currentDamageTypeId === CalculationItemIds.Physical ? result : Math.floor(result * mcrr / 100)
        return Math.min(100, result)
      })
    })
    options(CalculationContainerIds.RangeDamage, container => {
      container.markMultiplier()
      container.appendItem(CalculationItemIds.ShortRangeDamage)
      container.appendItem(CalculationItemIds.LongRangeDamage)
    })
    normal(CalculationContainerIds.UnsheatheAttackMultiplier, container => {
      container.markMultiplier()
      container.appendItem(CalculationItemIds.UnsheatheAttackMultiplier)
    })
    options(CalculationContainerIds.StrongerAgainstElement, container => {
      container.markMultiplier()
      container.appendItem(CalculationItemIds.StrongerAgainstNeutral)
      container.appendItem(CalculationItemIds.StrongerAgainstFire)
      container.appendItem(CalculationItemIds.StrongerAgainstWater)
      container.appendItem(CalculationItemIds.StrongerAgainstEarth)
      container.appendItem(CalculationItemIds.StrongerAgainstWind)
      container.appendItem(CalculationItemIds.StrongerAgainstLight)
      container.appendItem(CalculationItemIds.StrongerAgainstDark)
    })
    normal(CalculationContainerIds.Proration, container => {
      container.markMultiplier()
      container.appendItem(CalculationItemIds.Proration)
        .setDefaultValue(250)
        .setRange(50, 250, 50)
    })
    normal(CalculationContainerIds.ComboMultiplier, container => {
      container.markMultiplier()
      container.appendItem(CalculationItemIds.ComboMultiplier)
        .setDefaultValue(150)
    })
    // normal(CalculationContainerIds.SkillLongRange, container => {
    //   container.markMultiplier()
    //   container.defaultDisabled()
    //   container.appendItem(CalculationItemIds.SkillLevelLongRange)
    //     .setDefaultValue(10)
    //     .setRange(0, 10)
    //     .setUnit('')
    //   container.setCalcResult((itemContainer) => {
    //     const value = itemContainer.getItemValue(CalculationItemIds.SkillLevelLongRange)
    //     return (100 + value)
    //   })
    // })
    normal(CalculationContainerIds.Stability, container => {
      container.markMultiplier()
      container.disableFloorResult()
      container.appendItem(CalculationItemIds.Stability)
        .setDefaultValue(75)
        .setRange(0, 100, 10)
      container.setCalcResult(itemContainer => {
        const currentDamageTypeId = utils.getCurrentDamageTypeId(itemContainer)
        const stability = itemContainer.getItemValue(CalculationItemIds.Stability)
        if (currentDamageTypeId === CalculationItemIds.Physical) {
          return (stability + 50) / 2
        }
        const baseValue = 50 + stability / 2
        const extraLimit = baseValue > 90 ? (baseValue - 90) : 0
        return (Math.min(baseValue, 90) + 100 + extraLimit) / 2
      })
      // container.setCalcResult((itemContainer) => {
      //   const stability = itemContainer.getItemValue(CalculationItemIds.Stability)
      //   const accuracy = itemContainer.getItemValue(CalculationItemIds.Accuracy)
      //   const targetDodge = itemContainer.getItemValue(CalculationItemIds.TargetDodge)
      //   const accuracyRate = Math.min(100, Math.max(0, 300 + accuracy - targetDodge) / 3)
      //   const promiseAccuracy = itemContainer.getItemValue(CalculationItemIds.PromisedAccuracyRate)
      //   const cr = itemContainer.belongCalculation.containers.get(CalculationContainerIds.CriticalRate)!.getItemValue(CalculationItemIds.CriticalRate)
      //   return (((stability + 100) / 2)  * accuracyRate + ((stability / 2 + 100) / 2) * (100 - accuracyRate) * (cr + (100 - cr) * promiseAccuracy / 100) / 100) / 100
      // })
    })
    normal(CalculationContainerIds.Accuracy, container => {
      container.markMultiplier()
      container.appendItem(CalculationItemIds.Accuracy).setUnit('')
      container.appendItem(CalculationItemIds.SkillRealMpCost)
        .setRange(0, null, 100)
        .setDefaultValue(0)
        .setUnit('')
      container.appendItem(CalculationItemIds.TargetDodge).setUnit('')
      container.appendItem(CalculationItemIds.PromisedAccuracyRate)
        .setRange(0, 100, 10)
      container.setCalcResult((itemContainer) => {
        const currentDamageTypeId = utils.getCurrentDamageTypeId(itemContainer)
        if (currentDamageTypeId === CalculationItemIds.Magic) {
          return 100
        }
        const accuracy = itemContainer.getItemValue(CalculationItemIds.Accuracy)
        const skillRealMpCost = itemContainer.getItemValue(CalculationItemIds.SkillRealMpCost)
        const targetDodge = itemContainer.getItemValue(CalculationItemIds.TargetDodge)
        return Math.min(100, Math.max(0, 300 + accuracy + Math.floor(skillRealMpCost / 100) * 30 - targetDodge) / 3)
      })
    })
    normal(CalculationContainerIds.Critical_Accuracy_Stability, container => {
      container.markMultiplier()
      container.disableFloorResult()

      container.setVirtual([
        CalculationContainerIds.CriticalRate,
        CalculationContainerIds.CriticalDamage,
        CalculationContainerIds.Stability,
        CalculationContainerIds.Accuracy,
      ])

      container.setCalcResult((itemContainer) => {
        const currentDamageTypeId = utils.getCurrentDamageTypeId(itemContainer)
        const cr = itemContainer.belongCalculation.containers.get(CalculationContainerIds.CriticalRate)!.result()
        const cd = itemContainer.belongCalculation.containers.get(CalculationContainerIds.CriticalDamage)!.result()
        const acContainer = itemContainer.belongCalculation.containers.get(CalculationContainerIds.Accuracy)!
        const ac = acContainer.result()

        // no need to check `acContainer.enable` beacause `ac` is `100` when `acContaner.enable` is `false`
        const pac = acContainer.getItemValue(CalculationItemIds.PromisedAccuracyRate)

        if (currentDamageTypeId === CalculationItemIds.Magic) {
          const stabilityRes = itemContainer.belongCalculation.containers.get(CalculationContainerIds.Stability)!.result()
          return (stabilityRes * cr * cd / 100 + stabilityRes * (100 - cr)) / 100
        }
        const stability = itemContainer.belongCalculation.containers.get(CalculationContainerIds.Stability)!.getItemValue(CalculationItemIds.Stability)
        return (
          ((stability + 100) * ac + (stability / 2 + 100) * (100 - ac)) * cr * cd / 200 +
          ((stability + 100) * ac + (stability / 2 + 100) * Math.max(0, pac - ac)) * (100 - cr) / 2
        ) / 10000
      })
    })
    normal(CalculationContainerIds.OtherMultiplier, container => {
      container.markMultiplier()
      container.disableFloorResult()
      container.appendItem(CalculationItemIds.OtherMultiplier)
      container.setCalcResult((itemContainer) => {
        return itemContainer.customItems
          .reduce((cur, item) => cur * item.value / 100, itemContainer.getItemValue(CalculationItemIds.OtherMultiplier))
      })
    })

    this.calculationBase = markRaw(base)
  }
}
