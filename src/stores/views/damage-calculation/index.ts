import { defineStore } from 'pinia'
import { type Ref, computed, ref } from 'vue'

import Grimoire from '@/shared/Grimoire'

import { Calculation } from '@/lib/Damage/DamageCalculation'

import { DamageCalculationPersistenceService, type DamageCalculationSaveData } from './persistence'

export const useDamageCalculationStore = defineStore('views-damage-calculation', () => {
  const calculations: Ref<Calculation[]> = ref([])
  const currentCalculationIndex = ref(-1)

  const currentCalculation = computed(() => calculations.value[currentCalculationIndex.value]!)

  const reset = (newState: { calculations: Calculation[]; currentCalculationIndex: number }) => {
    calculations.value = newState.calculations
    currentCalculationIndex.value = newState.currentCalculationIndex
  }

  const appendCalculation = (calculation: Calculation) => {
    calculations.value.push(calculation)
    currentCalculationIndex.value = calculations.value.length - 1
  }

  const selectCalculation = (idx: number | Calculation) => {
    if (typeof idx !== 'number') {
      idx = calculations.value.indexOf(idx)
    }
    currentCalculationIndex.value = idx
  }

  const removeCalculation = (calculation: Calculation) => {
    const idx = calculations.value.indexOf(calculation)
    if (idx !== -1) {
      calculations.value.splice(idx, 1)
      if (currentCalculationIndex.value !== 0) {
        currentCalculationIndex.value = idx - 1
      }
    }
  }

  const createCalculation = () => {
    const name =
      Grimoire.i18n.t('damage-calculation.build') + ' ' + (calculations.value.length + 1).toString()
    const calculationBase = Grimoire.DamageCalculation.calculationBase
    const calculation = calculationBase.createCalculation(name)
    appendCalculation(calculation)
  }

  const save = () => {
    const data: DamageCalculationSaveData = {
      calculations: calculations.value.map(calculation => calculation.save()),
      currentCalculationIndex: currentCalculationIndex.value,
    }

    const result = DamageCalculationPersistenceService.save(data)
    if (!result.success) {
      throw result.error
    }
  }

  const load = () => {
    const result = DamageCalculationPersistenceService.load()
    if (!result.success) {
      console.warn('[store/damage-calculation/load] unknown error')
      console.log(result.error)
      throw result.error
    }
    if (result.value === null) {
      createCalculation()
      return
    }

    try {
      const calculationBase = Grimoire.DamageCalculation.calculationBase
      const newCalculations: Calculation[] = []
      result.value.calculations.forEach(calculationData => {
        const calculation = calculationBase.createCalculation()
        calculation.load(calculationData)
        newCalculations.push(calculation)
      })
      reset({
        calculations: newCalculations,
        currentCalculationIndex: result.value.currentCalculationIndex,
      })
      DamageCalculationPersistenceService.confirmLoaded()
    } catch (error) {
      console.warn('[store/damage-calculation/load] unknown error')
      console.log(error)
      throw error
    }
  }

  return {
    calculations,
    currentCalculation,

    selectCalculation,
    appendCalculation,
    removeCalculation,
    createCalculation,
    save,
    load,
  }
})
